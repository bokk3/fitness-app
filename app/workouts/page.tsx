'use client';

import { useState } from 'react';
import WorkoutLogger from '@/components/WorkoutLogger';
import Calendar from '@/components/Calendar';

export default function WorkoutsPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <div>
      <h1>Workouts</h1>
      
      <div className="grid grid-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <WorkoutLogger onSave={() => {
            // Refresh calendar after saving
            window.location.reload();
          }} />
        </div>
        <div>
          <Calendar onDateClick={(date) => setSelectedDate(date)} />
          {selectedDate && (
            <div className="card" style={{ marginTop: 'var(--spacing-md)' }}>
              <h4>Selected Date: {new Date(selectedDate).toLocaleDateString()}</h4>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>
                Click on a date to view workout details (feature coming soon)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
