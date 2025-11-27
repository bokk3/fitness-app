'use client';

import { useState, useEffect } from 'react';
import type { Exercise } from '@/lib/types';

interface WorkoutExerciseInput {
  exercise_id: number;
  exercise_name: string;
  sets: number;
  reps: number;
  weight: number;
  notes: string;
}

export default function WorkoutLogger({ onSave }: { onSave?: () => void }) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExerciseInput[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchExercises();
  }, []);

  const fetchExercises = async () => {
    const res = await fetch('/api/exercises');
    const data = await res.json();
    setExercises(data);
  };

  const addExercise = () => {
    if (selectedExerciseId === 0) return;
    
    const exercise = exercises.find(e => e.id === selectedExerciseId);
    if (!exercise) return;

    setWorkoutExercises([...workoutExercises, {
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      sets: 3,
      reps: 10,
      weight: 0,
      notes: ''
    }]);
    setSelectedExerciseId(0);
  };

  const updateExercise = (index: number, field: keyof WorkoutExerciseInput, value: any) => {
    const updated = [...workoutExercises];
    updated[index] = { ...updated[index], [field]: value };
    setWorkoutExercises(updated);
  };

  const removeExercise = (index: number) => {
    setWorkoutExercises(workoutExercises.filter((_, i) => i !== index));
  };

  const saveWorkout = async () => {
    if (workoutExercises.length === 0) {
      alert('Add at least one exercise');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/workouts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date,
          duration_minutes: duration ? parseInt(duration) : null,
          notes,
          exercises: workoutExercises.map(e => ({
            exercise_id: e.exercise_id,
            sets: e.sets,
            reps: e.reps,
            weight: e.weight || null,
            notes: e.notes || null
          }))
        })
      });

      if (res.ok) {
        alert('Workout saved!');
        setWorkoutExercises([]);
        setNotes('');
        setDuration('');
        if (onSave) onSave();
      } else {
        alert('Failed to save workout');
      }
    } catch (error) {
      console.error('Error saving workout:', error);
      alert('Error saving workout');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h3 className="card-title">Log Workout</h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
        <div>
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label>Duration (minutes)</label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="60"
          />
        </div>

        <div>
          <label>Add Exercise</label>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <select
              value={selectedExerciseId}
              onChange={(e) => setSelectedExerciseId(Number(e.target.value))}
              style={{ flex: 1 }}
            >
              <option value={0}>Select exercise...</option>
              {exercises.map(ex => (
                <option key={ex.id} value={ex.id}>
                  {ex.name} ({ex.muscle_group})
                </option>
              ))}
            </select>
            <button onClick={addExercise} className="btn btn-primary">
              Add
            </button>
          </div>
        </div>

        {workoutExercises.length > 0 && (
          <div>
            <h4 style={{ marginBottom: 'var(--spacing-sm)' }}>Exercises</h4>
            {workoutExercises.map((ex, index) => (
              <div
                key={index}
                className="card"
                style={{ marginBottom: 'var(--spacing-sm)', padding: 'var(--spacing-sm)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-sm)' }}>
                  <strong style={{ textTransform: 'uppercase' }}>{ex.exercise_name}</strong>
                  <button onClick={() => removeExercise(index)} className="btn btn-small">
                    Remove
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--spacing-sm)' }}>
                  <div>
                    <label>Sets</label>
                    <input
                      type="number"
                      value={ex.sets}
                      onChange={(e) => updateExercise(index, 'sets', Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div>
                    <label>Reps</label>
                    <input
                      type="number"
                      value={ex.reps}
                      onChange={(e) => updateExercise(index, 'reps', Number(e.target.value))}
                      min="1"
                    />
                  </div>
                  <div>
                    <label>Weight (kg)</label>
                    <input
                      type="number"
                      value={ex.weight}
                      onChange={(e) => updateExercise(index, 'weight', Number(e.target.value))}
                      min="0"
                      step="0.5"
                    />
                  </div>
                </div>
                <div style={{ marginTop: 'var(--spacing-sm)' }}>
                  <label>Notes</label>
                  <input
                    type="text"
                    value={ex.notes}
                    onChange={(e) => updateExercise(index, 'notes', e.target.value)}
                    placeholder="Optional notes..."
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        <div>
          <label>Workout Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did the workout go?"
            rows={3}
          />
        </div>

        <button
          onClick={saveWorkout}
          disabled={loading || workoutExercises.length === 0}
          className="btn btn-primary btn-large"
        >
          {loading ? 'SAVING...' : 'SAVE WORKOUT'}
        </button>
      </div>
    </div>
  );
}
