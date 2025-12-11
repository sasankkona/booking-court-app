import React, { useState } from 'react';
import { api } from '../services/api';
import { CourtSelector } from '../components/CourtSelector';
import { TimeSlotSelector } from '../components/TimeSlotSelector';
import { EquipmentSelector } from '../components/EquipmentSelector';
import { CoachSelector } from '../components/CoachSelector';
import { PriceBreakdown } from '../components/PriceBreakdown';

export function BookingPage() {
  const [userName, setUserName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [court, setCourt] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [equipmentQty, setEquipmentQty] = useState({});
  const [coach, setCoach] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [availabilityChecked, setAvailabilityChecked] = useState(false);

  const handleCheckAvailability = async () => {
    if (!court || !startTime) {
      setMessage({ type: 'error', text: 'Select court and time slot' });
      return;
    }

    setLoading(true);
    try {
      await api.bookings.checkAvailability({
        court: court._id,
        startTime,
        endTime,
        coach: coach ? coach._id : null,
        equipmentQty
      });
      setAvailabilityChecked(true);
      setMessage({ type: 'success', text: 'All resources available!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Availability check failed' });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!userName || !court || !startTime) {
      setMessage({ type: 'error', text: 'Fill all required fields' });
      return;
    }

    setLoading(true);
    try {
      const res = await api.bookings.create({
        userName,
        court: court._id,
        startTime,
        endTime,
        equipment: Object.keys(equipmentQty),
        equipmentQty,
        coach: coach ? coach._id : null
      });

      // Show different messages based on booking status
      if (res.data.status === 'confirmed') {
        setMessage({ type: 'success', text: `✓ Booking confirmed! Booking ID: ${res.data.bookingId}` });
      } else if (res.data.status === 'waitlist') {
        setMessage({ 
          type: 'warning', 
          text: `You've been added to the waitlist at position ${res.data.position}. You'll be notified when a slot becomes available.` 
        });
      }

      // Reset form
      setUserName('');
      setCourt(null);
      setStartTime(null);
      setEquipmentQty({});
      setCoach(null);
      setAvailabilityChecked(false);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.error || 'Booking failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="booking-page">
      <h1>Book Your Court</h1>

      <div className="form-section">
        <input
          type="text"
          placeholder="Your Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="text-input"
        />
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="date-input"
        />
      </div>

      <CourtSelector onSelectCourt={setCourt} />
      {court && <TimeSlotSelector date={date} onSelectTime={(s, e) => { setStartTime(s); setEndTime(e); }} />}
      {court && startTime && <EquipmentSelector onSelectEquipment={setEquipmentQty} />}
      {court && startTime && <CoachSelector onSelectCoach={setCoach} />}

      {court && startTime && (
        <PriceBreakdown court={court} startTime={startTime} equipmentQty={equipmentQty} coach={coach} />
      )}

      <div className="actions">
        <button onClick={handleCheckAvailability} disabled={loading || !court || !startTime} className="btn-check">
          Check Availability
        </button>
        {availabilityChecked && (
          <button onClick={handleBooking} disabled={loading || !userName} className="btn-book">
            Confirm Booking
          </button>
        )}
      </div>

      {message && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}
    </div>
  );
}
