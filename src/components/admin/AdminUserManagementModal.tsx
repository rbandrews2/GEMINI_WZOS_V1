import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User, UserRole } from '../../types';
import {
  Users,
  Plus,
  ShieldCheck,
  HardHat,
  Key,
  Trash2,
  Edit2,
  X,
  CheckCircle2,
  UserPlus,
  Send,
  Bell,
} from 'lucide-react';

interface AdminUserManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminUserManagementModal: React.FC<AdminUserManagementModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { users, addUser, updateUser, deleteUser, currentUser, setActiveTab } = useApp();

  const [isAddMode, setIsAddMode] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form fields
  const [formName, setFormName] = useState('');
  const [formUsername, setFormUsername] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('member');
  const [formPosition, setFormPosition] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmployeeId, setFormEmployeeId] = useState('');

  if (!isOpen) return null;

  const handleStartAdd = () => {
    setEditingUserId(null);
    setFormName('');
    setFormUsername('');
    setFormPassword('worker123');
    setFormRole('member');
    setFormPosition('Traffic Control Field Tech');
    setFormPhone('(555) 019-0000');
    setFormEmployeeId(`WZ-EMP-0${Math.floor(10 + Math.random() * 89)}`);
    setIsAddMode(true);
  };

  const handleStartEdit = (user: User) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormPassword(user.password || '');
    setFormRole(user.role);
    setFormPosition(user.position);
    setFormPhone(user.phone);
    setFormEmployeeId(user.employeeId);
    setIsAddMode(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formUsername.trim() || !formName.trim()) return;

    if (editingUserId) {
      updateUser(editingUserId, {
        name: formName,
        username: formUsername,
        password: formPassword,
        role: formRole,
        position: formPosition,
        phone: formPhone,
        employeeId: formEmployeeId,
      });
    } else {
      addUser({
        name: formName,
        username: formUsername,
        password: formPassword,
        role: formRole,
        position: formPosition,
        phone: formPhone,
        employeeId: formEmployeeId,
      });
    }
    setIsAddMode(false);
    setEditingUserId(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              <h2 className="font-display font-bold text-lg text-white">
                Admin: Crew & Login Credentials
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Establish and manage usernames and passwords for deskless field members.
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action button */}
        {!isAddMode && (
          <div className="flex justify-end">
            <button
              onClick={handleStartAdd}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-orange-600/30"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create New Member Account</span>
            </button>
          </div>
        )}

        {/* Add / Edit Form */}
        {isAddMode ? (
          <form onSubmit={handleSaveUser} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">
                {editingUserId ? 'Edit Member Credentials' : 'New Crew Account'}
              </h3>
              <button
                type="button"
                onClick={() => setIsAddMode(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Back to List
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. Alex Henderson"
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Employee ID</label>
                <input
                  type="text"
                  value={formEmployeeId}
                  onChange={(e) => setFormEmployeeId(e.target.value)}
                  placeholder="WZ-EMP-045"
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Username (Login)</label>
                <input
                  type="text"
                  value={formUsername}
                  onChange={(e) => setFormUsername(e.target.value)}
                  placeholder="ahenderson"
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Password (Admin Set)</label>
                <input
                  type="text"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="worker123"
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-white font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Role Authority</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-white"
                >
                  <option value="member">Member (Field Technician / Flagger)</option>
                  <option value="admin">Admin (Elevated Editor & Dispatcher)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Position / Job Title</label>
                <input
                  type="text"
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                  placeholder="Traffic Control Specialist"
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Phone Number</label>
              <input
                type="tel"
                value={formPhone}
                onChange={(e) => setFormPhone(e.target.value)}
                placeholder="(555) 019-3388"
                className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsAddMode(false)}
                className="flex-1 h-11 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-orange-600/30"
              >
                Save Account
              </button>
            </div>
          </form>
        ) : (
          /* Users List */
          <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/60">
            {users.map((u) => (
              <div
                key={u.id}
                className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                      u.role === 'admin'
                        ? 'bg-amber-600 text-slate-950'
                        : 'bg-slate-800 text-orange-400 border border-slate-700'
                    }`}
                  >
                    {u.role === 'admin' ? <ShieldCheck className="w-5 h-5" /> : <HardHat className="w-5 h-5" />}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{u.name}</span>
                      <span className="text-[10px] font-mono text-slate-400">{u.employeeId}</span>
                      <span
                        className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded ${
                          u.role === 'admin'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-600/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-600/30'
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400">{u.position}</div>
                    <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                      Username: <span className="text-slate-300">{u.username}</span> · Password:{' '}
                      <span className="text-slate-300">{u.password || '••••••••'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onClose();
                      setActiveTab('notifications');
                    }}
                    className="p-2 rounded-lg bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-600/40 transition-colors"
                    title={`Send in-app notification to ${u.name}`}
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleStartEdit(u)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
                    title="Edit Credentials"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-orange-400" />
                  </button>

                  {u.id !== currentUser?.id && (
                    <button
                      onClick={() => deleteUser(u.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 border border-slate-700"
                      title="Delete User"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 text-center text-xs text-slate-500">
          Work Zone OS · Persistent State Stored in Local Runtime
        </div>
      </div>
    </div>
  );
};
