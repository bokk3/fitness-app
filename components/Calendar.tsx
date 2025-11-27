'use client';

import { useState, useEffect } from 'react';
import { startOfMonth, endOfMonth, eachDayOfInterval, format, isSameMonth, isToday, startOfWeek, endOfWeek } from 'date-fns';
import type { Workout } from '@/lib/types';

export default function Calendar({ onDateClick }: { onDateClick?: (date: string) => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [workoutDates, setWorkoutDates] = useState<Set<string>>(new Set());

  const fetchWorkouts = async () => {
    const start = format(startOfMonth(currentDate), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentDate), 'yyyy-MM-dd');
    
    const res = await fetch(`/api/workouts?startDate=${start}&endDate=${end}`);
    const data = await res.json();
    
    const dates = new Set<string>(data.map((w: Workout) => w.date));
    setWorkoutDates(dates);
  };

  useEffect(() => {
    fetchWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentDate]);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDayClick = (day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd');
    if (onDateClick) {
      onDateClick(dateStr);
    }
  };

  return (
    <div className="calendar">
      <div className="calendar-header">
        <button onClick={previousMonth} className="btn btn-small">
          ← PREV
        </button>
        <h3 style={{ margin: 0, fontSize: '1.5rem' }}>
          {format(currentDate, 'MMMM yyyy').toUpperCase()}
        </h3>
        <button onClick={nextMonth} className="btn btn-small">
          NEXT →
        </button>
      </div>

      <div className="calendar-grid">
        {weekDays.map(day => (
          <div key={day} className="calendar-day-header">
            {day}
          </div>
        ))}
        {days.map((day, index) => {
          const dateStr = format(day, 'yyyy-MM-dd');
          const hasWorkout = workoutDates.has(dateStr);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={index}
              className={`calendar-day ${hasWorkout ? 'has-workout' : ''} ${isTodayDate ? 'today' : ''}`}
              onClick={() => handleDayClick(day)}
              style={{
                opacity: isCurrentMonth ? 1 : 0.3,
                cursor: 'pointer'
              }}
            >
              <div style={{ fontWeight: 900 }}>{format(day, 'd')}</div>
              {hasWorkout && (
                <div style={{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: 'var(--color-fg)',
                  border: '2px solid var(--color-fg)'
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
