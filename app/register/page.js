import SchoolChromeSlot from '../../components/app/SchoolChromeSlot';
import RegisterScreen from '../../components/app/screens/RegisterScreen';

// The page itself is a thin server file: the screen is in components/app/screens. On a school's own website the screen sits
// inside the school's own menu, footer and style sheets (SchoolChromeSlot, written by Bearilly Buildgram); on Bearilly's own
// website the slot adds nothing.
export default function Page() {
  return (
    <SchoolChromeSlot>
      <RegisterScreen />
    </SchoolChromeSlot>
  );
}
