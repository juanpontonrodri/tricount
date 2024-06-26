// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "hardhat/console.sol";

contract TravelManager {
    struct Expense {
        string name;
        uint256 amount;
        address payer;
    }

    struct Trip {
        string name;
        address[] participants;
        Expense[] expenses;
    }

    mapping(uint256 => Trip) public trips;
    uint256 public tripCount;

    event TripCreated(uint256 tripId, string name, address creator);
    event ExpenseAdded(uint256 tripId, string name, uint256 amount, address payer);

    function createTrip(string memory _name, address[] memory _participants) public {
        Trip storage newTrip = trips[tripCount];
        newTrip.name = _name;
        newTrip.participants = _participants;

        emit TripCreated(tripCount, _name, msg.sender);
        tripCount++;
    }

    function addExpense(uint256 _tripId, string memory _name, uint256 _amount) public {
        require(_tripId < tripCount, "Trip does not exist");
        Trip storage trip = trips[_tripId];

        bool isParticipant = false;
        for (uint256 i = 0; i < trip.participants.length; i++) {
            if (trip.participants[i] == msg.sender) {
                isParticipant = true;
                break;
            }
        }

        require(isParticipant, "You are not a participant in this trip");

        trip.expenses.push(Expense({
            name: _name,
            amount: _amount,
            payer: msg.sender
        }));

        emit ExpenseAdded(_tripId, _name, _amount, msg.sender);
    }

    function getTrip(uint256 _tripId) public view returns (string memory name, address[] memory participants, Expense[] memory expenses) {
        require(_tripId < tripCount, "Trip does not exist");
        Trip storage trip = trips[_tripId];
        return (trip.name, trip.participants, trip.expenses);
    }

    function getExpenses(uint256 _tripId) public view returns (Expense[] memory) {
        require(_tripId < tripCount, "Trip does not exist");
        Trip storage trip = trips[_tripId];
        return trip.expenses;
    }
}
