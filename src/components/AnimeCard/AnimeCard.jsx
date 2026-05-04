import React, { useState, useCallback, useRef, useEffect } from 'react';
import { progress, totalWatched, totalEpisodes } from '../../utils/helpers';
import './AnimeCard.css';

const Stars = ({ rating }) => {
  if (!rating) return null;
  return (
    <div className="star-row" aria-label={`Rating: ${rating} out of 10`}>
      {Array.from({ length: 5 }, (_, i) => {
        const filled = rating / 2 > i + 0.5;
        const half = !filled && rating / 2 > i;
        return (
          <span key={i} className="star" style={{ color: filled || half ? 'var(--accent)' : 'var(--border)' }}>
            {filled ? '★' : half ? '⯨' : '☆'}
          </span>
        );
      })}
      <span className="rating-num">{rating}/10</span>
    </div>
  );
};

const ProgressBar = ({ value }) => (
  <div className="progress-track" role="progressbar" aria-valuenow={Math.round(value * 100)} aria-valuemin={0} aria-valuemax={100}>
    <div className="progress-fill" style={{ width: `${Math.round(value * 100)}%` }} />
  </div>
);

const SeasonRow = ({ season, onChangeWatched, readOnly }) => {
  const pct = season.totalEp ? Math.min(season.watchedEp / season.totalEp, 1) : 0;
  return (
    <div className="season-row">
      <div className="season-row-top">
        <span className="season-label">{season.label}</span>
        <div className="season-ep-control">
          {!readOnly && (
            <button className="ep-btn" onClick={() => onChangeWatched(Math.max(0, season.watchedEp - 1))} aria-label="Decrease episodes">−</button>
          )}
          <span className="ep-count">{season.watchedEp}/{season.totalEp ?? '?'}</span>
          {!readOnly && (
            <button className="ep-btn" onClick={() => onChangeWatched(season.totalEp ? Math.min(season.totalEp, season.watchedEp + 1) : season.watchedEp + 1)} aria-label="Increase episodes">+</button>
          )}
        </div>
      </div>
      <ProgressBar value={pct} />
    </div>
  );
};

const AnimeCard = ({ anime, onEdit, onDelete, onSeasonWatched, onWatchedChange, registerRef, style }) => {
  const [seasonsOpen, setSeasonsOpen] = useState(false);
  const cardEl = useRef(null);
  useEffect(() => { if (registerRef) registerRef(anime.id, cardEl.current); }, [anime.id, registerRef]);

  // A completed mirror (mirrorOf is set) is read-only — edits go through the Watch Again source
  const isMirror = Boolean(anime.mirrorOf);

  const hasSeasons = (anime.seasons || []).length > 0;
  const watched    = totalWatched(anime);
  const total      = totalEpisodes(anime);
  const pct        = progress(anime);

  const toggleSeasons = useCallback((e) => {
    e.stopPropagation();
    setSeasonsOpen(v => !v);
  }, []);

  const handleEpChange = useCallback((delta) => {
    if (isMirror) return;
    const next   = Math.max(0, anime.watchedEpisodes + delta);
    const capped = anime.totalEpisodes ? Math.min(anime.totalEpisodes, next) : next;
    onWatchedChange(anime.id, capped);
  }, [anime, isMirror, onWatchedChange]);

  return (
    <article ref={cardEl} className={`anime-card${isMirror ? ' mirror-card' : ''}`} style={style} aria-label={anime.title}>

      {/* Mirror badge — shown on completed entries that are auto-copies of Watch Again */}
      {isMirror && (
        <div className="mirror-badge" title="Auto-added from Watch Again">
          🔁 Watch Again
        </div>
      )}

      {/* Header */}
      <div className="card-header">
        <h3 className="card-title">{anime.title}</h3>
        <div className="card-actions">
          {isMirror ? (
            <span className="card-btn mirror-lock" title="Edit via Watch Again section">🔒</span>
          ) : (
            <button className="card-btn" onClick={() => onEdit(anime)} aria-label="Edit">✏</button>
          )}
          {/* Mirrors can be individually deleted from Completed without removing the watchAgain source */}
          <button className="card-btn danger" onClick={() => onDelete(anime.id)} aria-label="Delete">✕</button>
        </div>
      </div>

      {/* Genre tags */}
      {anime.genre?.length > 0 && (
        <div className="card-genres">
          {anime.genre.slice(0, 3).map(g => (
            <span key={g} className="genre-tag">{g}</span>
          ))}
        </div>
      )}

      {/* Rating */}
      <Stars rating={anime.rating} />

      {/* Episode tracker (flat) */}
      {!hasSeasons && (
        <div className="card-eps">
          <div className="ep-row">
            {!isMirror && (
              <button className="ep-btn" onClick={() => handleEpChange(-1)} aria-label="Remove episode">−</button>
            )}
            <span className="ep-count">
              {anime.watchedEpisodes}/{anime.totalEpisodes ?? '?'} ep
            </span>
            {!isMirror && (
              <button className="ep-btn" onClick={() => handleEpChange(1)} aria-label="Add episode">+</button>
            )}
          </div>
          <ProgressBar value={pct} />
        </div>
      )}

      {/* Seasons summary + expand */}
      {hasSeasons && (
        <div className="card-seasons-wrap">
          <div className="card-eps">
            <span className="ep-count">{watched}/{total || '?'} ep total</span>
            <ProgressBar value={pct} />
          </div>
          <button
            className={`card-seasons-toggle${seasonsOpen ? ' open' : ''}`}
            onClick={toggleSeasons}
            aria-expanded={seasonsOpen}
          >
            <span className="seasons-expand-icon">▶</span>
            {anime.seasons.length} season{anime.seasons.length !== 1 ? 's' : ''}
          </button>

          {seasonsOpen && (
            <div className="card-seasons-panel">
              {anime.seasons.map(s => (
                <SeasonRow
                  key={s.id}
                  season={s}
                  readOnly={isMirror}
                  onChangeWatched={(n) => onSeasonWatched(anime.id, s.id, n)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comment */}
      {anime.comment && (
        <p className="card-comment">"{anime.comment}"</p>
      )}
    </article>
  );
};

export default React.memo(AnimeCard);
