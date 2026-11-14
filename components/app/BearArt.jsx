'use client';

import BearMascot from '../bear/BearMascot';
import { useTenant } from './TenantProvider';

// A still picture of the school's bear (its fur, accessories and colours) for empty states, onboarding,
// the splash screen and cards. The live, talking bear is the one BearRoot puts in the corner.
export default function BearArt({ emotion = 'adorable', pose = 'idle', size = 'full', className, celebrate, label }) {
  const { tutor, branding } = useTenant();
  return (
    <span className={className} style={{ display: 'inline-block', lineHeight: 0 }}>
      <BearMascot
        emotion={emotion}
        pose={pose}
        size={size}
        width="100%"
        furColor={tutor && tutor.fur_color}
        accessories={tutor && tutor.accessories}
        schoolColors={{ primary: branding.primary_color, secondary: branding.secondary_color }}
        dismissible={false}
        escToDismiss={false}
        celebrate={celebrate}
        label={label || (tutor && tutor.name) || 'Study tutor'}
      />
    </span>
  );
}
