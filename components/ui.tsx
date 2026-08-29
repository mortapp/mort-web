import Link from 'next/link'
import { Fragment } from 'react'

// Calibrated Liquid Glass: shared visual primitives favor clear labels and honest states over decorative but misleading copy.

// =====================================================================
// PAGE HEADER
// =====================================================================
interface PageHeaderProps {
  title: string
  eyebrow?: string
  description?: string
  children?: React.ReactNode
}

export function PageHeaderWithActions({ title, eyebrow, description, children }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div className="page-header-text">
        {eyebrow && <div className="page-header-eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p className="page-header-desc">{description}</p>}
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </div>
  )
}
// Preferred name per design system spec — same component.
export const PageHeader = PageHeaderWithActions

// =====================================================================
// GLASS CARD
// =====================================================================
interface GlassCardProps {
  children: React.ReactNode
  href?: string
  variant?: 'default' | 'highlight' | 'danger' | 'info'
  hoverable?: boolean
  className?: string
  style?: React.CSSProperties
}

export function GlassCard({ children, href, variant = 'default', hoverable, className = '', style }: GlassCardProps) {
  const variantCls = variant === 'highlight' ? 'highlight' : variant === 'danger' ? 'danger-card' : variant === 'info' ? 'info-card' : ''
  const cls = `card ${variantCls} ${hoverable ? 'hoverable' : ''} ${className}`.trim()
  if (href) return <Link href={href} className={cls} style={style}>{children}</Link>
  return <div className={cls} style={style}>{children}</div>
}

// =====================================================================
// MORT BUTTON
// =====================================================================
type ButtonVariant = 'primary' | 'ghost' | 'danger' | 'safe' | 'info' | 'sos'
interface MortButtonProps {
  children: React.ReactNode
  href?: string
  variant?: ButtonVariant
  size?: 'sm' | 'md' | 'lg'
  full?: boolean
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  name?: string
  value?: string
  onClick?: () => void
  className?: string
}

export function MortButton({ children, href, variant = 'ghost', size = 'md', full, type = 'button', disabled, name, value, onClick, className = '' }: MortButtonProps) {
  const sizeCls = size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : ''
  const cls = `btn ${variant} ${sizeCls} ${full ? 'full' : ''} ${className}`.trim()
  if (href) return <Link href={href} className={cls}>{children}</Link>
  return (
    <button type={type} className={cls} disabled={disabled} name={name} value={value} onClick={onClick}>
      {children}
    </button>
  )
}

// =====================================================================
// STATUS BADGE — covers every enum value used across the MORT schema
// =====================================================================
const statusMap: Record<string, { cls: string; label: string }> = {
  // applications
  submitted: { cls: 'blue', label: 'Submitted' },
  guardian_pending: { cls: 'yellow', label: 'Guardian review' },
  guardian_rejected: { cls: 'red', label: 'Guardian rejected' },
  adult_review: { cls: 'yellow', label: 'In review' },
  accepted: { cls: 'blue', label: 'Accepted' },
  rejected: { cls: 'red', label: 'Rejected' },
  completed: { cls: 'green', label: 'Completed' },
  disputed: { cls: 'red', label: 'Disputed' },
  // jobs
  draft: { cls: 'muted', label: 'Draft' },
  open: { cls: 'rose', label: 'Open' },
  paused: { cls: 'yellow', label: 'Paused' },
  filled: { cls: 'blue', label: 'Filled' },
  closed: { cls: 'muted', label: 'Closed' },
  removed: { cls: 'red', label: 'Removed' },
  // guardian connections
  invited: { cls: 'yellow', label: 'Invited' },
  active: { cls: 'blue', label: 'Active' },
  // verification / account
  not_started: { cls: 'muted', label: 'Not started' },
  pending: { cls: 'yellow', label: 'Pending' },
  approved: { cls: 'green', label: 'Approved' },
  suspended: { cls: 'red', label: 'Suspended' },
  banned: { cls: 'red', label: 'Banned' },
  // safety pings
  ok: { cls: 'green', label: 'Safe' },
  needs_help: { cls: 'red', label: 'Needs help' },
  missed: { cls: 'yellow', label: 'Missed' },
  // reports
  reviewing: { cls: 'yellow', label: 'Reviewing' },
  resolved: { cls: 'green', label: 'Resolved' },
  dismissed: { cls: 'muted', label: 'Dismissed' },
  // messages
  clean: { cls: 'green', label: 'Clean' },
  flagged: { cls: 'yellow', label: 'Flagged' },
  blocked: { cls: 'red', label: 'Blocked' },
  // support tickets
  in_progress: { cls: 'yellow', label: 'In progress' },
  // fallback
  none: { cls: 'muted', label: 'Not set' },
}

