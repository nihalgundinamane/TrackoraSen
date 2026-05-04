import React, { useState, useEffect, useCallback, useRef } from 'react';
import { uid } from '../../utils/helpers';
import './Modal.css';

// SECTIONS is now passed as prop — removed hardcoded constant

const GENRE_SUGGESTIONS = [
  'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Harem',
  'Historical', 'Horror', 'Isekai', 'Idol', 'Martial Arts', 'Mecha',
  'Medical', 'Music', 'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life',
  'Sports', 'Supernatural', 'Thriller', 'Dark', 'Game', 'Cultivation',
];

const defaultForm = (anime) => ({
  title: anime?.title || '',
  section: anime?.section || 'future',
  genre: anime?.genre ? anime.genre.join(', ') : '',
  totalEpisodes: anime?.totalEpisodes ?? '',
  watchedEpisodes: anime?.watchedEpisodes ?? 0,
  rating: anime?.rating ?? '',
  comment: anime?.comment || '',
  seasons: anime?.seasons ? anime.seasons.map(s => ({ ...s })) : [],
});

const EditModal = ({ anime, sections, onClose, onSave, onDelete }) => {
  const [form, setForm] = useState(() => defaultForm(anime));
  const [genreInput, setGenreInput] = useState(anime?.genre?.join(', ') || '');
  const [genreSuggestions, setGenreSuggestions] = useState([]);
  const overlayRef = useRef(null);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  const set = useCallback((k, v) => {
    setForm(f => ({ ...f, [k]: v }));
  }, []);

  const handleGenreInput = (val) => {
    setGenreInput(val);
    set('genre', val);
    const last = val.split(',').pop().trim();
    if (last.length > 1) {
      setGenreSuggestions(
        GENRE_SUGGESTIONS.filter(g =>
          g.toLowerCase().startsWith(last.toLowerCase()) &&
          !val.split(',').map(x => x.trim()).includes(g)
        ).slice(0, 6)
      );
    } else {
      setGenreSuggestions([]);
    }
  };

  const pickGenre = (g) => {
    const parts = genreInput.split(',').map(x => x.trim()).filter(Boolean);
    parts[parts.length - 1] = g;
    const next = parts.join(', ') + ', ';
    setGenreInput(next);
    set('genre', next);
    setGenreSuggestions([]);
  };

  // Season editor helpers
  const addSeason = () => {
    set('seasons', [
      ...form.seasons,
      { id: uid(), label: `Season ${form.seasons.length + 1}`, totalEp: '', watchedEp: 0 },
    ]);
  };

  const removeSeason = (id) => {
    set('seasons', form.seasons.filter(s => s.id !== id));
  };

  const updateSeason = (id, k, v) => {
    set('seasons', form.seasons.map(s =>
      s.id === id
        ? { ...s, [k]: (k === 'totalEp' || k === 'watchedEp') ? (parseInt(v) || 0) : v }
        : s
    ));
  };

  const handleSave = () => {
    const genres = form.genre
      .split(',')
      .map(g => g.trim())
      .filter(Boolean);

    onSave({
      title: form.title.trim(),
      section: form.section,
      genre: genres,
      totalEpisodes: form.totalEpisodes !== '' ? Number(form.totalEpisodes) : null,
      watchedEpisodes: Number(form.watchedEpisodes) || 0,
      rating: form.rating !== '' ? Number(form.rating) : null,
      comment: form.comment,
      seasons: form.seasons.map(s => ({
        ...s,
        totalEp: s.totalEp !== '' ? Number(s.totalEp) : null,
        watchedEp: Number(s.watchedEp) || 0,
      })),
    });
  };

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div className="modal-overlay" ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal="true" aria-label="Edit anime">
      <div className="modal-box">
        <div className="modal-title">
          <span>{anime ? 'Edit Anime' : 'Add Anime'}</span>
          <button className="modal-close" onClick={onClose} aria-label="Close modal">✕</button>
        </div>

        {/* Title */}
        <div className="field-group">
          <label className="field-label">Title</label>
          <input
            className="field-input"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            placeholder="Anime title…"
            autoFocus
          />
        </div>

        {/* Section */}
        <div className="field-group">
          <label className="field-label">Section</label>
          <select className="field-input" value={form.section} onChange={e => set('section', e.target.value)}>
            {(sections || []).map(s => (
              <option key={s.key} value={s.key}>{s.label}</option>
            ))}
          </select>
        </div>

        {/* Genre */}
        <div className="field-group genre-field-wrap">
          <label className="field-label">Genres (comma-separated)</label>
          <input
            className="field-input"
            value={genreInput}
            onChange={e => handleGenreInput(e.target.value)}
            placeholder="Action, Romance, Fantasy…"
          />
          {genreSuggestions.length > 0 && (
            <div className="genre-suggestions">
              {genreSuggestions.map(g => (
                <button key={g} className="genre-suggest-btn" onMouseDown={() => pickGenre(g)}>
                  {g}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Episodes — only if no seasons */}
        {form.seasons.length === 0 && (
          <div className="field-row">
            <div className="field-group">
              <label className="field-label">Total Episodes</label>
              <input
                className="field-input"
                type="number"
                min="0"
                value={form.totalEpisodes}
                onChange={e => set('totalEpisodes', e.target.value)}
                placeholder="?"
              />
            </div>
            <div className="field-group">
              <label className="field-label">Watched</label>
              <input
                className="field-input"
                type="number"
                min="0"
                value={form.watchedEpisodes}
                onChange={e => set('watchedEpisodes', e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Rating */}
        <div className="field-group">
          <label className="field-label">Rating (1–10)</label>
          <div className="rating-picker">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                className={`rating-pip${Number(form.rating) === n ? ' active' : ''}`}
                onClick={() => set('rating', Number(form.rating) === n ? '' : n)}
                aria-label={`Rate ${n}`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="field-group">
          <label className="field-label">Notes / Comment</label>
          <textarea
            className="field-input field-textarea"
            value={form.comment}
            onChange={e => set('comment', e.target.value)}
            placeholder="Your thoughts…"
            rows={2}
          />
        </div>

        {/* ── SEASON EDITOR ── */}
        <div className="field-group seasons-section">
          <div className="seasons-header">
            <span className="field-label" style={{ marginBottom: 0 }}>Seasons</span>
            <button className="btn btn-ghost add-season-btn" onClick={addSeason}>+ Add Season</button>
          </div>

          {form.seasons.length === 0 && (
            <p className="seasons-empty-hint">
              No seasons defined — using flat episode count above.
            </p>
          )}

          {form.seasons.map((s, idx) => (
            <div key={s.id} className="season-edit-row">
              <input
                className="field-input"
                placeholder={`Season ${idx + 1} name`}
                value={s.label}
                onChange={e => updateSeason(s.id, 'label', e.target.value)}
              />
              <input
                className="field-input"
                type="number"
                min="0"
                placeholder="Ep total"
                value={s.totalEp === null ? '' : s.totalEp}
                onChange={e => updateSeason(s.id, 'totalEp', e.target.value)}
              />
              <input
                className="field-input"
                type="number"
                min="0"
                placeholder="Watched"
                value={s.watchedEp}
                onChange={e => updateSeason(s.id, 'watchedEp', e.target.value)}
              />
              <button
                className="season-remove-btn"
                onClick={() => removeSeason(s.id)}
                aria-label={`Remove ${s.label}`}
              >
                🗑
              </button>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="form-actions">
          {anime && (
            <button
              className="btn btn-ghost danger-btn"
              onClick={() => { onDelete(anime.id); onClose(); }}
            >
              Delete
            </button>
          )}
          <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" onClick={handleSave}>
            {anime ? 'Save Changes' : 'Add Anime'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
