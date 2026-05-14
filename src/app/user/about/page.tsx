'use client';

import './about.css';

const features = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    title: 'World atlas',
    description:
      'Browse books by geography — click any country on the interactive map to see all books tagged to that location.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    title: 'Timeline filter',
    description:
      'Travel across six historical eras from Ancient to Post-war and see which books belong to each period.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 8 22 16" /><line x1="18" y1="12" x2="22" y2="12" />
        <polyline points="2 8 2 16" /><line x1="2" y1="12" x2="6" y2="12" />
        <line x1="6" y1="12" x2="18" y2="12" />
      </svg>
    ),
    title: 'Deep filtering',
    description:
      'Narrow your search by language, type, star rating, publication year, and a full library of subject tags.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: 'Rated reviews',
    description:
      'Every book is rated 1–5 stars with a full written review covering scholarly merit and narrative quality.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
      </svg>
    ),
    title: 'Reading list',
    description:
      'Save any book to your personal reading list and track your average rating across your saved collection.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49M7.76 7.76a6 6 0 0 0 0 8.49" />
      </svg>
    ),
    title: 'Admin panel',
    description:
      'Add, edit, and manage books, categories, and tags through the built-in admin dashboard — no coding needed.',
  },
];

export default function AboutPage() {
  return (
    <div className="about-page">
      <section className="about-intro">
        <h1 className="about-title">About</h1>
        <p className="about-body">
          HistoryBookMap is a new way to explore the world through books. Browse hundreds of reviews
          organised by geography, time period, and subject matter on an interactive world atlas.
        </p>
        <p className="about-accent">
          Click any country on the map to see books tagged to it. Use the era timeline to travel
          between historical periods. Filter by category, language, rating, and subject tags to find
          exactly what you are looking for.
        </p>
      </section>

      {/* Feature cards grid */}
      <section className="about-features" aria-label="Platform features">
        {features.map((f) => (
          <div key={f.title} className="about-feature-card">
            <span className="about-feature-icon" aria-hidden="true">{f.icon}</span>
            <h2 className="about-feature-title">{f.title}</h2>
            <p className="about-feature-desc">{f.description}</p>
          </div>
        ))}
      </section>

      {/* About the reviewer */}
      <section className="about-reviewer">
        <h2 className="about-reviewer-title">About the reviewer</h2>
        <p className="about-reviewer-body">
          This site collects reviews written over many years across multiple platforms. The collection
          spans 300+ books covering all periods and regions of world history, with a focus on
          accessible narrative history for the general reader.
        </p>
        <p className="about-reviewer-body">
          Reviews are written in English with select titles available in French. New reviews are added
          regularly as the collection continues to grow.
        </p>
      </section>
    </div>
  );
}
