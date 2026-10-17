import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { FieldFormTemplate, FormFieldDefinition, FormSubmission } from '../../types';
import {
  FileText,
  Plus,
  Send,
  CheckCircle2,
  Trash2,
  Calendar,
  User,
  ShieldCheck,
  MapPin,
  PenTool,
  Clock,
  Printer,
  X,
  FileCheck,
  AlertCircle,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { SignaturePad } from './SignaturePad';

export const FormsHubTab: React.FC = () => {
  const {
    formTemplates,
    addFormTemplate,
    deleteFormTemplate,
    formSubmissions,
    submitForm,
    currentUser,
    jobs,
    playBeep,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin';

  // Active view: 'list' | 'fill' | 'history'
  const [viewMode, setViewMode] = useState<'list' | 'fill' | 'history'>('list');
  const [activeTemplate, setActiveTemplate] = useState<FieldFormTemplate | null>(null);

  // Form runner state
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || '');
  const [customDestination, setCustomDestination] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<string>('safety@superiorllc.org');
  const [hasSignature, setHasSignature] = useState<boolean>(false);
  const [signatureData, setSignatureData] = useState<string | null>(null);

  // Admin New Form Template Modal
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState<'Safety' | 'Inspection' | 'Equipment' | 'Incident' | 'Custom'>('Safety');
  const [newDestination, setNewDestination] = useState('safety@superiorllc.org');
  const [newFields, setNewFields] = useState<FormFieldDefinition[]>([
    { id: 'field_1', label: 'Work Area Clean & Verified', type: 'boolean', required: true, defaultValue: true },
    { id: 'field_2', label: 'Technician Signature', type: 'signature', required: true },
  ]);

  // Submission view modal
  const [viewingSubmission, setViewingSubmission] = useState<FormSubmission | null>(null);

  const startFillForm = (template: FieldFormTemplate) => {
    setActiveTemplate(template);
    setSelectedDestination(template.destination);
    const initialData: Record<string, any> = {};
    template.fields.forEach((f) => {
      initialData[f.id] = f.defaultValue !== undefined ? f.defaultValue : f.type === 'boolean' ? false : '';
    });
    setFormData(initialData);
    setHasSignature(false);
    setSignatureData(null);
    setViewMode('fill');
  };

  const handleFieldChange = (fieldId: string, val: any) => {
    setFormData((prev) => ({ ...prev, [fieldId]: val }));
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTemplate || !currentUser) return;

    const signatureDataUrl = signatureData || '';

    const selectedJob = jobs.find((j) => j.id === selectedJobId);
    const dest = customDestination.trim() || selectedDestination;

    submitForm({
      formId: activeTemplate.id,
      formTitle: activeTemplate.title,
      submittedByUserId: currentUser.id,
      submittedByName: currentUser.name,
      jobId: selectedJob?.id,
      jobNumber: selectedJob?.jobNumber,
      destination: dest,
      data: formData,
      signatureData: signatureDataUrl,
      status: 'delivered',
    });

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#F97316', '#F59E0B', '#10B981'],
    });

    playBeep('success');
    setViewMode('history');
  };

  // Add field to new template
  const handleAddFieldToBuilder = () => {
    const newFieldId = `field_${Date.now()}`;
    setNewFields((prev) => [
      ...prev,
      {
        id: newFieldId,
        label: `Field Question ${prev.length + 1}`,
        type: 'text',
        required: true,
      },
    ]);
  };

  const handleSaveNewTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addFormTemplate({
      title: newTitle,
      category: newCategory,
      description: newDescription || 'Field compliance form configured by operations administrator.',
      destination: newDestination || 'safety@superiorllc.org',
      fields: newFields,
    });

    setIsBuilderOpen(false);
    setNewTitle('');
    setNewDescription('');
  };

  return (
    <div className="space-y-5 pb-24">
      {/* Top Header & Navigation Segment */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-orange-400" />
              <h2 className="font-display font-bold text-lg text-white">Forms Hub & Field Inspections</h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              MUTCD logs, JHA safety briefings, vehicle inspections, and incident reporting.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setIsBuilderOpen(true)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-orange-600/30 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Upload / Create Form</span>
              </button>
            )}
          </div>
        </div>

        {/* View Switcher: Available Forms vs Submissions History */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'list' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Available Field Forms ({formTemplates.length})
          </button>
          <button
            onClick={() => setViewMode('history')}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
              viewMode === 'history' ? 'bg-slate-800 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Submissions History ({formSubmissions.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: AVAILABLE FORMS LIST */}
      {viewMode === 'list' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formTemplates.map((template) => (
            <div
              key={template.id}
              className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30">
                    {template.category}
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-slate-400">
                    <span>{template.fields.length} checklist items</span>
                    {isAdmin && template.isCustom && (
                      <button
                        onClick={() => deleteFormTemplate(template.id)}
                        className="p-1 text-slate-500 hover:text-red-400"
                        title="Delete custom form"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="font-display font-bold text-base text-white">{template.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {template.description}
                </p>

                <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
                  <Send className="w-3 h-3 text-slate-400" />
                  <span>Destination:</span>
                  <span className="font-mono text-slate-300 font-semibold">{template.destination}</span>
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-slate-800/80">
                <button
                  onClick={() => startFillForm(template)}
                  className="w-full h-11 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md shadow-orange-600/20 active:scale-[0.98] transition-transform"
                >
                  <PenTool className="w-4 h-4" />
                  <span>Fill & Sign in Field</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW 2: FORM RUNNER (Fill & Sign) */}
      {viewMode === 'fill' && activeTemplate && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/30">
                {activeTemplate.category}
              </span>
              <h3 className="font-display font-bold text-lg text-white mt-1">{activeTemplate.title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{activeTemplate.description}</p>
            </div>
            <button
              onClick={() => setViewMode('list')}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmitForm} className="space-y-5">
            {/* Associated Job Site Selection */}
            <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-400" />
                <span>Associated Work Zone Job Site</span>
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full h-11 bg-slate-900 border border-slate-700 rounded-lg px-3 text-xs text-white"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    [{j.jobNumber}] {j.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Dynamic Checklist / Questions */}
            <div className="space-y-4">
              {activeTemplate.fields.map((field) => {
                if (field.type === 'signature') return null; // rendered at the bottom

                return (
                  <div
                    key={field.id}
                    className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2"
                  >
                    <label className="text-xs font-semibold text-slate-200 block">
                      {field.label} {field.required && <span className="text-red-400">*</span>}
                    </label>

                    {field.type === 'boolean' && (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleFieldChange(field.id, true)}
                          className={`flex-1 h-11 rounded-xl text-xs font-bold border transition-colors ${
                            formData[field.id] === true
                              ? 'bg-emerald-600 border-emerald-500 text-white shadow-md'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                          }`}
                        >
                          Pass / Compliant
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFieldChange(field.id, false)}
                          className={`flex-1 h-11 rounded-xl text-xs font-bold border transition-colors ${
                            formData[field.id] === false
                              ? 'bg-red-600 border-red-500 text-white shadow-md'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
                          }`}
                        >
                          Deficient / Flag
                        </button>
                      </div>
                    )}

                    {field.type === 'select' && (
                      <select
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        className="w-full h-11 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-white"
                        required={field.required}
                      >
                        <option value="">Select option...</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    )}

                    {field.type === 'text' && (
                      <input
                        type="text"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder={field.placeholder || 'Enter value...'}
                        className="w-full h-11 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-white placeholder-slate-500"
                        required={field.required}
                      />
                    )}

                    {field.type === 'number' && (
                      <input
                        type="number"
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        placeholder="0"
                        className="w-full h-11 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-white"
                        required={field.required}
                      />
                    )}

                    {field.type === 'textarea' && (
                      <textarea
                        value={formData[field.id] || ''}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        rows={3}
                        placeholder={field.placeholder || 'Field observations or corrective measures...'}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500"
                        required={field.required}
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Digital Touch Gesture Signature Component */}
            <SignaturePad
              signerName={currentUser?.name || 'Field Inspector'}
              onSignatureChange={(dataUrl) => setSignatureData(dataUrl)}
              required={true}
            />

            {/* Destination Selector */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-orange-400" />
                <span>Send to Destination</span>
              </label>

              <select
                value={selectedDestination}
                onChange={(e) => setSelectedDestination(e.target.value)}
                className="w-full h-11 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-white"
              >
                <option value="safety@superiorllc.org">Safety Dept (safety@superiorllc.org)</option>
                <option value="dispatch@superiorllc.org">Central Dispatch (dispatch@superiorllc.org)</option>
                <option value="fleet@superiorllc.org">Fleet & TMA Support (fleet@superiorllc.org)</option>
                <option value="caltrans-d4-inspect@dot.ca.gov">Caltrans Resident Inspector (DOT)</option>
                <option value="custom">Custom Recipient Email</option>
              </select>

              {selectedDestination === 'custom' && (
                <input
                  type="email"
                  value={customDestination}
                  onChange={(e) => setCustomDestination(e.target.value)}
                  placeholder="Enter email address: inspector@agency.gov"
                  className="w-full h-10 bg-slate-900 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  required
                />
              )}
            </div>

            {/* Submit Action */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="flex-1 h-14 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-2 h-14 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-slate-950 font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-orange-600/30 cursor-pointer"
              >
                <Send className="w-5 h-5" />
                <span>Submit Form to Destination</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* VIEW 3: SUBMISSIONS HISTORY */}
      {viewMode === 'history' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-4 bg-slate-800/60 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-display font-bold text-sm text-white">
              Filed Submissions Audit Trail ({formSubmissions.length})
            </h3>
            <span className="text-xs text-slate-400">All forms securely archived</span>
          </div>

          {formSubmissions.length === 0 ? (
            <div className="p-10 text-center text-slate-500 text-xs">
              No forms submitted yet. Choose a form from the Available Forms tab to start!
            </div>
          ) : (
            <div className="divide-y divide-slate-800">
              {formSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-4 hover:bg-slate-800/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{sub.formTitle}</span>
                      <span className="text-[10px] font-mono text-orange-400">[{sub.jobNumber || 'WZ-GEN'}]</span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-600/30">
                        {sub.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1 text-slate-300">
                        <User className="w-3 h-3 text-slate-500" />
                        {sub.submittedByName}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {new Date(sub.submittedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                      <span>·</span>
                      <span>Destination: <b className="text-slate-300">{sub.destination}</b></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setViewingSubmission(sub)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-orange-400" />
                      <span>Review Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review Submission Receipt Modal */}
      {viewingSubmission && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase text-emerald-400">Delivered & Verified</span>
                <h3 className="font-display font-bold text-lg text-white">{viewingSubmission.formTitle}</h3>
                <p className="text-xs text-slate-400">Sent to: {viewingSubmission.destination}</p>
              </div>
              <button onClick={() => setViewingSubmission(null)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-xl space-y-1">
                <div className="text-slate-400">Submitted By: <b className="text-white">{viewingSubmission.submittedByName}</b></div>
                <div className="text-slate-400">Job: <b className="text-orange-400">{viewingSubmission.jobNumber || 'General'}</b></div>
                <div className="text-slate-400">Timestamp: <b className="text-white">{new Date(viewingSubmission.submittedAt).toLocaleString()}</b></div>
              </div>

              <div className="space-y-2 pt-1">
                <div className="font-bold text-slate-300">Field Form Answers:</div>
                {Object.entries(viewingSubmission.data).map(([key, val]) => (
                  <div key={key} className="p-2.5 bg-slate-950/80 rounded-lg flex items-center justify-between">
                    <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="font-semibold text-white">
                      {typeof val === 'boolean' ? (val ? 'Yes / Passed' : 'No / Failed') : String(val)}
                    </span>
                  </div>
                ))}
              </div>

              {viewingSubmission.signatureData && (
                <div className="space-y-1 pt-2">
                  <div className="font-bold text-slate-300">Digital Signature Verification:</div>
                  <div className="p-2 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-center">
                    <img
                      src={viewingSubmission.signatureData}
                      alt="Signature"
                      className="max-h-20 object-contain"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setViewingSubmission(null)}
              className="w-full h-11 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs"
            >
              Close Receipt
            </button>
          </div>
        </div>
      )}

      {/* Admin Form Template Builder Modal */}
      {isBuilderOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div>
                <h3 className="font-display font-bold text-lg text-white">Design Custom Field Form</h3>
                <p className="text-xs text-orange-400 font-medium">Elevated Admin: Create forms for members in the field</p>
              </div>
              <button onClick={() => setIsBuilderOpen(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNewTemplate} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Form Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Flagger Station Line-of-Sight Audit"
                  className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-3 text-xs text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-2 text-xs text-white"
                  >
                    <option value="Safety">Safety</option>
                    <option value="Inspection">Inspection</option>
                    <option value="Equipment">Equipment</option>
                    <option value="Incident">Incident</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Default Destination</label>
                  <input
                    type="email"
                    value={newDestination}
                    onChange={(e) => setNewDestination(e.target.value)}
                    placeholder="safety@superiorllc.org"
                    className="w-full h-10 bg-slate-950 border border-slate-700 rounded-xl px-2 text-xs text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Form Instructions</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  rows={2}
                  placeholder="Guidance for deskless workers filling this out..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>

              {/* Dynamic Field Builder */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">Checklist Questions ({newFields.length})</label>
                  <button
                    type="button"
                    onClick={handleAddFieldToBuilder}
                    className="text-xs text-orange-400 hover:text-orange-300 font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Question</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {newFields.map((f, idx) => (
                    <div key={f.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-500">{idx + 1}.</span>
                      <input
                        type="text"
                        value={f.label}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewFields((prev) =>
                            prev.map((item) => (item.id === f.id ? { ...item, label: val } : item))
                          );
                        }}
                        className="flex-1 bg-transparent border-0 text-xs text-white focus:outline-none"
                      />
                      <select
                        value={f.type}
                        onChange={(e) => {
                          const t = e.target.value as any;
                          setNewFields((prev) =>
                            prev.map((item) => (item.id === f.id ? { ...item, type: t } : item))
                          );
                        }}
                        className="bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-[11px] text-slate-300"
                      >
                        <option value="boolean">Pass/Fail</option>
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="textarea">Notes</option>
                        <option value="signature">Signature</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsBuilderOpen(false)}
                  className="flex-1 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 h-12 rounded-xl bg-orange-600 hover:bg-orange-500 text-slate-950 font-bold text-xs shadow-md shadow-orange-600/30"
                >
                  Publish Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
