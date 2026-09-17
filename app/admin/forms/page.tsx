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
  HelpCircle
} from 'lucide-react';
import { RegistrationField, FieldType } from '@/lib/types';
import { DEFAULT_FORM_FIELDS } from '@/lib/defaultForm';

export default function AdminFormBuilderPage() {
  const [fields, setFields] = useState<RegistrationField[]>(DEFAULT_FORM_FIELDS);
  const [formTitle, setFormTitle] = useState('NEURAL NEXUS 2K26 — PLAYER & SQUAD REGISTRATION');
  const [formDesc, setFormDesc] = useState('Fill out legal player details, game identifiers, and required verification proofs to enter the competitive bracket.');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Edit / Add modal
  const [editingField, setEditingField] = useState<RegistrationField | null>(null);
  const [isNewField, setIsNewField] = useState(false);

  useEffect(() => {
    fetch('/api/admin/data?type=form-fields')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data?.length) setFields(res.data);
      })
      .catch(() => console.log('Using default form fields.'));
  }, []);

  // Save all fields to server
  const handleSaveForm = async () => {
    try {
      const res = await fetch('/api/admin/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'save-form-fields',
          payload: { fields }
        })
      });
      const data = await res.json();
      if (data.success) {
        setSaveNotice('Registration form configuration successfully saved and published!');
        setTimeout(() => setSaveNotice(null), 3500);
      }
    } catch (err: any) {
      alert('Failed to save form: ' + err.message);
    }
  };

  // Move Field Up/Down
  const moveField = (index: number, direction: 'up' | 'down') => {
    const newIdx = direction === 'up' ? index - 1 : index + 1;
    if (newIdx < 0 || newIdx >= fields.length) return;
    const updated = [...fields];
    const temp = updated[index];
    updated[index] = updated[newIdx];
    updated[newIdx] = temp;
    // update sort_order
    updated.forEach((f, i) => f.sort_order = i + 1);
    setFields(updated);
  };

  // Duplicate Field
  const duplicateField = (field: RegistrationField) => {
    const duplicated: RegistrationField = {
      ...field,
      id: `f-${Date.now()}`,
      label: `${field.label} (Copy)`,
      sort_order: fields.length + 1
    };
    setFields([...fields, duplicated]);
  };

  // Delete Field
  const deleteField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
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
    if (!editingField || !editingField.label) {
      alert('Field title is required.');
      return;
    }

    if (isNewField) {
      setFields([...fields, editingField]);
    } else {
      setFields(fields.map(f => f.id === editingField.id ? editingField : f));
    }
    setEditingField(null);
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
            Construct and reorder Google-Forms-style questions and document upload slots.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setPreviewOpen(true)}
            className="btn-cyber-secondary px-4 py-2 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1.5"
          >
            <Eye className="w-4 h-4 text-neon-cyan" />
            <span>PREVIEW FORM</span>
          </button>

          <button
            onClick={handleSaveForm}
            className="btn-cyber-primary px-5 py-2 rounded text-xs font-mono font-bold uppercase flex items-center space-x-1.5"
          >
            <Save className="w-4 h-4 text-cyber-black" />
            <span>PUBLISH FORM</span>
          </button>
        </div>
      </div>

      {saveNotice && (
        <div className="p-3.5 rounded-xl bg-neon-emerald/20 border border-neon-emerald/50 text-xs font-mono text-neon-emerald flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{saveNotice}</span>
        </div>
      )}

      {/* Form Settings Header Card */}
      <div className="glass-hud p-6 rounded-2xl border border-cyber-border space-y-4">
        <div>
          <label className="text-xs font-mono font-bold text-gray-300">Form Title</label>
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
            className="w-full mt-1 px-3 py-2 text-sm font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:border-neon-emerald focus:outline-none"
          />
        </div>
        <div>
          <label className="text-xs font-mono font-bold text-gray-300">Instructions / Description</label>
          <textarea
            rows={2}
            value={formDesc}
            onChange={(e) => setFormDesc(e.target.value)}
            className="w-full mt-1 px-3 py-2 text-xs font-mono bg-cyber-dark border border-cyber-border rounded-lg text-white focus:border-neon-emerald focus:outline-none"
          />
        </div>
      </div>

      {/* Fields List */}
      <div className="space-y-3">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-mono font-bold text-gray-300 uppercase">
            FORM QUESTIONS ({fields.length} TOTAL)
          </span>
          <button
            onClick={openAddField}
            className="px-3 py-1.5 rounded bg-neon-emerald/20 text-neon-emerald border border-neon-emerald/40 text-xs font-mono font-bold flex items-center space-x-1 hover:bg-neon-emerald/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>ADD NEW FIELD</span>
          </button>
        </div>

        {fields.map((field, idx) => (
          <div
            key={field.id}
            className="glass-panel p-4 rounded-xl border border-cyber-border flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-500 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono text-gray-500 font-bold">#{idx + 1}</span>
                <span className="text-xs font-mono font-bold text-neon-cyan px-2 py-0.5 rounded bg-neon-cyan/10 border border-neon-cyan/30">
                  {field.field_type.replace('_', ' ')}
                </span>
                {field.is_required && (
                  <span className="text-[10px] font-mono text-neon-red font-bold">* REQUIRED</span>
                )}
              </div>
              <h3 className="text-sm font-mono font-bold text-white mt-1">
                {field.label}
              </h3>
              {field.description && (
                <p className="text-xs text-gray-400">{field.description}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 self-end md:self-auto">
              <button
                disabled={idx === 0}
                onClick={() => moveField(idx, 'up')}
                className="p-1.5 rounded bg-cyber-dark text-gray-400 hover:text-white disabled:opacity-30"
                title="Move Up"
              >
                <ArrowUp className="w-4 h-4" />
              </button>
              <button
                disabled={idx === fields.length - 1}
                onClick={() => moveField(idx, 'down')}
                className="p-1.5 rounded bg-cyber-dark text-gray-400 hover:text-white disabled:opacity-30"
                title="Move Down"
              >
                <ArrowDown className="w-4 h-4" />
              </button>

              <button
                onClick={() => { setEditingField(field); setIsNewField(false); }}
                className="px-2.5 py-1 rounded bg-cyber-dark text-xs font-mono text-gray-300 hover:text-white border border-cyber-border"
              >
                Edit
              </button>

              <button
                onClick={() => duplicateField(field)}
                className="p-1.5 rounded bg-cyber-dark text-gray-400 hover:text-neon-cyan"
                title="Duplicate Field"
              >
                <Copy className="w-4 h-4" />
              </button>

              <button
                onClick={() => deleteField(field.id)}
                className="p-1.5 rounded bg-cyber-dark text-gray-400 hover:text-neon-red"
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
                className="w-4 h-4 rounded text-neon-emerald bg-cyber-dark border-cyber-border"
              />
              <label htmlFor="reqCheck" className="text-xs font-mono text-gray-300">
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
                <span className="text-[10px] font-mono text-neon-emerald font-bold uppercase">PREVIEW MODE</span>
                <h3 className="text-lg font-black text-white font-mono uppercase">{formTitle}</h3>
              </div>
              <button onClick={() => setPreviewOpen(false)} className="text-gray-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              {fields.map((f, i) => (
                <div key={f.id} className="p-3.5 rounded-lg bg-cyber-black/60 border border-cyber-border space-y-1">
                  <label className="text-xs font-mono font-bold text-white block">
                    {i + 1}. {f.label} {f.is_required && <span className="text-neon-red">*</span>}
                  </label>
                  {f.description && <p className="text-[11px] text-gray-400">{f.description}</p>}
                  
                  {['SHORT_TEXT', 'EMAIL', 'PHONE', 'NUMBER'].includes(f.field_type) && (
                    <input disabled placeholder={f.placeholder || 'Your answer'} className="w-full px-3 py-1.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded text-gray-400" />
                  )}

                  {f.field_type === 'LONG_TEXT' && (
                    <textarea disabled rows={2} placeholder="Your answer" className="w-full px-3 py-1.5 text-xs font-mono bg-cyber-dark border border-cyber-border rounded text-gray-400" />
                  )}

                  {['IMAGE_UPLOAD', 'FILE_UPLOAD', 'PDF_UPLOAD'].includes(f.field_type) && (
                    <div className="p-3 border border-dashed border-cyber-border text-center rounded text-xs font-mono text-neon-cyan">
                      File Upload: {f.field_type.replace('_', ' ')} (Simulated)
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
