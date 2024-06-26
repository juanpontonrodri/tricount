import React from "react";
import { ethers } from "ethers";

export function Balance({ trips, tripId, sendPayment }) {
  const calculateBalances = () => {
    const trip = trips[tripId];
    if (!trip) return [];

    const balances = {};
    trip.participants.forEach(participant => {
      balances[participant] = ethers.BigNumber.from(0);
    });

    trip.expenses.forEach(expense => {
      balances[expense.payer] = balances[expense.payer].add(expense.amount);
    });

    const totalPayments = trip.expenses.reduce((total, expense) => total.add(expense.amount), ethers.BigNumber.from(0));
    const averagePayment = totalPayments.div(trip.participants.length);

    return trip.participants.map(participant => ({
      name: participant,
      balance: balances[participant].sub(averagePayment)
    }));
  };

  const renderBalances = () => {
    const balanceList = calculateBalances();
    const creditors = balanceList.filter(b => b.balance.gt(0));
    const debtors = balanceList.filter(b => b.balance.lt(0));

    return (
      <>
        {debtors.map(debtor =>
          creditors.map(creditor => {
            const debtAmount = debtor.balance.abs().lt(creditor.balance) ? debtor.balance.abs() : creditor.balance;
            if (debtAmount.gt(0)) {
              return (
                <li key={`${debtor.name}-${creditor.name}`}>
                  {debtor.name} owes {creditor.name} {ethers.utils.formatEther(debtAmount)} ETH
                  {debtor.name.toLowerCase() === window.ethereum.selectedAddress.toLowerCase() && (
                    <button onClick={() => sendPayment(creditor.name, ethers.utils.formatEther(debtAmount))}>Pay Now</button>
                  )}
                </li>
              );
            }
            return null;
          })
        )}
      </>
    );
  };

  return (
    <div>
      <h4>Balances</h4>
      <ul>{renderBalances()}</ul>
    </div>
  );
}
