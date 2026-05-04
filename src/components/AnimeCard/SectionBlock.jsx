import React, { useState, useMemo } from 'react';
import AnimeCard from '../AnimeCard/AnimeCard';
import { sortAnime, SORT_OPTIONS } from '../../utils/helpers';
import './SectionBlock.css';

const SectionBlock = ({
  title, icon, anime, rawCount,
  onEdit, onDelete, onWatchedChange, onSeasonWatched,
  onAdd, defaultSort = 'dateAdded',
  registerCardRef,
}) => {
  const [sortKey, setSortKey]   = useState(defaultSort);
  const [collapsed, setCollapsed] = useState(false);

  const sorted = useMemo(() => sortAnime(anime, sortKey), [anime, sortKey]);

  const displayCount = rawCount !== undefined && rawCount !== anime.length
    ? `${anime.length} / ${rawCount}`
    : anime.length;

  return (
    <section className="section-block" aria-label={title}>
      <div className="section-header">
        <button
          className="section-title-btn"
          onClick={() => setCollapsed(v => !v)}
          aria-expanded={!collapsed}
        >
          <span className="section-collapse-icon">{collapsed ? '▶' : '▼'}</span>
          <span className="section-icon">{icon}</span>
          <span className="section-title">{title}</span>
          <span className="section-count">{displayCount}</span>
        </button>

        <div className="section-controls">
          <div className="sort-bar" role="group" aria-label="Sort options">
            <span className="sort-label">Sort</span>
            {SORT_OPTIONS.map(o => (
              <button
                key={o.key}
                className={`sort-btn${sortKey === o.key ? ' active' : ''}`}
                onClick={() => setSortKey(o.key)}
                aria-pressed={sortKey === o.key}
              >
                {o.label}
              </button>
            ))}
          </div>
          <button className="btn btn-ghost add-btn" onClick={onAdd} aria-label={`Add to ${title}`}>
            + Add
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="card-grid">
          {sorted.length === 0 ? (
            <div className="empty-state">Nothing here yet — add your first anime!</div>
          ) : (
            sorted.map((a, i) => (
              <AnimeCard
                key={a.id}
                anime={a}
                onEdit={onEdit}
                onDelete={onDelete}
                onWatchedChange={onWatchedChange}
                onSeasonWatched={onSeasonWatched}
                registerRef={registerCardRef}
                style={{ animationDelay: `${Math.min(i * 40, 400)}ms` }}
              />
            ))
          )}
        </div>
      )}
    </section>
  );
};

export default React.memo(SectionBlock);
