import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getTickets } from '../../api/ticketApi';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PRIORITY_COLORS, TICKET_STATUS } from '../../utils/constants';
import { formatDateTime } from '../../utils/dateUtils';
import { toast } from 'react-toastify';
import { exportTicketsXLSX } from '../../utils/exportUtils';
import { exportTicketsPDF } from '../../utils/pdfUtils';

export default function TicketList() {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    setLoading(true);
    const params = { page, size: 10 };
    if (statusFilter) params.status = statusFilter;
    getTickets(params)
      .then(({ data }) => { setTickets(data.content || []); setTotalPages(data.totalPages || 0); })
      .catch(() => toast.error('Failed to load tickets'))
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  const pageTitle = user?.role === 'TECHNICIAN' ? 'My Assigned Tickets'
    : user?.role === 'ADMIN' ? 'All Tickets' : 'My Tickets';

  const handleExportXLSX = async () => {
    await exportTicketsXLSX(tickets, pageTitle);
    toast.success('Excel exported!');
  };

  const handleExportPDF = () => {
    exportTicketsPDF(tickets, pageTitle);
    toast.success('PDF downloading!');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{pageTitle}</h1>
        <div className="flex gap-2">
          <button onClick={handleExportXLSX}
            className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700">
            Excel
          </button>
          <button onClick={handleExportPDF}
            className="px-3 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700">
            PDF
          </button>
          {user?.role !== 'TECHNICIAN' && (
            <Link to="/tickets/new"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 text-sm font-medium">
              + Report Issue
            </Link>
          )}
        </div>
      </div>

      {user?.role === 'TECHNICIAN' && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-center gap-2 text-sm text-blue-700">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          <span>Showing tickets assigned to you. Use the Ticket Detail page to update status and add resolution notes.</span>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-4 mb-6 flex flex-wrap gap-3 items-center">
        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Filter:</span>
        {['', ...Object.keys(TICKET_STATUS)].map(s => (
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
        <div className="space-y-3">
          {tickets.map(t => (
            <Link key={t.id} to={`/tickets/${t.id}`}
              className="block bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="text-gray-400 text-sm font-mono">#{t.id}</span>
                    <StatusBadge status={t.status} />
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[t.priority] || ''}`}>
                      {t.priority}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                      {t.category?.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium truncate">{t.description?.substring(0, 120)}{t.description?.length > 120 ? '...' : ''}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                    <span>By {t.reporter?.name}</span>
                    <span>{formatDateTime(t.createdAt)}</span>
                    {t.resource && <span> {t.resource.name}</span>}
                    {t.assignedTo && <span> {t.assignedTo.name}</span>}
                    {t.attachmentCount > 0 && <span> {t.attachmentCount}</span>}
                    {t.commentCount > 0 && <span>{t.commentCount}</span>}
                  </div>
                </div>
              </div>
            </Link>
          ))}
          {tickets.length === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 p-12 text-center">
              <p className="text-gray-400">No tickets found{statusFilter ? ` with status "${statusFilter}"` : ''}.</p>
            </div>
          )}
        </div>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}