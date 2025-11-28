import WorkoutLogger from '@/components/WorkoutLogger';
import Calendar from '@/components/Calendar';
import ProgressDashboard from '@/components/ProgressDashboard';

export default function HomePage() {
  return (
    <div>
      <h1>FITNESS DASHBOARD</h1>
      
      <div className="grid grid-2" style={{ marginBottom: 'var(--spacing-lg)' }}>
        <div>
          <h2>Training van Vandaag</h2>
          <WorkoutLogger />
        </div>
        <div>
          <h2>Kalender</h2>
          <Calendar />
        </div>
      </div>

      <h2>Voortgangsoverzicht</h2>
      <ProgressDashboard />
    </div>
  );
}
