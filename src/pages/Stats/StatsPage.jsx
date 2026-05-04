import React, { useMemo } from 'react';
import Petals from '../../components/Petals/Petals';
import {
  totalWatched, totalEpisodes, totalMinutesWatched,
  formatWatchTime, genreFrequency, AVG_EP_MINUTES
} from '../../utils/helpers';
import './StatsPage.css';

const StatCard = ({ label, value, sub, delay = 0 }) => (
  <div className="stats-card" style={{ animationDelay: `${delay}ms` }}>
    <span className="stats-card-value">{value}</span>
    <span className="stats-card-label">{label}</span>
    {sub && <span className="stats-card-sub">{sub}</span>}
  </div>
);

const GenreBar = ({ genre, count, max }) => {
  const pct = max ? (count / max) * 100 : 0;
  return (
    <div className="genre-bar-row">
      <span className="genre-bar-name">{genre}</span>
      <div className="genre-bar-track">
        <div
          className="genre-bar-fill"
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={Math.round(pct)}
        />
      </div>
      <span className="genre-bar-count">{count}</span>
    </div>
  );
};

const RatingHistogram = ({ animeList }) => {
  const bins = useMemo(() => {
    const map = {};
    for (let i = 1; i <= 10; i++) map[i] = 0;
    animeList.filter(a => a.rating).forEach(a => { map[a.rating] = (map[a.rating] || 0) + 1; });
    return map;
  }, [animeList]);

  const max = Math.max(...Object.values(bins), 1);

  return (
    <div className="histogram">
      {Object.entries(bins).map(([r, n]) => (
        <div key={r} className="histo-col">
          <span className="histo-count">{n || ''}</span>
          <div className="histo-bar-wrap">
            <div
              className="histo-bar"
              style={{ height: `${(n / max) * 100}%` }}
            />
          </div>
          <span className="histo-label">{r}</span>
        </div>
      ))}
    </div>
  );
};

const StatsPage = ({ animeList }) => {
  const watching = animeList.filter(a => a.section === 'watching');
  const future = animeList.filter(a => a.section === 'future');
  const watchAgain = animeList.filter(a => a.section === 'watchAgain');
  const completed = animeList.filter(a => a.section === 'completed');
  const airing = animeList.filter(a => a.section === 'airing');

  const totalMin = totalMinutesWatched(animeList);
  const totalEp = animeList.reduce((s, a) => s + totalWatched(a), 0);

  const rated = animeList.filter(a => a.rating);
  const avgRating = rated.length
    ? (rated.reduce((s, a) => s + a.rating, 0) / rated.length).toFixed(1)
    : '—';

  const topRated = [...animeList]
    .filter(a => a.rating)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);

  const genres = genreFrequency(animeList);
  const maxGenreCount = genres[0]?.[1] || 1;

  const completionRates = [
    { label: 'Watching', count: watching.length, color: 'var(--accent)' },
    { label: 'Future', count: future.length, color: 'var(--text-muted)' },
    { label: 'Watch Again', count: watchAgain.length, color: 'var(--accent2)' },
    { label: 'Completed', count: completed.length, color: '#4CAF50' },
    { label: 'Airing', count: airing.length, color: '#00b8d4' },
  ];
  const totalForDonut = animeList.length || 1;

  return (
    <main className="page sakura-bg stats-page">
      <Petals />

      <div className="container stats-container">
        <div className="stats-hero">
          <h1 className="stats-h1">Stats Dashboard</h1>
          <p className="stats-sub">{animeList.length} anime in your universe</p>
        </div>

        {/* Top stat cards */}
        <div className="stats-grid">
          <StatCard label="Total Watch Time" value={formatWatchTime(totalMin)} sub={`≈ ${Math.round(totalMin / 1440)} days`} delay={0} />
          <StatCard label="Episodes Watched" value={totalEp.toLocaleString()} sub="across all anime" delay={60} />
          <StatCard label="Average Rating" value={avgRating} sub={`${rated.length} rated`} delay={120} />
          <StatCard label="Anime Tracked" value={animeList.length} sub="in total" delay={180} />
        </div>

        {/* Section breakdown + Top rated */}
        <div className="stats-row-2">
          {/* Section breakdown donut-like */}
          <div className="stats-panel">
            <h2 className="panel-title">Section Breakdown</h2>
            <div className="breakdown-list">
              {completionRates.map(({ label, count, color }) => {
                const pct = Math.round((count / totalForDonut) * 100);
                return (
                  <div key={label} className="breakdown-row">
                    <span className="breakdown-dot" style={{ background: color }} />
                    <span className="breakdown-label">{label}</span>
                    <div className="breakdown-bar-track">
                      <div
                        className="breakdown-bar-fill"
                        style={{ width: `${pct}%`, background: color }}
                      />
                    </div>
                    <span className="breakdown-count">{count}</span>
                  </div>
                );
              })}
            </div>

            <div className="watch-time-detail">
              <h3 className="panel-subtitle">Watch Time Breakdown</h3>
              {[
                { label: 'Watching', list: watching },
                { label: 'Watch Again', list: watchAgain },
                { label: 'Completed', list: completed },
              ].map(({ label, list }) => (
                <div key={label} className="wt-row">
                  <span className="wt-label">{label}</span>
                  <span className="wt-value">{formatWatchTime(totalMinutesWatched(list))}</span>
                </div>
              ))}
              <div className="wt-row wt-total">
                <span className="wt-label">Total</span>
                <span className="wt-value accent">{formatWatchTime(totalMin)}</span>
              </div>
            </div>
          </div>

          {/* Top rated */}
          <div className="stats-panel">
            <h2 className="panel-title">Top Rated</h2>
            {topRated.length === 0 ? (
              <p className="panel-empty">Rate some anime to see rankings!</p>
            ) : (
              <div className="top-rated-list">
                {topRated.map((a, i) => (
                  <div key={a.id} className="top-rated-row">
                    <span className="top-rank">#{i + 1}</span>
                    <span className="top-title">{a.title}</span>
                    <span className="top-rating">★ {a.rating}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Rating histogram */}
        <div className="stats-panel histogram-panel">
          <h2 className="panel-title">Rating Distribution</h2>
          {rated.length === 0 ? (
            <p className="panel-empty">No ratings yet.</p>
          ) : (
            <RatingHistogram animeList={animeList} />
          )}
        </div>

        {/* Genre breakdown */}
        <div className="stats-panel">
          <h2 className="panel-title">Top Genres</h2>
          {genres.length === 0 ? (
            <p className="panel-empty">Add genre tags to your anime to see the breakdown.</p>
          ) : (
            <div className="genre-bars">
              {genres.map(([g, n]) => (
                <GenreBar key={g} genre={g} count={n} max={maxGenreCount} />
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default StatsPage;
