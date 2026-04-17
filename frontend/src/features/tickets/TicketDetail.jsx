import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getTicketById, updateTicketStatus, assignTechnician, addComment, updateComment, deleteComment } from '../../api/ticketApi';
import { getUsers } from '../../api/userApi';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { PRIORITY_COLORS } from '../../utils/constants';
import { formatDateTime, timeAgo } from '../../utils/dateUtils';
import { toast } from 'react-toastify';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// Attachment thumbnail — handles image load errors gracefully
function AttachmentThumb({ url, fileName, isImage, isPdf }) {
  const [imgError, setImgError] = useState(false);
  const showImg = isImage && !imgError;
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="block group">
      <div className="w-28 h-28 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden border dark:border-gray-600 hover:ring-2 hover:ring-primary-400 transition-all flex items-center justify-center">
        {showImg ? (
          <img src={url} alt={fileName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-3xl">{isPdf ? '' : ''}</span>
        )}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate w-28 text-center">{fileName}</p>
    </a>
  );
}


// Service Level Timer Component
function ServiceTimer({ ticket }) {
  const [now, setNow] = React.useState(new Date());
  React.useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const created = new Date(ticket.createdAt);
  const elapsed = Math.floor((now - created) / 1000);
  const h = Math.floor(elapsed / 3600);
  const m = Math.floor((elapsed % 3600) / 60);
  const s = elapsed % 60;
  const fmt = (n) => String(n).padStart(2, '0');

  const slaHours = { CRITICAL: 2, HIGH: 8, MEDIUM: 24, LOW: 72 };
  const slaSecs = (slaHours[ticket.priority] || 24) * 3600;
  const pct = Math.min((elapsed / slaSecs) * 100, 100);
  const breached = elapsed > slaSecs;
  const isResolved = ['RESOLVED', 'CLOSED'].includes(ticket.status);

  if (isResolved) return null;

  return (
    <div className={`rounded-xl p-4 border ${breached ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700' : 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700'} mb-4`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Service Level Timer</span>
        <span className={`font-mono text-lg font-bold ${breached ? 'text-red-600' : 'text-amber-600'}`}>
          {fmt(h)}:{fmt(m)}:{fmt(s)}
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div className={`h-2 rounded-full transition-all ${breached ? 'bg-red-500' : pct > 75 ? 'bg-orange-500' : 'bg-amber-400'}`}
          style={{ width: `${pct}%` }}></div>
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-xs text-gray-500">SLA: {slaHours[ticket.priority]}h for {ticket.priority}</span>
        <span className={`text-xs font-medium ${breached ? 'text-red-600' : 'text-gray-500'}`}>
          {breached ? '⚠ SLA Breached!' : `${Math.max(0, Math.floor((slaSecs - elapsed) / 3600))}h remaining`}
        </span>
      </div>
    </div>
  );
}

export default function TicketDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [editingComment, setEditingComment] = useState(null); // { id, content }
  const [newStatus, setNewStatus] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [techId, setTechId] = useState('');
  const [technicians, setTechnicians] = useState([]);

  const fetchTicket = useCallback(async () => {
    try {
      const { data } = await getTicketById(id);
      setTicket(data);
    } catch { toast.error('Failed to load ticket'); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { fetchTicket(); }, [fetchTicket]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      getUsers({ role: 'TECHNICIAN', size: 100 })
        .then(({ data }) => setTechnicians(data.content || []))
        .catch(() => {});
    }
  }, [user]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    try {
      await addComment(id, { content: comment });
      setComment('');
      toast.success('Comment added');
      fetchTicket();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to add comment'); }
  };

  const handleEditComment = async (commentId) => {
    if (!editingComment?.content?.trim()) return;
    try {
      await updateComment(id, commentId, { content: editingComment.content });
      setEditingComment(null);
      toast.success('Comment updated');
      fetchTicket();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update comment'); }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Delete this comment?')) return;
    try {
      await deleteComment(id, commentId);
      toast.success('Comment deleted');
      fetchTicket();
    } catch { toast.error('Failed to delete comment'); }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    if (newStatus === 'REJECTED' && !rejectionReason.trim()) {
      toast.warning('Please provide a rejection reason');
      return;
    }
    try {
      await updateTicketStatus(id, {
        status: newStatus,
        rejectionReason: newStatus === 'REJECTED' ? rejectionReason : undefined,
        resolutionNotes: (newStatus === 'RESOLVED' || newStatus === 'CLOSED') ? resolutionNotes : undefined,
      });
      toast.success('Status updated');
      setNewStatus(''); setRejectionReason(''); setResolutionNotes('');
      fetchTicket();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to update status'); }
  };

  const handleAssign = async () => {
    if (!techId) return;
    try {
      await assignTechnician(id, { technicianId: parseInt(techId) });
      toast.success('Technician assigned');
      setTechId('');
      fetchTicket();
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to assign'); }
  };

  if (loading) return <LoadingSpinner />;
  if (!ticket) return <p className="text-center text-gray-500 py-12">Ticket not found.</p>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Ticket #{ticket.id}</h1>
              {ticket.title && (
                <p className="text-base font-semibold text-gray-700 dark:text-gray-200 mt-1">{ticket.title}</p>
              )}
              <StatusBadge status={ticket.status} />
              <span className={`px-2 py-0.5 rounded text-xs font-medium ${PRIORITY_COLORS[ticket.priority] || ''}`}>
                {ticket.priority}
              </span>
              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                {ticket.category?.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-sm text-gray-400">Created {formatDateTime(ticket.createdAt)}</p>
          </div>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-5 leading-relaxed">{ticket.description}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t pt-4">
          <div><p className="text-gray-500 text-xs mb-1">Reporter</p><p className="font-medium">{ticket.reporter?.name}</p></div>
          <div><p className="text-gray-500 text-xs mb-1">Assigned To</p><p className="font-medium">{ticket.assignedTo?.name || <span className="text-gray-400">Unassigned</span>}</p></div>
          <div><p className="text-gray-500 text-xs mb-1">Resource</p><p className="font-medium">{ticket.resource?.name || <span className="text-gray-400">N/A</span>}</p></div>
          <div><p className="text-gray-500 text-xs mb-1">Contact</p><p className="font-medium">{ticket.contactDetails || <span className="text-gray-400">N/A</span>}</p></div>
        </div>

        {/* Resolution Notes */}
        {ticket.resolutionNotes && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-xs font-semibold text-green-700 mb-1"> Resolution Notes</p>
            <p className="text-sm text-green-800">{ticket.resolutionNotes}</p>
          </div>
        )}

        {/* Rejection Reason */}
        {ticket.rejectionReason && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs font-semibold text-red-700 mb-1"> Rejection Reason</p>
            <p className="text-sm text-red-800">{ticket.rejectionReason}</p>
          </div>
        )}
      </div>

      {/* Attachments */}
      {ticket.attachments?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Attachments ({ticket.attachments.length})</h2>
          <div className="flex flex-wrap gap-4">
            {ticket.attachments.map(a => {
              const url = `${API_URL}/uploads/tickets/${a.filePath}`;
              const isImage = a.fileType?.startsWith('image/') || 
                              /\.(jpg|jpeg|png|gif|webp)$/i.test(a.fileName || '');
              const isPdf = a.fileType === 'application/pdf' || /\.pdf$/i.test(a.fileName || '');
              return (
                <AttachmentThumb key={a.id} url={url} fileName={a.fileName} isImage={isImage} isPdf={isPdf} />
              );
            })}
          </div>
        </div>
      )}

      {/* Admin / Technician Actions */}
      {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
          <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-4">Staff Actions</h2>
          <div className="space-y-4">
            {/* Status Change */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Update Status</label>
              {/* Current status badge */}
              <div className="mb-2 flex items-center gap-2">
                <span className="text-xs text-gray-500 dark:text-gray-400">Current:</span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                  ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                  ticket.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700' :
                  ticket.status === 'RESOLVED' ? 'bg-green-100 text-green-700' :
                  ticket.status === 'CLOSED' ? 'bg-gray-100 text-gray-600' :
                  'bg-red-100 text-red-700'
                }`}>{ticket.status?.replace('_', ' ')}</span>
              </div>
              {['CLOSED', 'REJECTED'].includes(ticket.status) ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">This ticket is {ticket.status.toLowerCase()} and cannot be updated further.</p>
              ) : (
              <div className="flex flex-wrap gap-2">
                <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm min-w-44">
                  <option value="">Select new status...</option>
                  {ticket.status === 'OPEN' && (
                    <option value="IN_PROGRESS">IN PROGRESS</option>
                  )}
                  {(ticket.status === 'OPEN' || ticket.status === 'IN_PROGRESS') && (
                    <option value="RESOLVED">RESOLVED</option>
                  )}
                  {ticket.status === 'RESOLVED' && (
                    <option value="IN_PROGRESS">REOPEN (IN PROGRESS)</option>
                  )}
                  <option value="CLOSED">CLOSED</option>
                  {user?.role === 'ADMIN' && <option value="REJECTED">REJECTED</option>}
                </select>
                <button onClick={handleStatusUpdate} disabled={!newStatus}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-primary-700 font-medium">
                  Apply
                </button>
              </div>
              )}
              {/* Conditional fields */}
              {!['CLOSED', 'REJECTED'].includes(ticket.status) && newStatus === 'REJECTED' && (
                <textarea value={rejectionReason} onChange={e => setRejectionReason(e.target.value)}
                  placeholder="Rejection reason (required)..." rows={2}
                  className="mt-2 w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none" />
              )}
              {!['CLOSED', 'REJECTED'].includes(ticket.status) && (newStatus === 'RESOLVED' || newStatus === 'CLOSED') && (
                <textarea value={resolutionNotes} onChange={e => setResolutionNotes(e.target.value)}
                  placeholder="Resolution notes (optional)..." rows={2}
                  className="mt-2 w-full px-3 py-2 border border-green-300 rounded-lg text-sm focus:ring-2 focus:ring-green-400 outline-none" />
              )}
            </div>

            {/* Assign Technician */}
            {user?.role === 'ADMIN' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assign Technician</label>
                {ticket.assignedTo && (
                  <div className="mb-2 flex items-center gap-2 px-3 py-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg text-sm">
                    <svg className="w-4 h-4 text-primary-600 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
                    <span className="text-primary-700 dark:text-primary-300">Currently assigned: <strong>{ticket.assignedTo.name}</strong></span>
                  </div>
                )}
                <div className="flex gap-2">
                  <select value={techId} onChange={(e) => setTechId(e.target.value)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm min-w-52">
                    <option value="">{ticket.assignedTo ? 'Reassign to...' : 'Select a technician...'}</option>
                    {technicians.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.email})</option>
                    ))}
                  </select>
                  <button onClick={handleAssign} disabled={!techId}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm disabled:opacity-50 hover:bg-green-700 font-medium">
                    {ticket.assignedTo ? 'Reassign' : 'Assign'}
                  </button>
                </div>
                {technicians.length === 0 && <p className="text-xs text-amber-500 mt-1">No technicians found. Add a user with TECHNICIAN role first.</p>}
              </div>
            )}
          </div>
        </div>
      )}

      <ServiceTimer ticket={ticket} />
      {/* Comments */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
        <h2 className="font-semibold text-gray-800 dark:text-gray-100 mb-5">Comments ({ticket.comments?.length || 0})</h2>
        <div className="space-y-4 mb-6">
          {ticket.comments?.map(c => (
            <div key={c.id} className="flex gap-3">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-primary-600 text-xs font-semibold">{c.author?.name?.[0]?.toUpperCase()}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm text-gray-800">{c.author?.name}</span>
                  <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                  {c.createdAt !== c.updatedAt && <span className="text-xs text-gray-400 italic">(edited)</span>}
                  {c.author?.id === user?.id && (
                    <>
                      <button onClick={() => setEditingComment({ id: c.id, content: c.content })}
                        className="text-xs text-blue-500 hover:text-blue-700 ml-1">Edit</button>
                      <button onClick={() => handleDeleteComment(c.id)}
                        className="text-xs text-red-500 hover:text-red-700">Delete</button>
                    </>
                  )}
                  {user?.role === 'ADMIN' && c.author?.id !== user?.id && (
                    <button onClick={() => handleDeleteComment(c.id)}
                      className="text-xs text-red-500 hover:text-red-700 ml-1">Delete</button>
                  )}
                </div>
                {editingComment?.id === c.id ? (
                  <div className="flex gap-2 mt-1">
                    <input type="text" value={editingComment.content}
                      onChange={e => setEditingComment({ ...editingComment, content: e.target.value })}
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 outline-none" />
                    <button onClick={() => handleEditComment(c.id)}
                      className="px-3 py-1.5 bg-primary-600 text-white rounded-lg text-xs font-medium hover:bg-primary-700">Save</button>
                    <button onClick={() => setEditingComment(null)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs hover:bg-gray-50">Cancel</button>
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">{c.content}</p>
                )}
              </div>
            </div>
          ))}
          {(!ticket.comments || ticket.comments.length === 0) && (
            <p className="text-gray-400 text-sm text-center py-4">No comments yet. Be the first to comment.</p>
          )}
        </div>

        {/* Add comment */}
        <form onSubmit={handleAddComment} className="flex gap-3">
          <input type="text" value={comment} onChange={(e) => setComment(e.target.value)}
            placeholder="Write a comment..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 outline-none" />
          <button type="submit" disabled={!comment.trim()}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 disabled:opacity-50 font-medium">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
