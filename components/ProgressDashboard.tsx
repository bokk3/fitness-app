'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { BodyMeasurement, WorkoutWithExercises } from '@/lib/types';

export default function ProgressDashboard() {
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [workouts, setWorkouts] = useState<WorkoutWithExercises[]>([]);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  const fetchData = async () => {
    // Fetch measurements
    const measRes = await fetch('/api/measurements');
    const measData = await measRes.json();
    setMeasurements(measData.slice(0, 20).reverse());

    // Fetch workouts
    const workRes = await fetch('/api/workouts');
    const workData = await workRes.json();
    setWorkouts(workData.slice(0, 30));
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange]);

  // Prepare weight chart data
  const weightData = measurements
    .filter(m => m.weight)
    .map(m => ({
      date: new Date(m.date).toLocaleDateString(),
      weight: m.weight
    }));

  // Calculate total volume per workout
  const volumeData = workouts.map(w => {
    const totalVolume = w.exercises.reduce((sum, ex) => {
      return sum + (ex.sets * ex.reps * (ex.weight || 0));
    }, 0);
    return {
      date: new Date(w.date).toLocaleDateString(),
      volume: totalVolume
    };
  }).reverse();

  // Calculate stats
  const totalWorkouts = workouts.length;
  const currentWeight = measurements[measurements.length - 1]?.weight || 0;
  const avgVolume = volumeData.length > 0
    ? Math.round(volumeData.reduce((sum, d) => sum + d.volume, 0) / volumeData.length)
    : 0;

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-md)', display: 'flex', gap: 'var(--spacing-sm)' }}>
        <button
          onClick={() => setTimeRange('week')}
          className={`btn btn-small ${timeRange === 'week' ? 'btn-primary' : ''}`}
        >
          Week
        </button>
        <button
          onClick={() => setTimeRange('month')}
          className={`btn btn-small ${timeRange === 'month' ? 'btn-primary' : ''}`}
        >
          Maand
        </button>
        <button
          onClick={() => setTimeRange('year')}
          className={`btn btn-small ${timeRange === 'year' ? 'btn-primary' : ''}`}
        >
          Jaar
        </button>
      </div>

      <div className="grid grid-3" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div className="stat-card">
          <div className="stat-value">{totalWorkouts}</div>
          <div className="stat-label">Totaal Trainingen</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{currentWeight || '--'}</div>
          <div className="stat-label">Huidig Gewicht (kg)</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avgVolume}</div>
          <div className="stat-label">Gem. Volume (kg)</div>
        </div>
      </div>

      {weightData.length > 0 && (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
          <div className="card-header">
            <h3 className="card-title">Gewichtsverloop</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weightData}>
              <CartesianGrid strokeWidth={3} stroke="var(--color-border)" />
              <XAxis
                dataKey="date"
                stroke="var(--color-fg)"
                style={{ fontFamily: 'Courier New', fontWeight: 700, fontSize: '0.75rem' }}
              />
              <YAxis
                stroke="var(--color-fg)"
                style={{ fontFamily: 'Courier New', fontWeight: 700, fontSize: '0.75rem' }}
              />
              <Tooltip
                contentStyle={{
                  border: 'var(--border-width) solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontFamily: 'Courier New',
                  fontWeight: 700
                }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="var(--color-accent)"
                strokeWidth={3}
                dot={{ fill: 'var(--color-fg)', strokeWidth: 2, r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {volumeData.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Trainingsvolume</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={volumeData}>
              <CartesianGrid strokeWidth={3} stroke="var(--color-border)" />
              <XAxis
                dataKey="date"
                stroke="var(--color-fg)"
                style={{ fontFamily: 'Courier New', fontWeight: 700, fontSize: '0.75rem' }}
              />
              <YAxis
                stroke="var(--color-fg)"
                style={{ fontFamily: 'Courier New', fontWeight: 700, fontSize: '0.75rem' }}
              />
              <Tooltip
                contentStyle={{
                  border: 'var(--border-width) solid var(--color-border)',
                  backgroundColor: 'var(--color-bg)',
                  fontFamily: 'Courier New',
                  fontWeight: 700
                }}
              />
              <Bar dataKey="volume" fill="var(--color-accent)" stroke="var(--color-border)" strokeWidth={2} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {weightData.length === 0 && volumeData.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-xl)' }}>
          <h3>NOG GEEN GEGEVENS</h3>
          <p>Begin met het loggen van trainingen en metingen om je voortgang te zien!</p>
        </div>
      )}
    </div>
  );
}
