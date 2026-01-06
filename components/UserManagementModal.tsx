
import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Shield, User, AlertCircle, Save } from 'lucide-react';
import { UserAccount } from '../types';
import { getUsers, saveUser, deleteUser } from '../services/authService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
}

const UserManagementModal: React.FC<Props> = ({ isOpen, onClose, currentUser }) => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'user'>('user');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      refreshList();
    }
  }, [isOpen]);

  const refreshList = () => {
    const currentUsers = getUsers();
    setUsers(currentUsers);
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (!newUsername.trim() || !newPassword.trim()) {
      setError('Username and password are required.');
      return;
    }

    const result = saveUser({
      username: newUsername.trim(),
      password: newPassword.trim(),
      role: newRole,
      createdAt: Date.now()
    });

    if (result.success) {
      setSuccessMsg(`User ${newUsername} added successfully.`);
      setNewUsername('');
      setNewPassword('');
      setNewRole('user');
      // Force refresh logic
      setTimeout(() => refreshList(), 50);
    } else {
      setError(result.message);
    }
  };

  const handleDelete = (username: string) => {
    if (username === currentUser.username) {
      setError("You cannot delete your own account.");
      return;
    }
    if (!window.confirm(`Are you sure you want to delete user "${username}"?`)) return;

    const result = deleteUser(username);
    if (result.success) {
      refreshList();
      setSuccessMsg(`User ${username} deleted.`);
    } else {
      setError(result.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-700 bg-slate-800 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-900/50 p-2 rounded-lg border border-indigo-500/30">
               <Shield className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Master Control</h2>
              <p className="text-xs text-slate-400">User Management & Access Control</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
           
           {/* Add User Form */}
           <div className="bg-slate-950 p-5 rounded-xl border border-slate-800">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <UserPlus className="w-4 h-4" /> Add New User
              </h3>
              
              <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                 <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Username</label>
                    <input 
                      type="text" 
                      value={newUsername}
                      onChange={e => setNewUsername(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                      placeholder="e.g. doctor1"
                    />
                 </div>
                 <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Password</label>
                    <input 
                      type="text" 
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none font-mono"
                      placeholder="Password"
                    />
                 </div>
                 <div className="md:col-span-1">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Role</label>
                    <select 
                       value={newRole}
                       onChange={e => setNewRole(e.target.value as any)}
                       className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none"
                    >
                       <option value="user">User</option>
                       <option value="admin">Admin</option>
                    </select>
                 </div>
                 <div className="md:col-span-1">
                    <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm">
                       <Save className="w-4 h-4" /> Add
                    </button>
                 </div>
              </form>

              {error && (
                 <div className="mt-3 text-xs text-red-400 flex items-center gap-1 bg-red-900/10 p-2 rounded">
                    <AlertCircle className="w-3 h-3" /> {error}
                 </div>
              )}
              {successMsg && (
                 <div className="mt-3 text-xs text-emerald-400 flex items-center gap-1 bg-emerald-900/10 p-2 rounded">
                    <AlertCircle className="w-3 h-3" /> {successMsg}
                 </div>
              )}
           </div>

           {/* User List */}
           <div>
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3">Registered Users ({users.length})</h3>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                 <table className="w-full text-sm text-left">
                    <thead className="bg-slate-900 text-slate-500 font-medium">
                       <tr>
                          <th className="px-4 py-3">Username</th>
                          <th className="px-4 py-3">Role</th>
                          <th className="px-4 py-3">Password (Visible)</th>
                          <th className="px-4 py-3 text-right">Action</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/50">
                       {users.map(u => (
                          <tr key={u.username} className="hover:bg-slate-800/80 transition-colors">
                             <td className="px-4 py-3 font-semibold text-white flex items-center gap-2">
                                <User className={`w-4 h-4 ${u.role === 'admin' ? 'text-amber-400' : 'text-slate-400'}`} />
                                {u.username} {u.username === currentUser.username && <span className="text-[10px] bg-emerald-900/50 text-emerald-400 px-1.5 py-0.5 rounded ml-2">YOU</span>}
                             </td>
                             <td className="px-4 py-3">
                                <span className={`text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wide ${u.role === 'admin' ? 'bg-amber-900/30 text-amber-500 border border-amber-900/50' : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                                   {u.role}
                                </span>
                             </td>
                             <td className="px-4 py-3 font-mono text-slate-400">{u.password}</td>
                             <td className="px-4 py-3 text-right">
                                {u.username !== 'admin' && u.username !== currentUser.username && (
                                   <button 
                                      onClick={() => handleDelete(u.username)}
                                      className="text-slate-500 hover:text-red-400 transition-colors p-1"
                                      title="Delete User"
                                   >
                                      <Trash2 className="w-4 h-4" />
                                   </button>
                                )}
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default UserManagementModal;
