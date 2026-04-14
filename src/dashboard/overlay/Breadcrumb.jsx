import { useDashboard } from '../../contexts/DashboardContext';
import { useBreadcrumb } from '../../hooks/useEntity';
import styles from './Breadcrumb.module.css';

export default function Breadcrumb() {
  const { level, selectedIds, goToLevel } = useDashboard();
  const { data: rawCrumbs } = useBreadcrumb(level, selectedIds);

  if (level === 'country' || !rawCrumbs) return null;

  // Odisha has no region step — hide the synthetic single-region crumb.
  const crumbs = rawCrumbs.filter((c) => c.level !== 'region');

  return (
    <nav className={styles.breadcrumb} aria-label="Navigation">
      {crumbs.map((crumb, i) => (
        <span key={crumb.level} className={styles.item}>
          {i > 0 && (
            <svg aria-hidden="true" className={styles.chevron} width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M5 2l5 5-5 5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
          {i < crumbs.length - 1 ? (
            <button className={styles.link} onClick={() => goToLevel(crumb.level)}>
              {crumb.name}
            </button>
          ) : (
            <span className={styles.current}>{crumb.name}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
