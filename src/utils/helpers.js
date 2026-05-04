/**
 * Utility helpers — pure functions, no side effects.
 */

/** Average episode length in minutes used for watch-time estimation */
export const AVG_EP_MINUTES = 23;

/**
 * Given an anime object, return the total watched episode count
 * (summing across seasons if present).
 */
export const totalWatched = (anime) => {
  if (anime.seasons?.length > 0) {
    return anime.seasons.reduce((sum, s) => sum + (s.watchedEp || 0), 0);
  }
  return anime.watchedEpisodes || 0;
};

/**
 * Given an anime object, return the total episode count
 * (summing across seasons if present).
 */
export const totalEpisodes = (anime) => {
  if (anime.seasons?.length > 0) {
    return anime.seasons.reduce((sum, s) => sum + (s.totalEp || 0), 0);
  }
  return anime.totalEpisodes || 0;
};

/** Progress 0–1 */
export const progress = (anime) => {
  const total = totalEpisodes(anime);
  const watched = totalWatched(anime);
  if (!total) return 0;
  return Math.min(watched / total, 1);
};

/** Minutes watched across a list of anime */
export const totalMinutesWatched = (list) =>
  list.reduce((sum, a) => sum + totalWatched(a) * AVG_EP_MINUTES, 0);

/** Format minutes into "Xd Xh Xm" */
export const formatWatchTime = (minutes) => {
  const days = Math.floor(minutes / 1440);
  const hours = Math.floor((minutes % 1440) / 60);
  const mins = Math.floor(minutes % 60);
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (mins || !parts.length) parts.push(`${mins}m`);
  return parts.join(' ');
};

/** Collect genre frequency map from a list of anime */
export const genreFrequency = (list) => {
  const map = {};
  for (const a of list) {
    for (const g of (a.genre || [])) {
      map[g] = (map[g] || 0) + 1;
    }
  }
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12);
};

/** Sort comparators */
export const SORT_OPTIONS = [
  { key: 'title', label: 'Title A–Z' },
  { key: 'rating', label: 'Top Rated' },
  { key: 'progress', label: 'Progress' },
  { key: 'dateAdded', label: 'Date Added' },
];

export const sortAnime = (list, key) => {
  const copy = [...list];
  switch (key) {
    case 'title':
      return copy.sort((a, b) => a.title.localeCompare(b.title));
    case 'rating':
      return copy.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'progress':
      return copy.sort((a, b) => progress(b) - progress(a));
    case 'dateAdded':
      return copy.sort((a, b) => b.dateAdded - a.dateAdded);
    default:
      return copy;
  }
};

/** Generate a unique id */
export const uid = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

/** Debounce helper */
export const debounce = (fn, delay) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};

/** Clamp a number */
export const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
