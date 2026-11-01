import StaffShell from '../../components/app/StaffShell.jsx';

export default function StaffLayout({ children }) {
  return <StaffShell roles={['teacher', 'school_admin']}>{children}</StaffShell>;
}
