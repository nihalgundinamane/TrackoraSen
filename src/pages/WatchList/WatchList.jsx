import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import SectionBlock from '../../components/AnimeCard/SectionBlock';
import EditModal from '../../components/Modal/EditModal';
import FilterBar from '../../components/Filter/FilterBar';
import SectionsManager from '../../components/SectionsManager/SectionsManager';
import WatchPicker from '../../components/WatchPicker/WatchPicker';
import ImportModal from '../../components/Import/ImportModal';
import Petals from '../../components/Petals/Petals';
import './WatchList.css';

const WatchList = ({
  bySection, onAdd, onUpdate, onDelete, onWatchedChange, onSeasonWatched,
  onBulkMove, onImport, onMoveToWatching,
  sections,
  onAddSection, onRenameSection, onRemoveSection, onReorderSection, onResetSections,
  sectionIcons,
}) => {
  const [modal, setModal]         = useState(null);
  const [showManager, setManager] = useState(false);
  const [showPicker, setPicker]   = useState(false);
  const [showImport, setImport]   = useState(false);
  const [filters, setFilters]     = useState({ genres: [], ratingMin: null, ratingMax: null, progress: 'all' });
  const [highlightId, setHighlight] = useState(null);
  const cardRefs = useRef({});
  const location = useLocation();

  // Scroll-to-highlight when navigated from search
  useEffect(() => {
    const id = location.state?.highlight;
    if (!id) return;
    setHighlight(id);
    // Give DOM a moment to render
    setTimeout(() => {
      const el = cardRefs.current[id];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlighted');
        setTimeout(() => el.classList.remove('highlighted'), 2000);
      }
    }, 300);
    // Clear state so back-navigation doesn't re-trigger
    window.history.replaceState({}, '');
  }, [location.state]);

  const registerCardRef = useCallback((id, el) => {
    if (el) cardRefs.current[id] = el;
  }, []);

  const openAdd  = useCallback((section) => setModal({ anime: null, defaultSection: section }), []);
  const openEdit = useCallback((anime) => {
    if (anime.mirrorOf) return;
    setModal({ anime, defaultSection: anime.section });
  }, []);
  const closeModal = useCallback(() => setModal(null), []);

  const handleSave = useCallback((fields) => {
    if (modal.anime) onUpdate(modal.anime.id, fields);
    else onAdd({ ...fields, section: fields.section || modal.defaultSection });
    closeModal();
  }, [modal, onAdd, onUpdate, closeModal]);

  const handleDelete = useCallback((id) => {
    onDelete(id);
    closeModal();
  }, [onDelete, closeModal]);

  // Apply filters to an anime array
  const applyFilters = useCallback((anime) => {
    return anime.filter(a => {
      if (filters.genres.length > 0 && !filters.genres.some(g => (a.genre || []).includes(g))) return false;
      if (filters.ratingMin !== null && (a.rating || 0) < filters.ratingMin) return false;
      if (filters.ratingMax !== null && (a.rating || 0) > filters.ratingMax) return false;
      if (filters.progress === 'completed' && a.watchedEpisodes < (a.totalEpisodes || Infinity)) return false;
      if (filters.progress === 'inprogress' && (a.watchedEpisodes === 0 || a.watchedEpisodes >= (a.totalEpisodes || Infinity))) return false;
      if (filters.progress === 'notstarted' && a.watchedEpisodes > 0) return false;
      return true;
    });
  }, [filters]);

  const totalTracked = Object.values(bySection).flat().length;
  const hasActiveFilters = filters.genres.length > 0 || filters.ratingMin || filters.ratingMax || filters.progress !== 'all';
  const futureList = bySection['future'] || [];

  // All genres from entire list for filter suggestions
  const allGenres = [...new Set(Object.values(bySection).flat().flatMap(a => a.genre || []))].sort();

  return (
    <main className="page sakura-bg watchlist-page">
      <Petals />

      <div className="container watchlist-container">
        <div className="watchlist-hero">
          <div className="watchlist-hero-left">
            <h1 className="watchlist-h1">My Anime List</h1>
            <p className="watchlist-sub">{totalTracked} anime tracked</p>
          </div>
          <div className="watchlist-hero-actions">
            {futureList.length > 0 && (
              <button className="btn btn-primary" onClick={() => setPicker(true)}>
                🎲 What to Watch?
              </button>
            )}
            <button className="btn btn-ghost" onClick={() => setImport(true)}>
              ⬆ Import
            </button>
            <button className="btn btn-ghost" onClick={() => setManager(true)}>
              ⚙ Sections
            </button>
          </div>
        </div>

        <FilterBar
          allGenres={allGenres}
          filters={filters}
          onChange={setFilters}
          hasActive={hasActiveFilters}
        />

        {sections.map(s => (
          <SectionBlock
            key={s.key}
            sectionKey={s.key}
            title={s.label}
            icon={s.icon}
            anime={applyFilters(bySection[s.key] || [])}
            rawCount={(bySection[s.key] || []).length}
            onEdit={openEdit}
            onDelete={onDelete}
            onWatchedChange={onWatchedChange}
            onSeasonWatched={onSeasonWatched}
            onAdd={() => openAdd(s.key)}
            registerCardRef={registerCardRef}
          />
        ))}
      </div>

      {modal && (
        <EditModal
          anime={modal.anime}
          sections={sections}
          onClose={closeModal}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}

      {showManager && (
        <SectionsManager
          sections={sections}
          onAdd={onAddSection}
          onRename={onRenameSection}
          onRemove={(key) => { onRemoveSection(key); onBulkMove(key, 'future'); }}
          onReorder={onReorderSection}
          onReset={onResetSections}
          onClose={() => setManager(false)}
          icons={sectionIcons}
        />
      )}

      {showPicker && (
        <WatchPicker
          list={futureList}
          onClose={() => setPicker(false)}
          onMoveToWatching={(id) => { onMoveToWatching(id); }}
        />
      )}

      {showImport && (
        <ImportModal
          onImport={onImport}
          onClose={() => setImport(false)}
        />
      )}
    </main>
  );
};

export default WatchList;
