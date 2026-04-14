import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { toast } from 'react-toastify';

function Check({ ok }) {
  return ok
    ? <span className="text-green-500">✓</span>
    : <span className="text-gray-300">○</span>;
}

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) navigate('/login', { replace: true });
  }, [token, navigate]);

  const checks = {
    length: password.length >= 8,
    upper:  /[A-Z]/.test(password),
    lower:  /[a-z]/.test(password),
    number: /\d/.test(password),
  };
  const strong = Object.values(checks).every(Boolean);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!strong) { toast.error('Password does not meet requirements'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      await api.post('/api/v1/auth/reset-password', { token, newPassword: password });
      setDone(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Set New Password</h1>
          <p className="text-gray-500 text-sm mt-1">Choose a strong password for your account</p>
        </div>

        {done ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Password Reset!</h2>
            <p className="text-sm text-gray-500">Your password has been changed successfully. You can now sign in.</p>
            <Link to="/login"
              className="block w-full text-center py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              Sign In Now
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password *</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoFocus
                  className="w-full px-3 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-400 outline-none text-sm"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs">
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
              {password && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {[['length','8+ characters'],['upper','Uppercase'],['lower','Lowercase'],['number','Number']].map(([k,l]) => (
                    <span key={k} className="text-xs flex items-center gap-1 text-gray-500">
                      <Check ok={checks[k]} /> {l}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password *</label>
              <input
                type="password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-400 outline-none text-sm ${
                  confirm && password !== confirm ? 'border-red-400 bg-red-50' :
                  confirm && password === confirm ? 'border-green-400' : 'border-gray-300'
                }`}
              />
              {confirm && password !== confirm && <p className="text-red-500 text-xs mt-1">Passwords do not match</p>}
              {confirm && password === confirm && <p className="text-green-600 text-xs mt-1">Passwords match</p>}
            </div>

            <button type="submit" disabled={loading || !strong || password !== confirm}
              className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium text-sm transition-colors">
              {loading ? 'Resetting...' : 'Reset Password'}
            </button>

            <p className="text-center text-xs text-gray-400">
              Link expired?{' '}
              <Link to="/forgot-password" className="text-primary-600 hover:underline">Request a new one</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
