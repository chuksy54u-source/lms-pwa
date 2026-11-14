import SchoolChromeSlot from '../../components/app/SchoolChromeSlot';
import ForgotPasswordScreen from '../../components/app/screens/ForgotPasswordScreen';

// The page itself is a thin server file: the screen is in components/app/screens. On a school's own website the screen sits
// inside the school's own menu, footer and style sheets (SchoolChromeSlot, written by Bearilly Buildgram); on Bearilly's own
// website the slot adds nothing.
export default function Page() {
  return (
    <SchoolChromeSlot>
      <ForgotPasswordScreen />
    </SchoolChromeSlot>
  );
}
