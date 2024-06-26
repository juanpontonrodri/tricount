import React, { useState } from "react";

export function AddExpense({ addExpense }) {
  const [tripId, setTripId] = useState("");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    addExpense(tripId, name, amount);
  };

  return (
    <div className="card mb-4">
      <div className="card-header">
        <h4>Add Expense</h4>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Trip ID</label>
            <input className="form-control" type="text" value={tripId} onChange={(e) => setTripId(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Expense Name</label>
            <input className="form-control" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Amount (in ETH)</label>
            <input className="form-control" type="text" value={amount} onChange={(e) => setAmount(e.target.value)} required />
          </div>
          <div className="form-group">
            <input className="btn btn-primary" type="submit" value="Add Expense" />
          </div>
        </form>
      </div>
    </div>
  );
}
