'use client';

import { useState, useEffect } from 'react';
import type { Goal } from '@/lib/types';

export default function GoalSetter() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    type: 'strength' as Goal['type'],
    title: '',
    description: '',
    target_value: '',
    unit: 'kg',
    deadline: ''
  });

  const fetchGoals = async () => {
    const res = await fetch('/api/goals');
    const data = await res.json();
    setGoals(data);
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch('/api/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        target_value: parseFloat(formData.target_value) || null
      })
    });

    if (res.ok) {
      setShowForm(false);
      setFormData({
        type: 'strength',
        title: '',
        description: '',
        target_value: '',
        unit: 'kg',
        deadline: ''
      });
      fetchGoals();
    }
  };

  const updateGoalProgress = async (goalId: number, currentValue: number) => {
    const goal = goals.find(g => g.id === goalId);
    if (!goal) return;

    const isCompleted = goal.target_value && currentValue >= goal.target_value;

    await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: goalId,
        current_value: currentValue,
        status: isCompleted ? 'completed' : 'active'
      })
    });

    fetchGoals();
  };

  const deleteGoal = async (goalId: number) => {
    if (!confirm('Delete this goal?')) return;

    await fetch(`/api/goals?id=${goalId}`, { method: 'DELETE' });
    fetchGoals();
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'CANCEL' : '+ NEW GOAL'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="card-header">
            <h3 className="card-title">Create Goal</h3>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
            <div>
              <label>Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as Goal['type'] })}
                required
              >
                <option value="strength">Strength</option>
                <option value="weight_loss">Weight Loss</option>
                <option value="muscle_gain">Muscle Gain</option>
                <option value="endurance">Endurance</option>
                <option value="custom">Custom</option>
              </select>
            </div>
            <div>
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Bench press 100kg"
                required
              />
            </div>
            <div>
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description..."
                rows={3}
              />
            </div>
            <div className="grid grid-2">
              <div>
                <label>Target Value</label>
                <input
                  type="number"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  placeholder="100"
                  step="0.1"
                />
              </div>
              <div>
                <label>Unit</label>
                <input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  placeholder="kg, reps, minutes..."
                />
              </div>
            </div>
            <div>
              <label>Deadline</label>
              <input
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-large">
              CREATE GOAL
            </button>
          </form>
        </div>
      )}

      <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Active Goals</h2>
      <div className="grid grid-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
        {activeGoals.map(goal => {
          const progress = goal.target_value
            ? Math.min((goal.current_value / goal.target_value) * 100, 100)
            : 0;

          return (
            <div key={goal.id} className="card">
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                <span
                  style={{
                    padding: '4px 8px',
                    border: 'var(--border-width) solid var(--color-border)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    backgroundColor: 'var(--color-accent)'
                  }}
                >
                  {goal.type.replace('_', ' ')}
                </span>
              </div>
              <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>{goal.title}</h4>
              {goal.description && <p style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>{goal.description}</p>}
              
              {goal.target_value && (
                <>
                  <div className="progress-bar" style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    <div className="progress-bar-text">
                      {goal.current_value} / {goal.target_value} {goal.unit}
                    </div>
                  </div>
                  <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                    <label>Update Progress</label>
                    <input
                      type="number"
                      defaultValue={goal.current_value}
                      onBlur={(e) => updateGoalProgress(goal.id, parseFloat(e.target.value))}
                      step="0.1"
                    />
                  </div>
                </>
              )}
              
              {goal.deadline && (
                <p style={{ fontSize: '0.875rem', marginBottom: 'var(--spacing-sm)' }}>
                  <strong>Deadline:</strong> {new Date(goal.deadline).toLocaleDateString()}
                </p>
              )}
              
              <button onClick={() => deleteGoal(goal.id)} className="btn btn-small">
                Delete
              </button>
            </div>
          );
        })}
      </div>

      {activeGoals.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)', marginBottom: 'var(--spacing-lg)' }}>
          <p style={{ margin: 0, fontWeight: 700 }}>NO ACTIVE GOALS</p>
        </div>
      )}

      {completedGoals.length > 0 && (
        <>
          <h2 style={{ marginBottom: 'var(--spacing-md)' }}>Completed Goals</h2>
          <div className="grid grid-2">
            {completedGoals.map(goal => (
              <div key={goal.id} className="card" style={{ opacity: 0.7 }}>
                <h4>{goal.title}</h4>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>
                  ✓ Completed {goal.completed_at ? new Date(goal.completed_at).toLocaleDateString() : ''}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
