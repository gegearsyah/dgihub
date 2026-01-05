'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { mockCourses, mockPaymentMethods } from '@/lib/mockData';

export default function EnrollPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params?.id as string;
  const [course, setCourse] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<string>('');
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    const foundCourse = mockCourses.find(c => c.kursus_id === courseId);
    if (foundCourse) {
      setCourse(foundCourse);
      setShowPayment(foundCourse.price > 0);
    }
  }, [courseId]);

  const handleEnroll = () => {
    if (course?.price > 0 && !selectedPayment) {
      alert('Please select a payment method');
      return;
    }
    // Mock enrollment
    alert('Enrollment successful! Redirecting to course...');
    router.push(`/talenta/courses/${courseId}/learn`);
  };

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href={`/talenta/courses/${courseId}`} className="text-xl font-bold text-gray-900">
                ← Back to Course
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Enroll in Course</h1>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{course.title}</h2>
            <p className="text-gray-600">{course.provider_name}</p>
          </div>

          <div className="border-t border-b border-gray-200 py-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Course Fee</span>
              <span className="text-2xl font-bold">
                {course.price > 0 ? `Rp ${course.price.toLocaleString()}` : 'Free'}
              </span>
            </div>
            {course.price > 0 && (
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Duration</span>
                <span>{course.duration_hours} hours</span>
              </div>
            )}
          </div>

          {showPayment && course.price > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-4">Select Payment Method</h3>
              <div className="grid grid-cols-2 gap-4">
                {mockPaymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedPayment(method.id)}
                    className={`p-4 border-2 rounded-lg text-left transition-all ${
                      selectedPayment === method.id
                        ? 'border-indigo-600 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{method.icon}</span>
                      <span className="font-medium">{method.name}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> After enrollment, you'll have lifetime access to course materials
              and will receive a certificate upon completion.
            </p>
          </div>

          <div className="flex space-x-4">
            <Link
              href={`/talenta/courses/${courseId}`}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-center"
            >
              Cancel
            </Link>
            <button
              onClick={handleEnroll}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              {course.price > 0 ? 'Pay & Enroll' : 'Enroll for Free'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}



