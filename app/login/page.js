// Written by Bearilly Buildgram (full codebase swap). The design of the school's own login page, kept as designed.
// Its form signs in to Bearilly through LoginAdapter (see components/app/LoginAdapter.jsx).
import '../../school-site/src/app/globals.css';
import LoginAdapter from '../../components/app/LoginAdapter';
import SchoolLogin from '../../school-site/src/app/login/page';

export default function Login(props) {
  return (
    <LoginAdapter>
      <SchoolLogin {...props} />
    </LoginAdapter>
  );
}
