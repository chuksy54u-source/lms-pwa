export const BEARILLY_ENDPOINTS = Object.freeze([
  {
    "method": "POST",
    "path": "/api/v1/signup/school",
    "summary": "Create a school in setup mode and its first school-admin login."
  },
  {
    "method": "POST",
    "path": "/api/v1/contact/consultation",
    "summary": "Save a validated consultation request and queue confirmation and team emails."
  },
  {
    "method": "GET",
    "path": "/api/v1/schools/:id/setup",
    "summary": "Read the signed-in school’s server-stored setup progress."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/schools/:id/setup",
    "summary": "Save a setup step, choose a site mode, or complete setup before subscribing."
  },
  {
    "method": "GET",
    "path": "/api/v1/playground/games",
    "summary": "List the six available Playground games and their ruleset descriptions."
  },
  {
    "method": "GET",
    "path": "/api/v1/playground/players",
    "summary": "Find active student opponents in the caller's school; never returns email addresses."
  },
  {
    "method": "GET",
    "path": "/api/v1/playground/invitations",
    "summary": "List the caller's sent and received same-school game invitations."
  },
  {
    "method": "POST",
    "path": "/api/v1/playground/invitations",
    "summary": "Invite an active student from the caller's school to a game."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/playground/invitations/:id",
    "summary": "Accept or decline an invitation as its recipient, or cancel it as its sender."
  },
  {
    "method": "GET",
    "path": "/api/v1/playground/matches",
    "summary": "List the caller's active and completed matches."
  },
  {
    "method": "POST",
    "path": "/api/v1/playground/matches",
    "summary": "Start a match against Bearilly with optional beginner difficulty and coaching mode."
  },
  {
    "method": "GET",
    "path": "/api/v1/playground/matches/:id",
    "summary": "Read the match board, caller-visible game state, and move history as a participant."
  },
  {
    "method": "POST",
    "path": "/api/v1/playground/matches/:id/moves",
    "summary": "Submit a game-specific move; the server validates it and applies Bearilly's reply where applicable."
  },
  {
    "method": "GET",
    "path": "/api/v1/playground/history",
    "summary": "List the caller's completed Playground matches."
  },
  {
    "method": "GET",
    "path": "/api/v1/playground/leaderboard",
    "summary": "Get a school-scoped leaderboard, optionally filtered to one game."
  },
  {
    "method": "GET",
    "path": "/api/v1/billing/plans",
    "summary": "List active school subscription plans and their NGN prices."
  },
  {
    "method": "POST",
    "path": "/api/v1/billing/plans",
    "summary": "Create a plan. All prices are integer kobo; placeholder plans are test-key only."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/billing/plans/:id",
    "summary": "Update a plan's prices or availability. Prices are integer kobo."
  },
  {
    "method": "POST",
    "path": "/api/v1/billing/checkout",
    "summary": "Create a Paystack checkout for a new subscription, renewal, or prorated mid-term slot increase."
  },
  {
    "method": "GET",
    "path": "/api/v1/billing/slots",
    "summary": "See the school's purchased student slots, usage, remaining capacity, and alerts."
  },
  {
    "method": "GET",
    "path": "/api/v1/billing/subscription",
    "summary": "See the current or pending subscription, payment history, and active student count."
  },
  {
    "method": "POST",
    "path": "/api/v1/billing/verify",
    "summary": "Verify a Paystack reference server-side and activate its subscription or slot upgrade."
  },
  {
    "method": "GET",
    "path": "/api/v1/cron/daily",
    "summary": "Daily safety net run by Vercel Cron (Authorization: Bearer CRON_SECRET): settles Paystack checkouts whose webhook never arrived."
  },
  {
    "method": "POST",
    "path": "/api/v1/billing/paystack/webhook",
    "summary": "Receive Paystack webhooks; the raw-body x-paystack-signature is verified before processing."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/assessments/:id",
    "summary": "Change a quiz of the school's own: title, pass mark, attempts, status; or replace the questions (only before anyone has taken it)."
  },
  {
    "method": "GET",
    "path": "/api/v1/assessments/:id/submissions",
    "summary": "Attempts at a quiz. Students see only their own; staff see everyone's."
  },
  {
    "method": "POST",
    "path": "/api/v1/assessments/:id/submissions",
    "summary": "A student hands in a quiz. Multiple choice is marked at once; short answers are marked by the AI, or wait for a teacher. Returns the result."
  },
  {
    "method": "GET",
    "path": "/api/v1/auth/me",
    "summary": "Who am I? The signed-in person and their school."
  },
  {
    "method": "POST",
    "path": "/api/v1/auth/register",
    "summary": "A student signs themselves up with their school's invite code."
  },
  {
    "method": "GET",
    "path": "/api/v1/catalogue/courses",
    "summary": "The ready-made Bearilly courses, with whether this school has switched each one on."
  },
  {
    "method": "POST",
    "path": "/api/v1/courses",
    "summary": "Make a course of the school's own."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/courses/:id",
    "summary": "Change one of the school's own courses (title, description, level, status)."
  },
  {
    "method": "POST",
    "path": "/api/v1/courses/:id/assessments",
    "summary": "Make a quiz, with its questions, for one of the school's own courses."
  },
  {
    "method": "POST",
    "path": "/api/v1/courses/:id/units",
    "summary": "Add a unit to one of the school's own courses."
  },
  {
    "method": "GET",
    "path": "/api/v1/health",
    "summary": "Is the app up, and can it reach Supabase?"
  },
  {
    "method": "PATCH",
    "path": "/api/v1/lessons/:id",
    "summary": "Change a lesson of the school's own (title, notes, explanation, position)."
  },
  {
    "method": "POST",
    "path": "/api/v1/lessons/:id/images",
    "summary": "Upload an image to a lesson for teachers to include with the lesson notes."
  },
  {
    "method": "POST",
    "path": "/api/v1/progress/events",
    "summary": "A student opened or finished a lesson."
  },
  {
    "method": "GET",
    "path": "/api/v1/schools",
    "summary": "List all schools."
  },
  {
    "method": "POST",
    "path": "/api/v1/schools",
    "summary": "Create a school and its first admin. The admin's temporary password is shown once."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/schools/:id",
    "summary": "Rename, change type, rotate the invite code. Platform admins can also suspend."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/schools/:id/branding",
    "summary": "Change colours, font, logo, and the bear (name, fur, voice, accessories)."
  },
  {
    "method": "GET",
    "path": "/api/v1/schools/:id/api-keys",
    "summary": "List school server API keys without returning the raw secret."
  },
  {
    "method": "POST",
    "path": "/api/v1/schools/:id/api-keys",
    "summary": "Create a new API key for the school's server with a one-time secret reveal."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/schools/:id/api-keys/:keyId",
    "summary": "Rotate a key and return a fresh raw value once."
  },
  {
    "method": "DELETE",
    "path": "/api/v1/schools/:id/api-keys/:keyId",
    "summary": "Revoke a school API key immediately."
  },
  {
    "method": "GET",
    "path": "/api/v1/schools/:id/api-keys/:keyId/usage",
    "summary": "Read minute-bucket usage for one API key for the last 1 to 90 days."
  },
  {
    "method": "GET",
    "path": "/api/v1/schools/:id/domains",
    "summary": "List this school's connected website domains and verification status."
  },
  {
    "method": "POST",
    "path": "/api/v1/schools/:id/domains",
    "summary": "Start DNS TXT ownership verification for a school website domain; replacing a verified challenge requires explicit confirmation."
  },
  {
    "method": "POST",
    "path": "/api/v1/schools/:id/domains/:host/verify",
    "summary": "Verify a school website domain by checking its Bearilly DNS TXT challenge."
  },
  {
    "method": "DELETE",
    "path": "/api/v1/schools/:id/domains/:host",
    "summary": "Remove a school website domain and immediately stop allowing its browser origin."
  },
  {
    "method": "GET",
    "path": "/api/v1/students/:id/tutor-state",
    "summary": "The bear's mood for a student, worked out from their quiz scores and activity."
  },
  {
    "method": "POST",
    "path": "/api/v1/submissions/:id/grade",
    "summary": "A teacher marks, or changes, the points of an attempt."
  },
  {
    "method": "GET",
    "path": "/api/v1/teachers",
    "summary": "List teachers."
  },
  {
    "method": "POST",
    "path": "/api/v1/teachers",
    "summary": "Add a teacher. A temporary password is shown once."
  },
  {
    "method": "GET",
    "path": "/api/v1/teachers/:id",
    "summary": "One teacher. A teacher can only read themselves."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/teachers/:id",
    "summary": "Change a teacher's details or status."
  },
  {
    "method": "DELETE",
    "path": "/api/v1/teachers/:id",
    "summary": "Deactivate a teacher."
  },
  {
    "method": "GET",
    "path": "/api/v1/tenant",
    "summary": "Which school is this web address? Public. Used to brand the pages."
  },
  {
    "method": "POST",
    "path": "/api/v1/tutor/ask",
    "summary": "Ask the bear a question. The AI reads only the lesson notes; the answer is written for the bear to speak."
  },
  {
    "method": "GET",
    "path": "/api/v1/tutor/messages",
    "summary": "What the bear was asked. Students see their own; staff see their school's."
  },
  {
    "method": "POST",
    "path": "/api/v1/units/:id/lessons",
    "summary": "Add a lesson to a unit. \"notes\" is the content; \"explanation\" is what the bear says when the lesson opens."
  },
  {
    "method": "GET",
    "path": "/api/v1/schools/:id/dashboard",
    "summary": "School overview: active learners, slots used, average scores, and students needing help."
  },
  {
    "method": "POST",
    "path": "/api/v1/schools/:id/branding/logo",
    "summary": "Upload a PNG, JPEG or WebP school logo to that school's private storage folder (maximum 2 MB)."
  },
  {
    "method": "DELETE",
    "path": "/api/v1/schools/:id/branding/logo",
    "summary": "Remove the school's private logo."
  },
  {
    "method": "GET",
    "path": "/api/v1/teachers/:id/dashboard",
    "summary": "The signed-in teacher's learner list with average scores and bear moods."
  },
  {
    "method": "GET",
    "path": "/api/v1/students/:id/dashboard",
    "summary": "A learner's own courses, progress, results, mood and certificates."
  },
  {
    "method": "GET",
    "path": "/api/v1/students/:id/certificates",
    "summary": "Certificates visible to the learner or staff at their school."
  },
  {
    "method": "GET",
    "path": "/api/v1/certificates/verify/:code",
    "summary": "Publicly verify a certificate code without exposing student account details."
  },
  {
    "method": "GET",
    "path": "/api/v1/school-fees/schedules",
    "summary": "List fee schedules available to the caller in their school, including itemized fee lines."
  },
  {
    "method": "POST",
    "path": "/api/v1/school-fees/schedules",
    "summary": "Create a draft fee schedule with period, currency, class/student targeting, due date, and itemized amounts in currency minor units."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/school-fees/schedules/:id",
    "summary": "Edit a draft fee schedule and replace its itemized lines before it is published."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/school-fees/schedules/:id/status",
    "summary": "Publish a draft fee schedule or archive a schedule."
  },
  {
    "method": "GET",
    "path": "/api/v1/school-fees/invoices",
    "summary": "List fee invoices. Students only see their own invoices; staff see invoices in their school."
  },
  {
    "method": "GET",
    "path": "/api/v1/school-fees/payments",
    "summary": "List the school’s payment reconciliation records by status without revealing payer email or payment secrets."
  },
  {
    "method": "POST",
    "path": "/api/v1/school-fees/invoices",
    "summary": "Create one invoice for a student from a published schedule; optional additional-seat charges use Bearilly plan pricing and are gated on proven split settlement."
  },
  {
    "method": "GET",
    "path": "/api/v1/school-fees/invoices/:id",
    "summary": "Read an itemized invoice. A student can only read their own invoice."
  },
  {
    "method": "POST",
    "path": "/api/v1/school-fees/invoices/:id/checkout",
    "summary": "Initialize Paystack checkout for an unpaid invoice using the school’s encrypted Paystack secret."
  },
  {
    "method": "POST",
    "path": "/api/v1/school-fees/invoices/:id/verify",
    "summary": "Verify a Paystack transaction against the caller-owned invoice; the browser return alone never marks an invoice paid."
  },
  {
    "method": "GET",
    "path": "/api/v1/schools/:id/payments/settings",
    "summary": "Check whether a school Paystack account is configured without returning its secret."
  },
  {
    "method": "PUT",
    "path": "/api/v1/schools/:id/payments/settings",
    "summary": "Test and securely save or rotate the school’s Paystack secret; the secret is encrypted and never returned."
  },
  {
    "method": "DELETE",
    "path": "/api/v1/schools/:id/payments/settings",
    "summary": "Remove the school Paystack connection after pending student payments are settled."
  },
  {
    "method": "POST",
    "path": "/api/v1/school-payments/paystack/webhook",
    "summary": "Receive a school-fee Paystack webhook, verify its signature with that school’s secret, then confirm the transaction and settle idempotently."
  },
  {
    "method": "GET",
    "path": "/api/v1/admissions/:slug",
    "summary": "Read an enabled public admissions page and the application information configured by the school."
  },
  {
    "method": "POST",
    "path": "/api/v1/admissions/:slug",
    "summary": "Submit an online admission application and return a one-time private status token."
  },
  {
    "method": "GET",
    "path": "/api/v1/admissions/:slug/status",
    "summary": "Read a limited application status using its private tracking token."
  },
  {
    "method": "POST",
    "path": "/api/v1/admissions/:slug/payments",
    "summary": "Start Paystack checkout for an unpaid application fee using its private tracking token."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/admissions/:slug/payments",
    "summary": "Verify an application fee with Paystack; the browser return does not itself mark an application paid."
  },
  {
    "method": "POST",
    "path": "/api/v1/admissions/paystack/webhook",
    "summary": "Verify and reconcile Paystack webhook events for admission application fees."
  },
  {
    "method": "GET",
    "path": "/api/v1/schools/:id/admissions/settings",
    "summary": "Read the school admissions-page, exam/interview and student-fee gate settings."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/schools/:id/admissions/settings",
    "summary": "Save the school admissions page, application fee, exam/interview schedule and fee-gate settings."
  },
  {
    "method": "GET",
    "path": "/api/v1/schools/:id/admissions/applications",
    "summary": "List this school’s applications, optionally filtered by status and paginated."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/schools/:id/admissions/applications/:applicationId",
    "summary": "Update an application’s review status, exam score or decision note."
  },
  {
    "method": "POST",
    "path": "/api/v1/schools/:id/admissions/applications/:applicationId/admit",
    "summary": "Admit an applicant, allocate a school student ID, create the student login and optionally create a required first invoice."
  },
  {
    "method": "GET",
    "path": "/api/v1/schools/:id/identity",
    "summary": "Read the school’s configurable ID prefix and format with a preview."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/schools/:id/identity",
    "summary": "Update the format used for newly created student and staff IDs. Existing IDs remain unchanged."
  },
  {
    "method": "GET",
    "path": "/api/v1/students/:id/onboarding",
    "summary": "Read the student’s required first invoice and persistent onboarding/tour state."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/students/:id/onboarding",
    "summary": "Persist tour completion or confirm that a temporary password has been changed."
  },
  {
    "method": "GET",
    "path": "/api/v1/schools/:id/legacy",
    "summary": "Read safe legacy migration configuration without returning the encrypted shared secret or anon key."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/schools/:id/legacy",
    "summary": "Save a legacy Supabase project, public anon key, narrow table/column mapping and encrypted shared secret."
  },
  {
    "method": "POST",
    "path": "/api/v1/legacy/claim/start",
    "summary": "Look up a legacy student ID and send a short-lived code only when it matches the student’s verified Bearilly email."
  },
  {
    "method": "POST",
    "path": "/api/v1/legacy/claim/verify",
    "summary": "Verify the one-time legacy claim code and atomically link the legacy ID to the signed-in student."
  },
  {
    "method": "GET",
    "path": "/api/v1/sites",
    "summary": "List the school's website (a school has one). No subscription is needed: designing and previewing is free."
  },
  {
    "method": "POST",
    "path": "/api/v1/sites",
    "summary": "Create the school website with starter content (visible [ADD: ...] notes, never invented facts). The web address defaults to the school slug."
  },
  {
    "method": "GET",
    "path": "/api/v1/sites/:id",
    "summary": "Everything the builder screens need: site, pages, domains, setup-fee state, checklist, [ADD: ...] places left, preview and live links, and the template/font/section lists."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/sites/:id",
    "summary": "Change name, template, web address (until live) or settings (colours, fonts, tagline, contact, social links, search text). Switching template takes that template's colours and fonts. Every save keeps a version."
  },
  {
    "method": "POST",
    "path": "/api/v1/sites/:id/pages",
    "summary": "Add a page (up to 12). Sections are checked against a closed list of types; links and images are checked for safety."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/sites/:id/pages/:pageId",
    "summary": "Edit a page: title, address (not the home page), position, or the whole list of sections (this is what click-to-edit saves)."
  },
  {
    "method": "DELETE",
    "path": "/api/v1/sites/:id/pages/:pageId",
    "summary": "Delete a page. The home page cannot be deleted."
  },
  {
    "method": "POST",
    "path": "/api/v1/sites/:id/generate-copy",
    "summary": "Gemini writes home-page text from the school's own description. Only supplied facts are used; anything else becomes a visible [ADD: ...] note. Limited per school per day."
  },
  {
    "method": "GET",
    "path": "/api/v1/sites/:id/versions",
    "summary": "The last 50 saved versions of the site (newest first)."
  },
  {
    "method": "POST",
    "path": "/api/v1/sites/:id/versions/:version/restore",
    "summary": "Put the template, settings and pages back to how they were in a saved version. The restore is itself saved, so it can be undone."
  },
  {
    "method": "GET",
    "path": "/api/v1/sites/:id/assets",
    "summary": "List the site's uploaded pictures. Use each picture's url in logo_url, hero image_url or a gallery."
  },
  {
    "method": "POST",
    "path": "/api/v1/sites/:id/assets",
    "summary": "Upload a PNG, JPEG or WebP picture (max 3 MB, up to 40 per site) as multipart form data in the \"image\" field. SVG is refused."
  },
  {
    "method": "DELETE",
    "path": "/api/v1/sites/:id/assets/:assetId",
    "summary": "Delete a picture and remove every place on the site that used it."
  },
  {
    "method": "POST",
    "path": "/api/v1/sites/:id/checkout",
    "summary": "Pay and publish: starts the one-time website setup fee checkout. If the fee is already covered (paid earlier, or part of the subscription) the site goes live with no charge. confirm_reviewed must be true."
  },
  {
    "method": "POST",
    "path": "/api/v1/sites/:id/verify",
    "summary": "Verify the setup-fee payment with Paystack after the school returns. Paying makes the site live (the Paystack webhook does the same, so closing the tab is safe)."
  },
  {
    "method": "POST",
    "path": "/api/v1/sites/:id/publish",
    "summary": "Go live once the setup fee is covered. Needs confirm_reviewed: true; refuses while [ADD: ...] notes remain unless allow_placeholders is true. Creates the free address <slug>.<root domain>."
  },
  {
    "method": "GET",
    "path": "/api/v1/sites/:id/domains",
    "summary": "The site's addresses: the free Bearilly one and any domains the school connected, with DNS steps for those not verified yet."
  },
  {
    "method": "POST",
    "path": "/api/v1/sites/:id/domains",
    "summary": "Connect the school's own domain (after publishing). Attached through the Vercel API when configured, otherwise recorded for manual attaching. Returns plain DNS records to add."
  },
  {
    "method": "DELETE",
    "path": "/api/v1/sites/:id/domains/:host",
    "summary": "Disconnect a custom domain. The free Bearilly address cannot be removed."
  },
  {
    "method": "POST",
    "path": "/api/v1/sites/:id/domains/:host/verify",
    "summary": "Check whether a custom domain is pointed at Bearilly correctly. Once verified, the site answers on it."
  },
  {
    "method": "GET",
    "path": "/api/v1/preview/:siteId",
    "summary": "Public free preview of a site as JSON (the same data the /preview/<id> page draws). Not indexed by search engines; expires 410 PREVIEW_EXPIRED if unpaid and not edited for a while."
  },
  {
    "method": "GET",
    "path": "/api/v1/site-assets/:id",
    "summary": "A website picture. Public only while its site is live or its free preview has not expired."
  },
  {
    "method": "GET",
    "path": "/api/v1/domains/suggest",
    "summary": "Suggest domain names for the school and say whether each looks available. Buying stays manual in the first version."
  },
  {
    "method": "GET",
    "path": "/api/v1/staff/session",
    "summary": "Staff only. Am I signed in to the Content Studio? Answers 404 when staff tools are off or the caller is not on STAFF_IP_ALLOWLIST."
  },
  {
    "method": "POST",
    "path": "/api/v1/staff/session",
    "summary": "Staff only. Sign in with the staff key (made with openssl rand -hex 32) and your name; sets a signed session cookie. Wrong keys are throttled."
  },
  {
    "method": "DELETE",
    "path": "/api/v1/staff/session",
    "summary": "Staff only. Sign out (clears the session cookie)."
  },
  {
    "method": "GET",
    "path": "/api/v1/staff/content/courses",
    "summary": "Staff session. Every shared catalogue course with its unit, lesson and switched-on school counts."
  },
  {
    "method": "POST",
    "path": "/api/v1/staff/content/courses",
    "summary": "Staff session. Create a catalogue course. It starts as a draft (hidden from schools) until published."
  },
  {
    "method": "GET",
    "path": "/api/v1/staff/content/courses/:id",
    "summary": "Staff session. A catalogue course with all its units and lessons (notes and explanations included)."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/staff/content/courses/:id",
    "summary": "Staff session. Change title, level, description or status (draft, published, archived). Send expected_updated_at to refuse a save based on an old copy."
  },
  {
    "method": "POST",
    "path": "/api/v1/staff/content/courses/:id/units",
    "summary": "Staff session. Add a unit at the end of the course."
  },
  {
    "method": "GET",
    "path": "/api/v1/staff/content/courses/:id/schools",
    "summary": "Staff session. Every school, whether this course is switched on for it, and how many students are taking it there."
  },
  {
    "method": "PUT",
    "path": "/api/v1/staff/content/courses/:id/schools",
    "summary": "Staff session. Set exactly which schools have the course switched on. Switching it off where students are taking it needs confirm_students: true."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/staff/content/units/:id",
    "summary": "Staff session. Rename a unit, or move it up or down."
  },
  {
    "method": "DELETE",
    "path": "/api/v1/staff/content/units/:id",
    "summary": "Staff session. Delete an empty unit."
  },
  {
    "method": "POST",
    "path": "/api/v1/staff/content/units/:id/lessons",
    "summary": "Staff session. Add a lesson (title, notes, the bear explanation) at the end of the unit."
  },
  {
    "method": "PATCH",
    "path": "/api/v1/staff/content/lessons/:id",
    "summary": "Staff session. Change a lesson: title, notes (up to 50,000 characters), explanation (up to 1,500), move up or down, or move to another unit of the course."
  },
  {
    "method": "DELETE",
    "path": "/api/v1/staff/content/lessons/:id",
    "summary": "Staff session. Delete a lesson. Refused while students have progress on it."
  },
  {
    "method": "POST",
    "path": "/api/v1/staff/content/import",
    "summary": "Staff session. Paste a whole course in the Markdown format. dry_run (the default) checks it and says what would change; dry_run: false writes it."
  },
  {
    "method": "GET",
    "path": "/api/v1/staff/content/activity",
    "summary": "Staff session. The change log: who changed the catalogue, from which address, and when (newest first)."
  }
]);

