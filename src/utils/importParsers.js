import { uid } from './helpers';

const MAL_STATUS_MAP = {
  'Watching':       'watching',
  'Completed':      'completed',
  'On-Hold':        'watching',
  'Dropped':        'future',
  'Plan to Watch':  'future',
};

const ANILIST_STATUS_MAP = {
  'CURRENT':    'watching',
  'COMPLETED':  'completed',
  'PAUSED':     'watching',
  'DROPPED':    'future',
  'PLANNING':   'future',
  'REPEATING':  'watchAgain',
};

/**
 * Parse MAL XML export into TrackoraSen entries.
 */
export const parseMalXml = (xmlText) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, 'application/xml');

  const parseError = doc.querySelector('parsererror');
  if (parseError) throw new Error('Invalid XML file.');

  const entries = [];
  const animes = doc.querySelectorAll('anime');

  animes.forEach(node => {
    const get = (tag) => node.querySelector(tag)?.textContent?.trim() || '';
    const title    = get('series_title') || get('series_animedb_id');
    const status   = get('my_status');
    const score    = parseInt(get('my_score')) || null;
    const watched  = parseInt(get('my_watched_episodes')) || 0;
    const total    = parseInt(get('series_episodes')) || null;

    if (!title) return;

    entries.push({
      id: uid(),
      title,
      section: MAL_STATUS_MAP[status] || 'future',
      genre: [],
      totalEpisodes: total,
      watchedEpisodes: watched,
      rating: score && score > 0 ? score : null,
      comment: '',
      seasons: [],
      dateAdded: Date.now(),
    });
  });

  return entries;
};

/**
 * Parse AniList JSON export OR TrackoraSen native backup into entries.
 */
export const parseAnilistJson = (jsonText) => {
  let data;
  try {
    data = JSON.parse(jsonText);
  } catch {
    throw new Error('Invalid JSON file.');
  }

  // ── TrackoraSen native backup (flat array with 'section' field) ──
  // Detected when: it's an array AND the first item has a 'section' field
  // that is one of our known section keys. Pass through as-is.
  const KNOWN_SECTIONS = new Set(['watching','future','airing','watchAgain','completed']);
  if (Array.isArray(data) && data.length > 0 && KNOWN_SECTIONS.has(data[0]?.section)) {
    // Native TrackoraSen backup — preserve everything exactly
    return data.map(entry => ({
      ...entry,
      // Ensure id exists (generate if missing)
      id: entry.id || uid(),
    }));
  }

  // ── AniList exports ──
  // Can be { lists: [...] } or { data: { MediaListCollection: { lists: [...] } } }
  let lists = [];
  if (Array.isArray(data?.lists)) {
    lists = data.lists;
  } else if (data?.data?.MediaListCollection?.lists) {
    lists = data.data.MediaListCollection.lists;
  } else if (Array.isArray(data)) {
    // Flat array but not TrackoraSen format — treat as AniList flat
    return data.map(entry => flatAnilistEntry(entry));
  } else {
    throw new Error('Unrecognised format. Expected a TrackoraSen backup or AniList export.');
  }

  const entries = [];
  lists.forEach(list => {
    (list.entries || []).forEach(entry => {
      entries.push(flatAnilistEntry(entry));
    });
  });

  return entries;
};

const flatAnilistEntry = (entry) => {
  const media  = entry.media || entry;
  const title  = media?.title?.english || media?.title?.romaji || media?.title?.native || entry.title || 'Unknown';
  const status = entry.status || 'PLANNING';
  const score  = entry.score || null;
  const prog   = entry.progress || 0;
  const total  = media?.episodes || null;

  return {
    id: uid(),
    title,
    section: ANILIST_STATUS_MAP[status] || 'future',
    genre: (media?.genres || []).slice(0, 5),
    totalEpisodes: total,
    watchedEpisodes: prog,
    rating: score && score > 0 ? Math.round(score / 10) : null,
    comment: entry.notes || '',
    seasons: [],
    dateAdded: Date.now(),
  };
};
