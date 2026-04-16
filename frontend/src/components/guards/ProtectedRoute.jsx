import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useEffect, useState } from 'react';

export default function ProtectedRoute() {
  const { user, isLoading } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!isLoading) { setTimedOut(false); return; }
    // Safety timeout — if loading takes >3s, stop spinner and redirect
    const t = setTimeout(() => setTimedOut(true), 3000);
    return () => clearTimeout(t);
  }, [isLoading]);

  if (isLoading && !timedOut) return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-white" style={{background:'linear-gradient(135deg,#0ab5d6,#0a4a57)'}}>SC</div>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    </div>
  );

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
