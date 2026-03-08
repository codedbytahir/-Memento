/**
 * Landing page of the Memento application where users begin their journey.
 * It features an image upload zone and email collection form to initialize a new biography session.
 */
'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { UploadZone } from '@/components/UploadZone';
import { useStore } from '@/lib/store';
import { CreateSessionRequest, CreateSessionResponse } from '@/types/api';

export default function Home() {
  const router = useRouter();
  const { setSession, images } = useStore();

  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleStartStory = async () => {
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (images.length === 0) {
      setError('Please upload at least one photo to start.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const body: CreateSessionRequest = {
        email,
        images,
      };

      const response = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create session');
      }

      const { sessionId }: CreateSessionResponse = await response.json();
      setSession(sessionId, email);
      router.push('/interview');

    } catch (err: any) {
      console.error('Session creation error:', err);
      setError(err.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream px-4 py-12 md:py-24">
      <div className="mx-auto max-w-lg space-y-12">
        <div className="flex flex-col items-center space-y-4">
          <Image
            src="/logo.svg"
            alt="Memento - Preserve Your Story"
            width={512}
            height={150}
            className="h-16 w-auto"
            priority
          />
        </div>

        <Card className="space-y-8 p-8 border-2 border-navy/5 shadow-xl">
          <div className="space-y-2 text-center">
            <h2 className="font-serif text-3xl font-bold text-navy">
              Start Your Story
            </h2>
            <p className="text-charcoal-light">
              Upload up to 5 photos and enter your email to begin your journey with our AI biographer.
            </p>
          </div>

          <div className="space-y-6">
            <UploadZone />

            <div className="space-y-4">
              <Input
                type="email"
                placeholder="📧 your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={error && error.includes('email') ? error : undefined}
                className="focus:ring-navy"
              />

              <Button
                onClick={handleStartStory}
                className="w-full text-lg font-bold h-14"
                isLoading={isLoading}
              >
                🎤 Start My Story
              </Button>
            </div>

            {error && !error.includes('email') && (
              <p className="text-sm text-red-500 text-center font-medium">{error}</p>
            )}

            {process.env.NEXT_PUBLIC_DEV_MODE === 'true' && (
               <div className="flex justify-center">
                 <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-yellow-800 border border-yellow-200">
                   🔧 DEV MODE - No AWS charges
                 </span>
               </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
