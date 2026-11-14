'use client';

import { useState } from 'react';
import { useRouter } from '../../lib/app/nav.js';
import AuthFrame from '../../components/app/AuthFrame';
import { Button, Input } from '../../components/ui';
import { useTitle } from '../../lib/app/hooks';

// Public: anyone (an employer, another school) can check a certificate code.
export default function Verify() {
  useTitle('Check a certificate');
  const router = useRouter();
  const [code, setCode] = useState('');
  const [touched, setTouched] = useState(false);
  const clean = code.trim().toUpperCase();
  const invalid = clean.length < 6;
  return (
    <AuthFrame title="Check a certificate" sub="Enter the certificate number printed at the bottom of the certificate.">
      <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          setTouched(true);
          if (!invalid) router.push(`/certificate/${encodeURIComponent(clean)}`);
        }}
        noValidate
      >
        <Input label="Certificate number" placeholder="BRL-…" value={code} onChange={(e) => setCode(e.target.value)} error={touched && invalid ? 'Enter the full certificate number' : ''} autoCapitalize="characters" spellCheck={false} />
        <Button type="submit" block icon="shield">
          Check certificate
        </Button>
      </form>
    </AuthFrame>
  );
}
