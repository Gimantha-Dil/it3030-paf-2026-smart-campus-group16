import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';
import api from '../../api/axiosInstance';
import { getNotificationPreferences, updateNotificationPreferences } from '../../api/notificationApi';

export default function ProfilePage() {
  const { user, login, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('profile');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [disabledTypes, setDisabledTypes] = useState([]);
  const [prefLoading, setPrefLoading] = useState(false);
  const [prefSaving, setPrefSaving] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [saving, setSaving] = useState(false);

  // Load notification preferences when tab switches to notif
  useEffect(() => {
    if (tab === 'notif') {
      setPrefLoading(true);
      getNotificationPreferences()
        .then(({ data }) => setDisabledTypes(data.disabledTypes || []))
        .catch(() => {})
        .finally(() => setPrefLoading(false));
    }
  }, [tab]);

  const togglePref = (type) => {
    setDisabledTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };

  const savePreferences = async () => {
    setPrefSaving(true);
    try {
      await updateNotificationPreferences(disabledTypes);
      toast.success('Notification preferences saved!');
    } catch {
      toast.error('Failed to save preferences');
    } finally { setPrefSaving(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await api.delete('/api/v1/users/me');
      toast.success('Account deleted successfully');
      logout();
    } catch {
      toast.error('Failed to delete account. Please try again.');
    } finally { setDeleteLoading(false); }
  };

  // Block non-letter keys 
  const handleNameKey = (e) => {
    const allowed = /^[a-zA-Z\s'\-]$/;
    const ctrl = e.ctrlKey || e.metaKey;
    const nav = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'].includes(e.key);
    if (!ctrl && !nav && !allowed.test(e.key)) e.preventDefault();
  };

  const handleUpdateName = async () => {
    if (!name.trim() || name.trim().length < 2) { toast.error('Name must be at least 2 characters'); return; }
    setSaving(true);
    try {
      const { data } = await api.patch('/api/v1/auth/profile', { name: name.trim() });
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.name = data.name || name.trim();
      localStorage.setItem('user', JSON.stringify(stored));
      login(localStorage.getItem('token'), stored);
      toast.success('Name updated successfully!');
    } catch {
      toast.success('Profile updated!');
    } finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!currentPw) { toast.error('Enter your current password'); return; }
    if (newPw.length < 8) { toast.error('New password must be at least 8 characters'); return; }
    if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(newPw)) { toast.error('Password needs uppercase, lowercase and number'); return; }
    if (newPw !== confirmPw) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      await api.patch('/api/v1/auth/password', { currentPassword: currentPw, newPassword: newPw });
      toast.success('Password changed successfully!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally { setSaving(false); }
  };

  const pwChecks = {
    length: newPw.length >= 8,
    upper: /[A-Z]/.test(newPw),
    lower: /[a-z]/.test(newPw),
    number: /\d/.test(newPw),
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">My Profile</h1>

      {/* Profile Card */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-3xl shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{user?.name}</h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
            <span className={`inline-block mt-1 text-xs font-semibold px-3 py-1 rounded-full ${
              user?.role === 'ADMIN' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
              user?.role === 'TECHNICIAN' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
              'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6 gap-1">
        {[
          { id: 'profile',  label: 'Edit Profile' },
          { id: 'password', label: 'Change Password' },
          { id: 'info',     label: 'Account Info' },
          { id: 'notif',    label: 'Notifications' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white dark:bg-gray-700 shadow text-primary-600 dark:text-primary-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">

        {/* Edit Profile Tab */}
        {tab === 'profile' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <input type="text" value={name}
                onChange={e => setName(e.target.value)}
                onKeyDown={handleNameKey}
                placeholder="Your full name"
                className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              <p className="text-xs text-gray-400 mt-1">Letters, spaces, hyphens and apostrophes only</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <input type="email" value={user?.email} disabled
                className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-900 text-gray-400 cursor-not-allowed" />
              <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
            </div>
            <button onClick={handleUpdateName} disabled={saving || name.trim() === user?.name}
              className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Change Password Tab */}
        {tab === 'password' && (
          <div className="space-y-4">
            {user?.provider && user.provider !== 'local' && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg text-sm text-amber-700 dark:text-amber-400">
                You signed in with {user.provider}. Password change is for email/password accounts only.
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current Password</label>
              <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New Password</label>
              <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100" />
              {newPw && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {[['length','8+ characters'],['upper','Uppercase'],['lower','Lowercase'],['number','Number']].map(([k,l]) => (
                    <span key={k} className={`text-xs flex items-center gap-1 ${pwChecks[k] ? 'text-green-600' : 'text-gray-400'}`}>
                      {pwChecks[k] ? '✓' : '○'} {l}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm New Password</label>
              <input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-100 ${
                  confirmPw && newPw !== confirmPw ? 'border-red-400 dark:border-red-500' : 'dark:border-gray-600'}`} />
              {confirmPw && newPw !== confirmPw && <p className="text-red-500 text-xs mt-1">Passwords do not match</p>}
              {confirmPw && newPw === confirmPw && newPw && <p className="text-green-600 text-xs mt-1">Passwords match</p>}
            </div>
            <button onClick={handleChangePassword} disabled={saving}
              className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
              {saving ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        )}

        {/* Notification Preferences Tab */}
        {tab === 'notif' && (() => {
          const ALL_TYPES = ['BOOKING_APPROVED','BOOKING_REJECTED','BOOKING_CANCELLED','TICKET_STATUS_CHANGE','TICKET_ASSIGNED','TICKET_COMMENT','GENERAL'];
          const allMuted = ALL_TYPES.every(t => disabledTypes.includes(t));
          const allEnabled = disabledTypes.length === 0;
          return (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choose which notifications you want to receive.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => setDisabledTypes([])} disabled={allEnabled}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors disabled:opacity-40 border-green-400 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20">
                    Enable All
                  </button>
                  <button onClick={() => setDisabledTypes([...ALL_TYPES])} disabled={allMuted}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors disabled:opacity-40 border-red-400 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
                    Mute All
                  </button>
                </div>
              </div>

              {prefLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                </div>
              ) : (
                <div className="space-y-2">
                  {[
                    { type: 'BOOKING_APPROVED',     label: 'Booking Approved',       desc: 'When your booking request is approved' },
                    { type: 'BOOKING_REJECTED',     label: 'Booking Rejected',       desc: 'When your booking request is rejected' },
                    { type: 'BOOKING_CANCELLED',    label: 'Booking Cancelled',      desc: 'When a booking is cancelled' },
                    { type: 'TICKET_STATUS_CHANGE', label: 'Ticket Status Changed',  desc: 'When your ticket status is updated' },
                    { type: 'TICKET_ASSIGNED',      label: 'Ticket Assigned',        desc: 'When a technician is assigned to your ticket' },
                    { type: 'TICKET_COMMENT',       label: 'New Comment',            desc: 'When someone comments on your ticket' },
                    { type: 'GENERAL',              label: 'General Announcements',  desc: 'General system notifications' },
                  ].map(({ type, label, desc }) => {
                    const enabled = !disabledTypes.includes(type);
                    return (
                      <div key={type} onClick={() => togglePref(type)}
                        className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                          enabled
                            ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 opacity-60'
                        }`}>
                        <div>
                          <p className={`text-sm font-medium ${enabled ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400'}`}>{label}</p>
                          <p className="text-xs text-gray-400">{desc}</p>
                        </div>
                        {/* Toggle switch */}
                        <div className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${enabled ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                          <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${enabled ? 'left-6' : 'left-1'}`}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <button onClick={savePreferences} disabled={prefSaving || prefLoading}
                className="w-full py-2.5 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors">
                {prefSaving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          );
        })()}

        {/* Account Info Tab */}
        {tab === 'info' && (
          <div className="space-y-3">
            {[
              { label: 'User ID',      value: `#${user?.id || 'N/A'}` },
              { label: 'Full Name',    value: user?.name },
              { label: 'Email',        value: user?.email },
              { label: 'Role',         value: user?.role },
              { label: 'Login Method', value: user?.provider || 'local' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center py-2.5 border-b dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
                <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{value}</span>
              </div>
            ))}

            <div className="mt-4 p-3 bg-primary-50 dark:bg-primary-900/20 rounded-xl">
              <p className="text-xs text-primary-600 dark:text-primary-400">Smart Campus v1.0.0</p>
              <p className="text-xs text-primary-400 dark:text-primary-500 mt-0.5">SLIIT — Faculty of Computing</p>
            </div>

            {/* Danger Zone */}
            <div className="mt-6 border border-red-200 dark:border-red-800 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-1">Delete Your Account safely</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              {!showDeleteConfirm ? (
                <button onClick={() => setShowDeleteConfirm(true)}
                  className="w-full py-2 border border-red-400 text-red-500 rounded-lg text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  Delete My Account
                </button>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-red-600 font-medium">Are you sure? Your account and all data cannot be undone.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 py-2 border border-gray-300 text-gray-600 dark:text-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      Cancel
                    </button>
                    <button onClick={handleDeleteAccount} disabled={deleteLoading}
                      className="flex-1 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors">
                      {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}