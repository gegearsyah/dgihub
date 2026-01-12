'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import QuizBuilder from '@/components/QuizBuilder';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Video, FileText, HelpCircle, Trash2, ArrowLeft } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function CourseMaterialsPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  const [materials, setMaterials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [materialType, setMaterialType] = useState<'VIDEO' | 'PDF' | 'DOCUMENT' | 'LINK' | 'QUIZ'>('VIDEO');
  const [showQuizBuilder, setShowQuizBuilder] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fileUrl: '',
    orderIndex: 0,
    durationSeconds: 0
  });

  useEffect(() => {
    if (!isAuthenticated || user?.userType !== 'MITRA') {
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
        setMaterials(response.data);
      }
    } catch (error) {
      console.error('Failed to load materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaterial = async (quizData?: any) => {
    try {
      const materialData: any = {
        title: formData.title,
        description: quizData ? JSON.stringify(quizData) : formData.description,
        materialType: materialType,
        fileUrl: formData.fileUrl,
        orderIndex: formData.orderIndex || materials.length,
        durationSeconds: formData.durationSeconds || undefined
      };

      if (materialType === 'QUIZ' && quizData) {
        materialData.description = JSON.stringify(quizData);
      }

      const response = await apiClient.createCourseMaterial(courseId, materialData);
      if (response.success) {
        setShowAddDialog(false);
        setShowQuizBuilder(false);
        setFormData({
          title: '',
          description: '',
          fileUrl: '',
          orderIndex: 0,
          durationSeconds: 0
        });
        loadMaterials();
      } else {
        alert(response.message || 'Failed to create material');
      }
    } catch (error) {
      console.error('Failed to create material:', error);
      alert('Failed to create material');
    }
  };

  const getMaterialIcon = (type: string) => {
    switch (type) {
      case 'VIDEO':
        return <Video className="w-5 h-5" />;
      case 'QUIZ':
        return <HelpCircle className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/mitra/courses">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Course Materials</h1>
              <p className="text-muted-foreground">Manage learning materials and quizzes</p>
            </div>
          </div>

          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Material
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Course Material</DialogTitle>
                <DialogDescription>
                  Add videos, documents, links, or quizzes to your course
                </DialogDescription>
              </DialogHeader>

              {!showQuizBuilder ? (
                <div className="space-y-4">
                  <div>
                    <Label>Material Type</Label>
                    <select
                      value={materialType}
                      onChange={(e) => setMaterialType(e.target.value as any)}
                      className="w-full px-4 py-2 border border-border rounded-lg bg-background"
                    >
                      <option value="VIDEO">Video</option>
                      <option value="PDF">PDF Document</option>
                      <option value="DOCUMENT">Document</option>
                      <option value="LINK">External Link</option>
                      <option value="QUIZ">Quiz/Test</option>
                    </select>
                  </div>

                  <div>
                    <Label>Title</Label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Material title"
                    />
                  </div>

                  {materialType !== 'QUIZ' && (
                    <>
                      <div>
                        <Label>Description (optional)</Label>
                        <Textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          placeholder="Material description"
                          rows={3}
                        />
                      </div>

                      <div>
                        <Label>
                          {materialType === 'LINK' ? 'URL' : 'File URL'}
                        </Label>
                        <Input
                          value={formData.fileUrl}
                          onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                          placeholder={
                            materialType === 'LINK'
                              ? 'https://example.com'
                              : 'https://storage.example.com/file.mp4'
                          }
                        />
                      </div>

                      {materialType === 'VIDEO' && (
                        <div>
                          <Label>Duration (seconds, optional)</Label>
                          <Input
                            type="number"
                            value={formData.durationSeconds}
                            onChange={(e) =>
                              setFormData({ ...formData, durationSeconds: parseInt(e.target.value) || 0 })
                            }
                            placeholder="Duration in seconds"
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div>
                    <Label>Order Index</Label>
                    <Input
                      type="number"
                      value={formData.orderIndex}
                      onChange={(e) =>
                        setFormData({ ...formData, orderIndex: parseInt(e.target.value) || 0 })
                      }
                      placeholder="Display order"
                    />
                  </div>

                  {materialType === 'QUIZ' ? (
                    <Button onClick={() => setShowQuizBuilder(true)} className="w-full">
                      Create Quiz
                    </Button>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1">
                        Cancel
                      </Button>
                      <Button onClick={() => handleAddMaterial()} className="flex-1">
                        Add Material
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold">Quiz: {formData.title || 'Untitled'}</h3>
                    <Button variant="ghost" size="sm" onClick={() => setShowQuizBuilder(false)}>
                      Back
                    </Button>
                  </div>
                  <QuizBuilder
                    onSave={(quizData) => {
                      handleAddMaterial(quizData);
                    }}
                    onCancel={() => setShowQuizBuilder(false)}
                  />
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-4">
          {materials.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">No materials yet. Add your first material!</p>
            </Card>
          ) : (
            materials.map((material, index) => (
              <Card key={material.materi_id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {getMaterialIcon(material.material_type)}
                      <div>
                        <CardTitle className="text-lg">
                          {index + 1}. {material.title}
                        </CardTitle>
                        {material.description && material.material_type !== 'QUIZ' && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {material.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Type: </span>
                      <span className="font-medium">{material.material_type}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Order: </span>
                      <span className="font-medium">{material.order_index}</span>
                    </div>
                    {material.duration_seconds && (
                      <div>
                        <span className="text-muted-foreground">Duration: </span>
                        <span className="font-medium">
                          {Math.floor(material.duration_seconds / 60)} min
                        </span>
                      </div>
                    )}
                  </div>
                  {material.material_type === 'QUIZ' && (
                    <div className="mt-2 text-sm text-muted-foreground">
                      Quiz with questions (view in edit mode)
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}
