import React, { useState } from 'react';
import './FilterBar.css';

const PROGRESS_OPTIONS = [
  { key: 'all',         label: 'All' },
  { key: 'notstarted',  label: 'Not Started' },
  { key: 'inprogress',  label: 'In Progress' },
  { key: 'completed',   label: '100% Done' },
];

const FilterBar = ({ allGenres, filters, onChange, hasActive }) => {
  const [open, setOpen] = useState(false);

  const toggleGenre = (g) => {
    const next = filters.genres.includes(g)
      ? filters.genres.filter(x => x !== g)
      : [...filters.genres, g];
    onChange({ ...filters, genres: next });
  };

  const clear = () => onChange({ genres: [], ratingMin: null, ratingMax: null, progress: 'all' });

  return (
    <div className="filter-bar">
      <div className="filter-bar-top">
        <button
          className={`filter-toggle-btn${open ? ' open' : ''}${hasActive ? ' has-active' : ''}`}
          onClick={() => setOpen(v => !v)}
        >
          <span>⚡ Filter</span>
          {hasActive && <span className="filter-dot" />}
          <span className="filter-chevron">{open ? '▲' : '▼'}</span>
        </button>
        {hasActive && (
          <button className="filter-clear-btn" onClick={clear}>Clear filters</button>
        )}
      </div>

      {open && (
        <div className="filter-panel">
          {/* Genre multi-select */}
          <div className="filter-group">
            <span className="filter-label">Genre</span>
            <div className="filter-tags">
              {allGenres.map(g => (
                <button
                  key={g}
                  className={`filter-tag${filters.genres.includes(g) ? ' active' : ''}`}
                  onClick={() => toggleGenre(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          {/* Rating range */}
          <div className="filter-group filter-row">
            <div>
              <span className="filter-label">Min Rating</span>
              <div className="rating-range-pills">
                {[null,1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button
                    key={n ?? 'any'}
                    className={`range-pill${filters.ratingMin === n ? ' active' : ''}`}
                    onClick={() => onChange({ ...filters, ratingMin: n })}
                  >
                    {n ?? 'Any'}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="filter-label">Max Rating</span>
              <div className="rating-range-pills">
                {[null,1,2,3,4,5,6,7,8,9,10].map(n => (
                  <button
                    key={n ?? 'any'}
                    className={`range-pill${filters.ratingMax === n ? ' active' : ''}`}
                    onClick={() => onChange({ ...filters, ratingMax: n })}
                  >
                    {n ?? 'Any'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Progress */}
          <div className="filter-group">
            <span className="filter-label">Progress</span>
            <div className="filter-tags">
              {PROGRESS_OPTIONS.map(o => (
                <button
                  key={o.key}
                  className={`filter-tag${filters.progress === o.key ? ' active' : ''}`}
                  onClick={() => onChange({ ...filters, progress: o.key })}
                >
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterBar;
