'use client';

import { useTenant } from './TenantProvider';
import { appName } from '../../lib/app/brand.js';
import { CONNECTED } from '../../lib/app/connected.js';
import { initials } from '../../lib/app/format.js';

// The school's own mark, shown where Bearilly's bear head used to be: the sign-in, create-account and password
// screens, the loading screen, the install card. It is the logo the school uploaded (SVG, PNG, JPEG or WebP).
// A school that has not uploaded one gets a round monogram in its own colours — never Bearilly's logo.
//
//   size  - width and height in pixels (default 96)
//   label - the picture's text for screen readers (default: the school's name)
export default function BrandMark({ size = 96, className = '', label }) {
  const { school, branding, ready } = useTenant();
  const name = appName(school);
  const url = branding && branding.logo_url;
  const box = { width: size, height: size };
  const text = label || name;
  // On a school's own website, until the school's details have arrived (and no logo was remembered from the last visit) the mark is an empty
  // space of the same size, so a plain monogram in the wrong colours never flashes before the real logo appears.
  if (CONNECTED && !url && ready === false) return <span className={`brand-mark ${className}`.trim()} style={box} aria-hidden="true" />;
  return (
    <span className={`brand-mark ${className}`.trim()} style={box} role="img" aria-label={text}>
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt="" draggable="false" />
      ) : (
        <span className="brand-mark-letters" aria-hidden="true" style={{ fontSize: Math.round(size * 0.38) }}>
          {initials(name)}
        </span>
      )}
    </span>
  );
}
