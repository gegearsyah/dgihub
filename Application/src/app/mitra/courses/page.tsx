'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/contexts/ToastContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Edit, Trash2, Eye, CheckCircle2, XCircle, Globe, MapPin, Users, Send, EyeOff } from 'lucide-react';

export default function MitraCoursesPage() {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const { theme } = useTheme();
  const { success, error: showError } = useToast();
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any>(null);
  const [deletingCourse, setDeletingCourse] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    durationHours: '',
    durationDays: '',
    price: '',
    skkniCode: '',
    skkniName: '',
    aqrfLevel: '',
    deliveryMode: 'ONLINE',
    status: 'DRAFT'
  });
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.userType !== 'MITRA')) {
      router.push('/login');
    } else if (isAuthenticated && user?.userType === 'MITRA') {
      loadCourses();
    }
  }, [isAuthenticated, authLoading, user, router]);

  const loadCourses = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMitraCourses();
      if (response.success && response.data) {
        setCourses(Array.isArray(response.data) ? response.data : []);
      }
    } catch (error) {
      console.error('Failed to load courses:', error);
      showError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      durationHours: '',
      durationDays: '',
      price: '',
      skkniCode: '',
      skkniName: '',
      aqrfLevel: '',
      deliveryMode: 'ONLINE',
      status: 'DRAFT'
    });
    setEditingCourse(null);
    setShowCreateForm(false);
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiClient.createCourse({
        title: formData.title,
        description: formData.description,
        category: formData.category || undefined,
        durationHours: parseInt(formData.durationHours),
        durationDays: formData.durationDays ? parseInt(formData.durationDays) : undefined,
        price: parseFloat(formData.price) || 0,
        skkniCode: formData.skkniCode || undefined,
        skkniName: formData.skkniName || undefined,
        aqrfLevel: formData.aqrfLevel ? parseInt(formData.aqrfLevel) : undefined,
        deliveryMode: formData.deliveryMode,
        status: formData.status
      });

      if (response.success) {
        success('Course created successfully!');
        resetForm();
        loadCourses();
      } else {
        showError(response.message || 'Failed to create course');
      }
    } catch (error) {
      console.error('Failed to create course:', error);
      showError('Failed to create course');
    }
  };

  const handleEdit = (course: any) => {
    setEditingCourse(course);
    setFormData({
      title: course.title || '',
      description: course.description || '',
      category: course.category || '',
      durationHours: course.duration_hours?.toString() || '',
      durationDays: course.duration_days?.toString() || '',
      price: course.price?.toString() || '0',
      skkniCode: course.skkni_code || '',
      skkniName: course.skkni_name || '',
      aqrfLevel: course.aqrf_level?.toString() || '',
      deliveryMode: course.delivery_mode || 'ONLINE',
      status: course.status || 'DRAFT'
    });
    setShowCreateForm(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      const response = await apiClient.updateCourse(editingCourse.kursus_id, {
        title: formData.title,
        description: formData.description,
        category: formData.category || undefined,
        durationHours: parseInt(formData.durationHours),
        durationDays: formData.durationDays ? parseInt(formData.durationDays) : undefined,
        price: parseFloat(formData.price) || 0,
        skkniCode: formData.skkniCode || undefined,
        skkniName: formData.skkniName || undefined,
        aqrfLevel: formData.aqrfLevel ? parseInt(formData.aqrfLevel) : undefined,
        deliveryMode: formData.deliveryMode,
        status: formData.status
      });

      if (response.success) {
        success('Course updated successfully!');
        resetForm();
        loadCourses();
      } else {
        showError(response.message || 'Failed to update course');
      }
    } catch (error) {
      console.error('Failed to update course:', error);
      showError('Failed to update course');
    }
  };

  const handleDelete = async () => {
    if (!deletingCourse) return;

    try {
      const response = await apiClient.deleteCourse(deletingCourse.kursus_id);

      if (response.success) {
        success('Course deleted successfully!');
        setDeletingCourse(null);
        loadCourses();
      } else {
        showError(response.message || 'Failed to delete course');
      }
    } catch (error) {
      console.error('Failed to delete course:', error);
      showError('Failed to delete course');
    }
  };

  const handleTogglePublish = async (course: any) => {
    try {
      const newStatus = course.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
      const response = await apiClient.updateCourse(course.kursus_id, {
        ...course,
        status: newStatus
      });

      if (response.success) {
        success(`Course ${newStatus === 'PUBLISHED' ? 'published' : 'unpublished'} successfully!`);
        loadCourses();
      } else {
        showError(response.message || `Failed to ${newStatus === 'PUBLISHED' ? 'publish' : 'unpublish'} course`);
      }
    } catch (error) {
      console.error('Failed to toggle publish status:', error);
      showError('Failed to update course status');
    }
  };

  const getDeliveryModeIcon = (mode: string) => {
    switch (mode) {
      case 'ONLINE':
        return <Globe className="w-4 h-4" />;
      case 'OFFLINE':
        return <MapPin className="w-4 h-4" />;
      case 'HYBRID':
        return <Users className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  const getDeliveryModeLabel = (mode: string) => {
    switch (mode) {
      case 'ONLINE':
        return 'Online';
      case 'OFFLINE':
        return 'Offline';
      case 'HYBRID':
        return 'Hybrid';
      default:
        return 'Online';
    }
  };

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${
              isDark ? 'border-[#0EB0F9]' : 'border-[#0EB0F9]'
            } mx-auto`}></div>
            <p className="mt-4 text-muted-foreground">Loading...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Courses</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your training courses and materials
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowCreateForm(true);
            }}
            className="bg-[#0EB0F9] hover:bg-[#0A9DE6] text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Course
          </Button>
        </div>

        {/* Create/Edit Form Dialog */}
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingCourse ? 'Edit Course' : 'Create New Course'}
              </DialogTitle>
              <DialogDescription>
                {editingCourse ? 'Update course information' : 'Fill in the details to create a new course'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editingCourse ? handleUpdate : handleCreateCourse} className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Course title"
                />
              </div>
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Course description"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Technology, Business"
                  />
                </div>
                <div>
                  <Label htmlFor="deliveryMode">Delivery Mode *</Label>
                  <Select
                    value={formData.deliveryMode}
                    onValueChange={(value) => setFormData({ ...formData, deliveryMode: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ONLINE">Online</SelectItem>
                      <SelectItem value="OFFLINE">Offline</SelectItem>
                      <SelectItem value="HYBRID">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="durationHours">Duration (Hours) *</Label>
                  <Input
                    id="durationHours"
                    type="number"
                    required
                    min="1"
                    value={formData.durationHours}
                    onChange={(e) => setFormData({ ...formData, durationHours: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="durationDays">Duration (Days)</Label>
                  <Input
                    id="durationDays"
                    type="number"
                    min="1"
                    value={formData.durationDays}
                    onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="price">Price (Rp)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0 for free"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="skkniCode">SKKNI Code</Label>
                  <Input
                    id="skkniCode"
                    value={formData.skkniCode}
                    onChange={(e) => setFormData({ ...formData, skkniCode: e.target.value })}
                    placeholder="e.g., SKKNI-001"
                  />
                </div>
                <div>
                  <Label htmlFor="skkniName">SKKNI Name</Label>
                  <Input
                    id="skkniName"
                    value={formData.skkniName}
                    onChange={(e) => setFormData({ ...formData, skkniName: e.target.value })}
                    placeholder="SKKNI full name"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="aqrfLevel">AQRF Level</Label>
                  <Select
                    value={formData.aqrfLevel}
                    onValueChange={(value) => setFormData({ ...formData, aqrfLevel: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select AQRF Level" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(level => (
                        <SelectItem key={level} value={level.toString()}>
                          Level {level}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                      <SelectItem value="SUSPENDED">Suspended</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-[#0EB0F9] hover:bg-[#0A9DE6]">
                  {editingCourse ? 'Update Course' : 'Create Course'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deletingCourse} onOpenChange={(open) => !open && setDeletingCourse(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Course</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{deletingCourse?.title}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full flex items-center justify-center min-h-[400px]">
              <div className="rounded-lg shadow p-8 text-center max-w-md mx-auto bg-card border border-border">
                <p className="mb-4 text-muted-foreground">
                  No courses yet. Create your first course!
                </p>
              </div>
            </div>
          ) : (
            courses.map((course: any, index: number) => (
              <div key={course.kursus_id || `course-${index}`} className="bg-card border border-border rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-foreground line-clamp-2">{course.title}</h3>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePublish(course)}
                      className={`h-8 w-8 ${
                        course.status === 'PUBLISHED' 
                          ? 'text-orange-600 hover:text-orange-700' 
                          : 'text-[#0EB0F9] hover:text-[#0A9DE6]'
                      }`}
                      title={course.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    >
                      {course.status === 'PUBLISHED' ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(course)}
                      className="h-8 w-8"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeletingCourse(course)}
                      className="h-8 w-8 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                    course.status === 'PUBLISHED' 
                      ? 'bg-[#0EB0F9]/10 text-[#0878B3] border border-[#0EB0F9]/30' 
                      : course.status === 'DRAFT' 
                      ? 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                  }`}>
                    {course.status === 'PUBLISHED' && <CheckCircle2 className="w-3 h-3" />}
                    {course.status}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded flex items-center gap-1 ${
                    isDark ? 'bg-[#0EB0F9]/20 text-[#3BC0FF]' : 'bg-[#0EB0F9]/10 text-[#0878B3]'
                  }`}>
                    {getDeliveryModeIcon(course.delivery_mode || 'ONLINE')}
                    {getDeliveryModeLabel(course.delivery_mode || 'ONLINE')}
                  </span>
                </div>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2">{course.description}</p>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Price:</span>
                    <span className="font-medium text-foreground">
                      {course.price > 0 ? `Rp ${parseFloat(course.price).toLocaleString('id-ID')}` : 'Free'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium text-foreground">
                      {course.duration_hours}h
                      {course.duration_days && ` (${course.duration_days} days)`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Enrollments:</span>
                    <span className="font-medium text-foreground">{course.enrollment_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Materials:</span>
                    <span className="font-medium text-foreground">{course.material_count || 0}</span>
                  </div>
                  {course.skkni_code && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKKNI:</span>
                      <span className="font-medium text-foreground">{course.skkni_code}</span>
                    </div>
                  )}
                  {course.aqrf_level && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">AQRF:</span>
                      <span className="font-medium text-foreground">Level {course.aqrf_level}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 pt-4 border-t">
                  <Link
                    href={`/mitra/courses/${course.kursus_id}/materials`}
                    className="flex-1 text-center px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 text-sm transition-colors"
                  >
                    Materials
                  </Link>
                  <Link
                    href={`/mitra/courses/${course.kursus_id}/participants`}
                    className="flex-1 text-center px-4 py-2 bg-[#0EB0F9] text-white rounded-lg hover:bg-[#0A9DE6] text-sm transition-colors"
                  >
                    Participants ({course.enrollment_count || 0})
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AppLayout>
  );
}