export function createBearillyClient({ fetchImpl = fetch } = {}) {
  const origin = typeof window !== 'undefined' && window.location && window.location.origin;
  if (!origin) throw new Error('The generated Bearilly client is for browser requests through the same-origin server proxy.');
  const base = new URL(origin);
  return {
    async request(method, pathname, { query, body } = {}) {
      const verb = String(method).toUpperCase();
      const url = new URL(pathname, base);
      const allowed = BEARILLY_ENDPOINTS.some((endpoint) => {
        if (endpoint.method !== verb) return false;
        const template = endpoint.path.split('/').filter(Boolean);
        const actual = url.pathname.split('/').filter(Boolean);
        return url.origin === base.origin &&
          url.pathname.startsWith('/api/v1/') &&
          template.length === actual.length &&
          template.every((part, index) => part.startsWith(':') || part === actual[index]);
      });
      if (!allowed) throw new Error('This method and path are not in the generated Bearilly API contract.');
      for (const [key, value] of Object.entries(query || {})) url.searchParams.set(key, String(value));
      const response = await fetchImpl(url, {
        method: verb,
        credentials: 'same-origin',
        headers: { Accept: 'application/json', ...(body === undefined ? {} : { 'Content-Type': 'application/json' }) },
        ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error?.message || 'The Bearilly request failed.');
      return payload?.data;
    },
  };
}
