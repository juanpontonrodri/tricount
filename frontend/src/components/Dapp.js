import React from "react";
import { ethers } from "ethers";
import TravelManagerArtifact from "../contracts/TravelManager.json";
import contractAddress from "../contracts/contract-address.json";
import { NoWalletDetected } from "./NoWalletDetected";
import { ConnectWallet } from "./ConnectWallet";
import { Loading } from "./Loading";
import { TransactionErrorMessage } from "./TransactionErrorMessage";
import { WaitingForTransactionMessage } from "./WaitingForTransactionMessage";
import { CreateTrip } from "./CreateTrip";
import { AddExpense } from "./AddExpense";
import { Balance } from "./Balance";

const SEPOLIA_NETWORK_ID = '11155111';
const ERROR_CODE_TX_REJECTED_BY_USER = 4001;

export class Dapp extends React.Component {
  constructor(props) {
    super(props);
    this.initialState = {
      selectedAddress: undefined,
      transactionError: undefined,
      networkError: undefined,
      txBeingSent: undefined,
      trips: [],
      contractConnected: false
    };
    this.state = this.initialState;
  }

  render() {
    if (window.ethereum === undefined) {
      return <NoWalletDetected />;
    }

    if (!this.state.selectedAddress) {
      return (
        <ConnectWallet
          connectWallet={() => this._connectWallet()}
          networkError={this.state.networkError}
          dismiss={() => this._dismissNetworkError()}
        />
      );
    }

    if (!this.state.contractConnected) {
      return <Loading />;
    }

    return (
      <div className="container p-4">
        <div className="row">
          <div className="col-12">
            <h1>Travel Manager</h1>
            <p>Connected to Sepolia network.</p>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            <div className="card mb-4">
              <div className="card-header">
                <h2>Trips</h2>
              </div>
              <div className="card-body">
                <ul className="list-group">
                  {this.state.trips.map((trip, index) => (
                    <li key={index} className="list-group-item">
                      <strong>{index}:</strong> {trip.name}
                      <ul>
                        {trip.expenses.map((expense, i) => (
                          <li key={i}>
                            {expense.name}: {ethers.utils.formatEther(expense.amount)} ETH (Paid by: {expense.payer})
                          </li>
                        ))}
                      </ul>
                      <Balance trips={this.state.trips} tripId={index} sendPayment={(to, amount) => this._sendPayment(to, amount)} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-12">
            {this.state.txBeingSent && (
              <WaitingForTransactionMessage txHash={this.state.txBeingSent} />
            )}

            {this.state.transactionError && (
              <TransactionErrorMessage
                message={this._getRpcErrorMessage(this.state.transactionError)}
                dismiss={() => this._dismissTransactionError()}
              />
            )}
          </div>
        </div>

        <div className="row">
          <div className="col-md-6">
            <CreateTrip createTrip={(name, participants) => this._createTrip(name, participants)} />
          </div>
          <div className="col-md-6">
            <AddExpense addExpense={(tripId, name, amount) => this._addExpense(tripId, name, amount)} />
          </div>
        </div>
      </div>
    );
  }

  async _connectWallet() {
    const [selectedAddress] = await window.ethereum.request({ method: 'eth_requestAccounts' });
    this._checkNetwork();
    this._initialize(selectedAddress);
    window.ethereum.on("accountsChanged", ([newAddress]) => {
      this._stopPollingData();
      if (newAddress === undefined) {
        return this._resetState();
      }
      this._initialize(newAddress);
    });
  }

  _initialize(userAddress) {
    this.setState({ selectedAddress: userAddress });
    this._initializeEthers();
    this._startPollingData();
  }

  async _initializeEthers() {
    try {
      this._provider = new ethers.providers.Web3Provider(window.ethereum);
      this._travelManager = new ethers.Contract(
        contractAddress.TravelManager,
        TravelManagerArtifact.abi,
        this._provider.getSigner(0)
      );
      this.setState({ contractConnected: true });
      await this._updateTrips();
    } catch (error) {
      console.error("Failed to initialize ethers or contract: ", error);
    }
  }

  _startPollingData() {
    this._pollDataInterval = setInterval(() => this._updateTrips(), 1000);
    this._updateTrips();
  }

  _stopPollingData() {
    clearInterval(this._pollDataInterval);
    this._pollDataInterval = undefined;
  }

  async _updateTrips() {
    if (!this._travelManager) {
      console.error("TravelManager contract is not initialized.");
      return;
    }

    console.log("Updating trips");

    try {
      const tripCount = await this._travelManager.tripCount();
      let trips = [];
      for (let i = 0; i < tripCount; i++) {
        const trip = await this._travelManager.getTrip(i);
        const expenses = await this._travelManager.getExpenses(i);
        trips.push({
          name: trip[0],
          participants: trip[1],
          expenses: expenses.map(expense => ({
            name: expense.name,
            amount: expense.amount,
            payer: expense.payer
          }))
        });
      }
      this.setState({ trips });
    } catch (error) {
      console.error("Error fetching trip count or trips: ", error);
    }
  }

  async _createTrip(name, participants) {
    try {
      this._dismissTransactionError();
      const tx = await this._travelManager.createTrip(name, participants);
      this.setState({ txBeingSent: tx.hash });

      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }

      await this._updateTrips();
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  async _addExpense(tripId, name, amount) {
    try {
      this._dismissTransactionError();
      const tx = await this._travelManager.addExpense(tripId, name, ethers.utils.parseEther(amount));
      this.setState({ txBeingSent: tx.hash });
      const receipt = await tx.wait();
      if (receipt.status === 0) {
        throw new Error("Transaction failed");
      }
      await this._updateTrips();
    } catch (error) {
      if (error.code === ERROR_CODE_TX_REJECTED_BY_USER) {
        return;
      }
      console.error(error);
      this.setState({ transactionError: error });
    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  async _sendPayment(to, amount) {
    try {
      const tx = await this._provider.getSigner().sendTransaction({
        to,
        value: ethers.utils.parseEther(amount.toString())
      });
      this.setState({ txBeingSent: tx.hash });
      await tx.wait();
    } catch (error) {
      console.error("Error sending payment: ", error);
      this.setState({ transactionError: error });
    } finally {
      this.setState({ txBeingSent: undefined });
    }
  }

  _dismissTransactionError() {
    this.setState({ transactionError: undefined });
  }

  _dismissNetworkError() {
    this.setState({ networkError: undefined });
  }

  _getRpcErrorMessage(error) {
    if (error.data) {
      return error.data.message;
    }
    return error.message;
  }

  _resetState() {
    this.setState(this.initialState);
  }

  async _switchToSepolia() {
    const chainIdHex = `0x${parseInt(SEPOLIA_NETWORK_ID).toString(16)}`;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: chainIdHex }],
      });
    } catch (switchError) {
      if (switchError.code === 4902) {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: chainIdHex,
              chainName: 'Sepolia Test Network',
              nativeCurrency: {
                name: 'SepoliaETH',
                symbol: 'ETH',
                decimals: 18,
              },
              rpcUrls: ['https://eth-sepolia.g.alchemy.com/v2/72T53M3PnQ5MU6pjMvDw-NkcPXY5e2qh'],
              blockExplorerUrls: ['https://sepolia.etherscan.io'],
            },
          ],
        });
      }
    }
    await this._initialize(this.state.selectedAddress);
  }

  _checkNetwork() {
    if (window.ethereum.networkVersion !== SEPOLIA_NETWORK_ID) {
      this._switchToSepolia();
    }
  }
}
