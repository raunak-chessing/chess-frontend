"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { studiesApi } from '../../api/studiesApi';
import { Card } from '../../../../components/ui/Card';
import { SectionHeader } from '../../../../components/ui/SectionHeader';
import { authClient } from '@/lib/auth-client';
import { toast } from 'react-hot-toast';

export function StudiesExplorer() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [studies, setStudies] = useState<any[]>([]);
  const [myStudies, setMyStudies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      studiesApi.getStudies().then(setStudies),
      session?.user ? studiesApi.getMyStudies().then(setMyStudies) : Promise.resolve([])
    ]).finally(() => setLoading(false));
  }, [session]);

  const handleCreateStudy = async () => {
    if (!session?.user) {
      toast.error('You must be logged in to create a study');
      return;
    }
    try {
      const title = prompt('Enter a title for your new study:');
      if (!title) return;
      const newStudy = await studiesApi.createStudy({ title });
      router.push(`/studies/${newStudy.id}`);
    } catch (e) {
      toast.error('Failed to create study');
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-text-secondary">Loading studies...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 font-sans">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">Interactive Studies</h1>
          <p className="text-text-secondary">Explore community chess studies or create your own to analyze games.</p>
        </div>
        <button 
          onClick={handleCreateStudy}
          className="bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md active:translate-y-1"
        >
          + Create Study
        </button>
      </div>

      {session?.user && myStudies.length > 0 && (
        <div className="space-y-4">
          <SectionHeader>My Studies</SectionHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myStudies.map(study => (
              <Card 
                key={study.id} 
                className="p-4 cursor-pointer hover:border-primary transition-colors flex flex-col gap-2 bg-surface"
                onClick={() => router.push(`/studies/${study.id}`)}
              >
                <h3 className="font-bold text-text-primary text-lg">{study.title}</h3>
                <div className="flex justify-between text-sm text-text-secondary">
                  <span>{study._count.chapters} Chapters</span>
                  <span>{new Date(study.createdAt).toLocaleDateString()}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <SectionHeader>Public Studies</SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studies.map(study => (
            <Card 
              key={study.id} 
              className="p-4 cursor-pointer hover:border-primary transition-colors flex flex-col gap-2 bg-surface"
              onClick={() => router.push(`/studies/${study.id}`)}
            >
              <h3 className="font-bold text-text-primary text-lg">{study.title}</h3>
              <div className="flex justify-between items-center text-sm text-text-secondary">
                <span className="font-medium text-primary">by {study.owner.name} ({study.owner.rating})</span>
                <span>{study._count.chapters} Chapters</span>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
