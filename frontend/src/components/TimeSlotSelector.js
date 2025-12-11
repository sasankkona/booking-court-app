import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function TimeSlotSelector({ date, onSelectTime, startHour = 6, endHour = 22 }) {
  const [selectedTime, setSelectedTime] = useState(null);
  const hours = Array.from({ length: Math.max(0, endHour - startHour) }, (_, i) => i + startHour);

  const handleSelectTime = (hour) => {
    const start = new Date(date);
    start.setHours(hour, 0, 0, 0);
    const end = new Date(start);
    end.setHours(hour + 1);
    setSelectedTime(hour);
    onSelectTime(start, end);
  };

  const fmt = (h) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hh = ((h + 11) % 12) + 1; // convert 0..23 -> 12h
    return `${hh}:00 ${ampm}`;
  };

  return (
    <div className="time-slot-selector">
      <h3>Select Time Slot</h3>
      <p className="date-display">{new Date(date).toDateString()}</p>
      <div className="time-grid">
        {hours.map(hour => (
          <button
            key={hour}
            onClick={() => handleSelectTime(hour)}
            className={`time-slot ${selectedTime === hour ? 'selected' : ''}`}
          >
            {`${fmt(hour)} - ${fmt(hour + 1)}`}
          </button>
        ))}
      </div>
    </div>
  );
}