export function Status({ value }: { value?: string | null }) {
  if (!value) return null
  const s = statusMap[value] || { cls: 'muted', label: value.replace(/_/g, ' ') }
  return <span className={`status ${s.cls}`}>{s.label}</span>
}
// Preferred name per design system spec — same component.
export const StatusBadge = Status

// =====================================================================
// ROLE BADGE
// =====================================================================
const roleIcons: Record<string, string> = { teen: '🔥', adult: '💼', guardian: '🛡️', admin: '🔐', none: '·' }
export function RoleBadge({ role }: { role?: string | null }) {
  const key = role || 'none'
  return <span className={`role-badge ${key}`}>{roleIcons[key] || '·'} {key}</span>
}

// =====================================================================
// METRIC CARD
// =====================================================================
interface MetricCardProps {
  label: string
  value: React.ReactNode
  sub?: React.ReactNode
  icon?: string
  color?: string
  trend?: { direction: 'up' | 'down'; label: string }
}
export function MetricCard({ label, value, sub, icon, color, trend }: MetricCardProps) {
  return (
    <div className="metric-card">
      {icon && <div className="metric-card-icon">{icon}</div>}
      <span className="small">{label}</span>
      <strong style={color ? { color } : undefined}>{value}</strong>
      {sub && <div className="metric-card-sub">{sub}</div>}
      {trend && <div className={`metric-card-trend ${trend.direction}`}>{trend.direction === 'up' ? '↑' : '↓'} {trend.label}</div>}
    </div>
  )
}

// =====================================================================
// DANGER ZONE
// =====================================================================
interface DangerZoneProps {
  title: string
  description?: string
  children: React.ReactNode
}
export function DangerZone({ title, description, children }: DangerZoneProps) {
  return (
    <div className="danger-zone">
      <h3>{title}</h3>
      {description && <p>{description}</p>}
      {children}
    </div>
  )
}

// =====================================================================
// EMPTY STATE
// =====================================================================
interface EmptyStateProps {
  icon?: string
  title: string
  text?: string
  href?: string
  action?: string
}

export function EmptyState({ icon = '📭', title, text, href, action }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {href && action && (
        <Link href={href} className="btn primary" style={{ marginTop: 8, display: 'inline-flex' }}>
          {action}
        </Link>
      )}
    </div>
  )
}

// =====================================================================
// CATEGORY PILL
// =====================================================================
export const categoryColors: Record<string, string> = {
  'dog walking': 'rose',
  'lawn care': 'rose',
  'cleaning': 'blue',
  'tutoring': 'blue',
  'errands': 'yellow',
  'trash help': 'yellow',
  'car washing': 'blue',
  'snow shoveling': 'blue',
  'babysitting': 'yellow',
  'general': 'muted',
}

export const categoryIcons: Record<string, string> = {
  'dog walking': '🐕',
  'lawn care': '🌿',
  'cleaning': '🧹',
  'tutoring': '📚',
  'errands': '🛒',
  'trash help': '🗑️',
  'car washing': '🚗',
  'snow shoveling': '❄️',
  'babysitting': '👶',
  'raking leaves': '🍂',
  'moving': '📦',
  'event help': '🎉',
  'general': '⚡',
}

