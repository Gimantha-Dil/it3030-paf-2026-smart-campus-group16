import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { loginUser, registerUser } from '../../api/authApi';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function validateEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }

function validatePassword(password) {
  return {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };
}

function getPasswordStrength(checks) {
  const count = Object.values(checks).filter(Boolean).length;
  if (count <= 2) return { label: 'Weak', color: 'bg-red-500', width: 'w-1/4', text: 'text-red-500' };
  if (count === 3) return { label: 'Fair', color: 'bg-orange-400', width: 'w-2/4', text: 'text-orange-500' };
  if (count === 4) return { label: 'Good', color: 'bg-yellow-400', width: 'w-3/4', text: 'text-yellow-500' };
  return { label: 'Strong', color: 'bg-green-500', width: 'w-full', text: 'text-green-600' };
}

function validateName(name) { return /^[a-zA-Z\s'-]{2,80}$/.test(name.trim()); }

function handleNameKeyDown(e) {
  const allowed = /^[a-zA-Z\s'\-]$/;
  const ctrl = e.ctrlKey || e.metaKey;
  const nav = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'].includes(e.key);
  if (!ctrl && !nav && !allowed.test(e.key)) e.preventDefault();
}
function handleNamePaste(e) {
  if (!/^[a-zA-Z\s'-]+$/.test(e.clipboardData.getData('text'))) e.preventDefault();
}

const EyeOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);
const EyeClosed = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
  </svg>
);

function RoleSelectionStep({ onSelect }) {
  return (
    <div>
      <div className="text-center mb-4">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">How will you use Smart Campus?</h2>
        <p className="text-xs text-gray-500 mt-0.5">Choose your account type</p>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-2">
        <button onClick={() => onSelect('USER')}
          className="flex flex-col items-center gap-1.5 p-3 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all">
          <p className="font-semibold text-gray-800 text-sm">User</p>
          <p className="text-xs text-gray-400">Rooms &amp; study spaces</p>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Instant</span>
        </button>
        <button onClick={() => onSelect('TECHNICIAN')}
          className="flex flex-col items-center gap-1.5 p-3 border-2 border-gray-200 rounded-xl hover:border-orange-400 hover:bg-orange-50 transition-all">
          <p className="font-semibold text-gray-800 text-sm">Technician</p>
          <p className="text-xs text-gray-400">Maintenance &amp; tickets</p>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Approval</span>
        </button>
        <button onClick={() => onSelect('LECTURER')}
          className="flex flex-col items-center gap-1.5 p-3 border-2 border-gray-200 rounded-xl hover:border-purple-400 hover:bg-purple-50 transition-all">
          <p className="font-semibold text-gray-800 text-sm">Lecturer</p>
          <p className="text-xs text-gray-400">Halls &amp; exam rooms</p>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Approval</span>
        </button>
        <button onClick={() => onSelect('LAB_ASSISTANT')}
          className="flex flex-col items-center gap-1.5 p-3 border-2 border-gray-200 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all">
          <p className="font-semibold text-gray-800 text-sm">Lab Assistant</p>
          <p className="text-xs text-gray-400">Lab &amp; equipment</p>
          <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Approval</span>
        </button>
      </div>
    </div>
  );
}

function PendingApprovalBanner({ name, onGoToLogin }) {
  return (
    <div className="text-center space-y-4">
      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto">
        <svg className="w-8 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div>
        <h2 className="text-lg font-semibold text-gray-800">Awaiting Admin Approval</h2>
        <p className="text-sm text-gray-600 mt-2">Hi <strong>{name}</strong> Your account request has been submitted.</p>
        <p className="text-sm text-gray-500 mt-1">An administrator will review and approve or reject your request shortly.</p>
      </div>
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-700">
        You cannot log in until your account is approved.
      </div>
      <button onClick={onGoToLogin}
        className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 font-medium text-sm transition-colors">
        Back to Sign In
      </button>
    </div>
  );
}

export default function LoginPage() {
  const [tab, setTab] = useState('login');
  const [registerStep, setRegisterStep] = useState('role');
  const [selectedRole, setSelectedRole] = useState(null);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});
  const [pendingName, setPendingName] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (user) navigate('/dashboard', { replace: true }); }, [user, navigate]);

  const pwChecks = validatePassword(password);
  const pwStrong = pwChecks.length && pwChecks.upper && pwChecks.lower && pwChecks.number;
  const pwStrength = getPasswordStrength(pwChecks);

  const errors = {
    email: !email ? 'Email is required' : !validateEmail(email) ? 'Enter a valid email address' : '',
    name: tab === 'register' ? (!name.trim() ? 'Name is required' : !validateName(name) ? 'Letters, spaces only' : '') : '',
    password: !password ? 'Password is required' : tab === 'register' && !pwStrong ? 'Password does not meet requirements' : '',
    confirmPassword: tab === 'register' ? (password !== confirmPassword ? 'Passwords do not match' : '') : '',
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const handleBlur = (f) => setTouched(t => ({ ...t, [f]: true }));
  const showError = (f) => touched[f] && errors[f];

  const handleGoogleLogin = () => { window.location.href = `${API_URL}/oauth2/authorization/google`; };
  const handleMicrosoftLogin = () => { window.location.href = `${API_URL}/oauth2/authorization/microsoft`; };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, name: true, password: true, confirmPassword: true });
    if (hasErrors) return;
    setLoading(true);
    try {
      if (tab === 'login') {
        const { data } = await loginUser(email.trim().toLowerCase(), password);
        if (data.user.role === 'PENDING_STAFF') {
          toast.warning('Your account is awaiting admin approval. Please wait.');
          setLoading(false);
          return;
        }
        login(data.token, data.user);
        toast.success(`Welcome back, ${data.user.name}!`);
        navigate('/dashboard');
      } else {
        const requestedRole = ['TECHNICIAN', 'LECTURER', 'LAB_ASSISTANT'].includes(selectedRole) ? selectedRole : null;
        const { data } = await registerUser(email.trim().toLowerCase(), name.trim(), password, requestedRole, null);
        if (data.user.role === 'PENDING_STAFF') {
          setPendingName(data.user.name);
          setRegisterStep('pending');
        } else {
          login(data.token, data.user);
          toast.success(`Welcome, ${data.user.name}!`);
          navigate('/dashboard');
        }
      }
    } catch (err) {
      const valErrors = err.response?.data?.validationErrors;
      const msg = valErrors
        ? Object.values(valErrors).join(', ')
        : err.response?.data?.message || (tab === 'login' ? 'Invalid email or password' : 'Registration failed.');
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const switchTab = (t) => {
    setTab(t); setTouched({}); setPassword(''); setConfirmPassword('');
    setShowPw(false); setShowConfirm(false); setRegisterStep('role'); setSelectedRole(null);
  };

  const roleLabelMap = { TECHNICIAN: 'Technician', LECTURER: 'Lecturer', LAB_ASSISTANT: 'Lab Assistant', USER: 'User' };
  const roleLabel = roleLabelMap[selectedRole] || 'User';

  return (
    <div
      className="min-h-screen flex items-center justify-center relative"
      style={{
        backgroundImage: 'url(/sliit-campus.jpeg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Login card */}
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8 w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Smart Campus Hub</h1>
          <p className="text-gray-500 text-sm mt-1">Manage your campus operations</p>
        </div>

        {/* Tab switcher */}
        {registerStep !== 'pending' && (
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-5">
            <button onClick={() => switchTab('login')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === 'login' ? 'bg-white dark:bg-gray-700 shadow text-primary-600' : 'text-gray-500'}`}>
              Sign In
            </button>
            <button onClick={() => switchTab('register')}
              className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === 'register' ? 'bg-white dark:bg-gray-700 shadow text-primary-600' : 'text-gray-500'}`}>
              Register
            </button>
          </div>
        )}

        {/* Register steps */}
        {tab === 'register' && registerStep === 'role' && (
          <RoleSelectionStep onSelect={(r) => { setSelectedRole(r); setRegisterStep('form'); }} />
        )}
        {tab === 'register' && registerStep === 'pending' && (
          <PendingApprovalBanner name={pendingName} onGoToLogin={() => switchTab('login')} />
        )}

        {/* Login / Register form */}
        {(tab === 'login' || (tab === 'register' && registerStep === 'form')) && (
          <>
            {tab === 'login' && (
              <>
                <div className="space-y-2 mb-5">
                  <button onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">Continue with Google</span>
                  </button>

                  <button onClick={handleMicrosoftLogin}
                    className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                      <path fill="#F25022" d="M1 1h10v10H1z"/>
                      <path fill="#00A4EF" d="M13 1h10v10H13z"/>
                      <path fill="#7FBA00" d="M1 13h10v10H1z"/>
                      <path fill="#FFB900" d="M13 13h10v10H13z"/>
                    </svg>
                    <span className="text-gray-700 dark:text-gray-200 font-medium text-sm">Continue with Microsoft / SLIIT</span>
                  </button>
                </div>

                <div className="relative mb-5">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-white dark:bg-gray-900 text-gray-400">or continue with email</span>
                  </div>
                </div>
              </>
            )}

            {tab === 'register' && registerStep === 'form' && (
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setRegisterStep('role')}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back
                </button>
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                  selectedRole === 'TECHNICIAN' ? 'bg-orange-100 text-orange-700' :
                  selectedRole === 'LECTURER'   ? 'bg-orange-100 text-orange-700' :
                  selectedRole === 'LAB_ASSISTANT' ? 'bg-orange-100 text-orange-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {roleLabel} Account
                </span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {tab === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={name}
                    onChange={e => setName(e.target.value)}
                    onBlur={() => handleBlur('name')}
                    onKeyDown={handleNameKeyDown}
                    onPaste={handleNamePaste}
                    placeholder="John Doe" autoComplete="name"
                    className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-400 outline-none text-sm dark:bg-gray-800 dark:text-gray-100 ${
                      showError('name') ? 'border-red-400 bg-red-50' : 'border-gray-300 dark:border-gray-600'}`} />
                  {showError('name')
                    ? <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                    : <p className="text-gray-500 text-xs mt-1">Letters, spaces only</p>}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input type="email" value={email}
                  onChange={e => setEmail(e.target.value)}
                  onBlur={() => handleBlur('email')}
                  placeholder="you@my.sliit.lk" autoComplete="email"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:ring-2 focus:ring-primary-400 outline-none text-sm dark:bg-gray-800 dark:text-gray-100 ${
                    showError('email') ? 'border-red-400 bg-red-50' : 'border-gray-300 dark:border-gray-600'}`} />
                {showError('email') && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => setPassword(e.target.value)}
                    onBlur={() => handleBlur('password')}
                    placeholder="••••••••"
                    autoComplete={tab === 'login' ? 'current-password' : 'new-password'}
                    className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-400 outline-none text-sm dark:bg-gray-800 dark:text-gray-100 ${
                      showError('password') ? 'border-red-400 bg-red-50' : 'border-gray-300 dark:border-gray-600'}`} />
                  <button type="button" onClick={() => setShowPw(v => !v)} tabIndex={-1}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPw ? <EyeOpen /> : <EyeClosed />}
                  </button>
                </div>

                {tab === 'register' && password && (
                  <div className="mt-2">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-300 ${pwStrength.color} ${pwStrength.width}`} />
                      </div>
                      <span className={`text-xs font-medium ${pwStrength.text}`}>{pwStrength.label}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5">
                      {[['length','8+ characters'],['upper','Uppercase letter'],['lower','Lowercase letter'],['number','Number'],['special','Special character']].map(([k,l]) => (
                        <span key={k} className={`text-xs flex items-center gap-1 ${pwChecks[k] ? 'text-green-600' : 'text-gray-400'}`}>
                          {pwChecks[k] ? '✓' : '○'} {l}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {showError('password') && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}

                {tab === 'login' && (
                  <div className="text-right mt-1">
                    <button type="button" onClick={() => navigate('/forgot-password')}
                      className="text-xs text-primary-600 hover:underline">Forgot password?</button>
                  </div>
                )}
              </div>

              {tab === 'register' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input type={showConfirm ? 'text' : 'password'} value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      placeholder="••••••••" autoComplete="new-password"
                      className={`w-full px-3 py-2.5 pr-10 border rounded-lg focus:ring-2 focus:ring-primary-400 outline-none text-sm dark:bg-gray-800 dark:text-gray-100 ${
                        showError('confirmPassword') ? 'border-red-400 bg-red-50'
                        : confirmPassword && !errors.confirmPassword ? 'border-green-400'
                        : 'border-gray-300 dark:border-gray-600'}`} />
                    <button type="button" onClick={() => setShowConfirm(v => !v)} tabIndex={-1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showConfirm ? <EyeOpen /> : <EyeClosed />}
                    </button>
                  </div>
                  {showError('confirmPassword') && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
                  {confirmPassword && !errors.confirmPassword && (
                    <p className="text-green-600 text-xs mt-1">✓ Passwords match</p>
                  )}
                </div>
              )}

              {tab === 'register' && ['TECHNICIAN', 'LECTURER', 'LAB_ASSISTANT'].includes(selectedRole) && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-xs text-orange-700">
                  Your account will be <strong>PENDING</strong> until an admin approves it.
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium text-sm transition-colors">
                {loading ? 'Please wait...' : tab === 'login' ? 'Sign In' : `Register as ${roleLabel}`}
              </button>
            </form>

            <p className="text-center text-sm text-gray-500 mt-4">
              {tab === 'login'
                ? (<>Don&apos;t have an account?{' '}
                    <button onClick={() => switchTab('register')} className="text-primary-600 font-medium hover:underline">Register</button></>)
                : (<>Already have an account?{' '}
                    <button onClick={() => switchTab('login')} className="text-primary-600 font-medium hover:underline">Sign In</button></>)
              }
            </p>
          </>
        )}
      </div>
    </div>
  );
}