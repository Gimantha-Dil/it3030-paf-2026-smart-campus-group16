import { useState, useEffect, useCallback } from 'react';
import { formatDateTime } from '../../utils/dateUtils';

export default function BookingReview() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState(null);
  const [reason, setReason] = useState('');
  const [reasonTouched, setReasonTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getBookings({ status: 'PENDING', size: 50 });
      setBookings(data.content || []);
    } catch { toast.error('Failed to load pending bookings'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPending(); }, [fetchPending]);

  const handleReview = async (id, status) => {
    setReasonTouched(true);
    if (status === 'REJECTED' && !reason.trim()) { toast.warning(' A reason is required for rejection'); return; }
    if (status === 'REJECTED' && reason.trim().length < 5) { toast.warning(' Please provide a meaningful reason (min 5 characters)'); return; }
    setSubmitting(true);
    try {
      await reviewBooking(id, { status, reason: reason.trim() || undefined });
      toast.success(` Booking ${status === 'APPROVED' ? 'approved' : 'rejected'}`);
      setReviewingId(null); setReason(''); setReasonTouched(false);
      fetchPending();
    } catch (err) { toast.error(err.response?.data?.message || 'Review failed'); }
    finally { setSubmitting(false); }
  };

  const showReasonError = reasonTouched && !reason.trim();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Review Pending Bookings</h1>
      {loading ? <LoadingSpinner /> : bookings.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-12 text-center">
          <p className="text-4xl mb-3"></p>
          <p className="text-gray-500 text-lg">No pending bookings to review!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{b.resource?.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Requested by <strong>{b.user?.name}</strong> ({b.user?.email})</p>
                </div>
                <StatusBadge status={b.status} />
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm mb-4">
                <div><span className="text-gray-500 text-xs block">Start</span><span className="font-medium">{formatDateTime(b.startTime)}</span></div>
                <div><span className="text-gray-500 text-xs block">End</span><span className="font-medium">{formatDateTime(b.endTime)}</span></div>
                <div><span className="text-gray-500 text-xs block">Attendees</span><span className="font-medium">{b.attendees || 'N/A'}</span></div>
              </div>
              <p className="text-sm text-gray-600 mb-4 p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-500 text-xs block mb-1">Purpose</span>{b.purpose}
              </p>
              {reviewingId === b.id ? (
                <div className="border-t pt-4 space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason <span className="text-gray-400 font-normal">(required for rejection)</span>
                    </label>
                    <textarea value={reason} onChange={e => setReason(e.target.value)} onBlur={() => setReasonTouched(true)}
                      placeholder="Provide reason for rejection or notes for approval..." rows={2}
                      className={`w-full px-3 py-2 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 ${showReasonError ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
                    {showReasonError && <p className="text-red-500 text-xs mt-1">⚠ Reason is required for rejection</p>}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleReview(b.id, 'APPROVED')} disabled={submitting}
                      className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 disabled:opacity-50 font-medium flex items-center gap-1">
                       Approve
                    </button>
                    <button onClick={() => handleReview(b.id, 'REJECTED')} disabled={submitting}
                      className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 disabled:opacity-50 font-medium flex items-center gap-1">
                       Reject
                    </button>
                    <button onClick={() => { setReviewingId(null); setReason(''); setReasonTouched(false); }}
                      className="px-5 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:bg-gray-700">Cancel</button>
                  </div>
                </div>
              ) : (
                <button onClick={() => { setReviewingId(b.id); setReason(''); setReasonTouched(false); }}
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Review this booking →
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}