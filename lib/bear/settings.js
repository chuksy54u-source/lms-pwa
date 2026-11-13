// The API speaks snake_case (fur_color, max_intensity). The bear components speak camelCase.
// This file is the one translator between them.

export const MAX_MOOD = { friendly_only: 'adorable', up_to_worried: 'worried', up_to_intense: 'intense' };

// The school's "strongest mood allowed" -> the mood name the emotion engine's guard understands.
export function maxMoodFromIntensity(value) {
  return MAX_MOOD[value] || 'intense';
}

// GET /api/v1/tenant answer -> the `settings` the bear components take.
export function tutorSettingsFromApi(tenant) {
  const tutor = (tenant && tenant.tutor) || {};
  const brand = (tenant && tenant.branding) || {};
  return {
    tutorName: tutor.name || 'Bearilly',
    greeting: tutor.greeting || '',
    furColor: tutor.fur_color || undefined,
    voice: tutor.voice || undefined,
    accessories: tutor.accessories || undefined,
    schoolColors: brand.primary_color || brand.secondary_color ? { primary: brand.primary_color, secondary: brand.secondary_color } : undefined,
    maxMood: maxMoodFromIntensity(tutor.max_intensity),
  };
}

// What a school may put on its bear (the accessory names in the finished bear pack).
export const ACCESSORY_OPTIONS = {
  head: ['gradcap', 'headset', 'partyhat'],
  face: ['glasses'],
  neck: ['scarf', 'bowtie', 'ankara', 'medal'],
};
