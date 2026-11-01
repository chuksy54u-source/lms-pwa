import StaffShell from '../../components/app/StaffShell.jsx';

export default function StaffLayout({ children }) {
  return <StaffShell roles={['school_admin']}>{children}</StaffShell>;
}
