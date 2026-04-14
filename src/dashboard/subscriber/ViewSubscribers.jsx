import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useAllEntities } from '../../hooks/useEntity';
import { formatINR, fmtShort, EASE_OUT_EXPO } from '../../utils/finance';
import { useDashboard } from '../../contexts/DashboardContext';
import { getInitials } from '../../utils/dashboard';
import styles from './ViewSubscribers.module.css';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function agentName(sub, agentsMap)        { return agentsMap[sub.parentId]?.name || ''; }
function branchOfSub(sub, agentsMap, bMap){ const a = agentsMap[sub.parentId]; return a ? (bMap[a.parentId]?.name || '') : ''; }
function districtOfSub(sub, agentsMap, bMap, dMap) {
  const a = agentsMap[sub.parentId]; if (!a) return '';
  const b = bMap[a.parentId];        if (!b) return '';
  return dMap[b.parentId]?.name || '';
}
function regionIdOfSub(sub, agentsMap, bMap, dMap) {
  const a = agentsMap[sub.parentId]; if (!a) return null;
  const b = bMap[a.parentId];        if (!b) return null;
  const d = dMap[b.parentId];        return d ? d.parentId : null;
}

function activityLevel(sub) {
  if (!sub.isActive) return 'low';
  const recent = sub.contributionHistory.slice(-3).reduce((s, v) => s + v, 0);
  if (recent > 9000) return 'high';
  if (recent > 3000) return 'mid';
  return 'low';
}

const SORT_OPTIONS = [
  { key: 'contributions', label: 'Contributions', fn: (a, b) => b.totalContributions - a.totalContributions },
  { key: 'recent',        label: 'Recently joined', fn: (a, b) => b.registeredDate.localeCompare(a.registeredDate) },
  { key: 'name',          label: 'Name (A–Z)', fn: (a, b) => a.name.localeCompare(b.name) },
  { key: 'age',           label: 'Age', fn: (a, b) => a.age - b.age },
];

