import { createBooking, checkConflicts } from '../../api/bookingApi';
import { getResources } from '../../api/resourceApi';
import { toast } from 'react-toastify';
import TimePickerModal from '../../components/common/TimePickerModal';//BookingForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';


// Block non-numeric keys
function handleNumberKeyDown(e) {
  const nav = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'].includes(e.key);
  if (!nav && !/^\d$/.test(e.key)) e.preventDefault();
}

function getMaxDateTime() {
  const d = new Date(); d.setDate(d.getDate() + 90);
  return d.toISOString().slice(0, 16);
}

// Convert "HH:MM AM/PM" + date "YYYY-MM-DD" → "YYYY-MM-DDTHH:MM"
function buildDateTimeLocal(dateStr, timeAmPm) {
  if (!dateStr || !timeAmPm) return '';
  const [timePart, ap] = timeAmPm.split(' ');
  let [h, m] = timePart.split(':').map(Number);
  if (ap === 'PM' && h !== 12) h += 12;
  if (ap === 'AM' && h === 12) h = 0;
  return `${dateStr}T${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
}

// Convert "YYYY-MM-DDTHH:MM" → "HH:MM AM/PM"
function toAmPmTime(dtLocal) {
  if (!dtLocal) return '';
  const [, timePart] = dtLocal.split('T');
  if (!timePart) return '';
  const [h, m] = timePart.split(':').map(Number);
  const ap = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${String(h12).padStart(2,'0')}:${String(m).padStart(2,'0')} ${ap}`;
}

