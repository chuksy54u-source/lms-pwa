'use client';

// The Bearilly component kit. Every screen is built from these, so a change here re-styles the whole app.
// Styles live in styles/app.css; colours are theme variables, so each school's branding applies automatically.

import { forwardRef, useEffect, useId, useRef, useState } from 'react';
import Link from 'next/link';
import Icon from './icons';
import BearArt from '../app/BearArt';
import { friendlyError, initials } from '../../lib/app/format';

export { Icon };

const cx = (...c) => c.filter(Boolean).join(' ');

/* ---------- Buttons ---------- */
export const Button = forwardRef(function Button(
  { variant = 'primary', size, block, loading, href, icon, iconRight, children, className, disabled, type = 'button', ...rest },
  ref,
) {
  const cls = cx('btn', variant !== 'primary' && `btn-${variant}`, size === 'sm' && 'btn-sm', block && 'btn-block', className);
  const inner = (
    <>
      {loading ? <span className="spinner" aria-hidden /> : icon ? <Icon name={icon} size={20} /> : null}
      {children}
      {iconRight && !loading && <Icon name={iconRight} size={20} />}
    </>
  );
  if (href) {
    return (
      <Link href={href} className={cls} ref={ref} aria-disabled={disabled || undefined} {...rest}>
        {inner}
      </Link>
    );
  }
  return (
    <button ref={ref} type={type} className={cls} disabled={disabled || loading} aria-busy={loading || undefined} {...rest}>
      {inner}
    </button>
  );
});

export function IconButton({ icon, label, className, size = 22, ...rest }) {
  return (
    <button type="button" className={cx('icon-btn', className)} aria-label={label} title={label} {...rest}>
      <Icon name={icon} size={size} />
    </button>
  );
}

export function BackLink({ href, children = 'Back' }) {
  return (
    <Link href={href} className="back-link">
      <Icon name="back" size={18} /> {children}
    </Link>
  );
}

