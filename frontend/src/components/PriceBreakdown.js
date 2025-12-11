import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function PriceBreakdown({ court, startTime, equipmentQty, coach }) {
  const [breakdown, setBreakdown] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!court || !startTime) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    api.bookings.calculatePrice({
      court: court._id,
      startTime,
      equipmentQty: equipmentQty || {},
      coach: coach ? coach._id : null
    })
      .then(res => {
        if (cancelled) return;
        setBreakdown(res.data);
      })
      .catch(err => {
        if (cancelled) return;
        // axios network errors may not have response
        setError(err.response?.data?.error || err.message || 'Error calculating price');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
    // stringify equipmentQty to avoid object reference changes causing extra calls
  }, [court, startTime, JSON.stringify(equipmentQty || {}), coach]);

  if (loading) return <div className="price-breakdown loading">Calculating...</div>;
  if (error) return <div className="price-breakdown error">{error}</div>;
  if (!breakdown) return <div className="price-breakdown">Select all options to see price</div>;

  const showValue = (v) => (v !== null && v !== undefined);

  return (
    <div className="price-breakdown">
      <h3>Price Breakdown</h3>
      <div className="breakdown-items">
        {showValue(breakdown.base) && <div className="item"><span>Base Price:</span> <span>${breakdown.base}</span></div>}
        {showValue(breakdown.peakHour) && <div className="item"><span>Peak Hour Surcharge:</span> <span>${breakdown.peakHour}</span></div>}
        {showValue(breakdown.weekend) && <div className="item"><span>Weekend Surcharge:</span> <span>${breakdown.weekend}</span></div>}
        {showValue(breakdown.courtType) && <div className="item"><span>Court Premium:</span> <span>${breakdown.courtType}</span></div>}
        {showValue(breakdown.equipment) && <div className="item"><span>Equipment:</span> <span>${breakdown.equipment}</span></div>}
        {showValue(breakdown.coach) && <div className="item"><span>Coach:</span> <span>${breakdown.coach}</span></div>}
      </div>
      <div className="total">
        <strong>Total: ${breakdown.total}</strong>
      </div>
    </div>
  );
}
