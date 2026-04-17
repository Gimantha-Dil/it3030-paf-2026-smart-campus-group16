import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime } from '../../utils/dateUtils';
import { BOOKING_STATUS } from '../../utils/constants';

import { useAuth } from '../../hooks/useAuth';
import { getBookings, cancelBooking } from '../../api/bookingApi';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { toast } from 'react-toastify';
import { exportBookingsXLSX } from '../../utils/exportUtils';
import { exportBookingsPDF } from '../../utils/pdfUtils';//BookingList.jsx

export default function BookingList() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (statusFilter) params.status = statusFilter;
      const { data } = await getBookings(params);
      setBookings(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch (err) { 
      const msg = err.response?.data?.message;
      if (msg) toast.error(msg);
      // else silently fail - likely a permissions issue
    }
    finally { setLoading(false); }
  }, [page, statusFilter]);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  const handleExportCSV = async () => {
    await exportBookingsXLSX(bookings, user?.role === 'ADMIN' ? 'All Bookings' : 'My Bookings');
    toast.success('Bookings exported as Excel!');
  };

  const handleExportPDF = () => {
    exportBookingsPDF(bookings, user?.role === 'ADMIN' ? 'All Bookings' : 'My Bookings');
    toast.success('PDF exported!');
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this booking?')) return;
    try {
      await cancelBooking(id);
      toast.success('Booking cancelled');
      fetchBookings();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to cancel'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{user?.role === 'ADMIN' ? 'All Bookings' : 'My Bookings'}</h1>
        <div className="flex gap-2">
          <button onClick={handleExportPDF}
            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 flex items-center gap-1">
             PDF
          </button>
          <button onClick={handleExportCSV}
            className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-1">
             Excel
          </button>
          <Link to="/bookings/new"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm font-medium">
            + New Booking
          </Link>
          

        </div>
      </div>

      {/* Status filter */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Filter:</span>
        {['', ...Object.keys(BOOKING_STATUS)].map(s => (
          <button key={s} onClick={() => { setStatusFilter(s); setPage(0); }}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              statusFilter === s
                ? 'bg-primary-600 text-white border-primary-600'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          {bookings.length === 0 ? (
            <p className="text-center text-gray-500 py-16">
              No bookings found{statusFilter ? ` with status "${statusFilter}"` : ''}.
            </p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Resource</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                  {user?.role === 'ADMIN' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {bookings.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{b.resource?.name}</p>
                      <p className="text-xs text-gray-400">{b.resource?.location}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      <p>{formatDateTime(b.startTime)}</p>
                      <p className="text-gray-400 text-xs">→ {formatDateTime(b.endTime)}</p>
                      {b.attendees && <p className="text-xs text-gray-400"> {b.attendees}</p>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-xs">
                      <p className="truncate">{b.purpose}</p>
                      {b.adminReason && (
                        <p className="text-xs text-red-500 mt-1 truncate">Note: {b.adminReason}</p>
                      )}
                    </td>
                    {user?.role === 'ADMIN' && (
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                        <p>{b.user?.name}</p>
                        <p className="text-xs text-gray-400">{b.user?.email}</p>
                      </td>
                    )}
                    <td className="px-6 py-4"><StatusBadge status={b.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {b.status === 'APPROVED' && (
                          <Link to={`/bookings/${b.id}/qr`}
                            className="text-xs text-primary-600 hover:text-primary-700 font-medium border border-primary-200 px-2 py-1 rounded-lg hover:bg-primary-50">
                             QR
                          </Link>
                        )}
                        {(b.status === 'PENDING' || b.status === 'APPROVED') && (
                          <button onClick={() => handleCancel(b.id)}
                            className="text-sm text-red-600 hover:text-red-800 font-medium">Cancel</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}