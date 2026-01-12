'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';
import AppLayout from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, Award, Building2, CheckCircle2 } from 'lucide-react';

export default function CourseDetailPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'progress'>('overview');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }
    loadCourseData();
  }, [courseId, isAuthenticated]);

  const loadCourseData = async () => {
    try {
      setLoading(true);
      // Get course details
      const coursesResponse = await apiClient.getCourses();
      if (coursesResponse.success && coursesResponse.data) {
        const foundCourse = Array.isArray(coursesResponse.data)
          ? coursesResponse.data.find((c: any) => c.kursus_id === courseId || c.course_id === courseId)
          : null;
        
        if (foundCourse) {
          setCourse(foundCourse);
          
          // Check enrollment status
          const myCoursesResponse = await apiClient.getMyCourses();
          if (myCoursesResponse.success && myCoursesResponse.data) {
            const foundEnrollment = Array.isArray(myCoursesResponse.data)
              ? myCoursesResponse.data.find((e: any) => e.kursus_id === courseId || e.course_id === courseId)
              : null;
            setEnrollment(foundEnrollment);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load course:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      const response = await apiClient.enrollInCourse(courseId);
      if (response.success) {
        router.push(`/talenta/courses/${courseId}/learn`);
      } else {
        alert(response.message || 'Failed to enroll');
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      alert('Failed to enroll in course');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading course...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!course) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center bg-background">
          <Card className="p-8 text-center">
            <p className="text-muted-foreground mb-4">Course not found.</p>
            <Button asChild variant="outline">
              <Link href="/talenta/courses">Back to Courses</Link>
            </Button>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const isEnrolled = !!enrollment;
  const progress = enrollment?.progress || 0;

  return (
    <AppLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <Link href="/talenta/courses">← Back to Courses</Link>
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-3xl">{course.title}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">{course.description}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Provider</p>
                  <p className="font-semibold">{course.provider_name || course.mitra_name || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-semibold">{course.duration_hours || 0} hours</p>
                </div>
              </div>
              {course.skkni_code && (
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">SKKNI</p>
                    <p className="font-semibold">{course.skkni_code}</p>
                  </div>
                </div>
              )}
              {course.aqrf_level && (
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">AQRF Level</p>
                    <p className="font-semibold">Level {course.aqrf_level}</p>
                  </div>
                </div>
              )}
            </div>

            {isEnrolled && (
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-3">
                  <div
                    className="bg-primary h-3 rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="flex gap-4">
              {!isEnrolled ? (
                <Button onClick={handleEnroll} size="lg">
                  Enroll Now {course.price > 0 ? `- Rp ${course.price.toLocaleString()}` : '(Free)'}
                </Button>
              ) : (
                <Button asChild size="lg">
                  <Link href={`/talenta/courses/${courseId}/learn`}>
                    Continue Learning
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex space-x-8 border-b">
              <button
                onClick={() => setActiveTab('overview')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'overview'
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Overview
              </button>
              {isEnrolled && (
                <>
                  <button
                    onClick={() => setActiveTab('materials')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'materials'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Materials
                  </button>
                  <button
                    onClick={() => setActiveTab('progress')}
                    className={`pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === 'progress'
                        ? 'border-primary text-primary'
                        : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Progress
                  </button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Course Overview</h3>
                  <p className="text-muted-foreground">{course.description}</p>
                </div>
                {course.learning_outcomes && (
                  <div>
                    <h4 className="font-semibold mb-2">Learning Outcomes:</h4>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      {Array.isArray(course.learning_outcomes) 
                        ? course.learning_outcomes.map((outcome: string, i: number) => (
                            <li key={i}>{outcome}</li>
                          ))
                        : <li>{course.learning_outcomes}</li>
                      }
                    </ul>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'materials' && isEnrolled && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Course Materials</h3>
                <p className="text-muted-foreground">
                  Access all course materials from the learning page.
                </p>
                <Button asChild className="mt-4">
                  <Link href={`/talenta/courses/${courseId}/learn`}>
                    Go to Learning Page
                  </Link>
                </Button>
              </div>
            )}

            {activeTab === 'progress' && isEnrolled && (
              <div className="space-y-4">
                <div className="bg-muted p-6 rounded-lg">
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Overall Progress</span>
                    <span className="font-semibold">{progress}%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-4">
                    <div
                      className="bg-primary h-4 rounded-full transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="text-2xl font-bold">{enrollment.status}</p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground">Enrolled</p>
                    <p className="text-lg font-semibold">
                      {new Date(enrollment.enrolled_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
