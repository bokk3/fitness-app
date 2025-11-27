import ProgressDashboard from '@/components/ProgressDashboard';
import MeasurementTracker from '@/components/MeasurementTracker';

export default function ProgressPage() {
  return (
    <div>
      <h1>Progress Tracking</h1>
      
      <div style={{ marginBottom: 'var(--spacing-xl)' }}>
        <ProgressDashboard />
      </div>

      <h2>Body Measurements</h2>
      <MeasurementTracker />
    </div>
  );
}
