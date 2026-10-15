import type { ReactNode } from 'react';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description?: string;
  compact?: boolean;
  children?: ReactNode;
};

/**
 * Shared dark header for public and private pages.
 * Home retains its distinct photographic hero.
 */
export default function PageHero({ eyebrow, title, description, compact = false, children }: PageHeroProps) {
  return (
    <section className={compact ? 'page-hero page-hero--compact' : 'page-hero'}>
      <div className="wrap page-hero-content">
        <span className="eyebrow page-hero-eyebrow">
          <span className="hero-eyebrow-line" aria-hidden="true" />
          {eyebrow}
        </span>
        <h1 className="page-title">{title}</h1>
        {description && <p className="page-hero-description">{description}</p>}
        {children && <div className="page-hero-actions">{children}</div>}
      </div>
    </section>
  );
}
