import React, { useState, useEffect } from 'react';
import { api } from '../services/api';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState('courts');
  const [courts, setCourts] = useState([]);
  const [equipment, setEquipment] = useState([]);
  const [coaches, setCoaches] = useState([]);
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editingType, setEditingType] = useState(null);
  const [editingValues, setEditingValues] = useState({ name: '', type: 'indoor', basePrice: 0 });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [courtsRes, equipRes, coachesRes, rulesRes] = await Promise.all([
        api.courts.list(),
        api.equipment.list(),
        api.coaches.list(),
        api.pricing.list()
      ]);
      setCourts(courtsRes.data || []);
      setEquipment(equipRes.data || []);
      setCoaches(coachesRes.data || []);
      setRules(rulesRes.data || []);
    } catch (err) {
      console.error('Error fetching data:', err);
    }
  };

  const handleAddCourt = async (e) => {
    e.preventDefault();
    const name = e.target.courtName.value;
    const type = e.target.courtType.value;
    const basePrice = parseFloat(e.target.courtPrice.value);

    setLoading(true);
    try {
      await api.courts.create({ name, type, basePrice });
      fetchAllData();
      e.target.reset();
    } catch (err) {
      console.error(err);
      window.alert('Failed to add court');
    } finally {
      setLoading(false);
    }
  };

  const handleAddEquipment = async (e) => {
    e.preventDefault();
    const name = e.target.equipName.value;
    const totalQuantity = parseInt(e.target.equipQty.value, 10);
    const rentalPrice = parseFloat(e.target.equipPrice.value);

    setLoading(true);
    try {
      await api.equipment.create({ name, totalQuantity, rentalPrice });
      fetchAllData();
      e.target.reset();
    } catch (err) {
      console.error(err);
      window.alert('Failed to add equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCoach = async (e) => {
    e.preventDefault();
    const name = e.target.coachName.value;
    const hourlyRate = parseFloat(e.target.coachRate.value);

    setLoading(true);
    try {
      await api.coaches.create({ name, hourlyRate });
      fetchAllData();
      e.target.reset();
    } catch (err) {
      console.error(err);
      window.alert('Failed to add coach');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    const name = e.target.ruleName.value;
    const type = e.target.ruleType.value;
    const multiplier = e.target.ruleMultiplier?.value ? parseFloat(e.target.ruleMultiplier.value) : null;
    const surcharge = e.target.ruleSurcharge?.value ? parseFloat(e.target.ruleSurcharge.value) : null;

    setLoading(true);
    try {
      await api.pricing.create({ name, type, params: {}, multiplier, surcharge, active: true });
      fetchAllData();
      e.target.reset();
    } catch (err) {
      console.error(err);
      window.alert('Failed to add rule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-panel">
      <h1>Admin Dashboard</h1>

      <div className="tabs">
        <button onClick={() => setActiveTab('courts')} className={`tab ${activeTab === 'courts' ? 'active' : ''}`}>
          Courts
        </button>
        <button onClick={() => setActiveTab('equipment')} className={`tab ${activeTab === 'equipment' ? 'active' : ''}`}>
          Equipment
        </button>
        <button onClick={() => setActiveTab('coaches')} className={`tab ${activeTab === 'coaches' ? 'active' : ''}`}>
          Coaches
        </button>
        <button onClick={() => setActiveTab('pricing')} className={`tab ${activeTab === 'pricing' ? 'active' : ''}`}>
          Pricing Rules
        </button>
      </div>

      {activeTab === 'courts' && (
        <div className="tab-content">
          <h2>Manage Courts</h2>
          <form onSubmit={handleAddCourt} className="admin-form">
            <input type="text" name="courtName" placeholder="Court Name" required />
            <select name="courtType" required>
              <option value="">Select Type</option>
              <option value="indoor">Indoor</option>
              <option value="outdoor">Outdoor</option>
            </select>
            <input type="number" name="courtPrice" placeholder="Base Price" step="0.01" required />
            <button type="submit" disabled={loading}>Add Court</button>
          </form>

          <div className="list">
            {courts.map(court => (
              <div key={court._id} className="item">
                {editingId === court._id && editingType === 'courts' ? (
                  <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                    <input
                      value={editingValues.name}
                      onChange={e => setEditingValues(v => ({ ...v, name: e.target.value }))}
                      style={{ flex: 1 }}
                    />
                    <select
                      value={editingValues.type}
                      onChange={e => setEditingValues(v => ({ ...v, type: e.target.value }))}
                    >
                      <option value="indoor">Indoor</option>
                      <option value="outdoor">Outdoor</option>
                    </select>
                    <input
                      type="number"
                      value={editingValues.basePrice}
                      onChange={e => setEditingValues(v => ({ ...v, basePrice: parseFloat(e.target.value || 0) }))}
                      style={{ width: 100 }}
                    />
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await api.courts.update(court._id, editingValues);
                          setEditingId(null);
                          setEditingType(null);
                          fetchAllData();
                        } catch (err) {
                          console.error('Update failed', err);
                          window.alert('Failed to update court');
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Save
                    </button>
                    <button onClick={() => { setEditingId(null); setEditingType(null); }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <span>
                      {court.name} ({court.type}) - ${court.basePrice} {court.active === false && <em>(disabled)</em>}
                    </span>
                    <div>
                      <button
                        onClick={() => {
                          setEditingId(court._id);
                          setEditingType('courts');
                          setEditingValues({ name: court.name, type: court.type, basePrice: court.basePrice });
                        }}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          const verb = court.active === false ? 'Enable' : 'Disable';
                          if (!window.confirm(`${verb} court "${court.name}"?`)) return;
                          setLoading(true);
                          try {
                            await api.courts.update(court._id, { active: !court.active });
                            fetchAllData();
                          } catch (err) {
                            console.error('Toggle active failed', err);
                            window.alert('Failed to toggle court active status');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="clear-btn"
                        disabled={loading}
                      >
                        {court.active === false ? 'Enable' : 'Disable'}
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Delete court "${court.name}"?`)) return;
                          setLoading(true);
                          try {
                            await api.courts.delete(court._id);
                            fetchAllData();
                          } catch (err) {
                            console.error('Delete failed', err);
                            window.alert('Failed to delete court');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="clear-btn"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'equipment' && (
        <div className="tab-content">
          <h2>Manage Equipment</h2>
          <form onSubmit={handleAddEquipment} className="admin-form">
            <input type="text" name="equipName" placeholder="Equipment Name" required />
            <input type="number" name="equipQty" placeholder="Quantity" required />
            <input type="number" name="equipPrice" placeholder="Rental Price" step="0.01" required />
            <button type="submit" disabled={loading}>Add Equipment</button>
          </form>
          <div className="list">
            {equipment.map(item => (
              <div key={item._id} className="item">
                {editingId === item._id && editingType === 'equipment' ? (
                  <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                    <input
                      value={editingValues.name}
                      onChange={e => setEditingValues(v => ({ ...v, name: e.target.value }))}
                      style={{ flex: 1 }}
                      placeholder="Equipment Name"
                    />
                    <input
                      type="number"
                      value={editingValues.totalQuantity}
                      onChange={e => setEditingValues(v => ({ ...v, totalQuantity: parseInt(e.target.value || 0, 10) }))}
                      style={{ width: 100 }}
                      placeholder="Qty"
                    />
                    <input
                      type="number"
                      value={editingValues.rentalPrice}
                      onChange={e => setEditingValues(v => ({ ...v, rentalPrice: parseFloat(e.target.value || 0) }))}
                      style={{ width: 100 }}
                      placeholder="Price"
                    />
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await api.equipment.update(item._id, editingValues);
                          setEditingId(null);
                          setEditingType(null);
                          fetchAllData();
                        } catch (err) {
                          console.error('Update failed', err);
                          window.alert('Failed to update equipment');
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Save
                    </button>
                    <button onClick={() => { setEditingId(null); setEditingType(null); }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <span>{item.name} - {item.totalQuantity} @ ${item.rentalPrice}/ea {item.active === false && <em>(disabled)</em>}</span>
                    <div>
                      <button
                        onClick={() => {
                          setEditingId(item._id);
                          setEditingType('equipment');
                          setEditingValues({ name: item.name, totalQuantity: item.totalQuantity, rentalPrice: item.rentalPrice });
                        }}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          const verb = item.active === false ? 'Enable' : 'Disable';
                          if (!window.confirm(`${verb} equipment "${item.name}"?`)) return;
                          setLoading(true);
                          try {
                            await api.equipment.update(item._id, { active: !item.active });
                            fetchAllData();
                          } catch (err) {
                            console.error('Toggle failed', err);
                            window.alert('Failed to toggle equipment');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="clear-btn"
                        disabled={loading}
                      >
                        {item.active === false ? 'Enable' : 'Disable'}
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Delete equipment "${item.name}"?`)) return;
                          setLoading(true);
                          try {
                            await api.equipment.delete(item._id);
                            fetchAllData();
                          } catch (err) {
                            console.error('Delete failed', err);
                            window.alert('Failed to delete equipment');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="clear-btn"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'coaches' && (
        <div className="tab-content">
          <h2>Manage Coaches</h2>
          <form onSubmit={handleAddCoach} className="admin-form">
            <input type="text" name="coachName" placeholder="Coach Name" required />
            <input type="number" name="coachRate" placeholder="Hourly Rate" step="0.01" required />
            <button type="submit" disabled={loading}>Add Coach</button>
          </form>
          <div className="list">
            {coaches.map(coach => (
              <div key={coach._id} className="item">
                {editingId === coach._id && editingType === 'coaches' ? (
                  <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center' }}>
                    <input
                      value={editingValues.name}
                      onChange={e => setEditingValues(v => ({ ...v, name: e.target.value }))}
                      style={{ flex: 1 }}
                      placeholder="Coach Name"
                    />
                    <input
                      type="number"
                      value={editingValues.hourlyRate}
                      onChange={e => setEditingValues(v => ({ ...v, hourlyRate: parseFloat(e.target.value || 0) }))}
                      style={{ width: 100 }}
                      placeholder="Rate"
                    />
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await api.coaches.update(coach._id, editingValues);
                          setEditingId(null);
                          setEditingType(null);
                          fetchAllData();
                        } catch (err) {
                          console.error('Update failed', err);
                          window.alert('Failed to update coach');
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Save
                    </button>
                    <button onClick={() => { setEditingId(null); setEditingType(null); }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <span>{coach.name} - ${coach.hourlyRate}/hr {coach.active === false && <em>(disabled)</em>}</span>
                    <div>
                      <button
                        onClick={() => {
                          setEditingId(coach._id);
                          setEditingType('coaches');
                          setEditingValues({ name: coach.name, hourlyRate: coach.hourlyRate });
                        }}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          const verb = coach.active === false ? 'Enable' : 'Disable';
                          if (!window.confirm(`${verb} coach "${coach.name}"?`)) return;
                          setLoading(true);
                          try {
                            await api.coaches.update(coach._id, { active: !coach.active });
                            fetchAllData();
                          } catch (err) {
                            console.error('Toggle failed', err);
                            window.alert('Failed to toggle coach');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="clear-btn"
                        disabled={loading}
                      >
                        {coach.active === false ? 'Enable' : 'Disable'}
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Delete coach "${coach.name}"?`)) return;
                          setLoading(true);
                          try {
                            await api.coaches.delete(coach._id);
                            fetchAllData();
                          } catch (err) {
                            console.error('Delete failed', err);
                            window.alert('Failed to delete coach');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="clear-btn"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'pricing' && (
        <div className="tab-content">
          <h2>Manage Pricing Rules</h2>
          <form onSubmit={handleAddRule} className="admin-form">
            <input type="text" name="ruleName" placeholder="Rule Name" required />
            <select name="ruleType" required>
              <option value="">Select Type</option>
              <option value="timeRange">Time Range (Peak Hours)</option>
              <option value="day">Day (Weekend)</option>
              <option value="courtType">Court Type (Indoor/Outdoor)</option>
            </select>
            <input type="number" name="ruleMultiplier" placeholder="Multiplier (e.g., 1.5)" step="0.01" />
            <input type="number" name="ruleSurcharge" placeholder="Surcharge (e.g., 5.00)" step="0.01" />
            <button type="submit" disabled={loading}>Add Rule</button>
          </form>
          <div className="list">
            {rules.map(rule => (
              <div key={rule._id} className="item">
                {editingId === rule._id && editingType === 'pricing' ? (
                  <div style={{ display: 'flex', gap: '8px', width: '100%', alignItems: 'center', flexWrap: 'wrap' }}>
                    <input
                      value={editingValues.name}
                      onChange={e => setEditingValues(v => ({ ...v, name: e.target.value }))}
                      style={{ flex: 1, minWidth: 150 }}
                      placeholder="Rule Name"
                    />
                    <select
                      value={editingValues.type}
                      onChange={e => setEditingValues(v => ({ ...v, type: e.target.value }))}
                    >
                      <option value="timeRange">Time Range (Peak Hours)</option>
                      <option value="day">Day (Weekend)</option>
                      <option value="courtType">Court Type (Indoor/Outdoor)</option>
                    </select>
                    <input
                      type="number"
                      step="0.01"
                      value={editingValues.multiplier}
                      onChange={e => setEditingValues(v => ({ ...v, multiplier: parseFloat(e.target.value || 1) }))}
                      style={{ width: 100 }}
                      placeholder="Multiplier"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={editingValues.surcharge}
                      onChange={e => setEditingValues(v => ({ ...v, surcharge: parseFloat(e.target.value || 0) }))}
                      style={{ width: 100 }}
                      placeholder="Surcharge"
                    />
                    <button
                      onClick={async () => {
                        setLoading(true);
                        try {
                          await api.pricing.update(rule._id, editingValues);
                          setEditingId(null);
                          setEditingType(null);
                          fetchAllData();
                        } catch (err) {
                          console.error('Update failed', err);
                          window.alert('Failed to update pricing rule');
                        } finally {
                          setLoading(false);
                        }
                      }}
                    >
                      Save
                    </button>
                    <button onClick={() => { setEditingId(null); setEditingType(null); }}>Cancel</button>
                  </div>
                ) : (
                  <>
                    <span>{rule.name} ({rule.type}) - {rule.multiplier ? `x${rule.multiplier}` : `+$${rule.surcharge}`} {rule.active === false && <em>(disabled)</em>}</span>
                    <div>
                      <button
                        onClick={() => {
                          setEditingId(rule._id);
                          setEditingType('pricing');
                          setEditingValues({ name: rule.name, type: rule.type, multiplier: rule.multiplier || 1, surcharge: rule.surcharge || 0 });
                        }}
                        disabled={loading}
                      >
                        Edit
                      </button>
                      <button
                        onClick={async () => {
                          const verb = rule.active === false ? 'Enable' : 'Disable';
                          if (!window.confirm(`${verb} pricing rule "${rule.name}"?`)) return;
                          setLoading(true);
                          try {
                            await api.pricing.update(rule._id, { active: !rule.active });
                            fetchAllData();
                          } catch (err) {
                            console.error('Toggle failed', err);
                            window.alert('Failed to toggle pricing rule');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="clear-btn"
                        disabled={loading}
                      >
                        {rule.active === false ? 'Enable' : 'Disable'}
                      </button>
                      <button
                        onClick={async () => {
                          if (!window.confirm(`Delete pricing rule "${rule.name}"?`)) return;
                          setLoading(true);
                          try {
                            await api.pricing.delete(rule._id);
                            fetchAllData();
                          } catch (err) {
                            console.error('Delete failed', err);
                            window.alert('Failed to delete pricing rule');
                          } finally {
                            setLoading(false);
                          }
                        }}
                        className="clear-btn"
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
