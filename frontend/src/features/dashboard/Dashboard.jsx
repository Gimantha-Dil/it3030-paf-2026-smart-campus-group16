import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getResources } from '../../api/resourceApi';
import { getBookings } from '../../api/bookingApi';
import { getTickets } from '../../api/ticketApi';
import { getPendingStaff, approveStaff, rejectStaff } from '../../api/userApi';

// ── Widget definitions ────────────────────────────────────────────────────────
const ALL_WIDGETS = [
  { id: 'stats',       label: 'Stats Overview',      adminOnly: false, techHide: false },
  { id: 'clock',       label: 'Live Clock',           adminOnly: false, techHide: false },
  { id: 'quickact',    label: 'Quick Actions',         adminOnly: false, techHide: false },
  { id: 'profile',     label: 'My Profile',           adminOnly: false, techHide: false },
  { id: 'alerts',      label: 'Pending Alerts',       adminOnly: true,  techHide: true  },
  { id: 'pendstaff',   label: 'Staff Approvals',      adminOnly: true,  techHide: true  },
  { id: 'recentbook',  label: 'Recent Bookings',      adminOnly: false, techHide: true  },
  { id: 'recenttick',  label: 'Recent Tickets',       adminOnly: false, techHide: false },
];

function useWidgetState(role) {
  const key = `sc_widgets_${role}`;
  const defaultVisible = ALL_WIDGETS.filter(w => (!w.adminOnly || role === 'ADMIN') && (!w.techHide || role !== 'TECHNICIAN')).map(w => w.id);
  const [visible, setVisible] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) || defaultVisible; }
    catch { return defaultVisible; }
  });
  const [order, setOrder] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key + '_order')) || defaultVisible; }
    catch { return defaultVisible; }
  });

  const toggle = (id) => {
    setVisible(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  };

  const moveUp = (id) => {
    setOrder(prev => {
      const idx = prev.indexOf(id);
      if (idx <= 0) return prev;
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      localStorage.setItem(key + '_order', JSON.stringify(next));
      return next;
    });
  };

  const moveDown = (id) => {
    setOrder(prev => {
      const idx = prev.indexOf(id);
      if (idx < 0 || idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      localStorage.setItem(key + '_order', JSON.stringify(next));
      return next;
    });
  };

  const reset = () => {
    localStorage.removeItem(key);
    localStorage.removeItem(key + '_order');
    setVisible(defaultVisible);
    setOrder(defaultVisible);
  };

  return { visible, order, toggle, moveUp, moveDown, reset };
}

// ── Individual Widgets ────────────────────────────────────────────────────────
function StatsWidget({ stats, loading, userRole }) {
  const isTech = userRole === 'TECHNICIAN';
  const isAdmin = userRole === 'ADMIN';
  const cards = [
    { title: 'Total Resources', count: stats.resources, icon: <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth={1.8} viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'/></svg>, link: '/resources', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30', hide: isTech },
    { title: 'My Bookings', count: stats.bookings, icon: <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth={1.8} viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'/></svg>, link: '/bookings', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30', hide: isTech },
    { title: 'My Tickets', count: stats.tickets, icon: <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth={1.8} viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z'/></svg>, link: '/tickets', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30', hide: isTech },
    { title: 'Assigned Tickets', count: stats.tickets, icon: <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth={1.8} viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'/></svg>, link: '/tickets', color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/30', hide: !isTech },
    { title: 'Pending Bookings', count: stats.pendingBookings, icon: <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth={1.8} viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'/></svg>, link: '/admin/bookings/review', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/30', hide: !isAdmin },
  ].filter(c => !c.hide);
  return (
    <div className={`grid grid-cols-1 gap-4 ${isTech ? 'sm:grid-cols-1 max-w-xs' : cards.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4'}`}>
      {cards.map(c => (
        <Link key={c.title} to={c.link}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-5 hover:shadow-md transition-all hover:-translate-y-0.5 group">
          <div className={`w-10 h-10 ${c.bg} ${c.color} rounded-xl flex items-center justify-center mb-3`}>{c.icon}</div>
          <p className={`text-2xl font-bold ${c.color}`}>{loading ? '...' : c.count}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{c.title}</p>
        </Link>
      ))}
    </div>
  );
}

function ClockWidget({ user }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  const greeting = () => { const h = time.getHours(); return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'; };
  const roleLabel = () => {
    switch (user?.role) {
      case 'ADMIN': return 'Administrator';
      case 'TECHNICIAN': return 'Technician';
      case 'LECTURER': return 'Lecturer';
      case 'LAB_ASSISTANT': return 'Lab Assistant';
      default: return user?.userType === 'STUDENT' ? 'Student' : 'Staff';
    }
  };
  return (
    <div className="bg-gradient-to-r from-primary-600 to-primary-400 rounded-2xl p-6 text-white shadow-lg">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <p className="text-primary-200 text-sm font-medium mb-1">{greeting()},</p>
          <h1 className="text-2xl font-bold">{user?.name} </h1>
          <p className="text-primary-200 text-sm mt-1">{roleLabel()}</p>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold font-mono">{time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
          <p className="text-primary-200 text-xs mt-1">{time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
      </div>
    </div>
  );
}

function QuickActionsWidget({ user }) {
  const isTech = user?.role === 'TECHNICIAN';
  const isAdmin = user?.role === 'ADMIN';
  const canBook = ['ADMIN','USER','LECTURER','LAB_ASSISTANT'].includes(user?.role);

  const actions = [
    { to: '/bookings/new', icon: <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth={1.8} viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z'/></svg>, label: 'Book Resource', color: 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-300 hover:bg-primary-100', hide: !canBook },
    { to: '/tickets/new', icon: <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth={1.8} viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'/></svg>, label: 'Report Issue', color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100', hide: isTech },
    { to: '/tickets', icon: <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth={1.8} viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01'/></svg>, label: 'My Tickets', color: 'bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 hover:bg-orange-100', hide: !isTech },
    { to: '/resources', icon: <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth={1.8} viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4'/></svg>, label: 'Resources', color: 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100', hide: isTech },
    { to: '/admin/bookings/review', icon: <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth={1.8} viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'/></svg>, label: 'Review', color: 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-100', hide: !isAdmin },
    { to: '/admin/analytics', icon: <svg className='w-5 h-5' fill='none' stroke='currentColor' strokeWidth={1.8} viewBox='0 0 24 24'><path strokeLinecap='round' strokeLinejoin='round' d='M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z'/></svg>, label: 'Analytics', color: 'bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 hover:bg-purple-100', hide: !isAdmin },
  ].filter(a => !a.hide);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-5">
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 gap-2">
        {actions.map(a => (
          <Link key={a.to} to={a.to} className={`flex items-center gap-2 p-3 rounded-xl text-sm font-medium transition-colors ${a.color}`}>
            <span className="w-5 h-5">{a.icon}</span><span>{a.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

function ProfileWidget({ user, stats, loading }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-5">
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">My Profile</h2>
      <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
        {user?.avatarUrl ? (
          <img src={user.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-xl">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <p className="font-semibold text-gray-800 dark:text-gray-100 text-sm">{user?.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
        </div>
      </div>
      <div className="space-y-2">
        {[
          ['Role', user?.role],
          ...(user?.role !== 'TECHNICIAN' ? [['Bookings', loading ? '...' : stats.bookings]] : []),
          ['Tickets', loading ? '...' : stats.tickets],
        ].map(([l, v]) => (
          <div key={l} className="flex justify-between py-1.5 border-b dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">{l}</span>
            <span className="text-xs font-semibold text-gray-800 dark:text-gray-100">{v}</span>
          </div>
        ))}
      </div>
      <Link to="/profile" className="mt-3 block text-center text-xs text-primary-600 dark:text-primary-400 hover:underline">Edit Profile →</Link>
    </div>
  );
}

function AlertsWidget({ stats }) {
  if (!stats.pendingBookings && !stats.openTickets && !stats.pendingStaff) return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-5 text-center">
      <p className="text-green-600 dark:text-green-400 text-sm font-medium">✓ All clear! No pending items.</p>
    </div>
  );
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {stats.pendingBookings > 0 && (
        <Link to="/admin/bookings/review" className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3 hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors">
          <div className="w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-xl flex items-center justify-center"><svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg></div>
          <div><p className="text-xl font-bold text-amber-700 dark:text-amber-400">{stats.pendingBookings}</p><p className="text-xs text-amber-600 dark:text-amber-500">Pending Bookings</p></div>
        </Link>
      )}
      {stats.openTickets > 0 && (
        <Link to="/tickets" className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 flex items-center gap-3 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors">
          <div className="w-10 h-10 bg-red-100 dark:bg-red-800 rounded-xl flex items-center justify-center text-xl"></div>
          <div><p className="text-xl font-bold text-red-700 dark:text-red-400">{stats.openTickets}</p><p className="text-xs text-red-600 dark:text-red-500">Open Tickets</p></div>
        </Link>
      )}
      {stats.pendingStaff > 0 && (
        <Link to="/admin/users" className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-4 flex items-center gap-3 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
          <div className="w-10 h-10 bg-purple-100 dark:bg-purple-800 rounded-xl flex items-center justify-center text-xl"></div>
          <div><p className="text-xl font-bold text-purple-700 dark:text-purple-400">{stats.pendingStaff}</p><p className="text-xs text-purple-600 dark:text-purple-500">Staff Approvals</p></div>
        </Link>
      )}
    </div>
  );
}

const ROLE_BADGE = {
  TECHNICIAN:    'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  LECTURER:      'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  LAB_ASSISTANT: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
};

function PendingStaffWidget({ list, onApprove, onReject }) {
  if (list.length === 0) return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-5">
      <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-3"> Staff Approvals</h2>
      <p className="text-sm text-gray-400 text-center py-4">No pending staff requests.</p>
    </div>
  );
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Staff Approvals</h2>
        <Link to="/admin/users?tab=pending" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">View all →</Link>
      </div>
      <div className="space-y-3">
        {list.slice(0, 5).map(u => (
          <div key={u.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
            <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {u.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{u.name}</p>
              <p className="text-xs text-gray-400 truncate">{u.email}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${ROLE_BADGE[u.requestedRole] || 'bg-gray-100 text-gray-600'}`}>
              {u.requestedRole?.replace('_', ' ')}
            </span>
            <div className="flex gap-1.5 flex-shrink-0">
              <button onClick={() => onApprove(u.id)}
                className="text-xs px-2.5 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors">
                ✓
              </button>
              <button onClick={() => onReject(u.id)}
                className="text-xs px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentBookingsWidget({ bookings }) {
  const recent = bookings.slice(0, 4);
  const STATUS_COLORS = { APPROVED: 'text-green-600 bg-green-50 dark:bg-green-900/30', PENDING: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30', REJECTED: 'text-red-600 bg-red-50 dark:bg-red-900/30', CANCELLED: 'text-gray-500 bg-gray-50 dark:bg-gray-700' };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Recent Bookings</h2>
        <Link to="/bookings" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">View all →</Link>
      </div>
      {recent.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No bookings yet.</p> : (
        <div className="space-y-2">
          {recent.map(b => (
            <div key={b.id} className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{b.resource?.name}</p>
                <p className="text-xs text-gray-400">{new Date(b.startTime).toLocaleDateString('en-US', { month:'short', day:'numeric' })}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[b.status] || ''}`}>{b.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RecentTicketsWidget({ tickets }) {
  const recent = tickets.slice(0, 4);
  const PRIORITY_COLORS = { CRITICAL: 'text-red-600 bg-red-50 dark:bg-red-900/30', HIGH: 'text-orange-600 bg-orange-50 dark:bg-orange-900/30', MEDIUM: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30', LOW: 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' };
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-5">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">Recent Tickets</h2>
        <Link to="/tickets" className="text-xs text-primary-600 dark:text-primary-400 hover:underline">View all →</Link>
      </div>
      {recent.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">No tickets yet.</p> : (
        <div className="space-y-2">
          {recent.map(t => (
            <Link key={t.id} to={`/tickets/${t.id}`} className="flex items-center gap-3 p-2.5 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{t.title || t.description?.substring(0, 40)}</p>
                <p className="text-xs text-gray-400">{t.status}</p>
              </div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_COLORS[t.priority] || ''}`}>{t.priority}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Widget Customizer Panel ───────────────────────────────────────────────────
function WidgetCustomizer({ widgets, visible, order, onToggle, onMoveUp, onMoveDown, onReset, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Customize Dashboard</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 text-xl">×</button>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Show/hide widgets and reorder them.</p>
        <div className="space-y-2 mb-5">
          {order.filter(id => widgets.find(w => w.id === id)).map((id, idx) => {
            const w = widgets.find(w => w.id === id);
            if (!w) return null;
            const isOn = visible.includes(id);
            return (
              <div key={id} className={`flex items-center gap-3 p-3 rounded-xl border transition-colors ${isOn ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800' : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'}`}>
                <button onClick={() => onToggle(id)}
                  className={`w-10 h-5 rounded-full transition-colors relative flex-shrink-0 ${isOn ? 'bg-primary-600' : 'bg-gray-300 dark:bg-gray-600'}`}>
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all ${isOn ? 'left-5' : 'left-0.5'}`}></span>
                </button>
                <span className={`flex-1 text-sm font-medium ${isOn ? 'text-gray-800 dark:text-gray-100' : 'text-gray-400 dark:text-gray-500'}`}>{w.label}</span>
                <div className="flex gap-1">
                  <button onClick={() => onMoveUp(id)} disabled={idx === 0}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30">↑</button>
                  <button onClick={() => onMoveDown(id)} disabled={idx === order.length - 1}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 disabled:opacity-30">↓</button>
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <button onClick={onReset} className="flex-1 py-2 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700">Reset Default</button>
          <button onClick={onClose} className="flex-1 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Done</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ resources: 0, bookings: 0, tickets: 0, pendingBookings: 0, openTickets: 0, pendingStaff: 0 });
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [pendingStaffList, setPendingStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCustomizer, setShowCustomizer] = useState(false);

  const availableWidgets = ALL_WIDGETS.filter(w => (!w.adminOnly || user?.role === 'ADMIN') && (!w.techHide || user?.role !== 'TECHNICIAN'));
  const { visible, order, toggle, moveUp, moveDown, reset } = useWidgetState(user?.role || 'USER');

  useEffect(() => {
    if (!user) return;
    const isTechnician = user.role === 'TECHNICIAN';
    const isAdmin = user.role === 'ADMIN';

    const fetchStats = async () => {
      setLoading(true);
      try {
        // Tickets — all roles can access their own tickets
        const tickRes = await getTickets({ size: 10 }).catch(() => ({ data: { totalElements: 0, content: [] } }));
        const ticketList = (tickRes.data.content || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setTickets(ticketList);

        const newStats = {
          resources: 0,
          bookings: 0,
          tickets: tickRes.data.totalElements || 0,
          pendingBookings: 0,
          openTickets: 0,
          pendingStaff: 0,
        };

        // Open tickets count — valid for ADMIN only (all-tickets view)
        if (isAdmin) {
          const openTickRes = await getTickets({ size: 1, status: 'OPEN' }).catch(() => ({ data: { totalElements: 0 } }));
          newStats.openTickets = openTickRes.data.totalElements || 0;
        }

        // Bookings & Resources — not for TECHNICIAN
        if (!isTechnician) {
          const bookRes = await getBookings({ size: 10 }).catch(() => ({ data: { totalElements: 0, content: [] } }));
          newStats.bookings = bookRes.data.totalElements || 0;
          setBookings((bookRes.data.content || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));

          const resRes = await getResources({ size: 1 }).catch(() => ({ data: { totalElements: 0 } }));
          newStats.resources = resRes.data.totalElements || 0;

          // Pending bookings count — ADMIN only (system-wide)
          if (isAdmin) {
            const pendingRes = await getBookings({ size: 1, status: 'PENDING' }).catch(() => ({ data: { totalElements: 0 } }));
            newStats.pendingBookings = pendingRes.data.totalElements || 0;

            // Pending staff approvals
            const staffRes = await getPendingStaff({ size: 20 }).catch(() => ({ data: { content: [], totalElements: 0 } }));
            newStats.pendingStaff = staffRes.data.totalElements || 0;
            setPendingStaffList(staffRes.data.content || []);
          }
        }

        setStats(newStats);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  const handleApproveStaff = async (id) => {
    try {
      await approveStaff(id);
      setPendingStaffList(prev => prev.filter(u => u.id !== id));
      setStats(s => ({ ...s, pendingStaff: Math.max(0, s.pendingStaff - 1) }));
    } catch { /* ignore */ }
  };

  const handleRejectStaff = async (id) => {
    try {
      await rejectStaff(id);
      setPendingStaffList(prev => prev.filter(u => u.id !== id));
      setStats(s => ({ ...s, pendingStaff: Math.max(0, s.pendingStaff - 1) }));
    } catch { /* ignore */ }
  };

  const renderWidget = (id) => {
    if (!visible.includes(id)) return null;
    switch (id) {
      case 'stats':      return <StatsWidget key={id} stats={stats} loading={loading} userRole={user?.role} />;
      case 'clock':      return <ClockWidget key={id} user={user} />;
      case 'quickact':   return <QuickActionsWidget key={id} user={user} />;
      case 'profile':    return <ProfileWidget key={id} user={user} stats={stats} loading={loading} />;
      case 'alerts':     return user?.role === 'ADMIN' ? <AlertsWidget key={id} stats={stats} /> : null;
      case 'pendstaff':  return user?.role === 'ADMIN' ? <PendingStaffWidget key={id} list={pendingStaffList} onApprove={handleApproveStaff} onReject={handleRejectStaff} /> : null;
      case 'recentbook': return <RecentBookingsWidget key={id} bookings={bookings} />;
      case 'recenttick': return <RecentTicketsWidget key={id} tickets={tickets} />;
      default: return null;
    }
  };

  const fullWidth = ['clock', 'stats', 'alerts'];
  const halfWidth = ['quickact', 'profile', 'pendstaff', 'recentbook', 'recenttick'];

  const orderedFull = order.filter(id => fullWidth.includes(id) && visible.includes(id));
  const orderedHalf = order.filter(id => halfWidth.includes(id) && visible.includes(id));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Dashboard</h1>
        <button onClick={() => setShowCustomizer(true)}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
           Customize
        </button>
      </div>

      {orderedFull.map(id => renderWidget(id))}

      {orderedHalf.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {orderedHalf.map(id => renderWidget(id))}
        </div>
      )}

      {visible.length === 0 && (
        <div className="text-center py-16 text-gray-400 dark:text-gray-600">
          <p className="text-4xl mb-3"></p>
          <p>All widgets hidden. <button onClick={() => setShowCustomizer(true)} className="text-primary-600 dark:text-primary-400 hover:underline">Customize</button> to add them back.</p>
        </div>
      )}

      {showCustomizer && (
        <WidgetCustomizer
          widgets={availableWidgets}
          visible={visible}
          order={order}
          onToggle={toggle}
          onMoveUp={moveUp}
          onMoveDown={moveDown}
          onReset={reset}
          onClose={() => setShowCustomizer(false)}
        />
      )}
    </div>
  );
}