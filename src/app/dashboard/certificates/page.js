import { redirect } from 'next/navigation';

export default function LegacyRouteRedirect() {
  redirect('/me/certificates');
}
