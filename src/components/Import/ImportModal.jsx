import React, { useState, useCallback } from 'react';
import { parseMalXml, parseAnilistJson } from '../../utils/importParsers';
import './ImportModal.css';

const ImportModal = ({ onImport, onClose }) => {
  const [mode, setMode]       = useState('merge'); // 'merge' | 'replace'
  const [status, setStatus]   = useState(null);    // null | 'parsing' | 'preview' | 'done' | 'error'
  const [preview, setPreview] = useState([]);
  const [errMsg, setErrMsg]   = useState('');
  const [format, setFormat]   = useState('auto');  // 'auto' | 'mal' | 'anilist'

  const handleFile = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus('parsing');
    setErrMsg('');

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target.result;
      try {
        let parsed;
        const detectedFormat = format === 'auto'
          ? (file.name.endsWith('.xml') || text.trim().startsWith('<') ? 'mal' : 'anilist')
          : format;

        if (detectedFormat === 'mal') {
          parsed = parseMalXml(text);
        } else {
          parsed = parseAnilistJson(text);
        }

        if (!parsed.length) throw new Error('No entries found in file.');
        setPreview(parsed);
        setStatus('preview');
      } catch (err) {
        setErrMsg(err.message || 'Failed to parse file.');
        setStatus('error');
      }
    };
    reader.readAsText(file);
  }, [format]);

  const handleImport = () => {
    onImport(preview, mode);
    setStatus('done');
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="modal-box import-modal">
        <div className="modal-title">
          <span>⬆ Import Anime List</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {status === 'done' ? (
          <div className="import-done">
            <div className="import-done-icon">✅</div>
            <p className="import-done-msg">Imported {preview.length} anime successfully!</p>
            <button className="btn btn-primary" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            {/* Instructions */}
            <div className="import-instructions">
              <div className="import-source">
                <strong>TrackoraSen backup:</strong> Use the <code>⬇ Export</code> button → import that <code>.json</code> here
              </div>
              <div className="import-source">
                <strong>MyAnimeList:</strong> Account → Export Anime List → download the <code>.xml</code>
              </div>
              <div className="import-source">
                <strong>AniList:</strong> Settings → Apps → Export → download the <code>.json</code>
              </div>
            </div>

            {/* Format + Mode */}
            <div className="import-row">
              <div className="field-group">
                <label className="field-label">File Format</label>
                <select className="field-input" value={format} onChange={e => setFormat(e.target.value)}>
                  <option value="auto">Auto-detect</option>
                  <option value="mal">MAL XML</option>
                  <option value="anilist">AniList JSON</option>
                </select>
              </div>
              <div className="field-group">
                <label className="field-label">Import Mode</label>
                <select className="field-input" value={mode} onChange={e => setMode(e.target.value)}>
                  <option value="merge">Merge (skip duplicates)</option>
                  <option value="replace">Replace all data</option>
                </select>
              </div>
            </div>

            {mode === 'replace' && (
              <div className="import-warning">
                ⚠ Replace mode will delete all your current data. This cannot be undone.
              </div>
            )}

            {/* File input */}
            <div className="field-group">
              <label className="field-label">Select file</label>
              <input
                className="field-input"
                type="file"
                accept=".xml,.json"
                onChange={handleFile}
              />
            </div>

            {status === 'parsing' && <p className="import-hint">Parsing…</p>}

            {status === 'error' && (
              <p className="import-error">{errMsg}</p>
            )}

            {status === 'preview' && (
              <div className="import-preview">
                <p className="import-hint">Found <strong>{preview.length}</strong> entries. Preview (first 5):</p>
                <div className="preview-list">
                  {preview.slice(0, 5).map((a, i) => (
                    <div key={i} className="preview-item">
                      <span className="preview-title">{a.title}</span>
                      <span className="preview-section">{a.section}</span>
                    </div>
                  ))}
                  {preview.length > 5 && <div className="preview-more">…and {preview.length - 5} more</div>}
                </div>
                <div className="form-actions" style={{ borderTop: 0, paddingTop: 0 }}>
                  <button className="btn btn-ghost" onClick={() => setStatus(null)}>Cancel</button>
                  <button className="btn btn-primary" onClick={handleImport}>
                    Import {preview.length} anime
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ImportModal;