export function CategoryPill({ category }: { category?: string | null }) {
  if (!category) return null
  const key = category.toLowerCase()
  const color = categoryColors[key] || 'muted'
  const icon = categoryIcons[key] || '⚡'
  return <span className={`pill ${color}`}>{icon} {category}</span>
}

// =====================================================================
// CATEGORY TILE — the big, visual entry point for a job category
// (tutoring, lawn care, dog walking...) instead of a small text pill.
// This is the "main point" of the product made literally the biggest
// thing on the page: real categories, real counts, real color.
// =====================================================================
interface CategoryTileProps {
  category: string
  label?: string
  count?: number
  href: string
  active?: boolean
}
export function CategoryTile({ category, label, count, href, active }: CategoryTileProps) {
  const key = category.toLowerCase()
  const color = categoryColors[key] || 'muted'
  const icon = categoryIcons[key] || '⚡'
  return (
    <Link href={href} className={`category-tile ${active ? 'active' : ''}`}>
      <div className={`category-tile-icon ${color}`}>{icon}</div>
      <h3 className="category-tile-label">{label || category}</h3>
      <span className="category-tile-count">
        {count && count > 0 ? `${count} open job${count === 1 ? '' : 's'}` : 'Explore jobs'}
      </span>
    </Link>
  )
}

// =====================================================================
// JOB CARD — hierarchy: icon tile (fast scan) → title + price on one row
// (price is the accent color, top-right, so it doesn't blend into meta)
// → small muted meta line → optional description → status/badges.
// =====================================================================
interface JobCardProps {
  id: string
  title: string
  category?: string | null
  city?: string | null
  state?: string | null
  locationText?: string | null
  description?: string | null
  payLabel?: string | null
  status?: string | null
  requiresGuardianApproval?: boolean
  href: string
}
export function JobCard({ title, category, city, state, locationText, description, payLabel, status, requiresGuardianApproval, href }: JobCardProps) {
  const key = (category || '').toLowerCase()
  const tileColor = categoryColors[key] || 'muted'
  const icon = categoryIcons[key] || '⚡'
  return (
    <Link href={href} className="job-card">
      <div className={`job-card-icon ${tileColor}`}>{icon}</div>
      <div className="job-card-body">
        <div className="job-card-top-row">
          <h3 className="job-card-title">{title}</h3>
          <span className="job-card-pay">{payLabel || 'Pay TBD'}</span>
        </div>
        <div className="job-card-meta">
          {category ? `${category} · ` : ''}{[city, state].filter(Boolean).join(', ')}{locationText ? ` · ${locationText}` : ''}
        </div>
        {description && <p className="job-card-desc">{description}</p>}
        <div className="job-card-badges">
          <Status value={status} />
          {requiresGuardianApproval && (
            <span className="pill tooltip" data-tooltip="This teen's guardian must approve the application first">🛡️ Guardian req.</span>
          )}
        </div>
      </div>
    </Link>
  )
}

// =====================================================================
// SEGMENTED TABS — moved to components/segmented-tabs.tsx (needs client-
// side state for the sliding indicator). Re-exported here so existing
// `from '@/components/ui'` imports keep working.
// =====================================================================
export { SegmentedTabs } from './segmented-tabs'

// =====================================================================
// STATUS JOURNEY — connected-dot route showing an application's progress,
// instead of a single flat badge (mirrors a delivery-route visual).
// =====================================================================
type JourneyState = 'done' | 'current' | 'upcoming' | 'stopped'
interface JourneyStep { label: string; state: JourneyState }

