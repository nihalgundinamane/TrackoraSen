import React, { useState, useCallback } from 'react';
import './WatchPicker.css';

const WatchPicker = ({ list, onClose, onMoveToWatching }) => {
  const [picked, setPicked]     = useState(null);
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory]   = useState([]);
  const [moved, setMoved]       = useState(false);

  const spin = useCallback(() => {
    if (list.length === 0 || spinning) return;
    setSpinning(true);
    setMoved(false);
    setPicked(null);

    let ticks = 0;
    const maxTicks = 20 + Math.floor(Math.random() * 14);
    let delay = 60;

    const tick = () => {
      const rand = list[Math.floor(Math.random() * list.length)];
      setPicked(rand);
      ticks++;

      if (ticks >= maxTicks) {
        setSpinning(false);
        setHistory(h => [rand, ...h].slice(0, 5));
        return;
      }

      delay = Math.min(delay * 1.12, 380);
      setTimeout(tick, delay);
    };

    setTimeout(tick, delay);
  }, [list, spinning]);

  const handleMove = useCallback(() => {
    if (!picked || moved) return;
    onMoveToWatching(picked.id);
    setMoved(true);
  }, [picked, moved, onMoveToWatching]);

  const handleSpinAgain = () => {
    setMoved(false);
    spin();
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()} role="dialog" aria-modal="true">
      <div className="modal-box picker-modal">
        <div className="modal-title">
          <span>🎲 What to Watch?</span>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <p className="picker-sub">
          Spinning from your <strong>{list.length}</strong> entries in "Next to Watch"
        </p>

        <div className={`picker-display${spinning ? ' spinning' : ''}${picked && !spinning ? ' landed' : ''}`}>
          {picked ? (
            <>
              <div className="picker-title">{picked.title}</div>
              {picked.genre?.length > 0 && (
                <div className="picker-genres">
                  {picked.genre.slice(0, 3).map(g => (
                    <span key={g} className="genre-tag">{g}</span>
                  ))}
                </div>
              )}
              {picked.totalEpisodes && (
                <div className="picker-eps">{picked.totalEpisodes} eps</div>
              )}
              {moved && (
                <div className="picker-moved-badge">✅ Moved to Now Watching!</div>
              )}
            </>
          ) : (
            <div className="picker-placeholder">Press spin!</div>
          )}
        </div>

        <div className="picker-actions">
          {/* Primary spin/re-spin */}
          <button
            className={`btn btn-primary picker-spin-btn${spinning ? ' spinning' : ''}`}
            onClick={picked ? handleSpinAgain : spin}
            disabled={spinning}
          >
            {spinning ? '🎲 Spinning…' : picked ? '🎲 Spin Again' : '🎲 Spin!'}
          </button>

          {/* Move to watching — only after landing, before moved */}
          {picked && !spinning && !moved && (
            <button className="btn btn-ghost picker-move-btn" onClick={handleMove}>
              ▶ Start Watching
            </button>
          )}

          <button className="btn btn-ghost" onClick={onClose}>
            {moved ? 'Done' : 'Close'}
          </button>
        </div>

        {history.length > 0 && (
          <div className="picker-history">
            <span className="filter-label">Recent spins</span>
            {history.map((a, i) => (
              <div key={`${a.id}-${i}`} className="history-item">
                <span>{a.title}</span>
                {i === 0 && moved && <span className="history-moved">→ Watching</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WatchPicker;
