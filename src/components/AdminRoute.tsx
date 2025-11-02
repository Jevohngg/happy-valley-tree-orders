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
        className="fixed top-4 right-4 px-3 py-2 bg-slate-700 text-white font-medium text-sm rounded-lg shadow-lg hover:bg-slate-800 transition-colors flex items-center gap-2 z-50"
      >
        <Home className="w-4 h-4" />
        View Store
      </button>
    </div>
  );
}
