import { Link } from '../../lib/app/nav.js';
import { CONNECTED, SCHOOL_NAME } from '../../lib/app/connected.js';

const SCHOOL = (SCHOOL_NAME || '').trim() || 'Student portal';
export const metadata = { title: 'Privacy and terms' };

// Plain-language privacy notice (roadmap Phase 8: privacy, consent and retention rules).
// DRAFT: the owner or a lawyer must confirm this against the Nigeria Data Protection Act 2023 before launch.
//
// On Bearilly's own website the notice names Bearilly. On a school's own website (CONNECTED) it speaks of "the school" and "the
// school's learning platform provider", so a student is not shown which product the school uses. It still says plainly that a
// provider looks after the data for the school, because a privacy notice must not hide that. A lawyer should confirm this wording.
const up = (text) => text.charAt(0).toUpperCase() + text.slice(1);
const sections = (me, provider, subscription) => [
  ['Who we are', [CONNECTED ? `${me} runs this learning app. Your school decides who has an account and what is taught. ${up(provider)} looks after the data for the school.` : `${me} runs the learning app your school uses. Your school decides who has an account and what is taught. ${provider} looks after the data for the school.`]],
  ['What we keep', ['Your name, email, class and student code, which your school gives us.', 'What you do in the app: lessons opened and finished, quiz answers and scores, certificates, and questions you ask the bear.', `For payments, only the payment reference and amount. Card details stay with Paystack; ${provider} never sees them.`]],
  ['What the AI sees', ['When you ask the bear a question, the question and your school’s lesson notes are sent to our AI provider to write the answer. We send the least we can: never your phone number, address or full record.', 'The bear never asks for personal details and refuses unsafe topics.']],
  ['Who can see it', ['You, your teachers and your school admins. Each school only ever sees its own students.', 'Your teachers can read your questions to the bear, so they can help you and keep you safe.', `${up(provider)} staff look at a school’s data only to fix a problem, and every look is logged.`]],
  ['Children and consent', [`Many learners are under 18. Your school agrees to ${CONNECTED ? 'the platform’s' : 'Bearilly’s'} terms for its learners and gets the consent it needs from parents or guardians.`, 'If you are under 18, sign up only with your parent’s or guardian’s agreement.']],
  ['How long we keep it', [`While your school uses ${CONNECTED ? 'this learning app' : 'Bearilly'}, your learning record is kept so you can see your progress and certificates.`, `When a school stops using ${CONNECTED ? 'the platform' : 'Bearilly'}, its data is kept for 90 days (so it can come back), then deleted. Certificates stay checkable unless the school asks us to remove them.`, 'Backups are deleted on a rolling schedule after that.']],
  ['Your choices', ['Ask your school to correct or delete your details, or to export your record.', 'You can turn the bear’s voice off in your settings at any time.', `Questions or complaints: contact your school first. They can reach ${CONNECTED ? 'the platform’s' : 'Bearilly'} support.`]],
  ['Fair use', [`Use ${CONNECTED ? 'this app' : 'Bearilly'} for learning. Do not share your password, try to see other people’s data, or upload anything unlawful or hurtful.`, `Payments made through ${CONNECTED ? 'this app' : 'Bearilly'} go to the school (school fees)${subscription}, as shown on each payment page.`]],
];


export default function Privacy() {
  const provider = CONNECTED ? 'the school’s learning platform provider' : 'Bearilly';
  const SECTIONS = sections(CONNECTED ? SCHOOL : 'Bearilly', provider, CONNECTED ? '' : ' or to Bearilly (the school’s subscription)');
  return (
    <main className="app-main" id="main" style={{ maxWidth: 760, margin: '0 auto', padding: '32px 18px 80px' }}>
      <p className="eyebrow">{CONNECTED ? SCHOOL : 'Bearilly'}</p>
      <h1>Privacy and terms</h1>
      <p className="muted">The short version, in plain words. Last updated October 2026.</p>
      <div className="stack-lg" style={{ marginTop: 20 }}>
        {SECTIONS.map(([title, lines]) => (
          <section key={title} className="stack-sm">
            <h2 style={{ fontSize: '1.15rem' }}>{title}</h2>
            <ul className="small" style={{ paddingLeft: 20, margin: 0 }}>
              {lines.map((l) => (
                <li key={l} style={{ margin: '6px 0' }}>
                  {l}
                </li>
              ))}
            </ul>
          </section>
        ))}
        <p className="tiny muted">
          Draft for review: the owner confirms these rules under the Nigeria Data Protection Act 2023 before the first school goes live.
        </p>
        <Link href="/" className="btn btn-outline" style={{ alignSelf: 'flex-start' }}>
          {CONNECTED ? `Back to ${SCHOOL}` : 'Back to Bearilly'}
        </Link>
      </div>
    </main>
  );
}
