'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { LoadingBook } from '@/components/LoadingBook';
import { StatusResponse } from '@/types/api';

export default function LoadingPage() {
  const router = useRouter();
  const { sessionId, status, setStatus } = useStore();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }

    const pollStatus = async () => {
      try {
        const response = await fetch(`/api/status/${sessionId}`);
        if (response.ok) {
          const data: StatusResponse = await response.json();
          setProgress(data.progress || 0);

          if (data.status === 'completed') {
            setStatus('completed');
            router.push('/preview');
          } else if (data.status === 'failed') {
            setStatus('failed');
            alert('Something went wrong during processing. Please try again.');
            router.push('/interview');
          }
        }
      } catch (err) {
        console.error('Status polling error:', err);
      }
    };

    const intervalId = setInterval(pollStatus, 3000);
    return () => clearInterval(intervalId);
  }, [sessionId, router, setStatus]);

  if (!sessionId) return null;

  return (
    <main className="min-h-screen bg-cream flex flex-col items-center justify-center p-8">
      <div className="w-full max-w-lg space-y-12">
        <LoadingBook />

        <div className="space-y-4">
          <div className="relative h-4 w-full rounded-full bg-navy/5 overflow-hidden border border-navy/10 shadow-inner">
            <div
              className="absolute left-0 top-0 h-full bg-copper transition-all duration-1000 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-center font-bold text-navy text-lg">
            {progress}%
          </p>
        </div>
      </div>
    </main>
  );
}
