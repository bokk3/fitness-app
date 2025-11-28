'use client';

import { useState, useEffect } from 'react';
import type { BodyMeasurement } from '@/lib/types';

export default function MeasurementTracker() {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    weight: '',
    body_fat_percentage: '',
    chest: '',
    waist: '',
    hips: '',
    bicep_left: '',
    bicep_right: '',
    thigh_left: '',
    thigh_right: '',
    notes: ''
  });

  const fetchMeasurements = async () => {
    const res = await fetch('/api/measurements');
    const data = await res.json();
    setMeasurements(data);
  };

  useEffect(() => {
    fetchMeasurements();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/measurements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: formData.date,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        body_fat_percentage: formData.body_fat_percentage ? parseFloat(formData.body_fat_percentage) : null,
        chest: formData.chest ? parseFloat(formData.chest) : null,
        waist: formData.waist ? parseFloat(formData.waist) : null,
        hips: formData.hips ? parseFloat(formData.hips) : null,
        bicep_left: formData.bicep_left ? parseFloat(formData.bicep_left) : null,
        bicep_right: formData.bicep_right ? parseFloat(formData.bicep_right) : null,
        thigh_left: formData.thigh_left ? parseFloat(formData.thigh_left) : null,
        thigh_right: formData.thigh_right ? parseFloat(formData.thigh_right) : null,
        notes: formData.notes || null
      })
    });

    if (res.ok) {
      setShowForm(false);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        weight: '',
        body_fat_percentage: '',
        chest: '',
        waist: '',
        hips: '',
        bicep_left: '',
        bicep_right: '',
        thigh_left: '',
        thigh_right: '',
        notes: ''
      });
      fetchMeasurements();
    }
  };

  const deleteMeasurement = async (id: number) => {
    if (!confirm('Deze meting verwijderen?')) return;
    await fetch(`/api/measurements?id=${id}`, { method: 'DELETE' });
    fetchMeasurements();
  };

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'ANNULEREN' : '+ METING LOGGEN'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="card-header">
            <h3 className="card-title">Meting Loggen</h3>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div>
              <label>Datum</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-2">
              <div>
                <label>Gewicht (kg)</label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  step="0.1"
                  placeholder="75.5"
                />
              </div>
              <div>
                <label>Vetpercentage %</label>
                <input
                  type="number"
                  value={formData.body_fat_percentage}
                  onChange={(e) => setFormData({ ...formData, body_fat_percentage: e.target.value })}
                  step="0.1"
                  placeholder="15.5"
                />
              </div>
            </div>
            <h4>Lichaamsmetingen (cm)</h4>
            <div className="grid grid-3">
              <div>
                <label>Borst</label>
                <input
                  type="number"
                  value={formData.chest}
                  onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                  step="0.1"
                />
              </div>
              <div>
                <label>Taille</label>
                <input
                  type="number"
                  value={formData.waist}
                  onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  step="0.1"
                />
              </div>
              <div>
                <label>Heupen</label>
                <input
                  type="number"
                  value={formData.hips}
                  onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                  step="0.1"
                />
              </div>
              <div>
                <label>Biceps (L)</label>
                <input
                  type="number"
                  value={formData.bicep_left}
                  onChange={(e) => setFormData({ ...formData, bicep_left: e.target.value })}
                  step="0.1"
                />
              </div>
              <div>
                <label>Biceps (R)</label>
                <input
                  type="number"
                  value={formData.bicep_right}
                  onChange={(e) => setFormData({ ...formData, bicep_right: e.target.value })}
                  step="0.1"
                />
              </div>
              <div>
                <label>Bovenbeen (L)</label>
                <input
                  type="number"
                  value={formData.thigh_left}
                  onChange={(e) => setFormData({ ...formData, thigh_left: e.target.value })}
                  step="0.1"
                />
              </div>
              <div>
                <label>Bovenbeen (R)</label>
                <input
                  type="number"
                  value={formData.thigh_right}
                  onChange={(e) => setFormData({ ...formData, thigh_right: e.target.value })}
                  step="0.1"
                />
              </div>
            </div>
            <div>
              <label>Notities</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optionele notities..."
                rows={2}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-large">
              METING OPSLAAN
            </button>
          </form>
        </div>
      )}

      {measurements.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Gewicht</th>
              <th>Vet%</th>
              <th>Borst</th>
              <th>Taille</th>
              <th>Heupen</th>
              <th>Actie</th>
            </tr>
          </thead>
          <tbody>
            {measurements.map(m => (
              <tr key={m.id}>
                <td>{new Date(m.date).toLocaleDateString()}</td>
                <td>{m.weight ? `${m.weight} kg` : '--'}</td>
                <td>{m.body_fat_percentage ? `${m.body_fat_percentage}%` : '--'}</td>
                <td>{m.chest ? `${m.chest} cm` : '--'}</td>
                <td>{m.waist ? `${m.waist} cm` : '--'}</td>
                <td>{m.hips ? `${m.hips} cm` : '--'}</td>
                <td>
                  <button onClick={() => deleteMeasurement(m.id)} className="btn btn-small">
                    Verwijderen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
          <p style={{ margin: 0, fontWeight: 700 }}>NOG GEEN METINGEN</p>
        </div>
      )}
    </div>
  );
}
