'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { mockCourses } from '@/lib/mockData';

export default function LearnPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  const [course, setCourse] = useState<any>(null);
  const [currentMaterial, setCurrentMaterial] = useState<any>(null);

  useEffect(() => {
    const foundCourse = mockCourses.find(c => c.kursus_id === courseId && c.is_enrolled);
    if (foundCourse) {
      setCourse(foundCourse);
      // Set first incomplete material or first material
      const incomplete = foundCourse.materials?.find((m: any) => !m.completed);
      setCurrentMaterial(incomplete || foundCourse.materials?.[0]);
    }
  }, [courseId]);

  const handleComplete = () => {
    if (currentMaterial) {
      // Mock: Mark as completed
      alert('Material completed!');
      // Move to next material
      const currentIndex = course.materials.findIndex((m: any) => m.id === currentMaterial.id);
      if (currentIndex < course.materials.length - 1) {
        setCurrentMaterial(course.materials[currentIndex + 1]);
      }
    }
  };

  if (!course || !currentMaterial) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white shadow-lg overflow-y-auto">
        <div className="p-4 border-b">
          <Link href={`/talenta/courses/${courseId}`} className="text-sm text-indigo-600 hover:text-indigo-800">
            ← Back to Course
          </Link>
          <h2 className="font-semibold mt-2">{course.title}</h2>
        </div>
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Course Materials</h3>
          <div className="space-y-2">
            {course.materials?.map((material: any, index: number) => (
              <button
                key={material.id}
                onClick={() => setCurrentMaterial(material)}
                className={`w-full text-left p-3 rounded-lg transition-all ${
                  currentMaterial.id === material.id
                    ? 'bg-indigo-100 border-2 border-indigo-500'
                    : material.completed
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500">#{index + 1}</span>
                    <span className="text-sm">{material.title}</span>
                  </div>
                  {material.completed && <span className="text-green-600">✓</span>}
                </div>
                <div className="text-xs text-gray-500 mt-1">{material.duration}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                {currentMaterial.type === 'video' && <span className="text-2xl">▶️</span>}
                {currentMaterial.type === 'document' && <span className="text-2xl">📄</span>}
                {currentMaterial.type === 'quiz' && <span className="text-2xl">📝</span>}
                <h1 className="text-2xl font-bold">{currentMaterial.title}</h1>
              </div>
              <p className="text-gray-600">{currentMaterial.duration}</p>
            </div>

            {/* Video Player Mock */}
            {currentMaterial.type === 'video' && (
              <div className="mb-6">
                <div className="bg-black aspect-video rounded-lg flex items-center justify-center">
                  <div className="text-center text-white">
                    <div className="text-6xl mb-4">▶</div>
                    <p className="text-lg">Video Player</p>
                    <p className="text-sm text-gray-400 mt-2">Video content would play here</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex space-x-2">
                    <button className="px-4 py-2 bg-gray-200 rounded-lg">⏮ Previous</button>
                    <button className="px-4 py-2 bg-gray-200 rounded-lg">⏭ Next</button>
                  </div>
                  <button
                    onClick={handleComplete}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Mark as Complete
                  </button>
                </div>
              </div>
            )}

            {/* Document Viewer Mock */}
            {currentMaterial.type === 'document' && (
              <div className="mb-6">
                <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
                  <div className="text-6xl mb-4">📄</div>
                  <p className="text-lg font-medium mb-2">Document Viewer</p>
                  <p className="text-sm text-gray-600 mb-4">
                    PDF or document content would be displayed here
                  </p>
                  <button className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                    Open Document
                  </button>
                </div>
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleComplete}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Mark as Complete
                  </button>
                </div>
              </div>
            )}

            {/* Quiz Mock */}
            {currentMaterial.type === 'quiz' && (
              <div className="mb-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
                  <p className="font-medium mb-2">Quiz: {currentMaterial.title}</p>
                  <p className="text-sm text-gray-600">20 questions • 30 minutes</p>
                </div>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <p className="font-medium mb-3">Question 1 of 20</p>
                    <p className="mb-4">What is the main advantage of microservices architecture?</p>
                    <div className="space-y-2">
                      {['Scalability', 'Simplicity', 'Cost', 'Speed'].map((option, idx) => (
                        <label key={idx} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                          <input type="radio" name="answer" className="mr-3" />
                          <span>{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button className="px-4 py-2 bg-gray-200 rounded-lg">Previous</button>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                      Next Question
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Course Progress */}
            <div className="border-t pt-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-600">Course Progress</span>
                <span className="text-sm font-semibold">
                  {course.materials.filter((m: any) => m.completed).length} / {course.materials.length} completed
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full"
                  style={{
                    width: `${(course.materials.filter((m: any) => m.completed).length / course.materials.length) * 100}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}



