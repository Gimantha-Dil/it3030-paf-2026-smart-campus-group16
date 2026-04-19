import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getResources, deleteResource, updateResourceStatus } from '../../api/resourceApi';
import StatusBadge from '../../components/common/StatusBadge';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { RESOURCE_TYPES } from '../../utils/constants';
import { toast } from 'react-toastify';

export default function ResourceList() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState('');
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [minCapacity, setMinCapacity] = useState('');

  const fetchResources = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 12 };
      if (typeFilter) params.type = typeFilter;
      if (search) params.search = search;
      if (location) params.location = location;
      if (minCapacity) params.minCapacity = minCapacity;
      const { data } = await getResources(params);
      setResources(data.content || []);
      setTotalPages(data.totalPages || 0);
    } catch { toast.error('Failed to load resources'); }
    finally { setLoading(false); }
  }, [page, typeFilter, search, location, minCapacity]);

  useEffect(() => { fetchResources(); }, [fetchResources]);

  // Real-time debounced search
  const debounceRef = useRef(null);
  const handleSearchInput = (val) => {
    setSearch(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => { setPage(0); }, 400);
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(0); };

  const handleToggleStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'OUT_OF_SERVICE' : 'ACTIVE';
    try {
      await updateResourceStatus(id, newStatus);
      toast.success('Status updated');
      fetchResources();
    } catch { toast.error('Failed to update status'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    try {
      await deleteResource(id);
      toast.success('Resource deleted');
      fetchResources();
    } catch { toast.error('Failed to delete'); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Facilities & Assets</h1>
        {user?.role === 'ADMIN' && (
          <Link to="/admin/resources/new"
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm font-medium">
            + Add Resource
          </Link>
        )}
      </div>

      {/* Filters */}
      <form onSubmit={handleSearch} className="bg-white rounded-xl shadow-sm border p-4 mb-6">
        <div className="flex flex-wrap gap-3">
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(0); }}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm min-w-36">
            <option value="">All Types</option>
            {RESOURCE_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <input type="text" placeholder="Search name..." value={search}
            onChange={(e) => handleSearchInput(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 min-w-32" />
          <input type="text" placeholder="Filter by location..." value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1 min-w-32" />
          <input type="number" placeholder="Min capacity" value={minCapacity}
            onChange={(e) => setMinCapacity(e.target.value)} min="1"
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm w-32" />
          <button type="submit"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 font-medium">
            Search
          </button>
        </div>
      </form>

      {loading ? <LoadingSpinner /> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map(r => (
            <div key={r.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">{r.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{r.type?.replace(/_/g, ' ')}</p>
                </div>
                <StatusBadge status={r.status} />
              </div>
              <div className="text-sm text-gray-600 space-y-1 mb-4">
                <p> {r.location}</p>
                {r.capacity && <p> Capacity: {r.capacity}</p>}
                {r.availabilityStart && <p> {r.availabilityStart} – {r.availabilityEnd}</p>}
                {r.description && <p className="text-gray-400 text-xs truncate">{r.description}</p>}
              </div>
              <div className="flex gap-2 pt-3 border-t dark:border-gray-600">
                <Link to={`/bookings/new?resourceId=${r.id}`}
                  className="text-xs px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 flex-1 text-center">
                  Book
                </Link>
                <Link to={`/resources/${r.id}/availability`}
                  className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 dark:bg-primary-700 dark:hover:bg-primary-600 text-center whitespace-nowrap">
                  Available time slots
                </Link>
                {user?.role === 'ADMIN' && (<>
                  <Link to={`/admin/resources/${r.id}/edit`}
                    className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600">Edit</Link>
                  <button onClick={() => handleToggleStatus(r.id, r.status)}
                    className="text-xs px-3 py-1.5 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-500">
                    {r.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => handleDelete(r.id)}
                    className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600">Del</button>
                </>)}
              </div>
            </div>
          ))}
        </div>
      )}
      {resources.length === 0 && !loading && (
        <p className="text-center text-gray-500 py-12">No resources found.</p>
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}