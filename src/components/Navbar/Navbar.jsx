import React, { useState, useCallback, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import './Navbar.css';

const NAV_LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/list', label: 'My List' },
  { to: '/stats', label: 'Stats' },
];

const THEME_OPTIONS = [
  { key: 'sakura',   label: '🌸 Sakura'   },
  { key: 'manga',    label: '📖 Manga'    },
  { key: 'nightink', label: '🌙 Night Ink' },
];

const STATUS_CFG = {
  idle:    { icon: '☁', label: 'Not synced', cls: 'idle'    },
  syncing: { icon: '↻', label: 'Syncing…',   cls: 'syncing' },
  synced:  { icon: '✓', label: 'Synced',      cls: 'synced'  },
  error:   { icon: '⚠', label: 'Sync error', cls: 'error'   },
  offline: { icon: '✗', label: 'Offline',     cls: 'offline' },
};

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" width="13" height="13" style={{flexShrink:0}}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const Navbar = ({
  theme, setTheme, animeList,
  // sync + auth props
  user, syncStatus, onLogin, onLogout, onExport, onImportClick,
}) => {
  const [query, setQuery]     = useState('');
  const [results, setResults] = useState([]);
  const [open, setOpen]       = useState(''); // '' | 'search' | 'theme' | 'user'
  const searchRef = useRef(null);
  const themeRef  = useRef(null);
  const userRef   = useRef(null);
  const navigate  = useNavigate();

  const s = STATUS_CFG[syncStatus] || STATUS_CFG.idle;

  /* ── Search ── */
  const search = useCallback((q) => {
    setQuery(q);
    if (!q.trim()) { setResults([]); setOpen(''); return; }
    const lower = q.toLowerCase();
    const seen  = new Set();
    const found = (animeList || []).filter(a => {
      if (!a.title.toLowerCase().includes(lower)) return false;
      if (seen.has(a.title)) return false;
      seen.add(a.title);
      return true;
    }).slice(0, 8);
    setResults(found);
    setOpen(found.length ? 'search' : '');
  }, [animeList]);

  const pick = (anime) => {
    setQuery(''); setResults([]); setOpen('');
    navigate('/list', { state: { highlight: anime.mirrorOf || anime.id } });
  };

  /* ── Close on outside click ── */
  useEffect(() => {
    const handler = (e) => {
      if (!searchRef.current?.contains(e.target) && open === 'search') setOpen('');
      if (!themeRef.current?.contains(e.target)  && open === 'theme')  setOpen('');
      if (!userRef.current?.contains(e.target)   && open === 'user')   setOpen('');
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const currentTheme = THEME_OPTIONS.find(t => t.key === theme) || THEME_OPTIONS[0];

  return (
    <nav className="navbar" role="navigation" aria-label="Main navigation">
      <div className="navbar-inner">

        {/* ── Logo ── */}
        <NavLink to="/" className="nav-logo" aria-label="TrackoraSen home">
          <img src="/trackorasen-logo.png" alt="TrackoraSen" className="logo-img" />
        </NavLink>

        {/* ── Nav links ── */}
        <div className="nav-links">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to} to={to} end={end}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* ── Search — centred via flex auto margins ── */}
        <div className="nav-search" ref={searchRef}>
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            className="search-input"
            type="search"
            placeholder="Search anime…"
            value={query}
            onChange={e => search(e.target.value)}
            onFocus={() => results.length && setOpen('search')}
            aria-label="Search anime"
          />
          {open === 'search' && (
            <div className="search-dropdown" role="listbox">
              {results.map(a => (
                <button key={a.id} className="search-result" role="option" onMouseDown={() => pick(a)}>
                  <span className="result-title">{a.title}</span>
                  <span className="result-section">
                    {a.section === 'completed' && a.mirrorOf ? 'watchAgain' : a.section}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT SIDE: Export · Import · Theme · User/Login ── */}
        <div className="nav-right">

          {/* Export */}
          <button className="nav-icon-btn" onClick={onExport} title="Export backup">
            ⬇
          </button>

          {/* Import */}
          <button className="nav-icon-btn" onClick={onImportClick} title="Import backup">
            ⬆
          </button>

          {/* Theme picker */}
          <div className="theme-selector" ref={themeRef}>
            <button
              className="theme-current-btn"
              onClick={() => setOpen(o => o === 'theme' ? '' : 'theme')}
              aria-label="Change theme"
            >
              <span className="theme-current-label">{currentTheme.label}</span>
              <span className="theme-chevron">{open === 'theme' ? '▲' : '▼'}</span>
            </button>
            {open === 'theme' && (
              <div className="theme-dropdown">
                {THEME_OPTIONS.map(t => (
                  <button
                    key={t.key}
                    className={`theme-option${theme === t.key ? ' active' : ''}`}
                    onMouseDown={() => { setTheme(t.key); setOpen(''); }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* User area / Login */}
          {user ? (
            <div className="nav-user" ref={userRef}>
              {/* Sync pill */}
              <div className={`sync-pill ${s.cls}`} title={s.label}>
                <span className={`sync-pill-icon${syncStatus === 'syncing' ? ' spin' : ''}`}>{s.icon}</span>
                <span className="sync-pill-label">{s.label}</span>
              </div>

              {/* Avatar */}
              <button
                className="nav-avatar-btn"
                onClick={() => setOpen(o => o === 'user' ? '' : 'user')}
                title={user.displayName || user.email}
              >
                {user.photoURL
                  ? <img src={user.photoURL} alt="" className="nav-avatar-img" />
                  : <span className="nav-avatar-initial">
                      {(user.displayName || user.email || '?')[0].toUpperCase()}
                    </span>
                }
              </button>

              {open === 'user' && (
                <div className="nav-user-dropdown">
                  <div className="nud-name">{user.displayName || user.email}</div>
                  <div className="nud-email">{user.email}</div>
                  <hr className="nud-divider" />
                  <button className="nud-item" onMouseDown={() => { onImportClick(); setOpen(''); }}>
                    ⬆ Import backup
                  </button>
                  <button className="nud-item" onMouseDown={() => { onExport(); setOpen(''); }}>
                    ⬇ Export backup
                  </button>
                  <hr className="nud-divider" />
                  <button className="nud-item danger" onMouseDown={() => { onLogout(); setOpen(''); }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="nav-login-btn" onClick={onLogin} title="Sign in to sync across devices">
              <GoogleIcon />
              <span>Sign in</span>
            </button>
          )}

        </div>
      </div>
    </nav>
  );
};

export default React.memo(Navbar);
