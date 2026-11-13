// Written by Bearilly Buildgram (full codebase swap). The school's own landing page, kept as designed.
import '../school-site/src/app/globals.css';
import LandingGate from '../components/app/LandingGate';
import SchoolChrome from '../school-site/src/app/layout';
import SchoolLanding from '../school-site/src/app/page';

export default function Home(props) {
  return (
    <LandingGate>
      <SchoolChrome>
        <SchoolLanding {...props} />
      </SchoolChrome>
    </LandingGate>
  );
}
