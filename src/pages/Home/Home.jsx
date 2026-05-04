import React from 'react';
import { Link } from 'react-router-dom';
import Petals from '../../components/Petals/Petals';
import { totalMinutesWatched, formatWatchTime } from '../../utils/helpers';
import './Home.css';

const StatBubble = ({ label, value, delay = 0 }) => (
  <div className="stat-bubble" style={{ animationDelay: `${delay}ms` }}>
    <span className="bubble-value">{value}</span>
    <span className="bubble-label">{label}</span>
  </div>
);

const Home = ({ animeList }) => {
  const watching = animeList.filter(a => a.section === 'watching').length;
  const nextUp = animeList.filter(a => a.section === 'future').length;
  const airingCount = animeList.filter(a => a.section === 'airing').length;
  const total = animeList.length;
  const watchTime = formatWatchTime(totalMinutesWatched(animeList));
  const rated = animeList.filter(a => a.rating).length;
  const avgRating = rated
    ? (animeList.reduce((s, a) => s + (a.rating || 0), 0) / rated).toFixed(1)
    : '—';

  return (
    <main className="page sakura-bg home-page">
      <Petals />

      <div className="home-halftone" aria-hidden="true" />

      <div className="home-hero container">
        <p className="hero-eyebrow">Your Personal Anime Universe</p>
        <h1 className="hero-h1">
          Track Every <span>Episode</span>,<br />
          Every <span>Season</span>,<br />
          Every <span>Feeling</span>
        </h1>
        <p className="hero-sub">
          A beautiful, private tracker for everything you watch, love, and plan to watch.
        </p>
        <div className="hero-ctas">
          <Link to="/list" className="btn btn-primary hero-btn">
            Open My List →
          </Link>
          <Link to="/stats" className="btn btn-ghost hero-btn">
            View Stats
          </Link>
        </div>
      </div>

      {/* Stats strip */}
      <div className="home-stats container">
        <StatBubble label="Tracking" value={total} delay={100} />
        <StatBubble label="Now Watching" value={watching} delay={160} />
        <StatBubble label="Next Up" value={nextUp} delay={220} />
        <StatBubble label="Airing" value={airingCount} delay={260} />
        <StatBubble label="Watch Time" value={watchTime} delay={280} />
        <StatBubble label="Avg Rating" value={avgRating} delay={340} />
      </div>

      {/* Feature highlights */}
      <div className="home-features container">
        {[
          { icon: '🌸', title: 'Two Themes', desc: 'Sakura dark mode and crisp Manga print aesthetic.' },
          { icon: '📺', title: 'Season Cards', desc: 'Multi-season anime in one card with expandable arcs.' },
          { icon: '✏️', title: 'Season Editor', desc: 'Add, rename, remove seasons and track episodes per arc.' },
          { icon: '📊', title: 'Watch Stats', desc: 'Hours watched, genre breakdown, rating distribution.' },
        ].map((f, i) => (
          <div key={f.title} className="feature-card" style={{ animationDelay: `${i * 80}ms` }}>
            <span className="feature-icon">{f.icon}</span>
            <h3 className="feature-title">{f.title}</h3>
            <p className="feature-desc">{f.desc}</p>
          </div>
        ))}
      </div>
    </main>
  );
};

export default Home;
