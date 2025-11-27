import WorkoutLogger from '@/components/WorkoutLogger';
import Calendar from '@/components/Calendar';
import ProgressDashboard from '@/components/ProgressDashboard';

export default function HomePage() {
  return (
    <div>
      <h1>FITNESS DASHBOARD</h1>
      
      <div className="grid grid-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h2>Today's Workout</h2>
          <WorkoutLogger />
        </div>
        <div>
          <h2>Calendar</h2>
          <Calendar />
        </div>
      </div>

      <h2>Progress Overview</h2>
      <ProgressDashboard />
    </div>
  );
}