function buildJourneySteps(status?: string | null): JourneyStep[] {
  switch (status) {
    case 'guardian_pending':
      return [
        { label: 'Applied', state: 'done' },
        { label: 'Guardian review', state: 'current' },
        { label: 'Adult review', state: 'upcoming' },
        { label: 'Decision', state: 'upcoming' },
      ]
    case 'guardian_rejected':
      return [
        { label: 'Applied', state: 'done' },
        { label: 'Guardian rejected', state: 'stopped' },
      ]
    case 'submitted':
    case 'adult_review':
      return [
        { label: 'Applied', state: 'done' },
        { label: 'Adult review', state: 'current' },
        { label: 'Decision', state: 'upcoming' },
      ]
    case 'rejected':
      return [
        { label: 'Applied', state: 'done' },
        { label: 'Reviewed', state: 'done' },
        { label: 'Rejected', state: 'stopped' },
      ]
    case 'accepted':
      return [
        { label: 'Applied', state: 'done' },
        { label: 'Reviewed', state: 'done' },
        { label: 'Accepted', state: 'current' },
        { label: 'Completed', state: 'upcoming' },
      ]
    case 'disputed':
      return [
        { label: 'Applied', state: 'done' },
        { label: 'Accepted', state: 'done' },
        { label: 'Disputed', state: 'stopped' },
      ]
    case 'completed':
      return [
        { label: 'Applied', state: 'done' },
        { label: 'Reviewed', state: 'done' },
        { label: 'Accepted', state: 'done' },
        { label: 'Completed', state: 'done' },
      ]
    default:
      return [{ label: status || 'Unknown', state: 'current' }]
  }
}

export function StatusJourney({ status }: { status?: string | null }) {
  const steps = buildJourneySteps(status)
  return (
    <div className="status-journey">
      {steps.map((step, i) => (
        <Fragment key={step.label}>
          {i > 0 && <div className={`status-journey-connector ${steps[i - 1].state === 'done' ? 'done' : ''}`} />}
          <div className="status-journey-step">
            <div className={`status-journey-dot ${step.state}`} />
            <span className="status-journey-label">{step.label}</span>
          </div>
        </Fragment>
      ))}
    </div>
  )
}

// =====================================================================
// APPLICATION CARD
// =====================================================================
interface ApplicationCardProps {
  title: string
  subtitle?: string
  note?: string | null
  status?: string | null
  href?: string
  children?: React.ReactNode
}
export function ApplicationCard({ title, subtitle, note, status, href, children }: ApplicationCardProps) {
  const inner = (
    <>
      <div className="application-card-header">
        <div>
          <h3>{title}</h3>
          {subtitle && <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>{subtitle}</p>}
        </div>
        <Status value={status} />
      </div>
      {note && <p className="application-card-note">{note}</p>}
      {children}
    </>
  )
  if (href) return <Link href={href} className="application-card">{inner}</Link>
  return <div className="application-card">{inner}</div>
}

// =====================================================================
// MESSAGE THREAD CARD
// =====================================================================
interface MessageThreadCardProps {
  title: string
  preview?: string | null
  scannerStatus?: string | null
  updatedAt?: string | null
  active?: boolean
  href: string
}
export function MessageThreadCard({ title, preview, scannerStatus, updatedAt, active, href }: MessageThreadCardProps) {
  return (
    <Link href={href} className={`thread-card ${active ? 'active' : ''}`}>
      <div style={{ display: 'flex', gap: 12 }}>
        <div className="icon-tile-sm">💬</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <h3 style={{ fontSize: 14 }}>{title}</h3>
            {scannerStatus && scannerStatus !== 'clean' && <Status value={scannerStatus} />}
          </div>
          {preview && <p className="thread-preview">{preview}</p>}
          {updatedAt && <span className="message-meta">{new Date(updatedAt).toLocaleString()}</span>}
        </div>
      </div>
    </Link>
  )
}

