'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { mockCourses } from '@/lib/mockData';

export default function CourseDetailPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  const [course, setCourse] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'materials' | 'progress'>('overview');

  useEffect(() => {
    // In real app, fetch from API
    const foundCourse = mockCourses.find(c => c.kursus_id === courseId);
    if (foundCourse) {
      setCourse(foundCourse);
    }
  }, [courseId]);

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const completedMaterials = course.materials?.filter((m: any) => m.completed).length || 0;
  const totalMaterials = course.materials?.length || 0;
  const progress = course.is_enrolled ? Math.round((completedMaterials / totalMaterials) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/talenta/courses" className="text-xl font-bold text-gray-900">
                ← Back to Courses
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{course.title}</h1>
          <p className="text-gray-600 mb-6">{course.description}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div>
              <span className="text-sm text-gray-500">Provider</span>
              <p className="font-semibold">{course.provider_name}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">Duration</span>
              <p className="font-semibold">{course.duration_hours} hours</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">SKKNI</span>
              <p className="font-semibold">{course.skkni_code}</p>
            </div>
            <div>
              <span className="text-sm text-gray-500">AQRF Level</span>
              <p className="font-semibold">Level {course.aqrf_level}</p>
            </div>
          </div>

          {course.is_enrolled && (
            <div className="mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-indigo-600 h-3 rounded-full transition-all"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          <div className="flex space-x-4">
            {!course.is_enrolled ? (
              <Link
                href={`/talenta/courses/${courseId}/enroll`}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Enroll Now - Rp {course.price.toLocaleString()}
              </Link>
            ) : (
              <Link
                href={`/talenta/courses/${courseId}/learn`}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Continue Learning
              </Link>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Overview
              </button>
              {course.is_enrolled && (
                <>
                  <button
                    onClick={() => setActiveTab('materials')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'materials'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Materials ({completedMaterials}/{totalMaterials})
                  </button>
                  <button
                    onClick={() => setActiveTab('progress')}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'progress'
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Progress
                  </button>
                </>
              )}
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Course Overview</h3>
                <div className="prose max-w-none">
                  <p className="text-gray-700 mb-4">
                    This comprehensive course covers modern software development practices including
                    microservices architecture, containerization, cloud deployment, and DevOps practices.
                  </p>
                  <h4 className="font-semibold mb-2">Learning Outcomes:</h4>
                  <ul className="list-disc pl-6 mb-4">
                    <li>Design and implement microservices architecture</li>
                    <li>Deploy applications using Docker and Kubernetes</li>
                    <li>Implement CI/CD pipelines</li>
                    <li>Apply cloud-native development practices</li>
                  </ul>
                  <h4 className="font-semibold mb-2">Prerequisites:</h4>
                  <p className="text-gray-700">Basic programming knowledge, understanding of web development</p>
                </div>
              </div>
            )}

            {activeTab === 'materials' && course.is_enrolled && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Course Materials</h3>
                <div className="space-y-3">
                  {course.materials?.map((material: any) => (
                    <div
                      key={material.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${
                        material.completed ? 'bg-green-50 border-green-200' : 'bg-white border-gray-200'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">
                          {material.type === 'video' && '▶️'}
                          {material.type === 'document' && '📄'}
                          {material.type === 'quiz' && '📝'}
                        </div>
                        <div>
                          <h4 className="font-medium">{material.title}</h4>
                          <p className="text-sm text-gray-500">{material.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {material.completed && (
                          <span className="text-green-600 text-sm">✓ Completed</span>
                        )}
                        <Link
                          href={`/talenta/courses/${courseId}/learn/${material.id}`}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                        >
                          {material.completed ? 'Review' : 'Start'}
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'progress' && course.is_enrolled && (
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Progress</h3>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex justify-between mb-2">
                      <span className="font-medium">Overall Progress</span>
                      <span className="font-semibold">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4">
                      <div
                        className="bg-indigo-600 h-4 rounded-full"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Materials Completed</p>
                      <p className="text-2xl font-bold">{completedMaterials}/{totalMaterials}</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Time Spent</p>
                      <p className="text-2xl font-bold">12h 30m</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}



