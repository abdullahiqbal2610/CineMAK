// src/components/SeatBooking.js
import React, { useState } from "react";
import { getSeatingDetails } from "../api/api";

const SeatBooking = () => {
  const [showTimeId, setShowTimeId] = useState("");
  const [seats, setSeats] = useState([]);

  const handleFetchSeats = async () => {
    try {
      const data = await getSeatingDetails(showTimeId);
      setSeats(data);
    } catch (error) {
      console.error("Seat fetching error:", error);
      alert("Error fetching seat details.");
    }
  };

  const handleBookSeat = (seat) => {
    // In a full implementation, you'd mark the seat as booked.
    // Here we just alert the user.
    alert(`Booking seat ${seat.ShowtimeSeatId} (${seat.SeatType})`);
  };

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        marginBottom: "20px",
      }}
    >
      <h3>Book Seats</h3>
      <div>
        <input
          type="number"
          placeholder="Enter Showtime ID"
          value={showTimeId}
          onChange={(e) => setShowTimeId(e.target.value)}
        />
        <button onClick={handleFetchSeats} style={{ marginLeft: "10px" }}>
          Fetch Seats
        </button>
      </div>
      {seats.length > 0 && (
        <div>
          <h4>Available Seats</h4>
          <ul>
            {seats.map((seat) => (
              <li key={seat.ShowtimeSeatId}>
                Seat ID: {seat.ShowtimeSeatId}, Type: {seat.SeatType}, Price:{" "}
                {seat.SeatPrice}{" "}
                {seat.seatFull ? (
                  "(Full)"
                ) : (
                  <button
                    onClick={() => handleBookSeat(seat)}
                    style={{ marginLeft: "10px" }}
                  >
                    Book Seat
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SeatBooking;
