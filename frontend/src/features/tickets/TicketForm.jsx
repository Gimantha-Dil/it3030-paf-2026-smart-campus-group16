import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createTicket } from '../../api/ticketApi';
import { getResources } from '../../api/resourceApi';
import { TICKET_CATEGORIES, TICKET_PRIORITIES } from '../../utils/constants';
import { toast } from 'react-toastify';

const MAX_FILES = 3;
const MAX_FILE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];

export default function TicketForm() {
  const navigate = useNavigate();
  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({
    resourceId: '', category: 'OTHER', title: '',
    description: '', priority: 'MEDIUM', contactDetails: ''
  });
  const [files, setFiles] = useState([]);
  const [fileErrors, setFileErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    getResources({ size: 100 }).then(({ data }) => setResources(data.content || []));
  }, []);

  const errors = {
    title: !form.title.trim() ? 'Title is required'
      : form.title.trim().length < 5 ? `Too short (${form.title.trim().length}/5 min)`
      : form.title.trim().length > 150 ? 'Max 150 characters' : '',
    description: !form.description.trim() ? 'Description is required'
      : form.description.trim().length < 20 ? `Too short (${form.description.trim().length}/20 min)`
      : form.description.trim().length > 2000 ? 'Max 2000 characters' : '',
    contactDetails: form.contactDetails && form.contactDetails.trim().length > 200
      ? 'Max 200 characters' : '',
  };

  const hasErrors = Object.values(errors).some(Boolean);
  const showError = (f) => touched[f] && errors[f];
  const handleBlur = (f) => setTouched(t => ({ ...t, [f]: true }));
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files);
    const errs = [];
    const valid = [];
    selected.forEach(f => {
      if (!ALLOWED_TYPES.includes(f.type)) errs.push(`${f.name}: unsupported file type`);
      else if (f.size > MAX_FILE_MB * 1024 * 1024) errs.push(`${f.name}: exceeds ${MAX_FILE_MB}MB limit`);
      else valid.push(f);
    });
    const combined = [...files, ...valid];
    if (combined.length > MAX_FILES) {
      errs.push(`Maximum ${MAX_FILES} files allowed`);
      combined.splice(MAX_FILES);
    }
    setFileErrors(errs);
    setFiles(combined.slice(0, MAX_FILES));
    if (errs.length) toast.warning(errs[0]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ title: true, description: true, contactDetails: true });
    if (hasErrors) { toast.error('Please fix the errors before submitting'); return; }
    setLoading(true);
    try {
      const formData = new FormData();
      if (form.resourceId) formData.append('resourceId', form.resourceId);
      formData.append('category', form.category);
      formData.append('title', form.title.trim());
      formData.append('description', form.description.trim());
      formData.append('priority', form.priority);
      if (form.contactDetails) formData.append('contactDetails', form.contactDetails.trim());
      files.forEach(f => formData.append('files', f));
      await createTicket(formData);
      toast.success(' Ticket submitted successfully!');
      navigate('/tickets');
    } catch (err) {
      toast.error(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
    } finally { setLoading(false); }
  };

  const descLen = form.description.trim().length;
  const titleLen = form.title.trim().length;
  const priorityColors = { LOW: 'text-blue-600', MEDIUM: 'text-yellow-600', HIGH: 'text-orange-600', CRITICAL: 'text-red-600' };
  const priorityBg = { LOW: 'border-blue-300', MEDIUM: 'border-yellow-300', HIGH: 'border-orange-300', CRITICAL: 'border-red-400' };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Report an Issue</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Fields marked with * are required</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 space-y-5">

        {/* Related Resource */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Related Resource <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <select name="resourceId" value={form.resourceId} onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400">
            <option value="">Not resource-specific</option>
            {resources.map(r => <option key={r.id} value={r.id}>{r.name} — {r.location}</option>)}
          </select>
        </div>

        {/* Category + Priority */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
            <select name="category" value={form.category} onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400">
              {TICKET_CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority *</label>
            <select name="priority" value={form.priority} onChange={handleChange}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 font-semibold dark:bg-gray-700 dark:text-gray-100 ${priorityColors[form.priority]} ${priorityBg[form.priority]}`}>
              {TICKET_PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {form.priority === 'CRITICAL' && (
              <p className="text-red-600 text-xs mt-1"> Critical issues are escalated immediately</p>
            )}
            {form.priority === 'HIGH' && (
              <p className="text-orange-500 text-xs mt-1"> High priority — response within 4 hours</p>
            )}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Issue Title *</label>
          <input type="text" name="title" value={form.title} onChange={handleChange} onBlur={() => handleBlur('title')}
            placeholder="Brief summary of the issue (e.g. AC not working in Lab B)"
            maxLength={150}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 ${showError('title') ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'}`} />
          <div className="flex justify-between items-center mt-1">
            {showError('title')
              ? <p className="text-red-500 text-xs"> {errors.title}</p>
              : titleLen >= 5 ? <p className="text-green-600 text-xs"> Good title</p>
              : <span className="text-gray-400 text-xs">Min. 5 characters</span>}
            <span className={`text-xs ${titleLen > 130 ? 'text-orange-500' : 'text-gray-400'}`}>{titleLen}/150</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description *</label>
          <textarea name="description" value={form.description} onChange={handleChange} onBlur={() => handleBlur('description')}
            rows={5} maxLength={2000}
            placeholder="Describe the issue in detail. Include location, when it started, and any relevant details... (min. 20 characters)"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 resize-none dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 ${showError('description') ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'}`} />
          <div className="flex justify-between items-center mt-1">
            {showError('description')
              ? <p className="text-red-500 text-xs"> {errors.description}</p>
              : descLen >= 20 ? <p className="text-green-600 text-xs">✓ Good description</p>
              : <span className="text-gray-400 text-xs">Min. 20 characters</span>}
            <span className={`text-xs ${descLen > 1800 ? 'text-orange-500' : 'text-gray-400'}`}>{descLen}/2000</span>
          </div>
        </div>

        {/* Contact Details */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Contact Details <span className="text-gray-400 font-normal">(optional)</span>
          </label>
          <input type="text" name="contactDetails" value={form.contactDetails} onChange={handleChange} onBlur={() => handleBlur('contactDetails')}
            placeholder="Phone number or alternate email for follow-up"
            maxLength={200}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500 ${showError('contactDetails') ? 'border-red-400 bg-red-50 dark:bg-red-900/20' : 'border-gray-300 dark:border-gray-600'}`} />
          {showError('contactDetails') && <p className="text-red-500 text-xs mt-1"> {errors.contactDetails}</p>}
        </div>

        {/* File Attachments */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Evidence / Attachments
            <span className="text-gray-400 font-normal"> (max {MAX_FILES} files, {MAX_FILE_MB}MB each — images or PDF)</span>
          </label>

          {files.length < MAX_FILES && (
            <label className="flex items-center gap-2 cursor-pointer w-fit">
              <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                </svg>
                Choose files ({files.length}/{MAX_FILES})
              </div>
              <input type="file" multiple accept="image/*,.pdf" onChange={handleFiles} className="hidden" />
            </label>
          )}

          {fileErrors.map((err, i) => <p key={i} className="text-red-500 text-xs mt-1">⚠ {err}</p>)}

          {files.length > 0 && (
            <div className="mt-2 space-y-1">
              {files.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-lg">
                  <span>{f.type.startsWith('image/') ? '' : ''}</span>
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="text-gray-400">{(f.size / 1024).toFixed(0)}KB</span>
                  <button type="button" onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600 ml-1 font-bold">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2 border-t dark:border-gray-700">
          <button type="submit" disabled={loading}
            className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium text-sm transition-colors flex items-center justify-center gap-2">
            {loading ? (
              <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Submitting...</>
            ) : ' Submit Ticket'}
          </button>
          <button type="button" onClick={() => navigate('/tickets')}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors dark:text-gray-300">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
