'use client';

import { useState, useEffect } from 'react';
import type { Exercise } from '@/lib/types';

export default function ExerciseLibrary() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState<string>('alle');
  const [searchTerm, setSearchTerm] = useState('');

  const muscleGroups = ['alle', 'borst', 'rug', 'benen', 'schouders', 'armen', 'buikspieren', 'cardio'];

  const fetchExercises = async () => {
    const res = await fetch('/api/exercises');
    const data = await res.json();
    setExercises(data);
  };

  const filterExercises = () => {
    let filtered = exercises;

    if (selectedMuscleGroup !== 'alle') {
      filtered = filtered.filter(ex => ex.muscle_group === selectedMuscleGroup);
    }

    if (searchTerm) {
      filtered = filtered.filter(ex =>
        ex.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredExercises(filtered);
  };

  useEffect(() => {
    fetchExercises();
  }, []);

  useEffect(() => {
    filterExercises();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exercises, selectedMuscleGroup, searchTerm]);

  return (
    <div>
      <div style={{ marginBottom: 'var(--spacing-md)' }}>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
          {muscleGroups.map(group => (
            <button
              key={group}
              onClick={() => setSelectedMuscleGroup(group)}
              className={`btn btn-small ${selectedMuscleGroup === group ? 'btn-primary' : ''}`}
            >
              {group.toUpperCase()}
            </button>
          ))}
        </div>
        <input
          type="text"
          placeholder="Zoek oefeningen..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-2">
        {filteredExercises.map(exercise => (
          <div key={exercise.id} className="card">
            <h4 style={{ marginBottom: 'var(--spacing-xs)' }}>{exercise.name}</h4>
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)', marginBottom: 'var(--spacing-sm)' }}>
              <span
                style={{
                  padding: '4px 8px',
                  border: 'var(--border-width) solid var(--color-border)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}
              >
                {exercise.muscle_group}
              </span>
              <span
                style={{
                  padding: '4px 8px',
                  border: 'var(--border-width) solid var(--color-border)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  textTransform: 'uppercase'
                }}
              >
                {exercise.equipment}
              </span>
            </div>
            {exercise.instructions && (
              <p style={{ fontSize: '0.875rem', margin: 0 }}>{exercise.instructions}</p>
            )}
          </div>
        ))}
      </div>

      {filteredExercises.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 'var(--spacing-lg)' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0 }}>
            GEEN OEFENINGEN GEVONDEN
          </p>
        </div>
      )}
    </div>
  );
}
