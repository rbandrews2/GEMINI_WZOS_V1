import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Contact } from '../../types';
import {
  Users,
  Phone,
  MessageSquare,
  Search,
  Plus,
  Upload,
  Edit2,
  Trash2,
  ShieldAlert,
  PhoneCall,
  CheckCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';

export const ContactsTab: React.FC = () => {
  const { contacts, addContact, updateContact, deleteContact, bulkImportContacts, currentUser } = useApp();
  const isAdmin = currentUser?.role === 'admin';

  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Single contact form
  const [formName, setFormName] = useState('');
  const [formPosition, setFormPosition] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formDepartment, setFormDepartment] = useState('Field Crew');
  const [formIsEmergency, setFormIsEmergency] = useState(false);
  const [formNotes, setFormNotes] = useState('');

  // Bulk paste text
  const [bulkCsvText, setBulkCsvText] = useState('');

  // In-app dialer notification
  const [simulatedCall, setSimulatedCall] = useState<Contact | null>(null);

  const departments = ['all', 'Dispatch', 'Supervision', 'Field Crew', 'Fleet', 'Agency / DOT', 'Enforcement'];

  const filteredContacts = contacts.filter((c) => {
    if (departmentFilter !== 'all' && c.department !== departmentFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.position.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.department.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleOpenAdd = () => {
    setEditingContact(null);
    setFormName('');
    setFormPosition('');
    setFormPhone('');
    setFormDepartment('Field Crew');
    setFormIsEmergency(false);
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (contact: Contact) => {
    setEditingContact(contact);
    setFormName(contact.name);
    setFormPosition(contact.position);
    setFormPhone(contact.phone);
    setFormDepartment(contact.department);
    setFormIsEmergency(!!contact.isEmergency);
    setFormNotes(contact.notes || '');
    setIsAddModalOpen(true);
  };

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingContact) {
      updateContact(editingContact.id, {
        name: formName,
        position: formPosition,
        phone: formPhone,
        department: formDepartment,
        isEmergency: formIsEmergency,
        notes: formNotes,
      });
    } else {
      addContact({
        name: formName,
        position: formPosition,
        phone: formPhone,
        department: formDepartment,
        isEmergency: formIsEmergency,
        notes: formNotes,
      });
    }
    setIsAddModalOpen(false);
  };

  const handleBulkImport = () => {
    if (!bulkCsvText.trim()) return;
    const lines = bulkCsvText.trim().split('\n');
    const parsed: Omit<Contact, 'id'>[] = [];

    lines.forEach((line) => {
      const parts = line.split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      if (parts.length >= 3) {
        parsed.push({
          name: parts[0],
          position: parts[1],
          phone: parts[2],
          department: parts[3] || 'Field Operations',
          notes: parts[4] || 'Admin uploaded contact',
          isEmergency: parts[1]?.toLowerCase().includes('dispatch') || parts[1]?.toLowerCase().includes('emergency'),
        });
      }
    });

    if (parsed.length > 0) {
      bulkImportContacts(parsed);
      setBulkCsvText('');
      setIsBulkModalOpen(false);
    }
  };

  const handleTriggerCall = (c: Contact) => {
    setSimulatedCall(c);
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Header and Admin Upload Options */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <h2 className="font-display font-bold text-lg text-white">Work Zone Contacts Directory</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Admin-uploaded phone roster for road work crew, dispatch, DOT inspectors & emergency.
            </p>
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBulkModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-orange-400" />
                <span>Bulk Upload (CSV)</span>
              </button>

              <button
                onClick={handleOpenAdd}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-orange-600/30 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Add Contact</span>
              </button>
            </div>
          )}
        </div>

        {/* Search & Department Filters */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, position, or phone number..."
              className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {departments.map((dept) => (
              <button
                key={dept}
                onClick={() => setDepartmentFilter(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  departmentFilter === dept
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {dept === 'all' ? 'All Contacts' : dept}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Contacts List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredContacts.map((contact) => (
          <div
            key={contact.id}
            className={`p-4 rounded-2xl border transition-all ${
              contact.isEmergency
                ? 'bg-red-950/20 border-red-800/40 hover:border-red-600/60'
                : 'bg-slate-900 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-md ${
                    contact.isEmergency
                      ? 'bg-red-600 text-white'
                      : 'bg-slate-800 text-sky-400 border border-slate-700'
                  }`}
                >
                  {contact.isEmergency ? <ShieldAlert className="w-5 h-5" /> : contact.name.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-sm text-white">{contact.name}</h3>
                    {contact.isEmergency && (
                      <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-600/30 text-red-300 border border-red-500/40">
                        Priority
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-orange-400 font-medium">{contact.position}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{contact.department}</p>
                </div>
              </div>

              {isAdmin && (
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(contact)}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-orange-400" />
                  </button>
                  <button
                    onClick={() => deleteContact(contact.id)}
                    className="p-1 rounded text-slate-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {contact.notes && (
              <p className="text-[11px] text-slate-400 italic mt-2.5 pl-1 line-clamp-1 border-t border-slate-800/60 pt-2">
                "{contact.notes}"
              </p>
            )}

            {/* Quick Actions: Call & SMS for Deskless Field Workers */}
            <div className="grid grid-cols-2 gap-2 mt-3 pt-2 border-t border-slate-800/80">
              <a
                href={`tel:${contact.phone}`}
                onClick={(e) => {
                  // If on desktop without tel handler, show simulated call modal
                  if (!/Mobi|Android/i.test(navigator.userAgent)) {
                    e.preventDefault();
                    handleTriggerCall(contact);
                  }
                }}
                className="h-10 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/40 text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Call ({contact.phone})</span>
              </a>

              <a
                href={`sms:${contact.phone}`}
                className="h-10 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                <span>Send SMS</span>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Simulated Call Modal for Desktop / Field simulation */}
      {simulatedCall && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/40 animate-pulse">
              <PhoneCall className="w-8 h-8" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-emerald-400 font-semibold">Calling Dispatch...</div>
              <h3 className="font-display font-extrabold text-xl text-white mt-1">{simulatedCall.name}</h3>
              <p className="text-xs text-orange-400 font-medium">{simulatedCall.position}</p>
              <p className="font-mono text-sm text-slate-300 mt-1">{simulatedCall.phone}</p>
            </div>
            <p className="text-xs text-slate-400">
              In a mobile phone environment, this opens your native phone dialer automatically.
            </p>
            <button
              onClick={() => setSimulatedCall(null)}
              className="w-full h-11 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs"
            >
              End Call
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Contact Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="font-display font-bold text-lg text-white">
                {editingContact ? 'Edit Contact' : 'Upload New Contact'}
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveContact} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="e.g. John Miller"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Position / Title</label>
                <input
                  type="text"
                  value={formPosition}
                  onChange={(e) => setFormPosition(e.target.value)}
                  placeholder="e.g. Traffic Control Supervisor, DOT Inspector"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Telephone Number</label>
                <input
                  type="tel"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  placeholder="(555) 019-2830"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Department</label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-2 text-xs text-white"
                  >
                    <option value="Dispatch">Dispatch</option>
                    <option value="Supervision">Supervision</option>
                    <option value="Field Crew">Field Crew</option>
                    <option value="Fleet">Fleet</option>
                    <option value="Agency / DOT">Agency / DOT</option>
                    <option value="Enforcement">Enforcement</option>
                  </select>
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-700 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={formIsEmergency}
                      onChange={(e) => setFormIsEmergency(e.target.checked)}
                      className="rounded accent-orange-500"
                    />
                    <span>Priority Hotline</span>
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Notes (Optional)</label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder="e.g. Available 24/7 on channel 4"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-orange-600/30"
                >
                  {editingContact ? 'Save Changes' : 'Upload Contact'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk CSV Upload Modal */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Bulk Upload Contacts (CSV)</h3>
                <p className="text-xs text-slate-400">Paste comma-separated rows: Name, Position, Telephone, Department</p>
              </div>
              <button onClick={() => setIsBulkModalOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300">CSV Data</label>
              <textarea
                value={bulkCsvText}
                onChange={(e) => setBulkCsvText(e.target.value)}
                rows={6}
                placeholder={`Alex Turner, Lead TCS, (555) 019-3311, Field Crew\nRobert King, DOT Inspector, (555) 019-4455, Agency / DOT\nTow Truck Dispatch, Heavy Wrecker, (555) 019-8800, Fleet`}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-orange-500"
              />
              <p className="text-[11px] text-slate-400">
                Format: <code className="text-orange-400">Name, Position, Telephone Number, Department</code>
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setIsBulkModalOpen(false)}
                className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleBulkImport}
                disabled={!bulkCsvText.trim()}
                className="flex-1 h-12 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-md shadow-orange-600/30"
              >
                Import Contacts
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
