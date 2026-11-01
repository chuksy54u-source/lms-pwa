'use client';

// School branding and bear customisation: the fields, the live preview, and the save logic.
// Used by /admin/branding and the setup wizard.

import { useCallback, useEffect, useRef, useState } from 'react';
import BearMascot from '../bear/BearMascot';
import { Input, Select, Textarea, Button, Icon } from '../ui';
import { useTenant, loadFont } from '../app/TenantProvider';
import { useSession } from '../app/SessionProvider';
import { useToast } from '../app/ToastProvider';
import { apiGet, apiPatch, apiUpload, apiDelete } from '../../lib/api/client';
import { ACCESSORY_OPTIONS } from '../../lib/bear/settings';
import { FUR_PRESETS } from '../bear/bearMeta';
import { friendlyError } from '../../lib/app/format';

export const FONTS = ['Poppins', 'Inter', 'Nunito', 'Lora', 'Roboto', 'Open Sans', 'Montserrat', 'Lato', 'Merriweather'];
const BRAND_PRESETS = [
  ['#1E3A5F', '#E8A33D'],
  ['#2E4A86', '#F2B52E'],
  ['#2E7D5B', '#F4C542'],
  ['#8A2340', '#E9B949'],
  ['#4B2E83', '#F28C28'],
  ['#0F5257', '#F2A541'],
  ['#B23A1E', '#2F3E46'],
];
const ACC_LABEL = { gradcap: 'Graduation cap', headset: 'Headset', partyhat: 'Party hat', glasses: 'Glasses', scarf: 'Scarf', bowtie: 'Bow tie', ankara: 'Ankara collar', medal: 'Medal' };

// WCAG contrast, same maths as the API (lib/engine/schools.js), so we can warn before saving.
function isHexColor(hex) {
  return /^#[0-9a-f]{6}$/i.test(hex || '');
}
function lum(hex) {
  const c = hex.replace('#', '').match(/.{2}/g).map((p) => parseInt(p, 16) / 255).map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
export function contrast(a, b = '#FFFFFF') {
  if (!isHexColor(a) || !isHexColor(b)) return 0;
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
}

// Loads GET /schools/:id/branding into an editable draft and saves with PATCH. On save, the whole app re-skins.
export function useBranding() {
  const { me } = useSession();
  const { setSchool } = useTenant();
  const toast = useToast();
  const schoolId = me && me.school ? me.school.id : null;
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!schoolId) return;
    try {
      const b = await apiGet(`/api/v1/schools/${encodeURIComponent(schoolId)}/branding`);
      setSaved(b);
      setDraft(JSON.parse(JSON.stringify(b)));
      setError(null);
    } catch (err) {
      setError(err);
    }
  }, [schoolId]);
  useEffect(() => {
    load();
  }, [load]);

  const setB = (k, v) => setDraft((d) => ({ ...d, branding: { ...d.branding, [k]: v } }));
  const setT = (k, v) => setDraft((d) => ({ ...d, tutor: { ...d.tutor, [k]: v } }));

  // Sends only what changed. Returns true when saved.
  const save = useCallback(
    async (parts = ['branding', 'tutor']) => {
      if (!draft || !saved) return false;
      const body = {};
      if (parts.includes('branding')) {
        const keys = ['primary_color', 'secondary_color', 'font', 'pass_mark', 'grade_scale', 'certificate_signatory_name', 'certificate_signatory_title'];
        const b = Object.fromEntries(keys.filter((k) => draft.branding[k] !== saved.branding[k]).map((k) => [k, draft.branding[k] === '' ? null : draft.branding[k]]));
        if (Object.keys(b).length) body.branding = b;
      }
      if (parts.includes('tutor')) {
        const keys = ['name', 'greeting', 'fur_color', 'voice', 'accessories', 'max_intensity'];
        const t = Object.fromEntries(keys.filter((k) => JSON.stringify(draft.tutor[k]) !== JSON.stringify(saved.tutor[k])).map((k) => [k, draft.tutor[k]]));
        if (Object.keys(t).length) body.tutor = t;
      }
      if (!body.branding && !body.tutor) return true;
      if (parts.includes('branding') && (!isHexColor(draft.branding.primary_color) || !isHexColor(draft.branding.secondary_color))) {
        toast('Enter both colours as six-digit hex values, such as #1E3A5F.', 'error');
        return false;
      }
      if (body.branding && body.branding.primary_color && contrast(body.branding.primary_color) < 4.5) {
        toast('Pick a darker main colour so white text stays readable.', 'error');
        return false;
      }
      setSaving(true);
      try {
        const next = await apiPatch(`/api/v1/schools/${encodeURIComponent(schoolId)}/branding`, body);
        setSaved(next);
        setDraft(JSON.parse(JSON.stringify(next)));
        setSchool({ school: me.school, branding: next.branding, tutor: next.tutor });
        toast('Saved', 'success');
        return true;
      } catch (err) {
        toast(friendlyError(err), 'error');
        return false;
      } finally {
        setSaving(false);
      }
    },
    [draft, saved, schoolId, setSchool, me, toast],
  );

  const uploadLogo = useCallback(
    async (file) => {
      if (!file) return;
      if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) return toast('Use a PNG, JPEG or WebP image.', 'error');
      if (file.size > 2 * 1024 * 1024) return toast('The logo must be smaller than 2 MB.', 'error');
      const form = new FormData();
      form.append('logo', file);
      try {
        const next = await apiUpload(`/api/v1/schools/${encodeURIComponent(schoolId)}/branding/logo`, form);
        setSaved(next);
        setDraft((d) => ({ ...d, branding: { ...d.branding, logo_url: next.branding.logo_url } }));
        setSchool({ school: me.school, branding: next.branding, tutor: next.tutor });
        toast('Logo uploaded', 'success');
      } catch (err) {
        toast(friendlyError(err), 'error');
      }
    },
    [schoolId, setSchool, me, toast],
  );

  const removeLogo = useCallback(async () => {
    try {
      const next = await apiDelete(`/api/v1/schools/${encodeURIComponent(schoolId)}/branding/logo`);
      setSaved(next);
      setDraft((d) => ({ ...d, branding: { ...d.branding, logo_url: null } }));
      setSchool({ school: me.school, branding: next.branding, tutor: next.tutor });
    } catch (err) {
      toast(friendlyError(err), 'error');
    }
  }, [schoolId, setSchool, me, toast]);

  const dirty = draft && saved && JSON.stringify(draft) !== JSON.stringify(saved);
  return { schoolId, draft, saved, error, saving, dirty, setB, setT, save, reload: load, uploadLogo, removeLogo, reset: () => setDraft(JSON.parse(JSON.stringify(saved))) };
}