// =====================================================================
// SAFETY ACTION CARD
// =====================================================================
interface SafetyActionCardProps {
  icon: string
  title: string
  description: string
  variant: 'urgent' | 'calm'
  children: React.ReactNode
}
export function SafetyActionCard({ icon, title, description, variant, children }: SafetyActionCardProps) {
  return (
    <div className={`safety-action-card ${variant}`}>
      <div style={{ fontSize: 44, marginBottom: 10 }}>{icon}</div>
      <h2 style={{ fontSize: 22, marginBottom: 8, color: variant === 'urgent' ? 'var(--red)' : 'var(--green)' }}>{title}</h2>
      <p style={{ marginBottom: 20, fontSize: 14 }}>{description}</p>
      {children}
    </div>
  )
}

// =====================================================================
// ADMIN REVIEW CARD — icon tile (item type) + title/status top row
// =====================================================================
interface AdminReviewCardProps {
  icon?: string
  iconColor?: 'rose' | 'blue' | 'yellow' | 'muted'
  title: string
  subtitle?: string
  meta?: string
  status?: string | null
  children?: React.ReactNode
}
export function AdminReviewCard({ icon = '📋', iconColor = 'muted', title, subtitle, meta, status, children }: AdminReviewCardProps) {
  return (
    <div className="admin-review-card">
      <div className="admin-review-card-header">
        <div style={{ display: 'flex', gap: 12, flex: 1, minWidth: 0 }}>
          <div className={`job-card-icon ${iconColor}`}>{icon}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h3>{title}</h3>
            {subtitle && <p style={{ fontSize: 13, marginTop: 2 }}>{subtitle}</p>}
            {meta && <p style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, fontFamily: 'monospace' }}>{meta}</p>}
          </div>
        </div>
        <Status value={status} />
      </div>
      {children}
    </div>
  )
}

// =====================================================================
// SKELETON LOADERS
// =====================================================================
export function SkeletonLine({ width = '100%' }: { width?: string | number }) {
  return <div className="skeleton skeleton-line" style={{ width }} />
}
export function SkeletonCard() {
  return <div className="skeleton skeleton-card" />
}
export function SkeletonGrid({ count = 6, cols = 'three' }: { count?: number; cols?: 'two' | 'three' | 'four' }) {
  return (
    <div className={`grid ${cols}`}>
      {Array.from({ length: count }).map((_, i) => <SkeletonCard key={i} />)}
    </div>
  )
}
export function SkeletonStats() {
  return (
    <div className="stats">
      {Array.from({ length: 4 }).map((_, i) => (
        <div className="stat" key={i}>
          <SkeletonLine width="60%" />
          <SkeletonLine width="40%" />
        </div>
      ))}
    </div>
  )
}

// =====================================================================
// XP BAR
// =====================================================================
interface XPBarProps {
  current: number
  max: number
  level: number
  levelName: string
}

export function XPBar({ current, max, level, levelName }: XPBarProps) {
  const pct = Math.min(100, (current / max) * 100)
  const levelCls = ['', 'l1', 'l2', 'l3', 'l4', 'l5'][level] || 'l1'
  return (
    <div>
      <div className="xp-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className={`level-badge ${levelCls}`}>Lv{level} {levelName}</span>
        </div>
        <span className="xp-points">{current} / {max} XP</span>
      </div>
      <div className="xp-bar-wrap xp-bar-lg">
        <div className="xp-bar" style={{ width: `${pct}%` }} />
      </div>
      {level < 5 && (
        <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 6 }}>
          {max - current} XP to next level
        </div>
      )}
    </div>
  )
}

// =====================================================================
// BADGE ROW
// =====================================================================
interface Badge {
  icon: string
  label: string
  earned: boolean
}

export function BadgeRow({ badges }: { badges: Badge[] }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {badges.map(b => (
        <span key={b.label} className={`badge-chip ${b.earned ? 'earned' : ''}`} title={b.earned ? 'Earned!' : 'Not yet earned'}>
          {b.icon} {b.label}
        </span>
      ))}
    </div>
  )
}
