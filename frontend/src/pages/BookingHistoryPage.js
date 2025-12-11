import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function BookingHistoryPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.bookings.list()
      .then(res => setBookings(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading bookings...</p>;

  return (
    <div className="booking-history-page">
      <h1>Booking History</h1>
      {bookings.length === 0 ? (
        <p>No bookings yet.</p>
      ) : (
        <div className="bookings-list">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <h3>{booking.userName}</h3>
              <p><strong>Court:</strong> {booking.court?.name}</p>
              <p><strong>Time:</strong> {new Date(booking.startTime).toLocaleString()} - {new Date(booking.endTime).toLocaleTimeString()}</p>
              <p><strong>Status:</strong> <span className={`status ${booking.status}`}>{booking.status}</span></p>
              <p><strong>Total:</strong> ${booking.pricingBreakdown?.total || 'N/A'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
