import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function CoachSelector({ onSelectCoach }) {
  const [coaches, setCoaches] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.coaches.list()
      .then(res => setCoaches(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSelect = (coach) => {
    setSelected(coach);
    onSelectCoach(coach);
  };

  if (loading) return <p>Loading coaches...</p>;

  return (
    <div className="coach-selector">
      <h3>Book a Coach (Optional)</h3>
      <div className="coach-list">
        {coaches.map(coach => (
          <button
            key={coach._id}
            onClick={() => handleSelect(coach)}
            className={`coach-card ${selected?._id === coach._id ? 'selected' : ''}`}
          >
            <div className="coach-name">{coach.name}</div>
            <div className="coach-rate">${coach.hourlyRate}/hr</div>
          </button>
        ))}
      </div>
      <button onClick={() => { setSelected(null); onSelectCoach(null); }} className="clear-btn">
        No Coach
      </button>
    </div>
  );
}