/* ── Icons ───────────────────────────────────────────────────────────────── */
const Icons = {
  people: (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" width="16" height="16">
      <circle cx="10" cy="6" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.5 18v-.5a6.5 6.5 0 0113 0v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
  active: (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" width="16" height="16">
      <path d="M10 2a8 8 0 110 16 8 8 0 010-16z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  contributions: (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" width="16" height="16">
      <path d="M2 18V6l4-4h8l4 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M2 10h16M10 10v8" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),
  withdrawals: (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" width="16" height="16">
      <path d="M3 7h14v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7V5a3 3 0 016 0v2M10 11v3M10 14l-2-2M10 14l2-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

/* ── Mini bar chart for monthly contributions ────────────────────────────── */
function MiniChart({ data }) {
  const max = Math.max(...data, 1);
  const peakIdx = data.indexOf(max);
  return (
    <div className={styles.chartWrap}>
      <div className={styles.chartBars}>
        {data.map((v, i) => (
          <div
            key={i}
            className={styles.chartBar}
            data-peak={i === peakIdx}
            style={{ height: `${Math.max((v / max) * 100, 4)}%` }}
            title={`${MONTHS[i]}: ${formatINR(v)}`}
          />
        ))}
      </div>
      <div className={styles.chartLabels}>
        {MONTHS.map((m) => <span key={m} className={styles.chartLabel}>{m}</span>)}
      </div>
    </div>
  );
}

function KpiCard({ icon, label, value, suffix }) {
  return (
    <div className={styles.kpiCard}>
      <div className={styles.kpiIcon}>{icon}</div>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue}>{value}{suffix && <span className={styles.kpiSuffix}>{suffix}</span>}</div>
    </div>
  );
}

/* ── Subscriber detail view ──────────────────────────────────────────────── */
function SubscriberDetail({ sub, agentsMap, branchesMap, districtsMap }) {
  const aum = Math.max(0, sub.totalContributions - sub.totalWithdrawals);
  const monthly = sub.contributionHistory[sub.contributionHistory.length - 1] || 0;
  const regDate = new Date(sub.registeredDate).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  return (
    <div className={styles.detailContent}>
      <div className={styles.profileCard}>
        <div className={styles.profileAvatar}>{getInitials(sub.name)}</div>
        <div className={styles.profileInfo}>
          <div className={styles.profileName}>{sub.name}</div>
          <div className={styles.profileMeta}>
            <span className={styles.subStatus} data-status={sub.isActive ? 'active' : 'inactive'} />
            <span>{sub.isActive ? 'Active' : 'Inactive'}</span>
            <span>&middot;</span>
            <span style={{ textTransform: 'capitalize' }}>{sub.gender}, {sub.age}</span>
            <span>&middot;</span>
            <span>{sub.id.toUpperCase()}</span>
          </div>
          <div className={styles.profileBadges}>
            <span className={styles.kycBadge} data-kyc={sub.kycStatus}>
              KYC {sub.kycStatus}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.kpiRow}>
        <KpiCard icon={Icons.contributions} label="Contributions" value={formatINR(sub.totalContributions)} />
        <KpiCard icon={Icons.withdrawals}   label="Withdrawals"   value={formatINR(sub.totalWithdrawals)} />
        <KpiCard icon={Icons.active}        label="AUM"           value={formatINR(aum)} />
        <KpiCard icon={Icons.people}        label="Last month"    value={formatINR(monthly)} />
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Contact</div>
        <div className={styles.infoCard}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Phone</span>
            <span className={styles.infoValue}>{sub.phone}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Email</span>
            <span className={styles.infoValue}>{sub.email}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Registered</span>
            <span className={styles.infoValue}>{regDate}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Assignment</div>
        <div className={styles.infoCard}>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Agent</span>
            <span className={styles.infoValue}>{agentName(sub, agentsMap) || '—'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>Branch</span>
            <span className={styles.infoValue}>{branchOfSub(sub, agentsMap, branchesMap) || '—'}</span>
          </div>
          <div className={styles.infoRow}>
            <span className={styles.infoLabel}>District</span>
            <span className={styles.infoValue}>{districtOfSub(sub, agentsMap, branchesMap, districtsMap) || '—'}</span>
          </div>
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Monthly Contributions</div>
        <MiniChart data={sub.contributionHistory} />
      </div>

      {sub.productsHeld?.length > 0 && (
        <div className={styles.section}>
          <div className={styles.sectionTitle}>Products Held</div>
          <div className={styles.productsWrap}>
            {sub.productsHeld.map((p) => <span key={p} className={styles.productTag}>{p}</span>)}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
/*  ViewSubscribers — main panel                                              */
/* ═══════════════════════════════════════════════════════════════════════════ */
export default function ViewSubscribers() {
  const { viewSubscribersOpen, setViewSubscribersOpen } = useDashboard();

  const { data: allSubsRaw = [] }      = useAllEntities('subscriber');
  const { data: allAgentsRaw = [] }    = useAllEntities('agent');
  const { data: allBranchesRaw = [] }  = useAllEntities('branch');
  const { data: allDistrictsRaw = [] } = useAllEntities('district');
  const { data: allRegionsRaw = [] }   = useAllEntities('region');

  const AGENTS_MAP    = useMemo(() => Object.fromEntries(allAgentsRaw.map(a => [a.id, a])),    [allAgentsRaw]);
  const BRANCHES_MAP  = useMemo(() => Object.fromEntries(allBranchesRaw.map(b => [b.id, b])),  [allBranchesRaw]);
  const DISTRICTS_MAP = useMemo(() => Object.fromEntries(allDistrictsRaw.map(d => [d.id, d])), [allDistrictsRaw]);
  const REGIONS_MAP   = useMemo(() => Object.fromEntries(allRegionsRaw.map(r => [r.id, r])),   [allRegionsRaw]);

  const [view, setView] = useState('list');
  const [selectedSub, setSelectedSub] = useState(null);

  const [search, setSearch] = useState('');
  const [regionFilter, setRegionFilter] = useState(null);
  const [regionDropOpen, setRegionDropOpen] = useState(false);
  const [sortKey, setSortKey] = useState('contributions');
  const [sortDropOpen, setSortDropOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');

  const bodyRef = useRef(null);
  const regionBtnRef = useRef(null);
  const sortBtnRef = useRef(null);

  function handleClose() {
    setViewSubscribersOpen(false);
  }

  // Aggregate totals across all subscribers
  const totals = useMemo(() => {
    let active = 0, contributions = 0, aum = 0;
    for (const s of allSubsRaw) {
      if (s.isActive) active++;
      contributions += s.totalContributions;
      aum += Math.max(0, s.totalContributions - s.totalWithdrawals);
    }
    return { active, contributions, aum };
  }, [allSubsRaw]);

  // Region counts (cascaded up the hierarchy)
  const regionCounts = useMemo(() => {
    const counts = {};
    for (const s of allSubsRaw) {
      const rid = regionIdOfSub(s, AGENTS_MAP, BRANCHES_MAP, DISTRICTS_MAP);
      if (rid) counts[rid] = (counts[rid] || 0) + 1;
    }
    return counts;
  }, [allSubsRaw, AGENTS_MAP, BRANCHES_MAP, DISTRICTS_MAP]);

  const filtered = useMemo(() => {
    let list = allSubsRaw;
    if (statusFilter !== 'all') {
      const want = statusFilter === 'active';
      list = list.filter((s) => s.isActive === want);
    }
    if (regionFilter) {
      list = list.filter((s) => regionIdOfSub(s, AGENTS_MAP, BRANCHES_MAP, DISTRICTS_MAP) === regionFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.phone.includes(q) ||
        s.email.toLowerCase().includes(q) ||
        agentName(s, AGENTS_MAP).toLowerCase().includes(q)
      );
    }
    const sortOpt = SORT_OPTIONS.find((o) => o.key === sortKey) || SORT_OPTIONS[0];
    return [...list].sort(sortOpt.fn);
  }, [allSubsRaw, search, regionFilter, statusFilter, sortKey, AGENTS_MAP, BRANCHES_MAP, DISTRICTS_MAP]);

  const estimateSize = useCallback(() => 72, []);
  const virtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => bodyRef.current,
    estimateSize,
    overscan: 12,
  });

  // Reset transient state shortly after the panel closes
  useEffect(() => {
    if (viewSubscribersOpen) return;
    const t = setTimeout(() => {
      setView('list');
      setSelectedSub(null);
      setSearch('');
      setRegionFilter(null);
      setSortKey('contributions');
      setStatusFilter('all');
    }, 400);
    return () => clearTimeout(t);
  }, [viewSubscribersOpen]);

  useEffect(() => { bodyRef.current?.scrollTo(0, 0); }, [view]);

  useEffect(() => {
    if (!viewSubscribersOpen) return;
    function onKey(e) { if (e.key === 'Escape') handleClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [viewSubscribersOpen]);

  useEffect(() => {
    if (!regionDropOpen && !sortDropOpen) return;
    function handler(e) {
      if (regionDropOpen && regionBtnRef.current && !regionBtnRef.current.contains(e.target)) setRegionDropOpen(false);
      if (sortDropOpen && sortBtnRef.current && !sortBtnRef.current.contains(e.target))     setSortDropOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [regionDropOpen, sortDropOpen]);

  function handleSelect(sub) { setSelectedSub(sub); setView('detail'); }
  function handleBack()      { setView('list'); setSelectedSub(null); }

  let headerTitle    = 'Existing Subscribers';
  let headerSubtitle = `${allSubsRaw.length.toLocaleString()} subscribers across Odisha`;
  if (view === 'detail' && selectedSub) {
    headerTitle    = selectedSub.name;
    headerSubtitle = `Served by ${agentName(selectedSub, AGENTS_MAP) || '—'}`;
  }

  return (
    <>
      <AnimatePresence>
        {viewSubscribersOpen && (
          <motion.div
            key="vs-backdrop"
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewSubscribersOpen && (
          <motion.div
            key="vs-panel"
            className={styles.panel}
            initial={{ x: '100%' }}
            animate={{ x: 0,         transition: { duration: 0.55, ease: EASE_OUT_EXPO } }}
            exit={{    x: '100%',    transition: { duration: 0.55, ease: EASE_OUT_EXPO } }}
          >
            {/* Header */}
            <div className={styles.header} data-view={view}>
              <div className={styles.headerTop}>
                {view !== 'list' && (
                  <button className={styles.backBtn} onClick={handleBack} aria-label="Go back">
                    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" width="18" height="18">
                      <path d="M15 19l-7-7 7-7" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <AnimatePresence mode="wait">
                    <motion.h2
                      key={headerTitle}
                      className={styles.title}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.2 }}
                    >
                      {headerTitle}
                    </motion.h2>
                  </AnimatePresence>
                  <p className={styles.subtitle}>{headerSubtitle}</p>
                </div>
                <button className={styles.closeBtn} onClick={handleClose} aria-label="Close">
                  <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" width="18" height="18">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            {/* List-only chrome */}
            {view === 'list' && (
              <>
                <div className={styles.toolbar}>
                  <div className={styles.searchWrap}>
                    <span className={styles.searchIcon}>
                      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" width="14" height="14">
                        <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M14 14l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    </span>
                    <input
                      className={styles.searchInput}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search subscribers, phone, agent…"
                      aria-label="Search subscribers"
                      name="search"
                      autoComplete="off"
                    />
                    {search && (
                      <button className={styles.searchClear} onClick={() => setSearch('')} aria-label="Clear search">
                        <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" width="12" height="12">
                          <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div style={{ position: 'relative' }} ref={regionBtnRef}>
                    <button
                      className={styles.filterBtn}
                      data-active={!!regionFilter}
                      onClick={() => setRegionDropOpen((p) => !p)}
                    >
                      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" width="12" height="12">
                        <path d="M2 4h12M4 8h8M6 12h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                      {regionFilter ? REGIONS_MAP[regionFilter]?.name : 'Region'}
                    </button>
                    <AnimatePresence>
                      {regionDropOpen && (
                        <motion.div
                          className={styles.filterDropdown}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.12 }}
                        >
                          <button
                            className={styles.filterOption}
                            data-selected={!regionFilter}
                            onClick={() => { setRegionFilter(null); setRegionDropOpen(false); }}
                          >
                            All Regions <span className={styles.filterCount}>{allSubsRaw.length.toLocaleString()}</span>
                          </button>
                          {allRegionsRaw.map((r) => (
                            <button
                              key={r.id}
                              className={styles.filterOption}
                              data-selected={regionFilter === r.id}
                              onClick={() => { setRegionFilter(r.id); setRegionDropOpen(false); }}
                            >
                              {r.name} <span className={styles.filterCount}>{(regionCounts[r.id] || 0).toLocaleString()}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div style={{ position: 'relative' }} ref={sortBtnRef}>
                    <button
                      className={styles.filterBtn}
                      data-active={sortKey !== 'contributions'}
                      onClick={() => setSortDropOpen((p) => !p)}
                    >
                      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" width="12" height="12">
                        <path d="M4 2v12M4 14l-3-3M4 14l3-3M12 14V2M12 2l-3 3M12 2l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {SORT_OPTIONS.find((o) => o.key === sortKey)?.label || 'Sort'}
                    </button>
                    <AnimatePresence>
                      {sortDropOpen && (
                        <motion.div
                          className={styles.filterDropdown}
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          transition={{ duration: 0.12 }}
                        >
                          {SORT_OPTIONS.map((opt) => (
                            <button
                              key={opt.key}
                              className={styles.filterOption}
                              data-selected={sortKey === opt.key}
                              onClick={() => { setSortKey(opt.key); setSortDropOpen(false); }}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className={styles.statusChips}>
                  {['all', 'active', 'inactive'].map((s) => (
                    <button
                      key={s}
                      className={styles.statusChip}
                      data-active={statusFilter === s}
                      onClick={() => setStatusFilter(s)}
                    >
                      {s === 'all' ? 'All' : s === 'active' ? 'Active' : 'Inactive'}
                    </button>
                  ))}
                </div>

                <div className={styles.summaryStrip}>
                  <div className={styles.summaryChip}>
                    <span className={styles.summaryChipIcon}>{Icons.people}</span>
                    <span className={styles.summaryChipValue}>{allSubsRaw.length.toLocaleString()}</span>
                    <span className={styles.summaryChipLabel}>Subscribers</span>
                  </div>
                  <div className={styles.summaryChip}>
                    <span className={styles.summaryChipIcon}>{Icons.active}</span>
                    <span className={styles.summaryChipValue}>{totals.active.toLocaleString()}</span>
                    <span className={styles.summaryChipLabel}>Active</span>
                  </div>
                  <div className={styles.summaryChip}>
                    <span className={styles.summaryChipIcon}>{Icons.contributions}</span>
                    <span className={styles.summaryChipValue}>{fmtShort(totals.aum)}</span>
                    <span className={styles.summaryChipLabel}>AUM</span>
                  </div>
                </div>
              </>
            )}

            {/* Body */}
            <div className={styles.body} ref={bodyRef}>
              <AnimatePresence mode="wait">
                {view === 'list' && (
                  <motion.div
                    key="vs-list"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                  >
                    <div className={styles.listCount}>
                      Showing {filtered.length.toLocaleString()} of {allSubsRaw.length.toLocaleString()} subscribers
                    </div>

                    {filtered.length === 0 ? (
                      <div className={styles.emptyState}>
                        <div className={styles.emptyIcon}>
                          <svg aria-hidden="true" viewBox="0 0 48 48" fill="none" width="48" height="48">
                            <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="1.5" />
                            <path d="M16 20h16M16 28h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                          </svg>
                        </div>
                        <div className={styles.emptyTitle}>No subscribers found</div>
                        <div className={styles.emptyDesc}>Try adjusting your search or filters</div>
                      </div>
                    ) : (
                      <div
                        className={styles.virtualList}
                        style={{ height: `${virtualizer.getTotalSize()}px` }}
                      >
                        {virtualizer.getVirtualItems().map((vRow) => {
                          const sub = filtered[vRow.index];
                          const lvl = activityLevel(sub);
                          return (
                            <button
                              key={sub.id}
                              className={styles.subItem}
                              onClick={() => handleSelect(sub)}
                              data-index={vRow.index}
                              ref={virtualizer.measureElement}
                              style={{
                                position: 'absolute',
                                top: 0,
                                left: 'var(--space-5)',
                                right: 'var(--space-5)',
                                width: 'auto',
                                transform: `translateY(${vRow.start}px)`,
                              }}
                            >
                              <div className={styles.subAvatar}>{getInitials(sub.name)}</div>
                              <div className={styles.subInfo}>
                                <div className={styles.subName}>{sub.name}</div>
                                <div className={styles.subMeta}>
                                  <span className={styles.subStatus} data-status={sub.isActive ? 'active' : 'inactive'} />
                                  <span>{sub.isActive ? 'Active' : 'Inactive'}</span>
                                  <span>&middot;</span>
                                  <span>{agentName(sub, AGENTS_MAP) || '—'}</span>
                                </div>
                              </div>
                              <div className={styles.subStats}>
                                <div className={styles.stat}>
                                  <span className={styles.statValue}>{fmtShort(sub.totalContributions)}</span>
                                  <span className={styles.statLabel}>Contrib</span>
                                </div>
                                <span className={styles.activityBadge} data-level={lvl}>
                                  {lvl === 'high' ? 'High' : lvl === 'mid' ? 'Med' : 'Low'}
                                </span>
                              </div>
                              <span className={styles.chevron}>
                                <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" width="14" height="14">
                                  <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </motion.div>
                )}

                {view === 'detail' && selectedSub && (
                  <motion.div
                    key="vs-detail"
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
                  >
                    <SubscriberDetail
                      sub={selectedSub}
                      agentsMap={AGENTS_MAP}
                      branchesMap={BRANCHES_MAP}
                      districtsMap={DISTRICTS_MAP}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
