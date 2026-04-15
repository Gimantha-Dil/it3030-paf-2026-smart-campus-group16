import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getResourceById } from '../../api/resourceApi';
import { getBookings } from '../../api/bookingApi';
import { toast } from 'react-toastify';

export default function ResourceAvailability() {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    Promise.all([
      getResourceById(id),
      getBookings({ size: 200 }),
    ]).then(([res, books]) => {
      setResource(res.data);
      const filtered = (books.data.content || []).filter(
        b => b.resource?.id === parseInt(id) && ['APPROVED','PENDING'].includes(b.status)
      );
      setBookings(filtered);
    }).catch(() => toast.error('Failed to load availability'))
    .finally(() => setLoading(false));
  }, [id]);

  const dayBookings = bookings.filter(b => {
    if (!b.startTime) return false;
    const bookingDate = new Date(b.startTime).toLocaleDateString('en-CA'); // YYYY-MM-DD in local time
    return bookingDate === selectedDate;
  });

  const hours = Array.from({ length: 24 }, (_, i) => i);

  const isBooked = (hour) => dayBookings.some(b => {
    const start = new Date(b.startTime).getHours();
    const end = new Date(b.endTime).getHours();
    return hour >= start && hour < end;
  });

  const getBookingForHour = (hour) => dayBookings.find(b => {
    const start = new Date(b.startTime).getHours();
    const end = new Date(b.endTime).getHours();
    return hour >= start && hour < end;
  });

  const availStart = resource?.availabilityStart ? parseInt(resource.availabilityStart.split(':')[0]) : 0;
  const availEnd = resource?.availabilityEnd ? parseInt(resource.availabilityEnd.split(':')[0]) : 24;

  if (loading) return <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>;
  if (!resource) return <p className="text-center py-16 text-gray-500">Resource not found.</p>;

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link to="/resources" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">← Back</Link>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Resource Availability</h1>
      </div>

      {/* Resource info */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-5 mb-5">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">{resource.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{resource.type?.replace(/_/g,' ')} · {resource.location}</p>
            {resource.capacity && <p className="text-sm text-gray-500 dark:text-gray-400">👥 Capacity: {resource.capacity}</p>}
          </div>
          <Link to={`/bookings/new?resourceId=${id}`}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">
            Book Now
          </Link>
        </div>
        {resource.availabilityStart && (
          <p className="text-sm text-primary-600 dark:text-primary-400 mt-2">🕐 Available: {resource.availabilityStart} – {resource.availabilityEnd}</p>
        )}
      </div>

      {/* Date picker */}
      <div className="flex items-center gap-3 mb-5">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Select Date:</label>
        <input type="date" value={selectedDate}
          min={new Date().toISOString().slice(0,10)}
          onChange={e => setSelectedDate(e.target.value)}
          className="px-3 py-2 border dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100" />
      </div>

      {/* Hourly availability grid */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border dark:border-gray-700 p-5">
        <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">
          Availability for {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' })}
        </h3>

        <div className="grid grid-cols-6 gap-2">
          {hours.map(h => {
            const inRange = h >= availStart && h < availEnd;
            const booked = isBooked(h);
            const booking = getBookingForHour(h);
            return (
              <div key={h}
                title={booked ? `${booking?.status}: ${booking?.user?.name}` : inRange ? 'Available' : 'Outside hours'}
                className={`p-2 rounded-lg text-center cursor-default transition-colors
                  ${!inRange ? 'bg-gray-100 dark:bg-gray-900/50 text-gray-300 dark:text-gray-600' :
                    booked ? (booking?.status === 'APPROVED' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800' :
                      'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800') :
                    'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800'}`}>
                <p className="text-xs font-mono font-bold">{String(h).padStart(2,'0')}:00</p>
                <p className="text-xs mt-0.5">
                  {!inRange ? '—' : booked ? (booking?.status === 'APPROVED' ? '🔴' : '🟡') : '🟢'}
                </p>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex gap-4 mt-4 flex-wrap">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500"></div><span className="text-xs text-gray-500 dark:text-gray-400">Available</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-500"></div><span className="text-xs text-gray-500 dark:text-gray-400">Booked (Approved)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-amber-400"></div><span className="text-xs text-gray-500 dark:text-gray-400">Booked (Pending)</span></div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-300"></div><span className="text-xs text-gray-500 dark:text-gray-400">Outside Hours</span></div>
        </div>

        {/* Day bookings list */}
        {dayBookings.length > 0 && (
          <div className="mt-4 pt-4 border-t dark:border-gray-700">
            <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Bookings on this day:</h4>
            <div className="space-y-2">
              {dayBookings.map(b => (
                <div key={b.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className={`w-2 h-2 rounded-full ${b.status === 'APPROVED' ? 'bg-red-500' : 'bg-amber-400'}`}></div>
                  <div className="flex-1 text-sm">
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {new Date(b.startTime).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})} –{' '}
                      {new Date(b.endTime).toLocaleTimeString('en-US',{hour:'2-digit',minute:'2-digit'})}
                    </span>
                    <span className="text-gray-500 dark:text-gray-400 ml-2">· {b.purpose?.substring(0,30)}</span>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${b.status === 'APPROVED' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                    {b.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
