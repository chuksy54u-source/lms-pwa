'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { Button, ErrorState, Skeleton, Badge, Icon } from '../../../components/ui';
import { loadFont } from '../../../components/app/TenantProvider';
import useApi from '../../../lib/app/useApi';
import { dateLong, pct } from '../../../lib/app/format';
import { useTitle } from '../../../lib/app/hooks';

// PRINTABLE CERTIFICATE + public check. Anyone with the code can open this page (GET /certificates/verify/:code);
// it never shows the student's email or account details. Wording from the decisions log, item 5.
export default function CertificatePage() {
  const { code } = useParams();
  const res = useApi(`/api/v1/certificates/verify/${encodeURIComponent(code)}`);
  const d = res.data;
  const c = d && d.certificate;
  const b = (d && d.branding) || {};
  useTitle(c ? `${c.course_name} certificate` : 'Certificate');
  useEffect(() => {
    if (b.font) loadFont(b.font);
  }, [b.font]);
  const style = { '--brand': b.primary_color || undefined, '--accent': b.secondary_color || undefined, '--font': b.font ? `'${b.font}', system-ui, sans-serif` : undefined };
  const url = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <main style={{ padding: '24px 16px 48px', ...style }} className="stack-lg">
      <div className="row-between no-print" style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
        <Button variant="ghost" href="/verify" icon="shield" size="sm">
          Check another
        </Button>
        {c && (
          <Button size="sm" icon="print" onClick={() => window.print()}>
            Print or save PDF
          </Button>
        )}
      </div>
      {res.loading && !d ? (
        <div style={{ maxWidth: 880, margin: '0 auto', width: '100%' }}>
          <Skeleton height={420} />
        </div>
      ) : res.error && !d ? (
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <ErrorState error={res.error} onRetry={res.reload} title={res.error.status === 404 ? 'Certificate not found' : 'Could not check this certificate'} />
        </div>
      ) : d && !d.valid ? (
        <div style={{ maxWidth: 520, margin: '0 auto' }}>
          <ErrorState error={{ message: 'This code does not match a valid certificate.' }} title="Not a valid certificate" />
        </div>
      ) : c ? (
        <>
          <div className="center no-print">
            <Badge tone="success"><Icon name="check" size={14} /> Verified certificate</Badge>
          </div>
          <article className="certificate">
            {b.logo_url && <img src={b.logo_url} alt="" style={{ height: 56, margin: '0 auto 10px', objectFit: 'contain' }} />}
            <p className="eyebrow" style={{ color: 'var(--accent)' }}>
              {c.school_name}
            </p>
            <h1>Certificate of Completion</h1>
            <p style={{ marginTop: 18, color: '#4a5466' }}>This is to certify that</p>
            <p className="who">{c.student_name}</p>
            <p style={{ maxWidth: 560, margin: '0 auto', color: '#33404f', lineHeight: 1.7 }}>
              has successfully completed <strong>{c.course_name}</strong> at {c.school_name} on {dateLong(c.issued_at)} with a grade of <strong>{c.grade}</strong> ({pct(c.score)}).
            </p>
            <div className="seal">{c.grade}</div>
            <div className="meta">
              <div>
                {c.signatory_name ? (
                  <>
                    <p style={{ fontWeight: 700, color: '#222b38', borderTop: '1.5px solid #c9b994', paddingTop: 6, minWidth: 180 }}>{c.signatory_name}</p>
                    <p>{c.signatory_title}</p>
                  </>
                ) : null}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p>
                  Certificate No. <span className="mono">{c.verification_code}</span>
                </p>
                <p>Verify at {url.replace(/^https?:\/\//, '')}</p>
              </div>
            </div>
          </article>
        </>
      ) : null}
    </main>
  );
}
