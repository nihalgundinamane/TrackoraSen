import React, { useState } from 'react';
import './SyncBar.css';

const STATUS_ICON = {
  idle:    { icon: '☁',  label: 'Not synced',  cls: 'idle'    },
  syncing: { icon: '↻',  label: 'Syncing…',    cls: 'syncing' },
  synced:  { icon: '✓',  label: 'Synced',       cls: 'synced'  },
  error:   { icon: '⚠',  label: 'Sync error',  cls: 'error'   },
  offline: { icon: '✗',  label: 'Offline',      cls: 'offline' },
};

const SyncBar = ({ user, isLoading, syncStatus, onLogin, onLogout, onExport, onImportClick }) => {
  const [showMenu, setShowMenu] = useState(false);
  const s = STATUS_ICON[syncStatus] || STATUS_ICON.idle;

  if (isLoading) return null;

  return (
    <div className="sync-bar">
      {/* Export button — always visible */}
      <button className="sync-btn export-btn" onClick={onExport} title="Export your list as JSON backup">
        ⬇ Export
      </button>

      {user ? (
        <div className="sync-user-area">
          {/* Sync status pill */}
          <div className={`sync-status-pill ${s.cls}`} title={s.label}>
            <span className={`sync-icon${syncStatus === 'syncing' ? ' spin' : ''}`}>{s.icon}</span>
            <span className="sync-label">{s.label}</span>
          </div>

          {/* User avatar / menu */}
          <button
            className="sync-avatar-btn"
            onClick={() => setShowMenu(v => !v)}
            title={user.displayName || user.email}
          >
            {user.photoURL
              ? <img src={user.photoURL} alt={user.displayName} className="sync-avatar-img" />
              : <span className="sync-avatar-initial">{(user.displayName || user.email || '?')[0].toUpperCase()}</span>
            }
          </button>

          {showMenu && (
            <div className="sync-dropdown" onMouseLeave={() => setShowMenu(false)}>
              <div className="sync-user-name">{user.displayName || user.email}</div>
              <div className="sync-user-email">{user.email}</div>
              <hr className="sync-divider" />
              <button className="sync-menu-item" onClick={() => { onImportClick(); setShowMenu(false); }}>
                ⬆ Import backup
              </button>
              <button className="sync-menu-item danger" onClick={() => { onLogout(); setShowMenu(false); }}>
                Sign out
              </button>
            </div>
          )}
        </div>
      ) : (
        <button className="sync-btn login-btn" onClick={onLogin} title="Sign in with Google to sync across devices">
          <svg className="google-icon" viewBox="0 0 24 24" width="14" height="14">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sync across devices
        </button>
      )}
    </div>
  );
};

export default SyncBar;
