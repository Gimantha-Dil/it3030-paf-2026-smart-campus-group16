import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; 

const Icon = ({ d, d2, viewBox = "0 0 24 24", fill = false }) => (
  <svg className="w-5 h-5 flex-shrink-0" fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"}
    strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" viewBox={viewBox}>
    <path d={d} />
    {d2 && <path d={d2} />}
  </svg>
);

const Icons = {
  dashboard:     <Icon d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />,
  resources:     <Icon d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />,
  bookings:      <Icon d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
  tickets:       <Icon d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />,
  notifications: <Icon d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />,
  profile:       <Icon d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />,
  addResource:   <Icon d="M12 4v16m8-8H4" />,
  reviewBooking: <Icon d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  users:         <Icon d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />,
  analytics:     <Icon d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />,
  wrench:        <Icon d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" d2="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />,
};

const navItems = [
  { path: '/dashboard',          label: 'Dashboard',     icon: Icons.dashboard },
  { path: '/resources',          label: 'Resources',     icon: Icons.resources },
  { path: '/bookings',           label: 'Bookings',      icon: Icons.bookings },
  { path: '/tickets',            label: 'Tickets',       icon: Icons.tickets },
  { path: '/notifications',      label: 'Notifications', icon: Icons.notifications },
  { path: '/profile',            label: 'My Profile',    icon: Icons.profile },
];

const technicianItems = [
  { path: '/dashboard',     label: 'Dashboard',     icon: Icons.dashboard },
  { path: '/tickets',       label: 'My Tickets',    icon: Icons.tickets },
  { path: '/notifications', label: 'Notifications', icon: Icons.notifications },
  { path: '/profile',       label: 'My Profile',    icon: Icons.profile },
];

const adminItems = [
  { path: '/admin/resources/new',   label: 'Add Resource',    icon: Icons.addResource },
  { path: '/admin/bookings/review', label: 'Review Bookings', icon: Icons.reviewBooking },
  { path: '/admin/users',           label: 'User Management', icon: Icons.users },
  { path: '/admin/analytics',       label: 'Analytics',       icon: Icons.analytics },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const [hovered, setHovered] = useState(false);

  const isTechnician = user?.role === 'TECHNICIAN';
  const items = isTechnician ? technicianItems : navItems;

  // Sidebar is "expanded" when: mobile (open=true always expands) OR desktop + hovered
  const expanded = open ? hovered || true : false;
  // On desktop: sidebar always visible as mini (icons only), expands on hover
  // On mobile:  sidebar hidden until open=true, then fully expanded (no mini state)

  // Desktop mini width = 64px (w-16), expanded = 256px (w-64)
  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg text-sm transition-all duration-200 overflow-hidden whitespace-nowrap ${
      hovered ? 'px-3 py-2.5' : 'px-2.5 py-2.5 justify-center'
    } ${
      isActive
        ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 font-medium'
        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  return (
    <>
      {/* ── DESKTOP sidebar — always visible, mini by default, expands on hover ── */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`
          hidden lg:flex flex-col
          fixed left-0 top-16 bottom-0
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-700
          overflow-y-auto overflow-x-hidden
          z-40 transition-all duration-250 ease-in-out
          ${hovered ? 'w-64 px-3 shadow-lg' : 'w-16 px-2'}
          pt-3 pb-4
        `}
      >

        {/* Technician badge */}
        {isTechnician && (
          <div className={`mb-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800 flex items-center gap-2 overflow-hidden ${hovered ? 'px-3' : 'px-2 justify-center'}`}>
            {Icons.wrench}
            {hovered && <p className="text-xs font-semibold text-primary-600 dark:text-primary-300 uppercase tracking-wider">Technician</p>}
          </div>
        )}

        {/* Nav items */}
        <div className="space-y-0.5 flex-1">
          {items.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              title={!hovered ? item.label : undefined}
              className={linkClass}
            >
              {item.icon}
              {hovered && <span className="transition-opacity duration-150">{item.label}</span>}
            </NavLink>
          ))}
        </div>

        {/* Admin section */}
        {user?.role === 'ADMIN' && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 my-3" />
            {hovered && (
              <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Admin</p>
            )}
            <div className="space-y-0.5">
              {adminItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  title={!hovered ? item.label : undefined}
                  className={linkClass}
                >
                  {item.icon}
                  {hovered && <span className="transition-opacity duration-150">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          </>
        )}
      </aside>        


      {/* ── MOBILE sidebar — slide in/out overlay ── */}
      <aside
        className={`
          lg:hidden
          fixed left-0 top-16 bottom-0 w-64
          bg-white dark:bg-gray-900
          border-r border-gray-200 dark:border-gray-700
          px-3 pt-3 pb-4
          overflow-y-auto z-40
          transition-transform duration-300
          ${open ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {isTechnician && (
          <div className="mb-3 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg border border-primary-200 dark:border-primary-800 flex items-center gap-2">
            {Icons.wrench}
            <p className="text-xs font-semibold text-primary-600 dark:text-primary-300 uppercase tracking-wider">Technician</p>
          </div>
        )}

        <div className="space-y-0.5">
          {items.map(item => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/dashboard'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 font-medium'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </div>

        {user?.role === 'ADMIN' && (
          <>
            <div className="border-t border-gray-200 dark:border-gray-700 my-4" />
            <p className="px-3 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Admin</p>
            <div className="space-y-0.5">
              {adminItems.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                      isActive
                        ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-600 dark:text-primary-300 font-medium'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`
                  }
                >
                  {item.icon}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </>
        )}
      </aside>

      {/* Mobile overlay backdrop */}
      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/20 z-30" onClick={onClose} />
      )}
    </>
  );
}