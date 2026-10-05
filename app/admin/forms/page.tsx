'use client';

import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Copy, 
  ArrowUp, 
  ArrowDown, 
  Eye, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  X,
  Layers,
  HelpCircle,
  Loader2,
  Lock
} from 'lucide-react';
import { RegistrationField, FieldType } from '@/lib/types';
import { DEFAULT_FORM_FIELDS } from '@/lib/defaultForm';

export default function AdminFormBuilderPage() {
  const [fields, setFields] = useState<RegistrationField[]>(DEFAULT_FORM_FIELDS);
  const [formTitle, setFormTitle] = useState('NATIONAL ESPORTS CHAMPIONSHIP');
  const [formDesc, setFormDesc] = useState('Fill out legal player details, game identifiers, and required verification proofs to enter the competitive bracket.');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);

  // Edit / Add modal
  const [editingField, setEditingField] = useState<RegistrationField | null>(null);
  const [isNewField, setIsNewField] = useState(false);

  // Reliable Token Extractor
  const getAuthToken = () => {
    if (typeof window === 'undefined') return '';
    const directToken = localStorage.getItem('gg_admin_token');
    if (directToken) return directToken;
    try {
      const userStr = localStorage.getItem('gg_admin_user');
      if (userStr) {
        const parsed = JSON.parse(userStr);
        if (parsed?.token) return parsed.token;
      }
    } catch (_) {}
    return '';
  };

  useEffect(() => {
    // 1. Check local draft first for instant recovery
    try {
      const savedDraft = localStorage.getItem('gg_form_builder_draft');
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft);
        if (Array.isArray(parsed.fields) && parsed.fields.length > 0) setFields(parsed.fields);
        if (parsed.formTitle) setFormTitle(parsed.formTitle);
        if (parsed.formDesc) setFormDesc(parsed.formDesc);
      }
    } catch (_) {}

    // 2. Fetch fresh published state from database with cache-busting
    fetch(`/api/admin/data?type=form-fields&_t=${Date.now()}`, { cache: 'no-store' })
      .then(res => res.json())
      .then(res => {
        if (res.success) {
          if (Array.isArray(res.data) && res.data.length > 0) setFields(res.data);
          if (res.formTitle) setFormTitle(res.formTitle);
          if (res.formDesc) setFormDesc(res.formDesc);
        }
      })
      .catch(() => console.log('Using default form fields.'));
  }, []);

  // Auto-backup draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('gg_form_builder_draft', JSON.stringify({ fields, formTitle, formDesc }));
    } catch (_) {}
  }, [fields, formTitle, formDesc]);

  // Background auto-persistence helper to ensure changes are never lost
  const autoPersistToServer = async (fieldsToSave: RegistrationField[], titleToSave: string, descToSave: string) => {
    try {
      const token = getAuthToken();
      await fetch('/api/admin/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          action: 'save-form-fields',
          payload: { fields: fieldsToSave, formTitle: titleToSave, formDesc: descToSave }
        })
      });
      localStorage.setItem('gg_form_builder_draft', JSON.stringify({ fields: fieldsToSave, formTitle: titleToSave, formDesc: descToSave }));
    } catch (e) {
      console.warn('Auto-save error:', e);
    }
  };

  // Explicit Save all fields & publish live to server
  const handleSaveForm = async () => {
    setIsPublishing(true);
    try {
      const token = getAuthToken();
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          action: 'save-form-fields',
          payload: { fields, formTitle, formDesc }
        })
      });
      const data = await res.json();
      if (data.success) {
        try {
          localStorage.setItem('gg_form_builder_draft', JSON.stringify({ fields, formTitle, formDesc }));
        } catch (_) {}
        setSaveNotice('REGISTRATION FORM PUBLISHED LIVE! All edits, question orders, and custom fields are now instantly visible on /registration.');
        setTimeout(() => setSaveNotice(null), 5000);
      } else {
        alert('Save failed: ' + (data.error || 'Server error'));
      }
    } catch (err: any) {
      alert('Failed to save form: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleResetToDefault = () => {
    if (confirm('Are you sure you want to reset the registration form back to the default esports structure?')) {
      const defaults = DEFAULT_FORM_FIELDS;
      const defTitle = 'NATIONAL ESPORTS CHAMPIONSHIP';
      const defDesc = 'Fill out legal player details, game identifiers, and required verification proofs to enter the competitive bracket.';
      setFields(defaults);
      setFormTitle(defTitle);
      setFormDesc(defDesc);
      try {
        localStorage.removeItem('gg_form_builder_draft');
      } catch (_) {}
      autoPersistToServer(defaults, defTitle, defDesc);
    }
  };

  // Move Field Up/Down with auto-order & auto-persist
  const moveField = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= fields.length) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    updated.forEach((f, i) => f.sort_order = i + 1);
    setFields(updated);
    autoPersistToServer(updated, formTitle, formDesc);
  };

  // Duplicate Field with auto-persist
  const duplicateField = (field: RegistrationField) => {
    const duplicated: RegistrationField = {
      ...field,
      id: `f-${Date.now()}`,
      label: `${field.label} (Copy)`,
      sort_order: fields.length + 1
    };
    const updated = [...fields, duplicated];
    setFields(updated);
    autoPersistToServer(updated, formTitle, formDesc);
  };

  // Delete Field with auto-persist
  const deleteField = (id: string) => {
    if (!confirm('Are you sure you want to remove this field from the registration form?')) return;
    const updated = fields.filter(f => f.id !== id);
    updated.forEach((f, i) => f.sort_order = i + 1);
    setFields(updated);
    autoPersistToServer(updated, formTitle, formDesc);
  };

  // Open Edit or Add Field Modal
  const openAddField = () => {
    setEditingField({
      id: `f-${Date.now()}`,
      form_id: 'form-default',
      label: '',
      field_type: 'SHORT_TEXT',
      description: '',
      placeholder: '',
      is_required: false,
      options: [],
      sort_order: fields.length + 1
    });
    setIsNewField(true);
  };

  const saveEditingField = () => {
    if (!editingField || !editingField.label.trim()) {
      alert('Field title is required.');
      return;
    }

    let updated: RegistrationField[];
    if (isNewField) {
      updated = [...fields, editingField];
    } else {
      updated = fields.map(f => f.id === editingField.id ? editingField : f);
    }
    updated.forEach((f, i) => f.sort_order = i + 1);
    setFields(updated);
    setEditingField(null);
    autoPersistToServer(updated, formTitle, formDesc);
  };

  const fieldTypeOptions: { value: FieldType; label: string }[] = [
    { value: 'SHORT_TEXT', label: 'Short Text' },
    { value: 'LONG_TEXT', label: 'Long Text' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'EMAIL', label: 'Email' },
    { value: 'PHONE', label: 'Phone' },
    { value: 'DATE', label: 'Date' },
    { value: 'DROPDOWN', label: 'Dropdown' },
    { value: 'MULTIPLE_CHOICE', label: 'Multiple Choice (Radio)' },
    { value: 'CHECKBOX', label: 'Checkbox' },
    { value: 'IMAGE_UPLOAD', label: 'Image Upload' },
    { value: 'FILE_UPLOAD', label: 'File Upload' },
    { value: 'PDF_UPLOAD', label: 'PDF Document Upload' },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white font-mono uppercase">
            DYNAMIC FORM BUILDER
          </h1>
          <p className="text-xs text-gray-400 font-mono mt-0.5">
            Construct, title, reorder questions and verification upload slots. Edits reflect live immediately.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleResetToDefault}
            className="px-3.5 py-2 rounded text-xs font-mono font-bold uppercase border border-red-500/40 text-red-400 hover:bg-red-500/10 transition flex items-center space-x-1.5"
            title="Reset form back to default esports configuration"
          >
            <Trash2 className="w-4 h-4" />
            <span>RESET DEFAULTS</span>
          </button>

          <button
            onClick={() => setPreviewOpen(true)}
            className="btn-cyber-secondary px-4 py-2 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1.5"
          >
            <Eye className="w-4 h-4 text-neon-cyan" />
            <span>PREVIEW FORM</span>
          </button>

          <button
            onClick={handleSaveForm}
            disabled={isPublishing}
            className="btn-cyber-primary px-5 py-2 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1.5 disabled:opacity-50"
          >
            {isPublishing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-cyber-black" />
                <span>PUBLISHING...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4 text-cyber-black" />
                <span>PUBLISH FORM</span>
              </>
            )}
          </button>
        </div>
      </div>

      {saveNotice && (
        <div className="p-4 rounded-xl bg-neon-emerald/20 border border-neon-emerald/60 text-xs font-mono text-neon-emerald flex items-center space-x-3 shadow-lg shadow-neon-emerald/10">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span className="font-bold">{saveNotice}</span>
        </div>
      )}

      {/* Form Settings Header Card */}
      <div className="glass-hud p-6 rounded-2xl border border-cyber-border space-y-4">
        <div>
          <label className="text-xs font-mono font-bold text-neon-cyan uppercase">
            FORM DISPLAY TITLE *
          </label>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => {
              setFormTitle(e.target.value);
              autoPersistToServer(fields, e.target.value, formDesc);
            }}
            placeholder="e.g. NATIONAL ESPORTS CHAMPIONSHIP"
            className="w-full mt-1.5 px-3.5 py-2.5 text-sm font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:border-neon-emerald focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-mono font-bold text-gray-300 uppercase">
            INSTRUCTIONS / INTRODUCTORY DESCRIPTION
          </label>
          <textarea
            rows={2}
            value={formDesc}
            onChange={(e) => {
              setFormDesc(e.target.value);
              autoPersistToServer(fields, formTitle, e.target.value);
            }}
            placeholder="Enter instructions for players entering the tournament bracket..."
            className="w-full mt-1.5 px-3.5 py-2.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:border-neon-emerald focus:outline-none"
          />
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-mono font-bold text-gray-300 uppercase flex items-center space-x-2">
            <span>TOURNAMENT QUESTIONS ({fields.length} TOTAL)</span>
            <span className="text-[10px] text-gray-500 font-normal">(Players see questions strictly in this sequence)</span>
          </span>
          <button
            onClick={openAddField}
            className="px-3.5 py-2 rounded bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/40 text-xs font-mono font-bold flex items-center space-x-1.5 hover:bg-neon-emerald/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>ADD NEW QUESTION</span>
          </button>
        </div>

        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="glass-panel p-4 rounded-xl border border-cyber-border flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-500 transition-colors"
          >
            <div className="space-y-1 min-w-0 flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-neon-emerald font-bold px-2 py-0.5 rounded bg-cyber-dark border border-neon-emerald/30">
                  #{idx + 1}
                </span>
                <span className="text-xs font-mono font-bold text-neon-cyan px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30">
                  {field.field_type.replace('_', ' ')}
                </span>
                {field.is_required && (
                  <span className="text-[10px] font-mono text-neon-red font-bold">* MANDATORY</span>
                )}
                {['IMAGE_UPLOAD', 'PDF_UPLOAD', 'FILE_UPLOAD'].includes(field.field_type) && (
                  <span className="text-[10px] font-mono text-neon-gold flex items-center space-x-1">
                    <Lock className="w-3 h-3" />
                    <span>VAULT PROOF</span>
                  </span>
                )}
              </div>
              <h3 className="text-sm font-mono font-bold text-white mt-1 break-words">
                {field.label}
              </h3>
              {field.description && (
                <p className="text-xs text-gray-400 font-mono">{field.description}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 self-end md:self-auto flex-shrink-0">
              <button
                disabled={idx === 0}
                onClick={() => moveField(idx, 'up')}
                className="p-1.5 rounded bg-cyber-dark text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                title="Move Up in sequence"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                disabled={idx === fields.length - 1}
                onClick={() => moveField(idx, 'down')}
                className="p-1.5 rounded bg-cyber-dark text-gray-400 hover:text-white disabled:opacity-30 transition-colors"
                title="Move Down in sequence"
              >
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={() => { setEditingField(field); setIsNewField(false); }}
                className="px-3 py-1.5 rounded bg-cyber-dark text-xs font-mono text-gray-300 hover:text-white border border-cyber-border hover:border-neon-emerald transition-colors"
              >
                Edit
              </button>

              <button
                onClick={() => duplicateField(field)}
                className="p-1.5 rounded bg-cyber-dark text-gray-400 hover:text-neon-cyan transition-colors"
                title="Duplicate Field"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={() => deleteField(field.id)}
                className="p-1.5 rounded bg-cyber-dark text-gray-400 hover:text-neon-red transition-colors"
                title="Delete Field"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* EDIT / ADD MODAL */}
      {editingField && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-hud p-6 sm:p-8 rounded-2xl border-2 border-neon-cyan/50 max-w-lg w-full max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex justify-between items-center border-b border-cyber-border pb-3">
              <h3 className="text-lg font-black text-white font-mono uppercase">
                {isNewField ? 'ADD NEW QUESTION FIELD' : 'CONFIGURE FIELD'}
              </h3>
              <button onClick={() => setEditingField(null)} className="text-gray-400 hover:text-white">
                ✕
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-gray-300">Field Question / Title *</label>
              <input
                type="text"
                required
                value={editingField.label}
                onChange={(e) => setEditingField({ ...editingField, label: e.target.value })}
                placeholder="e.g. Manager details, Discord Tag, Age..."
                className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-gray-300">Question Type</label>
              <select
                value={editingField.field_type}
                onChange={(e) => setEditingField({ ...editingField, field_type: e.target.value as FieldType })}
                className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              >
                {fieldTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-gray-300">Help Description / Hint</label>
              <input
                type="text"
                value={editingField.description || ''}
                onChange={(e) => setEditingField({ ...editingField, description: e.target.value })}
                placeholder="Optional instructions for the applicant..."
                className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono font-bold text-gray-300">Placeholder Text</label>
              <input
                type="text"
                value={editingField.placeholder || ''}
                onChange={(e) => setEditingField({ ...editingField, placeholder: e.target.value })}
                placeholder="e.g. Enter name or handle..."
                className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
              />
            </div>

            {['DROPDOWN', 'MULTIPLE_CHOICE', 'CHECKBOX'].includes(editingField.field_type) && (
              <div className="space-y-1">
                <label className="text-xs font-mono font-bold text-gray-300">
                  Options (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Option A, Option B, Option C"
                  value={editingField.options?.join(', ') || ''}
                  onChange={(e) => setEditingField({
                    ...editingField,
                    options: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                  })}
                  className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:outline-none focus:border-neon-emerald"
                />
              </div>
            )}

            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="reqCheck"
                checked={editingField.is_required}
                onChange={(e) => setEditingField({ ...editingField, is_required: e.target.checked })}
                className="w-4 h-4 rounded text-neon-emerald bg-cyber-dark border-cyber-border accent-neon-emerald"
              />
              <label htmlFor="reqCheck" className="text-xs font-mono text-gray-300 cursor-pointer">
                Mark as Mandatory (Required to submit)
              </label>
            </div>

            <div className="pt-4 border-t border-cyber-border flex justify-end space-x-3">
              <button
                onClick={() => setEditingField(null)}
                className="px-4 py-2 text-xs font-mono font-bold text-gray-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={saveEditingField}
                className="btn-cyber-primary px-5 py-2 rounded text-xs font-mono font-bold uppercase"
              >
                Apply Field
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM PREVIEW MODAL */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-hud p-6 sm:p-8 rounded-2xl border-2 border-neon-emerald/50 max-w-2xl w-full max-h-[85vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-cyber-border pb-3">
              <div>
                <span className="text-[10px] font-mono text-neon-emerald font-bold uppercase">LIVE PLAYER PREVIEW</span>
                <h3 className="text-lg font-black text-white font-mono uppercase">{formTitle}</h3>
                <p className="text-xs text-gray-400 font-mono mt-0.5">{formDesc}</p>
              </div>
              <button onClick={() => setPreviewOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              {fields.map((f, i) => (
                <div key={f.id} className="p-4 rounded-lg bg-cyber-black/60 border border-cyber-border space-y-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono font-bold text-neon-emerald px-1.5 py-0.5 rounded bg-cyber-dark border border-neon-emerald/30">
                      #{i + 1}
                    </span>
                    <label className="text-xs font-mono font-bold text-white block">
                      {f.label} {f.is_required && <span className="text-neon-red">*</span>}
                    </label>
                  </div>
                  {f.description && <p className="text-[11px] text-gray-400 font-mono">{f.description}</p>}
                  
                  {['SHORT_TEXT', 'EMAIL', 'PHONE', 'NUMBER', 'DATE'].includes(f.field_type) && (
                    <input disabled placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}...`} className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded text-gray-400" />
                  )}

                  {f.field_type === 'LONG_TEXT' && (
                    <textarea disabled rows={2} placeholder={f.placeholder || `Enter ${f.label.toLowerCase()}...`} className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded text-gray-400" />
                  )}

                  {f.field_type === 'DROPDOWN' && (
                    <select disabled className="w-full px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded text-gray-400">
                      <option>{f.placeholder || `-- Select ${f.label} --`}</option>
                    </select>
                  )}

                  {['IMAGE_UPLOAD', 'FILE_UPLOAD', 'PDF_UPLOAD'].includes(f.field_type) && (
                    <div className="p-4 border-2 border-dashed border-cyber-border text-center rounded text-xs font-mono text-neon-cyan flex items-center justify-center space-x-2">
                      <Lock className="w-4 h-4 text-neon-gold" />
                      <span>{f.label} ({f.field_type.replace('_', ' ')})</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-cyber-border flex justify-end">
              <button
                onClick={() => setPreviewOpen(false)}
                className="btn-cyber-primary px-5 py-2 rounded text-xs font-mono font-bold uppercase"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
