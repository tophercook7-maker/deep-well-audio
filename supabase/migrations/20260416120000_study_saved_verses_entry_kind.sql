// lib/ageGate.ts

const STORAGE_KEY = 'ss_age_verified';

export function isAgeVerified() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return false;
    const parsed = JSON.parse(data);
    return parsed.verified === true;
  } catch {
    return false;
  }
}

export function verifyAge() {
  try {
    const payload = {
      verified: true,
      timestamp: Date.now(),
      version: 2,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch {
    return false;
  }
}

export function clearAgeVerification() {
  localStorage.removeItem(STORAGE_KEY);
}


// components/AgeGate.tsx

import React, { useEffect, useState } from 'react';
import { isAgeVerified, verifyAge } from '../lib/ageGate';

interface AgeGateProps {
  children: React.ReactNode;
  isPublicRoute?: boolean;
}

export default function AgeGate({ children, isPublicRoute = false }: AgeGateProps) {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (isPublicRoute) {
      setVerified(true);
      setLoading(false);
      return;
    }
    const checkVerified = isAgeVerified();
    setVerified(checkVerified);
    setLoading(false);
  }, [isPublicRoute]);

  function handleConfirm() {
    verifyAge();
    setVerified(true);
  }

  function handleLeave() {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = 'https://www.google.com';
    }
  }

  if (loading) {
    return <div>Loading...</div>;
  }

  if (verified) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'white',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '2rem',
        textAlign: 'center',
        zIndex: 9999,
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="age-gate-title"
    >
      <h1 id="age-gate-title" style={{ marginBottom: '1rem' }}>
        This site is for adults 18+
      </h1>
      <p style={{ marginBottom: '2rem', maxWidth: 320 }}>
        By continuing, you confirm you are at least 18 years old.
      </p>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={handleConfirm}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: 4,
          }}
          autoFocus
        >
          I am 18+
        </button>
        <button
          onClick={handleLeave}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
            backgroundColor: '#e0e0e0',
            border: 'none',
            borderRadius: 4,
          }}
        >
          Leave site
        </button>
      </div>
    </div>
  );
}
