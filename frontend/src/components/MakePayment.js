import React from "react";

export function MakePayment({ makePayment }) {
  return (
    <div>
      <h4>Make Payment</h4>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.target);
          const tripId = formData.get("tripId");
          const amount = formData.get("amount");
          if (tripId && amount) {
            makePayment(tripId, amount);
          }
        }}
      >
        <div className="form-group">
          <label>Trip ID</label>
          <input className="form-control" type="number" name="tripId" required />
        </div>
        <div className="form-group">
          <label>Amount (ETH)</label>
          <input className="form-control" type="text" name="amount" required />
        </div>
        <div className="form-group">
          <input className="btn btn-primary" type="submit" value="Make Payment" />
        </div>
      </form>
    </div>
  );
}
