// HELP CENTRE content (roadmap Phase 8). Plain words, short steps. `roles` says who sees a topic first;
// everyone can still search everything.
export const HELP_GROUPS = [
  { id: 'start', title: 'Getting started' },
  { id: 'learning', title: 'Learning with the bear' },
  { id: 'teaching', title: 'Teaching and marking' },
  { id: 'school', title: 'Running your school' },
  { id: 'money', title: 'Payments' },
  { id: 'website', title: 'Your school website' },
  { id: 'account', title: 'Account and settings' },
];

export const HELP_TOPICS = [
  // Getting started
  { group: 'start', roles: ['student', 'teacher', 'school_admin', 'out'], q: 'How do I sign in?', steps: ['Open your school’s Bearilly address (for example yourschool.bearilly.com).', 'Type the email and password your school gave you.', 'The first time, you are asked to choose your own password.'] },
  { group: 'start', roles: ['student', 'out'], q: 'I have an invite code. How do I join?', steps: ['On the sign-in page, choose “Create an account”.', 'Type the invite code from your school, your name, email and a password.', 'You land on your Home screen, ready to learn.'] },
  { group: 'start', roles: ['student', 'teacher', 'school_admin', 'out'], q: 'I forgot my password', steps: ['On the sign-in page, choose “Forgot password?”.', 'Type your email. A reset link is sent to you.', 'Students without an email: ask your school admin to set a new temporary password.'] },
  { group: 'start', roles: ['student', 'teacher', 'school_admin'], q: 'Can I install Bearilly like an app?', steps: ['On Android (Chrome): open the menu ⋮ and choose “Install app” or “Add to Home screen”.', 'On iPhone (Safari): tap Share, then “Add to Home Screen”.', 'It opens full screen and works on slow connections.'] },
  // Learning
  { group: 'learning', roles: ['student'], q: 'How do lessons work?', steps: ['Go to Learn and open a course.', 'Open a lesson. The bear explains it out loud and the notes are on screen.', 'When you have finished, tap “Mark as done” to move on.'] },
  { group: 'learning', roles: ['student'], q: 'How do I ask the bear a question?', steps: ['Tap “Bear AI”, or the bear in the corner, and type your question.', 'The bear answers from your school’s own lesson notes.', 'If the notes do not cover it, the bear says so and suggests asking your teacher, rather than guessing.'] },
  { group: 'learning', roles: ['student'], q: 'How are quizzes marked?', steps: ['Multiple-choice answers are marked straight away.', 'Written answers go to your teacher, who marks them and can leave a comment.', 'Your grades are under Tasks → Grades.'] },
  { group: 'learning', roles: ['student'], q: 'How do I get a certificate?', steps: ['Finish every lesson and pass the course quizzes.', 'Your certificate appears under Me → My certificates.', 'Each certificate has a code anyone can check on the Verify page.'] },
  { group: 'learning', roles: ['student'], q: 'What is the Playground?', steps: ['Games (chess, Scrabble, draughts, Ludo, Ayo and a property game) for a short break.', 'Play the bear, which explains good moves in training mode, or challenge a classmate.', 'Your school can see Playground use, and it never replaces lesson time.'] },
  // Teaching
  { group: 'teaching', roles: ['teacher', 'school_admin'], q: 'How do I mark written answers?', steps: ['Open Marking. Answers waiting for you are at the top.', 'Read the answer, give a score and an optional comment.', 'Save. The student sees the grade and comment straight away.'] },
  { group: 'teaching', roles: ['teacher', 'school_admin'], q: 'How do I add a lesson?', steps: ['Open Courses and choose a course.', 'Add a unit, then a lesson inside it.', 'Write clear notes: the bear teaches only from these notes, so it never makes things up.'] },
  { group: 'teaching', roles: ['teacher', 'school_admin'], q: 'What does a flagged bear chat mean?', steps: ['The bear flags a chat when a learner seems upset, unsafe or stuck.', 'Open Bear chats to read it in full.', 'Follow your school’s safeguarding steps for anything worrying.'] },
  { group: 'teaching', roles: ['teacher'], q: 'Who “needs help”?', steps: ['On My learners, a learner who is falling behind or scoring low is marked “needs help”.', 'Open their name to see lessons, scores and recent questions to the bear.'] },
  // School
  { group: 'school', roles: ['school_admin'], q: 'How do I add students?', steps: ['Open Students → Add student, type their name (email is optional), and save.', 'Copy the temporary password shown and give it to the student.', 'For many students, use “Import spreadsheet” with the CSV template.'] },
  { group: 'school', roles: ['school_admin'], q: 'How do I add teachers?', steps: ['Open Teachers → Add teacher.', 'They get a temporary password and choose their own the first time they sign in.'] },
  { group: 'school', roles: ['school_admin'], q: 'How do I change our colours and bear?', steps: ['Open Branding & bear.', 'Upload your logo and pick your colours. The preview updates as you go.', 'Give your bear a name and voice, then save. Everyone sees it on their next visit.'] },
  // Money
  { group: 'money', roles: ['school_admin'], q: 'How does billing work?', steps: ['You pay per student, per term, through Paystack.', 'Open Billing & slots, pick a plan, the number of students and the term, then pay.', 'Need more students mid-term? Choose “Add slots”. You only pay for the rest of the term.'] },
  { group: 'money', roles: ['school_admin'], q: 'What happens when slots run out?', steps: ['You cannot add more students until you add slots.', 'Existing students keep learning.', 'A banner warns you before you run out.'] },
  { group: 'money', roles: ['school_admin'], q: 'How do parents pay school fees?', steps: ['Open School fees → Payment account and connect your school’s own Paystack account. Money goes straight to the school.', 'Create a fee schedule (tuition, books, etc.) and publish it.', 'Send invoices to students. They (or their parents) pay from Me → School fees.'] },
  { group: 'money', roles: ['student'], q: 'How do I pay my school fees?', steps: ['Open Me → School fees.', 'Choose an invoice and tap Pay. You go to Paystack to pay safely.', 'You come back to Bearilly and the invoice shows as paid.'] },
  { group: 'money', roles: ['school_admin', 'student'], q: 'I paid but it still says unpaid', steps: ['Wait a minute and refresh. Paystack sometimes takes a moment to confirm.', 'On the payment page, tap “I have paid · check now”.', 'Still unpaid after an hour? Contact Bearilly support with your Paystack reference.'] },
  // Website
  { group: 'website', roles: ['school_admin'], q: 'We do not have a website. Can Bearilly build one?', steps: ['Open Website builder and describe your school in your own words.', 'The bear writes the pages. Anything it does not know is marked [ADD: …] so nothing is invented.', 'Edit the text, pictures and colours with the phone/tablet/desktop preview. Designing is free.', 'When it is ready, pay the one-time setup fee and publish.'] },
  { group: 'website', roles: ['school_admin'], q: 'How do I use our own domain name?', steps: ['Publish your website first.', 'In Website builder → Domain, type your domain (for example ourschool.ng) and choose Connect.', 'Add the DNS records shown where you bought the domain, then tap “Check now”. It can take a few hours.'] },
  { group: 'website', roles: ['school_admin'], q: 'We already have a website. How do we connect it?', steps: ['Open Connect your website.', 'Create an API key and add your website’s address to the allowed list.', 'Give the key and the instructions to your web developer.'] },
  // Account
  { group: 'account', roles: ['student', 'teacher', 'school_admin'], q: 'Can I turn the bear’s voice off?', steps: ['Students: Me → Bear voice. Staff: Account → Bear voice.', 'The bear still shows its words on screen.', 'You can also keep its words on screen longer and switch its movement off.'] },
  { group: 'account', roles: ['student', 'teacher', 'school_admin'], q: 'How do I change my password?', steps: ['Students: Me → Password & privacy. Staff: Account.', 'Type your current password and a new one (at least 8 characters).'] },
  { group: 'account', roles: ['student', 'teacher', 'school_admin', 'out'], q: 'Is my information safe?', steps: ['Each school only ever sees its own students.', 'Payments go through Paystack; Bearilly never sees card details.', 'Chats with the bear are visible to your school’s teachers for safeguarding.'] },
];
