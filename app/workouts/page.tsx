'use client';

import { useState } from 'react';
import WorkoutLogger from '@/components/WorkoutLogger';
import Calendar from '@/components/Calendar';

export default function WorkoutsPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  return (
    <div>
      <h1>Trainingen</h1>
      
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
              <h4>Geselecteerde Datum: {new Date(selectedDate).toLocaleDateString('nl-NL')}</h4>
              <p style={{ fontSize: '0.875rem', margin: 0 }}>
                Klik op een datum om trainingsdetails te bekijken (functie binnenkort beschikbaar)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