function ColorField({ label, value, onChange, hint, error }) {
  return (
    <div className="field" data-invalid={error ? 'true' : undefined}>
      <span className="field-label">{label}</span>
      <div className="color-input">
        <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value.toUpperCase())} aria-label={label} />
        <input className="input mono" value={value || ''} onChange={(e) => onChange(e.target.value.toUpperCase())} maxLength={7} aria-label={`${label} hex`} style={{ maxWidth: 140 }} />
      </div>
      {error ? <p className="field-error">{error}</p> : hint && <p className="field-hint">{hint}</p>}
    </div>
  );
}

export function LookFields({ api }) {
  const { draft, setB, uploadLogo, removeLogo } = api;
  const fileRef = useRef(null);
  const b = draft.branding;
  const ratio = contrast(b.primary_color);
  const primaryColorError = !isHexColor(b.primary_color)
    ? 'Use a six-digit hex colour, such as #1E3A5F.'
    : ratio < 4.5
      ? `Too light for white text (${ratio.toFixed(1)}:1, needs 4.5:1)`
      : '';
  useEffect(() => loadFont(b.font), [b.font]);
  return (
    <div className="stack">
      <div className="field">
        <span className="field-label">School logo</span>
        <div className="row">
          <div style={{ width: 64, height: 64, borderRadius: 14, background: 'var(--surface-2)', display: 'grid', placeItems: 'center', overflow: 'hidden', border: '1px solid var(--line)' }}>
            {b.logo_url ? <img src={b.logo_url} alt="School logo" style={{ width: '100%', height: '100%', objectFit: 'contain' }} /> : <Icon name="building" />}
          </div>
          <div className="row wrap" style={{ gap: 8 }}>
            <Button size="sm" variant="outline" icon="upload" onClick={() => fileRef.current.click()}>
              {b.logo_url ? 'Replace' : 'Upload logo'}
            </Button>
            {b.logo_url && (
              <Button size="sm" variant="ghost" onClick={removeLogo}>
                Remove
              </Button>
            )}
          </div>
          <input ref={fileRef} type="file" hidden accept="image/png,image/jpeg,image/webp" onChange={(e) => uploadLogo(e.target.files[0])} />
        </div>
        <p className="field-hint">PNG, JPEG or WebP, under 2 MB. A square logo looks best.</p>
      </div>
      <div className="field">
        <span className="field-label">Quick colour pairs</span>
        <div className="swatches">
          {BRAND_PRESETS.map(([p, s]) => (
            <button
              key={p}
              type="button"
              className="swatch"
              aria-pressed={b.primary_color === p && b.secondary_color === s}
              aria-label={`Main ${p}, accent ${s}`}
              style={{ background: `linear-gradient(135deg, ${p} 50%, ${s} 50%)` }}
              onClick={() => {
                setB('primary_color', p);
                setB('secondary_color', s);
              }}
            />
          ))}
        </div>
      </div>
      <div className="grid-2">
        <ColorField label="Main colour" value={b.primary_color} onChange={(v) => setB('primary_color', v)} error={primaryColorError} hint={`Buttons and headers · contrast ${ratio.toFixed(1)}:1`} />
        <ColorField label="Accent colour" value={b.secondary_color} onChange={(v) => setB('secondary_color', v)} error={!isHexColor(b.secondary_color) ? 'Use a six-digit hex colour, such as #E8A33D.' : ''} hint="Highlights and progress" />
      </div>
      <Select label="Font" value={b.font} onChange={(e) => setB('font', e.target.value)}>
        {FONTS.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function BearFields({ api }) {
  const { draft, setT } = api;
  const t = draft.tutor;
  const acc = t.accessories || {};
  const voice = t.voice || {};
  const setAcc = (slot, val) => setT('accessories', { ...acc, [slot]: val || null });
  return (
    <div className="stack">
      <div className="grid-2">
        <Input label="Bear's name" value={t.name || ''} maxLength={60} onChange={(e) => setT('name', e.target.value)} hint="e.g. Ornate AI Tutor" />
        <Select label="Voice" value={voice.gender || 'feminine'} onChange={(e) => setT('voice', { ...voice, gender: e.target.value, lang: voice.lang || 'en-NG' })} hint="Uses the voices on each phone, so it can sound a little different per device.">
          <option value="feminine">Feminine</option>
          <option value="masculine">Masculine</option>
        </Select>
      </div>
      <Textarea label="Greeting" rows={2} maxLength={200} value={t.greeting || ''} onChange={(e) => setT('greeting', e.target.value)} hint="What the bear says to visitors on your school's pages." />
      <div className="field">
        <span className="field-label">Fur colour</span>
        <div className="row wrap">
          <div className="swatches">
            {Object.entries(FUR_PRESETS).map(([n, hex]) => (
              <button key={n} type="button" className="swatch" aria-pressed={(t.fur_color || '').toUpperCase() === hex.toUpperCase()} aria-label={n} title={n} style={{ background: hex }} onClick={() => setT('fur_color', hex)} />
            ))}
          </div>
          <div className="color-input">
            <input type="color" value={t.fur_color || '#C99B68'} onChange={(e) => setT('fur_color', e.target.value.toUpperCase())} aria-label="Custom fur colour" />
          </div>
        </div>
      </div>
      <div className="grid-2">
        {['head', 'face', 'neck'].map((slot) => (
          <Select key={slot} label={slot === 'head' ? 'On the head' : slot === 'face' ? 'On the face' : 'Around the neck'} value={acc[slot] || ''} onChange={(e) => setAcc(slot, e.target.value)}>
            <option value="">Nothing</option>
            {ACCESSORY_OPTIONS[slot].map((a) => (
              <option key={a} value={a}>
                {ACC_LABEL[a] || a}
              </option>
            ))}
          </Select>
        ))}
        <Select label="Strongest mood" value={t.max_intensity || 'up_to_intense'} onChange={(e) => setT('max_intensity', e.target.value)} hint="How firm the bear may get with learners who fall behind.">
          <option value="friendly_only">Always friendly</option>
          <option value="up_to_worried">Up to worried</option>
          <option value="up_to_intense">Up to firm coach</option>
        </Select>
      </div>
    </div>
  );
}

export function GradingFields({ api }) {
  const { draft, setB } = api;
  const b = draft.branding;
  return (
    <div className="stack">
      <div className="grid-2">
        <Input label="Pass mark (%)" type="number" min={1} max={100} value={b.pass_mark ?? 50} onChange={(e) => setB('pass_mark', Math.max(1, Math.min(100, Number(e.target.value) || 50)))} />
        <Select label="Grade scale" value={b.grade_scale || 'standard'} onChange={(e) => setB('grade_scale', e.target.value)}>
          <option value="standard">Standard (A–F)</option>
          <option value="waec">WAEC style (A1–F9)</option>
        </Select>
      </div>
      <div className="grid-2">
        <Input label="Certificate signed by" placeholder="e.g. Chidi Okafor" value={b.certificate_signatory_name || ''} onChange={(e) => setB('certificate_signatory_name', e.target.value)} />
        <Input label="Their title" placeholder="e.g. School Principal" value={b.certificate_signatory_title || ''} onChange={(e) => setB('certificate_signatory_title', e.target.value)} />
      </div>
    </div>
  );
}

// A phone showing the student home in the draft colours, font and bear: changes show before saving.
export function BrandPreview({ draft, schoolName }) {
  const b = draft.branding;
  const t = draft.tutor;
  const vars = { '--brand': b.primary_color, '--accent': b.secondary_color, '--p-font': `'${b.font}', system-ui, sans-serif` };
  return (
    <div className="preview-phone" style={vars} role="img" aria-label="Live preview of the student app in these colours, font and bear">
      <div className="preview-screen" aria-hidden="true" style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className="row" style={{ gap: 8 }}>
          {b.logo_url ? (
            <img src={b.logo_url} alt="" style={{ width: 28, height: 28, objectFit: 'contain', borderRadius: 6 }} />
          ) : (
            <span style={{ width: 28, height: 28, borderRadius: 8, background: b.primary_color, color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 12 }}>
              {(schoolName || 'S').slice(0, 2).toUpperCase()}
            </span>
          )}
          <strong style={{ fontSize: 13 }}>{schoolName}</strong>
        </div>
        <div>
          <p style={{ fontSize: 11, color: '#5b6270' }}>Good morning,</p>
          <p style={{ fontSize: 20, fontWeight: 700 }}>Ada 👋</p>
        </div>
        <div style={{ background: b.primary_color, color: '#fff', borderRadius: 14, padding: 12 }}>
          <p style={{ fontSize: 10, color: '#E8EDF4' }}>Continue learning</p>
          <p style={{ fontSize: 13, fontWeight: 700 }}>Fractions and Decimals</p>
          <div style={{ height: 6, borderRadius: 4, background: 'rgba(255,255,255,.25)', marginTop: 8 }}>
            <div style={{ width: '62%', height: '100%', borderRadius: 4, background: b.secondary_color }} />
          </div>
        </div>
        <div style={{ background: '#fff', borderRadius: 14, padding: 10, border: '1px solid #ecdfc8', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: b.secondary_color, color: '#24180a', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 99 }}>Quiz</span>
          <span style={{ fontSize: 12 }}>Chapter 4 check</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, marginTop: 'auto' }}>
          <div style={{ background: '#fff', border: '1px solid #ecdfc8', borderRadius: '14px 14px 14px 4px', padding: '8px 10px', fontSize: 11, flex: 1 }}>
            {t.greeting || `Hi! I am ${t.name || 'your tutor'}.`}
          </div>
          <div style={{ width: 92, flex: 'none' }}>
            <BearMascot size="bust" width="100%" emotion="adorable" pose="wave" furColor={t.fur_color} accessories={t.accessories} schoolColors={{ primary: b.primary_color, secondary: b.secondary_color }} dismissible={false} escToDismiss={false} label={t.name || 'Bear'} />
          </div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <span style={{ display: 'inline-block', background: b.primary_color, color: '#fff', fontWeight: 600, fontSize: 12, padding: '8px 18px', borderRadius: 99 }}>Next lesson</span>
        </div>
      </div>
      <p className="tiny center" style={{ color: '#9aa3b2', marginTop: 8 }}>
        Live preview
      </p>
    </div>
  );
}

export function SaveBar({ api, parts, label = 'Save changes' }) {
  if (!api.dirty) return null;
  return (
    <div className="card row-between wrap" style={{ position: 'sticky', bottom: 16, zIndex: 20, boxShadow: 'var(--shadow-lg)' }}>
      <span className="small strong">You have unsaved changes</span>
      <div className="row" style={{ gap: 8 }}>
        <Button variant="ghost" size="sm" onClick={api.reset}>
          Undo
        </Button>
        <Button size="sm" loading={api.saving} onClick={() => api.save(parts)}>
          {label}
        </Button>
      </div>
    </div>
  );
}
