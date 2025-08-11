import DemoDashboard from '../components/DemoDashboard';
import BackendStatus from '@/components/BackendStatus';
import BackendConnectionTest from '@/components/BackendConnectionTest';

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <BackendConnectionTest />
      </div>
      
      <BackendStatus>
        <DemoDashboard />
      </BackendStatus>
    </div>
  );
}