// Today's date string YYYY-MM-DD
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function BookingForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedResourceId = searchParams.get('resourceId') || '';

  const [resources, setResources] = useState([]);
  const [form, setForm] = useState({
    resourceId: preselectedResourceId,
    startDate: '', startTime: '',   // startDate: YYYY-MM-DD, startTime: HH:MM AM/PM
    endDate: '',   endTime: '',
    purpose: '', attendees: ''
  });
  const [loading, setLoading] = useState(false);
  const [conflict, setConflict] = useState(false);
  const [touched, setTouched] = useState({});
  const [selectedResource, setSelectedResource] = useState(null);

  // Clock modal state
  const [clockOpen, setClockOpen] = useState(null); // 'start' | 'end' | null

  // Derived datetime-local strings for validation & API
  const startDT = buildDateTimeLocal(form.startDate, form.startTime);
  const endDT   = buildDateTimeLocal(form.endDate,   form.endTime);

  useEffect(() => {
    getResources({ size: 100, status: 'ACTIVE' }).then(({ data }) => {
      const list = data.content || [];
      setResources(list);
      if (preselectedResourceId) {
        const r = list.find(x => String(x.id) === String(preselectedResourceId));
        if (r) setSelectedResource(r);
      }
    });
  }, [preselectedResourceId]);

  const errors = {
    resourceId: !form.resourceId ? 'Please select a resource' : '',
    startTime: !startDT ? 'Start date & time is required'
      : new Date(startDT) <= new Date() ? 'Start time must be in the future' : '',
    endTime: !endDT ? 'End date & time is required'
      : startDT && new Date(endDT) <= new Date(startDT) ? 'End time must be after start time'
      : startDT && (new Date(endDT) - new Date(startDT)) > 12 * 3600000 ? 'Booking cannot exceed 12 hours'
      : '',
    purpose: !form.purpose ? 'Purpose is required'
      : form.purpose.length < 10 ? 'Purpose must be at least 10 characters'
      : form.purpose.length > 500 ? 'Purpose too long (max 500)' : '',
    attendees: form.attendees && selectedResource?.capacity && parseInt(form.attendees) > selectedResource.capacity
      ? `Exceeds capacity (max ${selectedResource.capacity})` : '',
  };
  const hasErrors = Object.values(errors).some(Boolean);
  const showError = (f) => touched[f] && errors[f];
  const handleBlur = (f) => setTouched(t => ({ ...t, [f]: true }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (name === 'resourceId') {
      const r = resources.find(x => String(x.id) === value);
      setSelectedResource(r || null);
      setConflict(false);
    }
  };

  // Clock confirm handlers
  const handleStartTimeConfirm = (ampmTime) => {
    setForm(prev => ({ ...prev, startTime: ampmTime }));
    setClockOpen(null);
    setConflict(false);
    setTouched(t => ({ ...t, startTime: true }));
  };
  const handleEndTimeConfirm = (ampmTime) => {
    setForm(prev => ({ ...prev, endTime: ampmTime }));
    setClockOpen(null);
    setConflict(false);
    setTouched(t => ({ ...t, endTime: true }));
  };

  // Conflict check
  useEffect(() => {
    if (!form.resourceId || !startDT || !endDT) return;
    if (new Date(endDT) <= new Date(startDT)) return;
    const t = setTimeout(async () => {
      try {
        const { data } = await checkConflicts(form.resourceId, startDT, endDT);
        setConflict(data.hasConflict);
        if (data.hasConflict) toast.warning(' Time slot already booked!');
      } catch { /* ignore */ }
    }, 500);
    return () => clearTimeout(t);
  }, [form.resourceId, startDT, endDT]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ resourceId: true, startTime: true, endTime: true, purpose: true, attendees: true });
    if (hasErrors || conflict) { toast.error('Please fix the errors before submitting'); return; }
    setLoading(true);
    try {
      await createBooking({
        resourceId: parseInt(form.resourceId),
        startTime: startDT,
        endTime: endDT,
        purpose: form.purpose,
        attendees: form.attendees ? parseInt(form.attendees) : null,
      });
      toast.success(' Booking request submitted!');
      navigate('/bookings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create booking');
    } finally { setLoading(false); }
  };

  const purposeLen = form.purpose.length;
  const isStartToday = form.startDate ? form.startDate === todayStr() : false;
  const isEndToday   = form.endDate   ? form.endDate   === todayStr() : false;
  const durationMins = startDT && endDT && new Date(endDT) > new Date(startDT)
    ? Math.round((new Date(endDT) - new Date(startDT)) / 60000) : null;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Book a Resource</h1>
      <form onSubmit={handleSubmit} noValidate className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border p-6 space-y-5">

        {/* Resource */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource *</label>
          <select name="resourceId" value={form.resourceId} onChange={handleChange} onBlur={() => handleBlur('resourceId')}
            className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 ${showError('resourceId') ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}>
            <option value="">Select a resource</option>
            {resources.map(r => (
              <option key={r.id} value={r.id}>{r.name} ({r.type?.replace(/_/g, ' ')}) — {r.location}{r.capacity ? ` · Cap: ${r.capacity}` : ''}</option>
            ))}
          </select>
          {showError('resourceId') && <p className="text-red-500 text-xs mt-1"> {errors.resourceId}</p>}
          {selectedResource && (
            <div className="mt-2 p-3 bg-blue-50 rounded-lg text-xs text-blue-700 space-y-0.5">
              {selectedResource.capacity && <p> Capacity: {selectedResource.capacity}</p>}
              {selectedResource.availabilityStart && <p> Available: {selectedResource.availabilityStart} – {selectedResource.availabilityEnd}</p>}
              {selectedResource.description && <p> {selectedResource.description}</p>}
            </div>
          )}
        </div>

        {/* Start Date + Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Date & Time *</label>
          <div className="flex gap-2">
            <input
              type="date" name="startDate" value={form.startDate}
              min={todayStr()} max={getMaxDateTime().slice(0,10)}
              onChange={handleChange} onBlur={() => handleBlur('startTime')}
              className={`flex-1 px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 ${showError('startTime') ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            />
            <button
              type="button"
              onClick={() => form.startDate ? setClockOpen('start') : toast.warning('Please select a start date first')}
              className={`px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 min-w-[130px] justify-center
                ${form.startTime ? 'bg-primary-50 border-primary-300 text-primary-600' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
            >
               {form.startTime || 'Pick time'}
            </button>
          </div>
          {showError('startTime') && <p className="text-red-500 text-xs mt-1"> {errors.startTime}</p>}
        </div>

        {/* End Date + Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Date & Time *</label>
          <div className="flex gap-2">
            <input
              type="date" name="endDate" value={form.endDate}
              min={form.startDate || todayStr()} max={getMaxDateTime().slice(0,10)}
              onChange={handleChange} onBlur={() => handleBlur('endTime')}
              className={`flex-1 px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 ${showError('endTime') ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
            />
            <button
              type="button"
              onClick={() => form.endDate ? setClockOpen('end') : toast.warning('Please select an end date first')}
              className={`px-4 py-2.5 border rounded-lg text-sm font-medium transition-colors flex items-center gap-2 min-w-[130px] justify-center
                ${form.endTime ? 'bg-primary-50 border-primary-300 text-primary-600' : 'border-gray-300 text-gray-500 hover:bg-gray-50'}`}
            >
               {form.endTime || 'Pick time'}
            </button>
          </div>
          {showError('endTime') && <p className="text-red-500 text-xs mt-1"> {errors.endTime}</p>}
        </div>

        {/* Duration */}
        {durationMins && (
          <p className="text-xs text-gray-500 -mt-2">
            ⏱ Duration: {durationMins >= 60 ? `${Math.floor(durationMins/60)}h ${durationMins%60}m` : `${durationMins} minutes`}
          </p>
        )}

        {/* Conflict warning */}
        {conflict && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <span></span>
            <span>This resource is already booked during the selected time. Please choose a different slot.</span>
          </div>
        )}

        {/* Available confirmation */}
        {!conflict && form.resourceId && startDT && endDT && !errors.startTime && !errors.endTime && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
            <span></span><span>Time slot is available!</span>
          </div>
        )}

        {/* Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose *</label>
          <textarea name="purpose" value={form.purpose} onChange={handleChange} onBlur={() => handleBlur('purpose')}
            rows={3} placeholder="Describe the purpose of this booking (min. 10 characters)"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 resize-none ${showError('purpose') ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
          <div className="flex justify-between items-center mt-1">
            {showError('purpose') ? <p className="text-red-500 text-xs">⚠ {errors.purpose}</p> : <span />}
            <span className={`text-xs ${purposeLen > 450 ? 'text-orange-500' : 'text-gray-400'}`}>{purposeLen}/500</span>
          </div>
        </div>

        {/* Attendees */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Number of Attendees {selectedResource?.capacity && <span className="text-gray-400 font-normal">(max {selectedResource.capacity})</span>}
          </label>
          <input type="text" name="attendees" value={form.attendees} onChange={handleChange}
            onBlur={() => handleBlur('attendees')} onKeyDown={handleNumberKeyDown} inputMode="numeric"
            min="1" max={selectedResource?.capacity || 1000} placeholder="e.g. 20"
            className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 ${showError('attendees') ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
          {showError('attendees') && <p className="text-red-500 text-xs mt-1"> {errors.attendees}</p>}
        </div>

        <div className="flex gap-3 pt-2 border-t">
          <button type="submit" disabled={loading || conflict}
            className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium text-sm transition-colors">
            {loading ? 'Submitting...' : 'Submit Booking Request'}
          </button>
          <button type="button" onClick={() => navigate('/bookings')}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </form>

      {/* Clock Modals */}
      {clockOpen === 'start' && (
        <TimePickerModal
          value={form.startTime || ''}
          isToday={isStartToday}
          onConfirm={handleStartTimeConfirm}
          onCancel={() => setClockOpen(null)}
        />
      )}
      {clockOpen === 'end' && (
        <TimePickerModal
          value={form.endTime || ''}
          isToday={isEndToday}
          onConfirm={handleEndTimeConfirm}
          onCancel={() => setClockOpen(null)}
        />
      )}
    </div>
  );
}