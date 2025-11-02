import { useNavigate } from 'react-router-dom';
import { AdminPanel } from './AdminPanel';
import { Home } from 'lucide-react';

export function AdminRoute() {
  const navigate = useNavigate();

  return (
    <div>
      <AdminPanel />
      <button
        onClick={() => navigate('/')}
        className="fixed bottom-6 right-6 px-6 py-3 bg-slate-700 text-white font-semibold rounded-lg shadow-lg hover:bg-slate-800 transition-colors flex items-center gap-2 z-50"
      >
        <Home className="w-5 h-5" />
        View Store
      </button>
    </div>
  );
}
