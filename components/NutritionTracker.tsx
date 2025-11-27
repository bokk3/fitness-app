'use client';

import { useState, useEffect } from 'react';
import type { NutritionLogWithFood, NutritionFood } from '@/lib/types';

export default function NutritionTracker() {
  const [logs, setLogs] = useState<NutritionLogWithFood[]>([]);
  const [foods, setFoods] = useState<NutritionFood[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    food_id: 0,
    meal_type: 'breakfast' as 'breakfast' | 'lunch' | 'dinner' | 'snack',
    servings: 1,
    notes: ''
  });

  const fetchFoods = async () => {
    const res = await fetch('/api/foods');
    const data = await res.json();
    setFoods(data);
  };

  const fetchLogs = async () => {
    const res = await fetch(`/api/nutrition?date=${selectedDate}`);
    const data = await res.json();
    setLogs(data);
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.food_id === 0) {
      alert('Please select a food');
      return;
    }

    const res = await fetch('/api/nutrition', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        date: selectedDate
      })
    });

    if (res.ok) {
      setShowForm(false);
      setFormData({
        food_id: 0,
        meal_type: 'breakfast',
        servings: 1,
        notes: ''
      });
      fetchLogs();
    }
  };

  const deleteLog = async (logId: number) => {
    await fetch(`/api/nutrition?id=${logId}`, { method: 'DELETE' });
    fetchLogs();
  };

  // Calculate daily totals
  const totals = logs.reduce((acc, log) => {
    const servings = log.servings;
    return {
      calories: acc.calories + (log.food.calories * servings),
      protein: acc.protein + (log.food.protein * servings),
      carbs: acc.carbs + (log.food.carbs * servings),
      fat: acc.fat + (log.food.fat * servings)
    };
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

  const mealTypes = ['breakfast', 'lunch', 'dinner', 'snack'] as const;

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-sm)', alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{ flex: '0 0 auto' }}
        />
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'CANCEL' : '+ LOG FOOD'}
        </button>
      </div>

      <div className="grid grid-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="stat-card">
          <div className="stat-value">{Math.round(totals.calories)}</div>
          <div className="stat-label">Calories</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Math.round(totals.protein)}g</div>
          <div className="stat-label">Protein</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Math.round(totals.carbs)}g</div>
          <div className="stat-label">Carbs</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{Math.round(totals.fat)}g</div>
          <div className="stat-label">Fat</div>
        </div>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="card-header">
            <h3 className="card-title">Log Food</h3>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div>
              <label>Food</label>
              <select
                value={formData.food_id}
                onChange={(e) => setFormData({ ...formData, food_id: Number(e.target.value) })}
                required
              >
                <option value={0}>Select food...</option>
                {foods.map(food => (
                  <option key={food.id} value={food.id}>
                    {food.name} ({food.calories} cal, {food.serving_size})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-2">
              <div>
                <label>Meal Type</label>
                <select
                  value={formData.meal_type}
                  onChange={(e) => setFormData({ ...formData, meal_type: e.target.value as typeof formData.meal_type })}
                >
                  <option value="breakfast">Breakfast</option>
                  <option value="lunch">Lunch</option>
                  <option value="dinner">Dinner</option>
                  <option value="snack">Snack</option>
                </select>
              </div>
              <div>
                <label>Servings</label>
                <input
                  type="number"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: parseFloat(e.target.value) })}
                  min="0.1"
                  step="0.1"
                  required
                />
              </div>
            </div>
            <div>
              <label>Notes</label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
              />
            </div>
            <button type="submit" className="btn btn-primary btn-large">
              LOG FOOD
            </button>
          </form>
        </div>
      )}

      {mealTypes.map(mealType => {
        const mealLogs = logs.filter(log => log.meal_type === mealType);
        if (mealLogs.length === 0) return null;

        return (
          <div key={mealType} style={{ marginBottom: 'var(--spacing-lg)' }}>
            <h3 style={{ marginBottom: 'var(--spacing-sm)' }}>{mealType.toUpperCase()}</h3>
            <table>
              <thead>
                <tr>
                  <th>Food</th>
                  <th>Servings</th>
                  <th>Calories</th>
                  <th>Protein</th>
                  <th>Carbs</th>
                  <th>Fat</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {mealLogs.map(log => (
                  <tr key={log.id}>
                    <td>{log.food.name}</td>
                    <td>{log.servings}x</td>
                    <td>{Math.round(log.food.calories * log.servings)}</td>
                    <td>{Math.round(log.food.protein * log.servings)}g</td>
                    <td>{Math.round(log.food.carbs * log.servings)}g</td>
                    <td>{Math.round(log.food.fat * log.servings)}g</td>
                    <td>
                      <button onClick={() => deleteLog(log.id)} className="btn btn-small">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {logs.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
          <p style={{ margin: 0, fontWeight: 700 }}>NO FOOD LOGGED FOR THIS DAY</p>
        </div>
      )}
    </div>
  );
}
