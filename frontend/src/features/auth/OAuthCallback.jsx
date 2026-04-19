import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { toast } from 'react-toastify';

const STAFF_ROLES = ['TECHNICIAN', 'LECTURER', 'LAB_ASSISTANT'];

function RoleCard({ role, icon, title, desc, badge, badgeColor, borderColor, bgColor, onClick }) {
  return (
    <button onClick={() => onClick(role)}
      className={`w-full flex items-start gap-3 p-3 border-2 border-gray-200 rounded-xl hover:${borderColor} hover:${bgColor} transition-all text-left group`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg`}
        style={{ background: bgColor.replace('hover:','') }}>
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-800 text-sm">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${badgeColor}`}>{badge}</span>
      </div>
    </button>
  );
}

export default function OAuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [showRoleSelect, setShowRoleSelect] = useState(false);
  const [token, setToken] = useState('');
  const [userData, setUserData] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const t = searchParams.get('token');
    const u = searchParams.get('user');
    const isNew = searchParams.get('isNewUser') === 'true';

    if (t && u) {
      try {
        const parsed = JSON.parse(decodeURIComponent(u));
        if (isNew) {
          // New user — show role selection before logging in
          setToken(t);
          setUserData(parsed);
          setShowRoleSelect(true);
        } else {
          // Existing user — direct login
          localStorage.setItem('token', t);
          localStorage.setItem('user', JSON.stringify(parsed));
          window.location.href = '/dashboard';
        }
      } catch {
        navigate('/login', { replace: true });
      }
    } else {
      navigate('/login', { replace: true });
    }
  }, []);

  const handleRoleSelect = async (selectedRole) => {
    setSaving(true);
    try {
      // Save token temporarily to make API call
      localStorage.setItem('token', token);

      if (STAFF_ROLES.includes(selectedRole)) {
        // Request staff role — set PENDING_STAFF
        await api.post('/api/v1/auth/request-staff-role', { requestedRole: selectedRole });
        const updatedUser = { ...userData, role: 'PENDING_STAFF', requestedRole: selectedRole };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.warning('Your staff role request has been submitted for admin approval.');
        window.location.href = '/dashboard';
      } else {
        // USER — instant access, no extra API call needed
        localStorage.setItem('user', JSON.stringify(userData));
        window.location.href = '/dashboard';
      }
    } catch {
      toast.error('Failed to set role. Please try again.');
      localStorage.removeItem('token');
    } finally { setSaving(false); }
  };

  if (showRoleSelect) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-md">
          <div className="text-center mb-5">
            <h2 className="text-lg font-bold text-gray-800">Welcome, {userData?.name}! 👋</h2>
            <p className="text-sm text-gray-500 mt-1">How will you use Smart Campus?</p>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-2">
            <button onClick={() => handleRoleSelect('USER')} disabled={saving}
              className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group disabled:opacity-50">
              <span className="text-2xl">👤</span>
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-sm">User</p>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Instant</span>
              </div>
            </button>

            <button onClick={() => handleRoleSelect('TECHNICIAN')} disabled={saving}
              className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all group disabled:opacity-50">
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-sm">Technician</p>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Approval</span>
              </div>
            </button>

            <button onClick={() => handleRoleSelect('LECTURER')} disabled={saving}
              className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all group disabled:opacity-50">
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-sm">Lecturer</p>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Approval</span>
              </div>
            </button>

            <button onClick={() => handleRoleSelect('LAB_ASSISTANT')} disabled={saving}
              className="flex flex-col items-center gap-2 p-4 border-2 border-gray-200 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all group disabled:opacity-50">
              <div className="text-center">
                <p className="font-semibold text-gray-800 text-sm">Lab Assistant</p>
                <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Approval</span>
              </div>
            </button>
          </div>

          {saving && <p className="text-center text-sm text-gray-500 mt-3">Setting up your account...</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white dark:bg-gray-900">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      <p className="text-sm text-gray-500 dark:text-gray-400">Signing you in...</p>
    </div>
  );
}