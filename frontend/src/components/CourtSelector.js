import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function CourtSelector({ onSelectCourt }) {
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCourts = () => {
    setLoading(true);
    setError(null);
    api.courts.list()
      .then(res => setCourts(res.data || []))
      .catch(err => {
        console.error('Failed to load courts:', err);
        setError(err?.message || 'Failed to load courts');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  if (loading) return <p>Loading courts...</p>;

  return (
    <div className="court-selector">
      <h3>Select Court</h3>
      {error && (
        <div className="error">
          <p>Error loading courts: {error}</p>
          <button onClick={fetchCourts}>Retry</button>
        </div>
      )}
      {!error && courts.length === 0 && (
        <div className="empty">
          <p>No courts available. Ensure the backend is running and /api/courts returns data.</p>
          <button onClick={fetchCourts}>Retry</button>
        </div>
      )}
      <div className="grid">
        {courts.map(court => (
          <button
            key={court._id}
            onClick={() => onSelectCourt(court)}
            className="court-card"
          >
            <div className="court-name">{court.name}</div>
            <div className="court-type">{court.type}</div>
            <div className="court-price">${court.basePrice}/hr</div>
          </button>
        ))}
      </div>
    </div>
  );
}
