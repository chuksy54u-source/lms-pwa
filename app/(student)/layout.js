import StudentShell from '../../components/app/StudentShell';

// Every student page: role check, bottom tabs (side rail on a computer), install prompt.
export default function StudentLayout({ children }) {
  return <StudentShell>{children}</StudentShell>;
}
