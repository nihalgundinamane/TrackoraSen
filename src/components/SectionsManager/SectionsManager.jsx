import React, { useState } from 'react';
import './SectionsManager.css';

const SectionsManager = ({ sections, onAdd, onRename, onRemove, onReorder, onReset, onClose, icons }) => {
  const [newLabel, setNewLabel] = useState('');
  const [newIcon, setNewIcon]   = useState('📺');
  const [editKey, setEditKey]   = useState(null);
  const [editVal, setEditVal]   = useState('');
  const [dragKey, setDragKey]   = useState(null);

  const handleAdd = () => {
    if (!newLabel.trim()) return;
    onAdd(newLabel.trim(), newIcon);
    setNewLabel('');
  };

  const startEdit = (s) => { setEditKey(s.key); setEditVal(s.label); };
  const saveEdit  = (key) => { if (editVal.trim()) onRename(key, editVal.trim()); setEditKey(null); };

  const handleDragOver = (e, key) => {
    e.preventDefault();
    if (dragKey && dragKey !== key) onReorder(dragKey, key);
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="modal-box sections-modal">
        <div className="modal-title">
          <span>Manage Sections</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="sections-hint">Drag to reorder. Default sections cannot be removed but can be renamed.</p>

        <div className="sections-list">
          {sections.map(s => (
            <div
              key={s.key}
              className="section-item"
              draggable
              onDragStart={() => setDragKey(s.key)}
              onDragEnd={() => setDragKey(null)}
              onDragOver={e => handleDragOver(e, s.key)}
            >
              <span className="section-drag-handle">⠿</span>
              <span className="section-item-icon">{s.icon}</span>

              {editKey === s.key ? (
                <input
                  className="field-input section-rename-input"
                  value={editVal}
                  autoFocus
                  onChange={e => setEditVal(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveEdit(s.key); if (e.key === 'Escape') setEditKey(null); }}
                  onBlur={() => saveEdit(s.key)}
                />
              ) : (
                <span className="section-item-label">{s.label}</span>
              )}

              <div className="section-item-actions">
                {!s.isDefault && (
                  <button className="sec-btn" onClick={() => startEdit(s)} title="Rename">✏</button>
                )}
                {!s.isDefault && (
                  <button className="sec-btn danger" onClick={() => onRemove(s.key)} title="Remove section (anime moved to Next to Watch)">✕</button>
                )}
                {s.isDefault && (
                  <span className="sec-locked" title="Default section — cannot be renamed or removed">🔒</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Add custom section */}
        <div className="add-section-form">
          <span className="filter-label">Add custom section</span>
          <div className="add-section-row">
            <select
              className="field-input icon-picker"
              value={newIcon}
              onChange={e => setNewIcon(e.target.value)}
            >
              {icons.map(ic => (
                <option key={ic} value={ic}>{ic}</option>
              ))}
            </select>
            <input
              className="field-input"
              placeholder="Section name…"
              value={newLabel}
              onChange={e => setNewLabel(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <button className="btn btn-primary" onClick={handleAdd}>Add</button>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-ghost danger-btn" onClick={() => { onReset(); onClose(); }}>Reset to defaults</button>
          <button className="btn btn-primary" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
};

export default SectionsManager;
