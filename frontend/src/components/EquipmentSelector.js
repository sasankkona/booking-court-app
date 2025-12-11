import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function EquipmentSelector({ onSelectEquipment }) {
  const [equipment, setEquipment] = useState([]);
  const [selected, setSelected] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.equipment.list()
      .then(res => setEquipment(res.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleQtyChange = (id, qty) => {
    const updated = { ...selected };
    if (qty > 0) {
      updated[id] = qty;
    } else {
      delete updated[id];
    }
    setSelected(updated);
    onSelectEquipment(updated);
  };

  if (loading) return <p>Loading equipment...</p>;

  return (
    <div className="equipment-selector">
      <h3>Rent Equipment (Optional)</h3>
      <div className="equipment-list">
        {equipment.map(item => (
          <div key={item._id} className="equipment-item">
            <label>{item.name} (${item.rentalPrice}/each) - {item.totalQuantity} available</label>
            <input
              type="number"
              min="0"
              max={item.totalQuantity}
              value={selected[item._id] || 0}
              onChange={(e) => handleQtyChange(item._id, parseInt(e.target.value))}
              className="qty-input"
            />
          </div>
        ))}
      </div>
    </div>
  );
}
