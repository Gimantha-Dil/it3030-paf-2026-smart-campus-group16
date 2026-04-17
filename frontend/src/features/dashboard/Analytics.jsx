import { useState, useEffect } from 'react';
import { getBookings } from '../../api/bookingApi';
import { getTickets } from '../../api/ticketApi';
import { getResources } from '../../api/resourceApi';
import { toast } from 'react-toastify';

function Bar({ label, value, max, color }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 dark:text-gray-400 w-24 truncate">{label}</span>
      <div className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full h-2.5">
        <div className={`h-2.5 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }}></div>
      </div>
      <span className="text-xs font-semibold text-gray-700 dark:text-gray-300 w-6 text-right">{value}</span>
    </div>
  );
}

export default function Analytics() {
  const [bookings, setBookings] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getBookings({ size: 200 }),
      getTickets({ size: 200 }),
      getResources({ size: 100 }),
    ]).then(([b, t, r]) => {
      setBookings(b.data.content || []);
      setTickets(t.data.content || []);
      setResources(r.data.content || []);
    }).catch(() => toast.error('Failed to load analytics'))
    .finally(() => setLoading(false));
  }, []);

  // Top resources by booking count
  const resourceBookings = resources.map(r => ({
    name: r.name,
    count: bookings.filter(b => b.resource?.id === r.id).length,
  })).sort((a, b) => b.count - a.count).slice(0, 5);

  // Bookings by status
  const byStatus = ['PENDING','APPROVED','REJECTED','CANCELLED'].map(s => ({
    label: s, count: bookings.filter(b => b.status === s).length,
  }));

  // Tickets by priority
  const byPriority = ['CRITICAL','HIGH','MEDIUM','LOW'].map(p => ({
    label: p, count: tickets.filter(t => t.priority === p).length,
  }));

  // Bookings by hour (peak hours)
  const hourCounts = Array(24).fill(0);
  bookings.forEach(b => {
    if (b.startTime) {
      const h = new Date(b.startTime).getHours();
      hourCounts[h]++;
    }
  });
  const peakHours = hourCounts
    .map((count, hour) => ({ hour: `${hour}:00`, count }))
    .filter(h => h.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Tickets by status
  const ticketsByStatus = ['OPEN','IN_PROGRESS','RESOLVED','CLOSED','REJECTED'].map(s => ({
    label: s.replace('_',' '), count: tickets.filter(t => t.status === s).length,
  }));

  const maxResourceCount = Math.max(...resourceBookings.map(r => r.count), 1);
  const maxStatusCount = Math.max(...byStatus.map(s => s.count), 1);
  const maxPriorityCount = Math.max(...byPriority.map(p => p.count), 1);
  const maxPeakCount = Math.max(...peakHours.map(h => h.count), 1);
  const maxTicketStatus = Math.max(...ticketsByStatus.map(s => s.count), 1);

  const statusColors = { PENDING: 'bg-amber-400', APPROVED: 'bg-green-500', REJECTED: 'bg-red-400', CANCELLED: 'bg-gray-400' };
  const priorityColors = { CRITICAL: 'bg-red-500', HIGH: 'bg-orange-500', MEDIUM: 'bg-yellow-400', LOW: 'bg-blue-400' };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">Analytics Dashboard</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Bookings', value: bookings.length, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/30' },
          { label: 'Total Tickets', value: tickets.length, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/30' },
          { label: 'Total Resources', value: resources.length, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/30' },
          { label: 'Approval Rate', value: bookings.length > 0 ? `${Math.round(bookings.filter(b=>b.status==='APPROVED').length/bookings.length*100)}%` : '0%', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/30' },
        ].map(c => (
          <div key={c.label} className={`${c.bg} rounded-2xl p-4 border border-transparent`}>
            <p className={`text-2xl font-bold ${c.color}`}>{c.value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{c.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Top Resources */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Top Resources by Bookings</h2>
          {resourceBookings.length === 0
            ? <p className="text-sm text-gray-400 text-center py-4">No booking data yet</p>
            : <div className="space-y-3">
                {resourceBookings.map((r, i) => (
                  <Bar key={`${r.name}-${i}`} label={r.name} value={r.count} max={maxResourceCount} color="bg-primary-500" />
                ))}
              </div>
          }
        </div>

        {/* Peak Booking Hours */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Peak Booking Hours</h2>
          {peakHours.length === 0
            ? <p className="text-sm text-gray-400 text-center py-4">No booking data yet</p>
            : <div className="space-y-3">
                {peakHours.map(h => (
                  <Bar key={h.hour} label={h.hour} value={h.count} max={maxPeakCount} color="bg-blue-500" />
                ))}
              </div>
          }
        </div>

        {/* Bookings by Status */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Bookings by Status</h2>
          <div className="space-y-3">
            {byStatus.map(s => (
              <Bar key={s.label} label={s.label} value={s.count} max={maxStatusCount} color={statusColors[s.label] || 'bg-gray-400'} />
            ))}
          </div>
        </div>

        {/* Tickets by Priority */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-6">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100 mb-4">Tickets by Priority</h2>
          <div className="space-y-3">
            {byPriority.map(p => (
              <Bar key={p.label} label={p.label} value={p.count} max={maxPriorityCount} color={priorityColors[p.label] || 'bg-gray-400'} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3">Tickets by Status</h3>
            <div className="space-y-2">
              {ticketsByStatus.map(s => (
                <Bar key={s.label} label={s.label} value={s.count} max={maxTicketStatus} color="bg-orange-400" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
