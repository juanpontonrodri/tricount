import React from "react";

export function CreateTrip({ createTrip }) {
  return (
    <div className="card mb-4">
      <div className="card-header">
        <h4>Create Trip</h4>
      </div>
      <div className="card-body">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const formData = new FormData(event.target);
            const name = formData.get("name");
            const participants = formData.get("participants").split(",").map(addr => addr.trim());
            if (name && participants.length > 0) {
              createTrip(name, participants);
            }
          }}
        >
          <div className="form-group">
            <label>Trip Name</label>
            <input className="form-control" type="text" name="name" required />
          </div>
          <div className="form-group">
            <label>Participants (comma-separated addresses)</label>
            <input className="form-control" type="text" name="participants" required />
          </div>
          <div className="form-group">
            <input className="btn btn-primary" type="submit" value="Create Trip" />
          </div>
        </form>
      </div>
    </div>
  );
}
