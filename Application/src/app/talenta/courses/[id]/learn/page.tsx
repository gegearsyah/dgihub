'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import VideoPlayer from '@/components/VideoPlayer';
import DocumentViewer from '@/components/DocumentViewer';
import QuizViewer from '@/components/QuizViewer';
import { Play, FileText, HelpCircle, CheckCircle2, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export default function LearnPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  const [materials, setMaterials] = useState<any[]>([]);
  const [currentMaterial, setCurrentMaterial] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadMaterials();
  }, [courseId, isAuthenticated]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getCourseMaterials(courseId);
      if (response.success && response.data) {
        const materialsArray = Array.isArray(response.data) ? response.data : [];
        
        // Load progress for each material
        const materialsWithProgress = await Promise.all(
          materialsArray.map(async (material: any) => {
            try {
              const progressResponse = await apiClient.getMaterialProgress(material.materi_id);
              if (progressResponse.success && progressResponse.data) {
                const progressData = progressResponse.data as any;
                return {
                  ...material,
                  completed: (progressData.progress_percentage || 0) >= 100,
                  progress: progressData.progress_percentage || 0,
                  lastPosition: progressData.last_position || 0,
                  timeSpent: progressData.time_spent_seconds || 0
                };
              }
            } catch (error) {
              console.error(`Failed to load progress for material ${material.materi_id}:`, error);
            }
            return {
              ...material,
              completed: material.completed || false,
              progress: 0,
              lastPosition: 0,
              timeSpent: 0
            };
          })
        );
        
        setMaterials(materialsWithProgress);
        // Set first incomplete material or first material
        const incomplete = materialsWithProgress.find((m: any) => !m.completed);
        setCurrentMaterial(incomplete || materialsWithProgress[0]);
      }
    } catch (error) {
      console.error('Failed to load materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMaterialComplete = async () => {
    if (!currentMaterial || currentMaterial.completed) return;

    try {
      setCompleting(true);
      const response = await apiClient.markMaterialComplete(currentMaterial.materi_id);
      if (response.success) {
        // Update material status
        setMaterials((prev) =>
          prev.map((m) =>
            m.materi_id === currentMaterial.materi_id
              ? { ...m, completed: true, completedAt: new Date().toISOString() }
              : m
          )
        );
        setCurrentMaterial((prev: any) => ({
          ...prev,
          completed: true,
          completedAt: new Date().toISOString()
        }));

        // Move to next incomplete material
        const nextIncomplete = materials.find(
          (m) => !m.completed && m.materi_id !== currentMaterial.materi_id
        );
        if (nextIncomplete) {
          setCurrentMaterial(nextIncomplete);
        }
      }
    } catch (error) {
      console.error('Failed to mark material as complete:', error);
    } finally {
      setCompleting(false);
    }
  };

  const handleQuizComplete = async (result: any) => {
    // Quiz completion is handled by QuizViewer
    // Just update the material status if passed
    if (result.passed) {
      await handleMaterialComplete();
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Play className="w-4 h-4" />;
      case 'QUIZ':
        return <HelpCircle className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading course materials...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!materials || materials.length === 0) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No materials available for this course.</p>
            <Button asChild variant="outline">
              <Link href={`/talenta/courses/${courseId}`}>Back to Course</Link>
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const completedCount = materials.filter((m) => m.completed).length;
  const progress = (completedCount / materials.length) * 100;

  return (
    <AppLayout>
      <div className="min-h-screen bg-background flex">
        {/* Sidebar */}
        <div className="w-80 bg-card border-r border-border overflow-y-auto">
          <div className="p-4 border-b border-border">
            <Link
              href={`/talenta/courses/${courseId}`}
              className="text-sm text-primary hover:underline mb-2 inline-block"
            >
              ← Back to Course
            </Link>
            <div className="mt-4">
              <h2 className="font-semibold text-foreground mb-2">Course Materials</h2>
              <div className="text-sm text-muted-foreground">
                {completedCount} / {materials.length} completed
              </div>
              <div className="w-full bg-muted rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
          <div className="p-4 space-y-2">
            {materials.map((material, index) => {
              const isActive = currentMaterial?.materi_id === material.materi_id;
              return (
                <button
                  key={material.materi_id}
                  onClick={() => setCurrentMaterial(material)}
                  className={cn(
                    'w-full text-left p-3 rounded-lg transition-all',
                    isActive
                      ? 'bg-primary/10 border-2 border-primary'
                      : material.completed
                      ? 'bg-success/10 border border-success/30'
                      : 'bg-muted/50 border border-border hover:bg-muted'
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1 min-w-0">
                      {getMaterialIcon(material.material_type)}
                      <span className="text-sm font-medium text-foreground truncate">
                        {index + 1}. {material.title}
                      </span>
                    </div>
                    {material.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-[#0EB0F9] shrink-0" />
                    ) : material.progress > 0 ? (
                      <div className="w-4 h-4 rounded-full border-2 border-[#0EB0F9] shrink-0 flex items-center justify-center">
                        <div 
                          className="w-2 h-2 rounded-full bg-[#0EB0F9]"
                          style={{ opacity: material.progress / 100 }}
                        />
                      </div>
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    {material.duration_seconds && (
                      <div className="text-xs text-muted-foreground">
                        {Math.floor(material.duration_seconds / 60)} min
                      </div>
                    )}
                    {material.progress > 0 && material.progress < 100 && (
                      <div className="text-xs text-[#0EB0F9]">
                        {Math.round(material.progress)}% complete
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto p-8">
            {currentMaterial && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold text-foreground mb-2">
                    {currentMaterial.title}
                  </h1>
                  {currentMaterial.description && (
                    <p className="text-muted-foreground">{currentMaterial.description}</p>
                  )}
                </div>

                {/* Video Player */}
                {currentMaterial.material_type === 'VIDEO' && currentMaterial.file_url && (
                  <VideoPlayer
                    src={currentMaterial.file_url}
                    title={currentMaterial.title}
                    materialId={currentMaterial.materi_id}
                    onComplete={handleMaterialComplete}
                  />
                )}

                {/* Document Viewer */}
                {(currentMaterial.material_type === 'PDF' ||
                  currentMaterial.material_type === 'DOCUMENT') &&
                  currentMaterial.file_url && (
                    <DocumentViewer
                      src={currentMaterial.file_url}
                      title={currentMaterial.title}
                      fileType={currentMaterial.file_type}
                      materialId={currentMaterial.materi_id}
                      onComplete={handleMaterialComplete}
                    />
                  )}

                {/* Quiz Viewer */}
                {currentMaterial.material_type === 'QUIZ' && (
                  <QuizViewer
                    materialId={currentMaterial.materi_id}
                    quizData={
                      currentMaterial.description
                        ? typeof currentMaterial.description === 'string'
                          ? JSON.parse(currentMaterial.description)
                          : currentMaterial.description
                        : { questions: [] }
                    }
                    onComplete={handleQuizComplete}
                  />
                )}

                {/* Link Material */}
                {currentMaterial.material_type === 'LINK' && currentMaterial.file_url && (
                  <Card className="p-6">
                    <p className="text-muted-foreground mb-4">
                      This material is an external link. Click below to open it.
                    </p>
                    <Button
                      asChild
                      className="w-full"
                      onClick={handleMaterialComplete}
                    >
                      <a href={currentMaterial.file_url} target="_blank" rel="noopener noreferrer">
                        Open Link
                      </a>
                    </Button>
                  </Card>
                )}

                {/* Navigation */}
                <div className="flex justify-between pt-4 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const currentIndex = materials.findIndex(
                        (m) => m.materi_id === currentMaterial.materi_id
                      );
                      if (currentIndex > 0) {
                        setCurrentMaterial(materials[currentIndex - 1]);
                      }
                    }}
                    disabled={
                      materials.findIndex((m) => m.materi_id === currentMaterial.materi_id) === 0
                    }
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => {
                      const currentIndex = materials.findIndex(
                        (m) => m.materi_id === currentMaterial.materi_id
                      );
                      if (currentIndex < materials.length - 1) {
                        setCurrentMaterial(materials[currentIndex + 1]);
                      }
                    }}
                    disabled={
                      materials.findIndex((m) => m.materi_id === currentMaterial.materi_id) ===
                      materials.length - 1
                    }
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
