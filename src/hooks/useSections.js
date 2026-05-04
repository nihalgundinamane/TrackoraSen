import { useState, useCallback } from 'react';

const STORAGE_KEY = 'trackorasen-sections-v1';

export const DEFAULT_SECTIONS = [
  { key: 'watching',   label: 'Now Watching',     icon: '▶',  isDefault: true,  mirrorSource: false },
  { key: 'future',     label: 'Next to Watch',     icon: '🎯', isDefault: true,  mirrorSource: false },
  { key: 'airing',     label: 'Airing in Future',  icon: '📡', isDefault: true,  mirrorSource: false },
  { key: 'watchAgain', label: 'Watch Again',        icon: '🔁', isDefault: true,  mirrorSource: true  },
  { key: 'completed',  label: 'Completed',          icon: '✅', isDefault: true,  mirrorSource: false },
];

const SECTION_ICONS = ['📺','🎬','🗂','💾','🏆','🗑','⏸','📌','🔥','💎','🌟','🎭','🎪','👀','🧪'];

const load = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
};

const persist = (sections) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(sections)); } catch { /* ignore */ }
};

export const useSections = () => {
  const [sections, setSections] = useState(() => load() ?? DEFAULT_SECTIONS);

  const commit = useCallback((next) => {
    persist(next);
    setSections(next);
  }, []);

  const addSection = useCallback((label, icon) => {
    const key = 'custom_' + Date.now().toString(36);
    const next = [...sections, { key, label, icon: icon || '📺', isDefault: false, mirrorSource: false }];
    commit(next);
    return key;
  }, [sections, commit]);

  const renameSection = useCallback((key, label) => {
    commit(sections.map(s => s.key === key ? { ...s, label } : s));
  }, [sections, commit]);

  const removeSection = useCallback((key) => {
    // Cannot remove default sections
    commit(sections.filter(s => s.key !== key || s.isDefault));
  }, [sections, commit]);

  const reorderSection = useCallback((fromKey, toKey) => {
    const next = [...sections];
    const fromIdx = next.findIndex(s => s.key === fromKey);
    const toIdx   = next.findIndex(s => s.key === toKey);
    if (fromIdx === -1 || toIdx === -1) return;
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    commit(next);
  }, [sections, commit]);

  const resetSections = useCallback(() => {
    commit(DEFAULT_SECTIONS);
  }, [commit]);

  return { sections, addSection, renameSection, removeSection, reorderSection, resetSections, SECTION_ICONS };
};
