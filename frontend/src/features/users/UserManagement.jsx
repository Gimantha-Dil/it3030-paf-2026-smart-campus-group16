import { useState, useEffect, useCallback } from 'react';
import { getUsers, updateUserRole, deleteUser, getPendingStaff, approveStaff, rejectStaff } from '../../api/userApi';
import { registerUser } from '../../api/authApi';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'react-toastify';

const ROLES = ['USER', 'ADMIN', 'TECHNICIAN', 'LECTURER', 'LAB_ASSISTANT'];
const EDIT_ROLES = ['USER', 'ADMIN', 'TECHNICIAN', 'LECTURER', 'LAB_ASSISTANT'];
const ROLE_COLORS = {
  ADMIN: 'bg-red-100 text-red-700',
  TECHNICIAN: 'bg-blue-100 text-blue-700',
  USER: 'bg-gray-100 text-gray-700',
  PENDING_STAFF: 'bg-orange-100 text-orange-700',
  LECTURER: 'bg-purple-100 text-purple-700',
  LAB_ASSISTANT: 'bg-teal-100 text-teal-700',
  STUDENT: 'bg-gray-100 text-gray-600',
};

// Add User Modal
function AddUserModal({ onClose, onAdded }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'USER' });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleNameKeyDown = (e) => {
    const allowed = /^[a-zA-Z\s'\-]$/;
    const ctrl = e.ctrlKey || e.metaKey;
    const nav = ['Backspace','Delete','ArrowLeft','ArrowRight','Tab','Home','End'].includes(e.key);
    if (!ctrl && !nav && !allowed.test(e.key)) e.preventDefault();
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = 'Name must be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Valid email required';
    if (form.password.length < 8) errs.password = 'Min 8 characters';
    if (!/(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/.test(form.password)) errs.password = 'Need uppercase, lowercase and number';
    return errs;
  };

  const handleSubmit = async () => {
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setLoading(true);
    try {
      const { data } = await registerUser(
        form.email.trim().toLowerCase(),
        form.name.trim(),
        form.password
      );
      if (form.role !== 'USER') {
        await updateUserRole(data.user.id, form.role);
      }
      toast.success(`User "${form.name}" created successfully!`);
      onAdded();
      onClose();
    } catch {
      toast.error('Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Add New User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
            <input type="text" value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              onKeyDown={handleNameKeyDown}
              placeholder="John Doe"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 ${errors.name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            <p className="text-gray-400 text-xs mt-1">Letters and spaces only</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
            <input type="email" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              placeholder="user@sliit.lk"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
            <input type="password" value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              placeholder="Min 8 chars, uppercase, number"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400 ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`} />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
            <select value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary-400">
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium text-sm transition-colors">
            {loading ? 'Creating...' : 'Create User'}
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// Edit User Modal
function EditUserModal({ user, onClose, onUpdated, currentUser }) {
  const [role, setRole] = useState(user.role);
  const [loading, setLoading] = useState(false);

  const isSelf = user.id === currentUser?.id;
  const isSuperAdmin = currentUser?.email === 'gimantha333@gmail.com';
  const targetIsAdmin = user.role === 'ADMIN';
  const canEdit = isSuperAdmin || !targetIsAdmin;

  const handleSave = async () => {
    if (role === user.role) { onClose(); return; }
    if (isSelf) { toast.error("You cannot change your own role"); return; }
    if (!canEdit) { toast.error("Only the Super Admin can modify other admins"); return; }
    setLoading(true);
    try {
      await updateUserRole(user.id, role);
      toast.success(`Role updated to ${role}`);
      onUpdated();
      onClose();
    } catch {
      toast.error('Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100">Edit User</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold">×</button>
        </div>

        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg mb-5">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-sm">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800 text-sm">{user.name}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          {isSelf && (
            <p className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-2">
              You cannot change your own role
            </p>
          )}
          {!isSelf && !canEdit && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-2">
              Only the Super Admin can modify other admin accounts
            </p>
          )}
          <div className="flex flex-wrap gap-2">
            {EDIT_ROLES.map(r => (
              <button key={r} onClick={() => !isSelf && canEdit && setRole(r)}
                disabled={isSelf || !canEdit}
                className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors
                  ${(isSelf || !canEdit) ? 'opacity-40 cursor-not-allowed border-gray-200 text-gray-400' :
                    role === r ? 'bg-primary-600 text-white border-primary-600' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleSave} disabled={loading}
            className="flex-1 bg-primary-600 text-white py-2.5 rounded-lg hover:bg-primary-700 disabled:opacity-50 font-medium text-sm transition-colors">
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [userTypeFilter, setUserTypeFilter] = useState('');
  const [staffRoleFilter, setStaffRoleFilter] = useState('');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [activeTab, setActiveTab] = useState('users');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: 10 };
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;
      if (userTypeFilter) params.userType = userTypeFilter;
      if (staffRoleFilter === 'ACADEMIC') params.academicStaff = true;
      const { data } = await getUsers(params);
      setUsers(data.content || []);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements || data.content?.length || 0);
    } catch {
      toast.error('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search, userTypeFilter, staffRoleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const fetchPendingStaff = useCallback(async () => {
    setPendingLoading(true);
    try {
      const { data } = await getPendingStaff({ page: 0, size: 50 });
      setPendingUsers(data.content || []);
      setPendingCount(data.totalElements || data.content.length);
    } catch { toast.error('Failed to load pending staff'); setPendingUsers([]); }
    finally { setPendingLoading(false); }
  }, []);

  useEffect(() => { fetchPendingStaff(); }, [fetchPendingStaff]);

  const handleApproveStaff = async (userId, userName, requestedRole) => {
    if (!window.confirm(`Approve "${userName}" as ${requestedRole || 'Staff'}?`)) return;
    try {
      await approveStaff(userId);
      toast.success(`${userName} approved as ${requestedRole || 'Staff'}!`);
      fetchPendingStaff(); fetchUsers();
    } catch { toast.error('Failed to approve'); }
  };

  const handleRejectStaff = async (userId, userName) => {
    if (!window.confirm(`Reject "${userName}"? They will become a regular User.`)) return;
    try {
      await rejectStaff(userId);
      toast.success(`${userName}'s request rejected.`);
      fetchPendingStaff(); fetchUsers();
    } catch { toast.error('Failed to reject'); }
  };

  const handleSearch = (e) => { e.preventDefault(); setPage(0); };

  const handleDelete = async (userId, userName) => {
    if (userId === currentUser?.id) { toast.error("You can't delete your own account"); return; }
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    try {
      await deleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete user');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">User Management</h1>
          <p className="text-gray-500 mt-1">
            {!loading && `${totalElements} user${totalElements !== 1 ? 's' : ''} total`}
          </p>
        </div>
        {activeTab === 'users' && (
          <button onClick={() => setShowAddModal(true)}
            className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 text-sm font-medium flex items-center gap-2">
            + Add User
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5 border-b border-gray-200">
        <button onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === 'users' ? 'border-primary-600 text-primary-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          All Users
        </button>
        <button onClick={() => setActiveTab('pending')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'pending' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
          Pending Staff Approvals
          {pendingCount > 0 && (
            <span className="bg-orange-500 text-white text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">{pendingCount}</span>
          )}
        </button>
      </div>

      {/* Pending Staff Tab */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {pendingLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
          ) : (pendingUsers || []).length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-gray-500 font-medium">No pending approvals</p>
              <p className="text-gray-400 text-sm mt-1">All staff requests have been reviewed</p>
            </div>
          ) : (
            <>
              <div className="bg-orange-50 border-b border-orange-100 px-6 py-3">
                <p className="text-sm text-orange-700 font-medium">
                  {(pendingUsers||[]).length} user{(pendingUsers||[]).length !== 1 ? 's' : ''} waiting for staff role approval
                </p>
              </div>
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Requested Role</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(pendingUsers || []).map(u => (
                    <tr key={u.id} className="hover:bg-orange-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-semibold text-sm">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <p className="font-medium text-gray-800 text-sm">{u.name}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          u.requestedRole === 'TECHNICIAN' ? 'bg-orange-100 text-orange-700' :
                          u.requestedRole === 'LECTURER' ? 'bg-purple-100 text-purple-700' :
                          'bg-teal-100 text-teal-700'}`}>
                          {u.requestedRole}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleApproveStaff(u.id, u.name, u.requestedRole)}
                            className="px-3 py-1.5 bg-green-600 text-white text-xs rounded-lg hover:bg-green-700 font-medium transition-colors">
                            Approve
                          </button>
                          <button onClick={() => handleRejectStaff(u.id, u.name)}
                            className="px-3 py-1.5 bg-red-100 text-red-600 text-xs rounded-lg hover:bg-red-200 font-medium transition-colors">
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>
      )}

      {/* All Users Tab */}
      {activeTab === 'users' && (
        <div>
          {/* Search & Filter */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
            <form onSubmit={handleSearch} className="flex gap-3 flex-wrap">
              <input type="text" placeholder="Search by name or email..." value={search}
                onChange={e => setSearch(e.target.value)}
                className="flex-1 min-w-48 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 outline-none" />
              <select value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(0); }}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-400 outline-none">
                <option value="">All Roles</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700 font-medium">
                Search
              </button>
              {(search || roleFilter || userTypeFilter || staffRoleFilter) && (
                <button type="button"
                  onClick={() => { setSearch(''); setRoleFilter(''); setUserTypeFilter(''); setStaffRoleFilter(''); setPage(0); }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 text-gray-600">
                  Clear
                </button>
              )}
            </form>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : (users || []).length === 0 ? (
              <div className="text-center py-16 text-gray-500">No users found</div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {(users || []).map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-semibold text-sm">
                            {user.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 text-sm">{user.name}</p>
                            {user.id === currentUser?.id && (
                              <span className="text-xs text-primary-500 font-medium">You</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button onClick={() => setEditUser(user)}
                            className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium">
                            Edit
                          </button>
                          <span className="text-gray-300">|</span>
                          {(() => {
                            const isSuperAdmin = currentUser?.email === 'gimantha333@gmail.com';
                            const targetIsAdmin = user.role === 'ADMIN';
                            const canDelete = user.id !== currentUser?.id && (isSuperAdmin || !targetIsAdmin);
                            return (
                              <button
                                onClick={() => canDelete && handleDelete(user.id, user.name)}
                                disabled={!canDelete}
                                className="text-xs px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-30 disabled:cursor-not-allowed">
                                Delete
                              </button>
                            );
                          })()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200">
                <button onClick={() => setPage(p => p - 1)} disabled={page === 0}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                  Previous
                </button>
                <span className="text-sm text-gray-600">Page {page + 1} of {totalPages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages - 1}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg disabled:opacity-40 hover:bg-gray-50">
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddUserModal onClose={() => setShowAddModal(false)} onAdded={fetchUsers} />
      )}
      {editUser && (
        <EditUserModal
          user={editUser}
          onClose={() => setEditUser(null)}
          onUpdated={fetchUsers}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}