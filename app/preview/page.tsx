'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/lib/store';
import { PDFPreview } from '@/components/PDFPreview';
import { StatusResponse } from '@/types/api';

export default function PreviewPage() {
  const router = useRouter();
  const { sessionId, pdfUrl, setPdfUrl } = useStore();
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      router.push('/');
      return;
    }

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/status/${sessionId}`);
        if (response.ok) {
          const data: StatusResponse = await response.json();
          if (data.status === 'completed' && data.pdfUrl) {
            setPdfUrl(data.pdfUrl);
          }
        }
      } catch (err) {
        console.error('Error fetching session status:', err);
      }
    };

    if (!pdfUrl) {
      fetchStatus();
    }
  }, [sessionId, pdfUrl, setPdfUrl, router]);

  const handleSendEmail = async () => {
    if (isSending || sent) return;

    setIsSending(true);
    try {
      const response = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      setSent(true);
      alert('Your biography has been sent to your email!');
    } catch (err) {
      console.error('Email sending error:', err);
      alert('Failed to send email. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  const handleDownload = () => {
    if (pdfUrl) {
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = 'memento-biography.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (!sessionId) return null;

  return (
    <main className="min-h-screen bg-cream py-12 px-4 md:py-24">
      {pdfUrl ? (
        <PDFPreview
          pdfUrl={pdfUrl}
          onSendEmail={handleSendEmail}
          isSending={isSending}
          onDownload={handleDownload}
        />
      ) : (
        <div className="flex flex-col items-center justify-center space-y-8 py-12">
          <h2 className="font-serif text-3xl font-bold text-navy">Generating Your PDF...</h2>
          <div className="h-24 w-24 animate-spin rounded-full border-8 border-navy border-t-copper" />
        </div>
      )}
    </main>
  );
}
