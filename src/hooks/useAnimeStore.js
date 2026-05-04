import { useState, useCallback, useMemo } from 'react';
import INITIAL_DATA from '../data/initialData';
import { uid } from '../utils/helpers';

const STORAGE_KEY = 'trackorasen-data-v1';

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
};

const save = (data) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
  catch { /* ignore */ }
};

const buildMirror = (src) => ({
  ...src,
  id: uid(),
  section: 'completed',
  mirrorOf: src.id,
  dateAdded: src.dateAdded,
});

const hydrateMirrors = (list) => {
  const result = [...list];
  const mirroredSourceIds = new Set(result.filter(a => a.mirrorOf).map(a => a.mirrorOf));
  for (const entry of list) {
    if (entry.section === 'watchAgain' && !mirroredSourceIds.has(entry.id)) {
      const mirror = buildMirror(entry);
      result.push(mirror);
      const idx = result.findIndex(a => a.id === entry.id);
      if (idx !== -1) result[idx] = { ...result[idx], mirrorId: mirror.id };
    }
  }
  return result;
};

export const useAnimeStore = () => {
  const [list, setList] = useState(() => hydrateMirrors(load() ?? INITIAL_DATA));

  const commit = useCallback((nextOrFn) => {
    setList(prev => {
      const next = typeof nextOrFn === 'function' ? nextOrFn(prev) : nextOrFn;
      save(next);
      return next;
    });
  }, []);

  const add = useCallback((fields) => {
    const isWatchAgain = fields.section === 'watchAgain';
    const isCompleted  = fields.section === 'completed';
    const entry = {
      id: uid(),
      title: fields.title || 'Untitled',
      section: fields.section || 'watching',
      genre: fields.genre || [],
      totalEpisodes: fields.totalEpisodes ? Number(fields.totalEpisodes) : null,
      watchedEpisodes: fields.watchedEpisodes
        ? Number(fields.watchedEpisodes)
        : (isWatchAgain || isCompleted) && fields.totalEpisodes
          ? Number(fields.totalEpisodes)
          : 0,
      rating: fields.rating ? Number(fields.rating) : null,
      comment: fields.comment || '',
      seasons: fields.seasons || [],
      dateAdded: Date.now(),
    };

    if (isWatchAgain) {
      const mirror = buildMirror(entry);
      entry.mirrorId = mirror.id;
      commit(prev => [...prev, entry, mirror]);
    } else {
      commit(prev => [...prev, entry]);
    }
    return entry;
  }, [commit]);

  const update = useCallback((id, patch) => {
    commit(prev => {
      const target = prev.find(a => a.id === id);
      if (!target) return prev;

      let next = prev.map(a => a.id === id ? { ...a, ...patch } : a);

      if (target.section === 'watchAgain' && target.mirrorId) {
        const SYNC_KEYS = ['title','genre','rating','comment','seasons',
                           'totalEpisodes','watchedEpisodes'];
        const syncPatch = {};
        SYNC_KEYS.forEach(k => { if (patch[k] !== undefined) syncPatch[k] = patch[k]; });
        if (Object.keys(syncPatch).length > 0) {
          next = next.map(a => a.id === target.mirrorId ? { ...a, ...syncPatch } : a);
        }
      }
      return next;
    });
  }, [commit]);

  const remove = useCallback((id) => {
    commit(prev => {
      const target = prev.find(a => a.id === id);
      if (!target) return prev.filter(a => a.id !== id);

      if (target.section === 'watchAgain' && target.mirrorId) {
        return prev
          .filter(a => a.id !== id)
          .map(a => a.id === target.mirrorId ? { ...a, mirrorOf: undefined } : a);
      }

      if (target.mirrorOf) {
        return prev
          .filter(a => a.id !== id)
          .map(a => a.id === target.mirrorOf ? { ...a, mirrorId: undefined } : a);
      }

      return prev.filter(a => a.id !== id);
    });
  }, [commit]);

  const moveSection = useCallback((id, newSection) => {
    commit(prev => {
      const target = prev.find(a => a.id === id);
      if (!target) return prev;

      let next = prev;

      if (target.section === 'watchAgain' && target.mirrorId) {
        next = next.map(a => a.id === target.mirrorId ? { ...a, mirrorOf: undefined } : a);
      }

      next = next.map(a =>
        a.id === id ? { ...a, section: newSection, mirrorId: undefined } : a
      );

      if (newSection === 'watchAgain') {
        const moved = next.find(a => a.id === id);
        const mirror = buildMirror(moved);
        next = next.map(a => a.id === id ? { ...a, mirrorId: mirror.id } : a);
        next = [...next, mirror];
      }

      return next;
    });
  }, [commit]);

  // Bulk move all anime from one section key to another (for custom section deletion)
  const bulkMoveSection = useCallback((fromKey, toKey) => {
    commit(prev => prev.map(a => a.section === fromKey ? { ...a, section: toKey } : a));
  }, [commit]);

  const setWatched = useCallback((id, n) => {
    update(id, { watchedEpisodes: Math.max(0, n) });
  }, [update]);

  const setSeasonWatched = useCallback((animeId, seasonId, n) => {
    commit(prev => {
      const target = prev.find(a => a.id === animeId);
      if (!target) return prev;
      const updatedSeasons = target.seasons.map(s =>
        s.id === seasonId ? { ...s, watchedEp: Math.max(0, n) } : s
      );
      let next = prev.map(a => a.id === animeId ? { ...a, seasons: updatedSeasons } : a);
      if (target.section === 'watchAgain' && target.mirrorId) {
        next = next.map(a =>
          a.id === target.mirrorId ? { ...a, seasons: updatedSeasons } : a
        );
      }
      return next;
    });
  }, [commit]);

  const reset = useCallback(() => {
    commit(hydrateMirrors(INITIAL_DATA));
  }, [commit]);

  // Import from MAL/AniList — merges by title (case-insensitive), skips duplicates
  const importAnime = useCallback((entries, mode = 'merge') => {
    commit(prev => {
      if (mode === 'replace') {
        return hydrateMirrors(entries);
      }
      // merge: skip entries whose title already exists
      const existing = new Set(prev.map(a => a.title.toLowerCase()));
      const newEntries = entries.filter(e => !existing.has((e.title || '').toLowerCase()));
      return hydrateMirrors([...prev, ...newEntries]);
    });
  }, [commit]);

  // Overwrite entire list — used by cloud sync when remote data arrives
  const loadList = useCallback((newList) => {
    commit(newList);
  }, [commit]);

  const bySection = useMemo(() => {
    const map = {};
    for (const a of list) {
      if (!map[a.section]) map[a.section] = [];
      map[a.section].push(a);
    }
    return map;
  }, [list]);

  return {
    list,
    bySection,
    add,
    update,
    remove,
    moveSection,
    bulkMoveSection,
    setWatched,
    setSeasonWatched,
    reset,
    importAnime,
    loadList,
  };
};
