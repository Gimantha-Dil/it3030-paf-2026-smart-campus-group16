import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createResource, updateResource, getResourceById } from '../../api/resourceApi';
import { RESOURCE_TYPES } from '../../utils/constants';
import { toast } from 'react-toastify';
import TimePickerModal from '../../components/common/TimePickerModal';

const DEFAULT_FORM = {
  name: '', type: 'LECTURE_HALL', capacity: '', location: '',
  description: '', status: 'ACTIVE',
  availabilityStart: '08:00', availabilityEnd: '20:00',
};

function handleNameKeyDown(e) {
  const allowed = /^[a-zA-Z0-9\s'\-.,()]$/;
  const ctrl = e.ctrlKey || e.metaKey;
  const nav = ['Backspace','Delete','ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Tab','Home','End'].includes(e.key);
  if (!ctrl && !nav && !allowed.test(e.key)) e.preventDefault();
}

function handleNumberKeyDown(e) {
  const nav = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'].includes(e.key);
  if (!nav && !/^\d$/.test(e.key)) e.preventDefault();
}

function to12h(time24) {
  if (!time24) return '';
  const [h, m] = time24.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ap}`;
}

function to24h(time12) {
  if (!time12) return '';
  const [timePart, ap] = time12.split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

export default function ResourceForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(isEdit);
  const [touched, setTouched] = useState({});
  const [clockOpen, setClockOpen] = useState(null);

  useEffect(() => {
    if (!isEdit) return;
    getResourceById(id)
      .then(({ data }) => setForm({
        name: data.name || '',
        type: data.type || 'LECTURE_HALL',
        capacity: data.capacity || '',
        location: data.location || '',
        description: data.description || '',
        status: data.status || 'ACTIVE',
        availabilityStart: data.availabilityStart || '08:00',
        availabilityEnd: data.availabilityEnd || '20:00',
      }))
      .catch(() => toast.error('Failed to load resource'))
      .finally(() => setLoadingData(false));
  }, [id, isEdit]);

  const errors = {
    name: !form.name.trim() ? 'Name is required'
      : form.name.trim().length < 2 ? 'Min 2 characters'
      : form.name.trim().length > 100 ? 'Max 100 characters' : '',
    location: !form.location.trim() ? 'Location is required'
      : form.location.trim().length < 2 ? 'Min 2 characters' : '',
    capacity: form.capacity !== '' && form.capacity !== null
      ? (isNaN(parseInt(form.capacity)) || parseInt(form.capacity) < 1 || parseInt(form.capacity) > 10000
        ? 'Must be between 1 and 10,000' : '') : '',
    description: form.description.length > 2000 ? 'Max 2000 characters' : '',
    availabilityStart: !form.availabilityStart ? 'Start time is required' : '',
    availabilityEnd: !form.availabilityEnd ? 'End time is required'
      : form.availabilityStart && form.availabilityEnd <= form.availabilityStart
        ? 'End time must be after start time'
      : form.availabilityStart && form.availabilityEnd && (() => {
          const [sh, sm] = form.availabilityStart.split(':').map(Number);
          const [eh, em] = form.availabilityEnd.split(':').map(Number);
          return (eh * 60 + em) - (sh * 60 + sm) < 60;
        })()
        ? 'Minimum 1 hour availability required'
      : '',
  };

  const hasErrors = Object.values(errors).some(Boolean);
  const showError = (f) => touched[f] && errors[f];
  const handleBlur = (f) => setTouched(t => ({ ...t, [f]: true }));
  const handleChange = (e) => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleStartConfirm = (time12) => {
    setForm(prev => ({ ...prev, availabilityStart: to24h(time12) }));
    handleBlur('availabilityStart');
    setClockOpen(null);
  };

  const handleEndConfirm = (time12) => {
    setForm(prev => ({ ...prev, availabilityEnd: to24h(time12) }));
    handleBlur('availabilityEnd');
    setClockOpen(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ name: true, location: true, capacity: true, description: true, availabilityStart: true, availabilityEnd: true });
    if (hasErrors) { toast.error('Please fix the errors before submitting'); return; }
    setLoading(true);
    try {
      const payload = { ...form, capacity: form.capacity ? parseInt(form.capacity) : null };
      isEdit ? await updateResource(id, payload) : await createResource(payload);
      toast.success(`Resource ${isEdit ? 'updated' : 'created'} successfully!`);
      navigate('/resources');
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to ${isEdit ? 'update' : 'create'} resource`);
    } finally { setLoading(false); }
  };

  if (loadingData) return (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{isEdit ? 'Edit Resource' : 'Add New Resource'}</h1>
      <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6 space-y-5">

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource Name *</label>
          <input type="text" name="name" value={form.name}
            onChange={handleChange} onBlur={() => handleBlur('name')}
            onKeyDown={handleNameKeyDown}
            placeholder="e.g. Main Lecture Hall A"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 ${showError('name') ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
          {showError('name')
            ? <p className="text-red-500 text-xs mt-1"> {errors.name}</p>
            : <p className="text-gray-400 text-xs mt-1">Letters, numbers, spaces and basic punctuation only</p>}
        </div>

        {/* Type + Capacity */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type *</label>
            <select name="type" value={form.type} onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400">
              {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Capacity</label>
            <input type="text" name="capacity" value={form.capacity}
              onChange={handleChange} onBlur={() => handleBlur('capacity')}
              onKeyDown={handleNumberKeyDown} inputMode="numeric"
              placeholder="e.g. 50"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 ${showError('capacity') ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {showError('capacity') && <p className="text-red-500 text-xs mt-1"> {errors.capacity}</p>}
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location *</label>
          <input type="text" name="location" value={form.location}
            onChange={handleChange} onBlur={() => handleBlur('location')}
            placeholder="e.g. Block A, Floor 3"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 ${showError('location') ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
          {showError('location') && <p className="text-red-500 text-xs mt-1"> {errors.location}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea name="description" value={form.description} onChange={handleChange} onBlur={() => handleBlur('description')}
            rows={3} placeholder="Optional: facilities, equipment, notes..."
            className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 resize-none ${showError('description') ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
          <div className="flex justify-between mt-1">
            {showError('description') ? <p className="text-red-500 text-xs"> {errors.description}</p> : <span />}
            <span className={`text-xs ${form.description.length > 1800 ? 'text-orange-500' : 'text-gray-400'}`}>
              {form.description.length}/2000
            </span>
          </div>
        </div>

        {/* Status + Availability Times */}
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            <select name="status" value={form.status} onChange={handleChange}
              className="w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400">
              <option value="ACTIVE">ACTIVE</option>
              <option value="OUT_OF_SERVICE">OUT OF SERVICE</option>
            </select>
          </div>

          {/* Available From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Available From *</label>
            <button type="button" onClick={() => setClockOpen('start')}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm text-left flex items-center justify-between hover:bg-gray-50 focus:ring-2 focus:ring-primary-400 outline-none transition-colors ${showError('availabilityStart') ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
              <span className="flex items-center gap-2">
                <span></span>
                <span className="font-medium text-gray-700">{to12h(form.availabilityStart)}</span>
              </span>
              <span className="text-gray-400 text-xs"></span>
            </button>
            {showError('availabilityStart') && <p className="text-red-500 text-xs mt-1">⚠ {errors.availabilityStart}</p>}
          </div>

          {/* Available Until */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Available Until *</label>
            <button type="button" onClick={() => setClockOpen('end')}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm text-left flex items-center justify-between hover:bg-gray-50 focus:ring-2 focus:ring-primary-400 outline-none transition-colors ${showError('availabilityEnd') ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
              <span className="flex items-center gap-2">
                <span></span>
                <span className="font-medium text-gray-700">{to12h(form.availabilityEnd)}</span>
              </span>
              <span className="text-gray-400 text-xs"></span>
            </button>
            {showError('availabilityEnd') && <p className="text-red-500 text-xs mt-1">⚠ {errors.availabilityEnd}</p>}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2 border-t">
          <button type="submit" disabled={loading}
            className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium text-sm transition-colors">
            {loading ? (isEdit ? 'Saving...' : 'Creating...') : (isEdit ? 'Save Changes' : 'Create Resource')}
          </button>
          <button type="button" onClick={() => navigate('/resources')}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>

      {/* Clock Modals */}
      {clockOpen === 'start' && (
        <TimePickerModal
          value={to12h(form.availabilityStart)}
          isToday={false}
          onConfirm={handleStartConfirm}
          onCancel={() => setClockOpen(null)}
        />
      )}
      {clockOpen === 'end' && (
        <TimePickerModal
          value={to12h(form.availabilityEnd)}
          isToday={false}
          onConfirm={handleEndConfirm}
          onCancel={() => setClockOpen(null)}
        />
      )}
    </div>
  );
}