'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { WaveformAnimation } from '@/components/WaveformAnimation';
import { VoiceRecorder } from '@/components/VoiceRecorder';
import { Trash2, Send, Save, BookOpen } from 'lucide-react';

export default function InterviewPage() {
  const router = useRouter();
  const { sessionId, images, transcript, addTranscriptLine, status, setStatus } = useStore();
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (!sessionId) {
      router.push('/');
    }
  }, [sessionId, router]);

  const handleSubmitAnswer = () => {
    if (currentAnswer.trim()) {
      addTranscriptLine(currentAnswer);
      setCurrentAnswer('');
      // Cycle through uploaded images to prompt different questions
      setCurrentImageIndex((prev) => (prev + 1) % (images.length || 1));
    }
  };

  const handleFinishStory = async () => {
    if (transcript.length === 0 && !currentAnswer) {
      alert('Please tell us a bit of your story before finishing.');
      return;
    }

    const fullTranscript = [...transcript, currentAnswer].filter(Boolean).join(' ');
    if (fullTranscript.length < 50) {
      alert('Your story is a bit short. Tell us a little more to create a beautiful biography!');
      return;
    }

    setIsFinishing(true);
    try {
      // Trigger the process API
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, transcript: fullTranscript }),
      });

      if (!response.ok) {
        throw new Error('Failed to start processing');
      }

      setStatus('processing');
      router.push('/loading');
    } catch (err) {
      console.error('Processing error:', err);
      alert('There was an error processing your story. Please try again.');
      setIsFinishing(false);
    }
  };

  const questions = [
    "Tell me about your earliest memory related to this photo...",
    "Who are the people in this picture, and what was your relationship like?",
    "What was the atmosphere or the mood during this moment?",
    "If you could go back to this day, what one thing would you do differently?",
    "What does this photo represent in the larger story of your life?"
  ];

  if (!sessionId) return null;

  return (
    <main className="min-h-screen bg-cream py-8 px-4 md:py-16">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="flex items-center justify-between border-b border-navy/10 pb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-navy" />
            <h1 className="font-serif text-xl font-bold text-navy">Recording Your Story</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={() => router.push('/')}>
            End Session
          </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-6">
            <Card className="overflow-hidden p-0 border-2 border-navy/5 shadow-lg">
              <div className="relative aspect-[4/3] bg-navy/5">
                {images[currentImageIndex] ? (
                  <img
                    src={images[currentImageIndex]}
                    alt="Current Memory"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-navy/20">
                    <BookOpen className="h-16 w-16" />
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-navy/80 to-transparent p-4">
                  <p className="text-white text-sm font-medium italic">
                    {questions[currentImageIndex % questions.length]}
                  </p>
                </div>
              </div>
            </Card>

            <VoiceRecorder
              onTranscriptComplete={(text) => setCurrentAnswer(text)}
              disabled={isFinishing}
            />
          </div>

          <div className="space-y-6">
            <Card className="flex flex-col h-[400px] border-2 border-navy/5 shadow-lg bg-white">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {transcript.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center space-y-4 text-charcoal-light opacity-50 text-center">
                    <WaveformAnimation />
                    <p className="text-sm">Your conversation will appear here...</p>
                  </div>
                ) : (
                  transcript.map((line, i) => (
                    <div key={i} className="rounded-lg bg-navy/5 p-3 text-sm text-charcoal shadow-sm border border-navy/5">
                      {line}
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-t border-navy/5 bg-cream/30">
                <div className="relative">
                  <textarea
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Tell me more..."
                    className="w-full rounded-md border border-navy/10 bg-white p-3 pr-12 text-sm focus:ring-2 focus:ring-navy outline-none resize-none h-24"
                    disabled={isFinishing}
                  />
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!currentAnswer.trim() || isFinishing}
                    className="absolute bottom-3 right-3 rounded-full bg-navy p-2 text-white hover:bg-navy-light disabled:bg-navy/20"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>

            <div className="flex flex-col space-y-3">
              <Button
                variant="secondary"
                className="w-full text-lg font-bold h-12 shadow-md"
                onClick={handleFinishStory}
                isLoading={isFinishing}
              >
                <Save className="mr-2 h-5 w-5" />
                Finish My Story
              </Button>
              <p className="text-xs text-center text-charcoal-light">
                Click Finish My Story when you're ready to create your biography.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
