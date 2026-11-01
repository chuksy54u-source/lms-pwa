// A pretend lesson so the frontend can build the lesson page and the "ask the bear" box before the database exists.
// The REAL lesson comes from the database (Phase 1) with these same field names:
//   notes        the lesson content. Students read it, and the AI uses it as its ONLY reference.
//   explanation  written in advance for each lesson. The bear speaks it when the lesson opens. No AI involved.
export const MOCK_LESSON = {
  id: 'les_demo',
  course_id: 'crs_001',
  title: 'Fractions: numerators and denominators',
  explanation:
    'A fraction shows part of a whole. The top number is the numerator. It tells you how many parts you have. The bottom number is the denominator. It tells you how many equal parts the whole is cut into. If a pizza is cut into four equal slices and you eat one, you ate one quarter.',
  notes:
    'A fraction names part of a whole. In three quarters, the numerator is 3 and the denominator is 4. The denominator can never be zero. Equivalent fractions name the same amount in different ways: one half and two quarters are equivalent.',
};

// Used only by the stub answer in lib/bear/mockAsk.js
export const MOCK_FAQ = [
  { keywords: ['numerator'], answer: 'The numerator is the top number of a fraction. It tells you how many parts you have. In three quarters, the numerator is three.' },
  { keywords: ['denominator'], answer: 'The denominator is the bottom number. It tells you how many equal parts the whole is cut into. In three quarters, the denominator is four.' },
  { keywords: ['equivalent', 'same amount'], answer: 'Equivalent fractions are different fractions that name the same amount. One half and two quarters are equivalent.' },
  { keywords: ['zero'], answer: 'The denominator can never be zero, because you cannot cut something into zero parts.' },
];