/* ---------- Form fields ---------- */
export function Field({ label, hint, error, children, id, className }) {
  return (
    <div className={cx('field', className)} data-invalid={error ? 'true' : undefined}>
      {label && (
        <label className="field-label" htmlFor={id}>
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="field-error" id={id && `${id}-error`} role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="field-hint" id={id && `${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export const Input = forwardRef(function Input({ label, hint, error, className, type = 'text', id: given, ...rest }, ref) {
  const auto = useId();
  const id = given || auto;
  const [show, setShow] = useState(false);
  const isPassword = type === 'password';
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  const input = (
    <input
      ref={ref}
      id={id}
      className="input"
      type={isPassword && show ? 'text' : type}
      aria-invalid={error ? true : undefined}
      aria-describedby={describedBy}
      {...rest}
    />
  );
  return (
    <Field label={label} hint={hint} error={error} id={id} className={className}>
      {isPassword ? (
        <div className="input-wrap">
          {input}
          <IconButton className="input-action" icon={show ? 'eyeOff' : 'eye'} label={show ? 'Hide password' : 'Show password'} onClick={() => setShow((s) => !s)} size={20} />
        </div>
      ) : (
        input
      )}
    </Field>
  );
});

export const Textarea = forwardRef(function Textarea({ label, hint, error, className, id: given, ...rest }, ref) {
  const auto = useId();
  const id = given || auto;
  return (
    <Field label={label} hint={hint} error={error} id={id} className={className}>
      <textarea ref={ref} id={id} className="textarea" aria-invalid={error ? true : undefined} aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined} {...rest} />
    </Field>
  );
});

export function Select({ label, hint, error, className, id: given, children, ...rest }) {
  const auto = useId();
  const id = given || auto;
  return (
    <Field label={label} hint={hint} error={error} id={id} className={className}>
      <select id={id} className="select input" {...rest}>
        {children}
      </select>
    </Field>
  );
}

export function SearchInput({ label = 'Search', ...rest }) {
  return (
    <div className="search-wrap">
      <Icon name="search" size={18} />
      <input className="input input-search" type="search" aria-label={label} {...rest} />
    </div>
  );
}

export function Switch({ checked, onChange, label, disabled, id }) {
  return (
    <label className="switch">
      <input type="checkbox" role="switch" id={id} checked={!!checked} disabled={disabled} onChange={(e) => onChange && onChange(e.target.checked)} aria-label={label} />
      <span className="switch-track" />
    </label>
  );
}

export function Checkbox({ children, ...rest }) {
  return (
    <label className="checkbox">
      <input type="checkbox" {...rest} />
      <span>{children}</span>
    </label>
  );
}

// Password strength meter from the CREATE ACCOUNT screen.
export function passwordScore(pw) {
  const s = String(pw || '');
  let score = 0;
  if (s.length >= 8) score++;
  if (s.length >= 12) score++;
  if (/[a-z]/.test(s) && /[A-Z]/.test(s)) score++;
  if (/\d/.test(s)) score++;
  if (/[^A-Za-z0-9]/.test(s)) score++;
  return Math.min(score, 4);
}
export function PasswordStrength({ value }) {
  if (!value) return null;
  const score = passwordScore(value);
  const levels = [
    ['Too short', 'var(--danger)'],
    ['Weak — add numbers or capitals', 'var(--danger)'],
    ['Okay — make it longer', 'var(--warn)'],
    ['Good — add a symbol to make it strong', 'var(--info)'],
    ['Strong password', 'var(--success)'],
  ];
  const [text, color] = levels[value.length < 8 ? 0 : score];
  return (
    <div className="stack-sm" aria-live="polite">
      <div className="strength">
        <span style={{ width: `${Math.max(10, score * 25)}%`, background: color }} />
      </div>
      <p className="tiny muted">{text}</p>
    </div>
  );
}

/* ---------- Display ---------- */
export function Card({ as: Tag = 'div', className, children, href, ...rest }) {
  if (href) {
    return (
      <Link href={href} className={cx('card card-link', className)} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <Tag className={cx('card', className)} {...rest}>
      {children}
    </Tag>
  );
}

export function Badge({ tone, children, className }) {
  return <span className={cx('badge', tone && `badge-${tone}`, className)}>{children}</span>;
}

export function Chips({ options, value, onChange, label }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" className="chip" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
          {o.count !== undefined && <span className="count">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function Tabs({ tabs, value, onChange, label }) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((t) => (
        <button key={t.value} role="tab" type="button" className="tab" aria-selected={value === t.value} onClick={() => onChange(t.value)}>
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function Progress({ value = 0, tone, size, label }) {
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <div className={cx('progress', tone && `progress-${tone}`, size === 'sm' && 'progress-sm')} role="progressbar" aria-valuenow={Math.round(v)} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span style={{ width: `${v}%` }} />
    </div>
  );
}

export function Ring({ value = 0, size = 150, stroke = 16, children, color }) {
  const [shown, setShown] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setShown(Math.max(0, Math.min(100, Number(value) || 0))), 60);
    return () => clearTimeout(t);
  }, [value]);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} aria-hidden>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle className="ring-fill" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} strokeDasharray={c} strokeDashoffset={c * (1 - shown / 100)} style={color ? { stroke: color } : undefined} />
      </svg>
      <div className="ring-label">{children}</div>
    </div>
  );
}

export function Stat({ label, value, foot, tone }) {
  return (
    <div className={cx('stat', tone && `stat-${tone}`)}>
      <p className="stat-label">{label}</p>
      <p className="stat-value">{value}</p>
      {foot && <p className="stat-foot">{foot}</p>}
    </div>
  );
}

export function Avatar({ name, size }) {
  return (
    <span className={cx('avatar', size === 'lg' && 'avatar-lg')} aria-hidden>
      {initials(name)}
    </span>
  );
}

const MOODS = {
  adorable: { label: 'Doing well', emoji: '😊' },
  worried: { label: 'Needs a nudge', emoji: '😟' },
  intense: { label: 'Needs help', emoji: '😤' },
};
export function MoodBadge({ mood }) {
  const m = MOODS[mood] || { label: 'No data yet', emoji: '🐻' };
  return (
    <span className={cx('mood', `mood-${mood}`)} title={`Bear mood: ${mood || 'unknown'}`}>
      <span aria-hidden>{m.emoji}</span> {m.label}
    </span>
  );
}

export function PageHead({ title, sub, eyebrow, actions, back }) {
  return (
    <div className="page-head">
      <div className="stack-sm">
        {back}
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {sub && <p>{sub}</p>}
      </div>
      {actions && <div className="row wrap">{actions}</div>}
    </div>
  );
}

export function SectionHead({ title, action }) {
  return (
    <div className="section-head">
      <h2>{title}</h2>
      {action}
    </div>
  );
}

/* ---------- States ---------- */
export function EmptyState({ title, text, action, emotion = 'adorable', pose = 'wave', card = true }) {
  const body = (
    <div className="state">
      <BearArt className="state-art" emotion={emotion} pose={pose} />
      <p className="state-title">{title}</p>
      {text && <p className="state-text">{text}</p>}
      {action}
    </div>
  );
  return card ? <div className="card">{body}</div> : body;
}

export function ErrorState({ error, onRetry, title = 'Something went wrong', card = true }) {
  const body = (
    <div className="state" role="alert">
      <BearArt className="state-art" emotion="worried" pose="cheeks" />
      <p className="state-title">{title}</p>
      <p className="state-text">{friendlyError(error) || 'Check your connection.'}</p>
      {onRetry && (
        <Button onClick={onRetry} icon="refresh">
          Try again
        </Button>
      )}
    </div>
  );
  return card ? <div className="card">{body}</div> : body;
}

export function Skeleton({ height = 18, width = '100%', radius, style }) {
  return <div className="skeleton" style={{ height, width, borderRadius: radius, ...style }} aria-hidden />;
}

export function CardSkeleton({ lines = 2 }) {
  return (
    <div className="card stack" aria-busy="true" aria-label="Loading">
      <Skeleton height={18} width="55%" />
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12} width={`${85 - i * 20}%`} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 3, lines = 2 }) {
  return (
    <div className="stack">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} lines={lines} />
      ))}
    </div>
  );
}

// Shows loading / error / empty / content for one useApi() result.
export function Async({ state, empty, skeleton, children, isEmpty }) {
  const { data, error, loading, reload } = state;
  if (data === undefined && loading) return skeleton || <ListSkeleton />;
  if (data === undefined && error) return <ErrorState error={error} onRetry={reload} />;
  if (data === undefined) return null;
  const blank = isEmpty ? isEmpty(data) : Array.isArray(data) && data.length === 0;
  if (blank && empty) return empty;
  return children(data);
}

/* ---------- Sheet (bottom sheet on phones, dialog on desktop) ---------- */
export function Sheet({ open, onClose, title, children, labelledBy }) {
  const auto = useId();
  const box = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const before = document.activeElement;
    // move keyboard focus into the sheet (first field, else the close button); give it back on close
    const t = setTimeout(() => {
      const el = box.current && (box.current.querySelector('input:not([type=hidden]), select, textarea') || box.current.querySelector('button'));
      if (el) el.focus();
    }, 30);
    const onKey = (e) => e.key === 'Escape' && onClose && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      clearTimeout(t);
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
      if (before && before.focus) before.focus();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={(e) => e.target === e.currentTarget && onClose && onClose()}>
      <div className="sheet" role="dialog" aria-modal="true" aria-labelledby={labelledBy || auto} ref={box}>
        <div className="sheet-handle" />
        {title && (
          <div className="row-between" style={{ marginBottom: 14 }}>
            <h2 id={auto}>{title}</h2>
            <IconButton icon="close" label="Close" onClick={onClose} />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

export function Callout({ tone, title, children }) {
  return (
    <div className={cx('callout', tone)}>
      {title && <p className="callout-title">{title}</p>}
      <div>{children}</div>
    </div>
  );
}
