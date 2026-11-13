import AuthFrame from '../components/app/AuthFrame';
import { Button } from '../components/ui';

export const metadata = { title: 'Page not found' };

// Shown for any address that does not exist (roadmap Phase 8: friendly error pages).
export default function NotFound() {
  return (
    <AuthFrame title="We can’t find that page" sub="The link may be old, or the address has a typo." emotion="worried" pose="cheeks">
      <div className="stack">
        <Button href="/" block icon="home">
          Go to the start
        </Button>
        <Button href="/help" variant="outline" block>
          Get help
        </Button>
      </div>
    </AuthFrame>
  );
}
