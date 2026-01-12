/**
 * POST /api/v1/talenta/quizzes/[id]/submit
 * Submit quiz answers and get score
 */

import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest, authorizeUserType } from '@/lib/api-helpers';
import { supabaseAdmin } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth || auth.response) return auth?.response;

    const user = auth.user;
    const authError = authorizeUserType(user, 'TALENTA');
    if (authError) return authError;

    const { id: materialId } = await params;
    const body = await request.json();
    const { answers } = body; // { questionId: answerId }

    if (!supabaseAdmin) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    const db = supabaseAdmin;

    // Get material (quiz)
    const { data: material } = await db
      .from('materi')
      .select('*, kursus_id')
      .eq('materi_id', materialId)
      .eq('material_type', 'QUIZ')
      .single();

    if (!material) {
      return NextResponse.json(
        { success: false, message: 'Quiz not found' },
        { status: 404 }
      );
    }

    // Verify enrollment
    const { data: enrollment } = await db
      .from('enrollments')
      .select('*')
      .eq('kursus_id', material.kursus_id)
      .eq('talenta_id', user.userId)
      .single();

    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: 'Not enrolled in this course' },
        { status: 403 }
      );
    }

    // Parse quiz data from description
    let quizData;
    try {
      quizData = typeof material.description === 'string' 
        ? JSON.parse(material.description) 
        : material.description;
    } catch (e) {
      return NextResponse.json(
        { success: false, message: 'Invalid quiz data' },
        { status: 400 }
      );
    }

    if (!quizData.questions || !Array.isArray(quizData.questions)) {
      return NextResponse.json(
        { success: false, message: 'Quiz has no questions' },
        { status: 400 }
      );
    }

    // Calculate score
    let correct = 0;
    const total = quizData.questions.length;
    const results: any[] = [];

    quizData.questions.forEach((question: any, index: number) => {
      const userAnswer = answers[question.id || index];
      const isCorrect = userAnswer === question.correctAnswer;
      
      if (isCorrect) correct++;
      
      results.push({
        questionId: question.id || index,
        question: question.question,
        userAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        options: question.options
      });
    });

    const score = Math.round((correct / total) * 100);
    const passed = score >= (quizData.passingScore || 70);

    // Save quiz submission
    const { data: submission, error } = await db
      .from('quiz_submissions')
      .insert({
        materi_id: materialId,
        talenta_id: user.userId,
        answers: answers,
        score: score,
        passed: passed,
        submitted_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Quiz submission error:', error);
      // Continue even if saving fails
    }

    // If passed and requires completion, mark material as completed
    if (passed && material.requires_completion) {
      await db
        .from('material_completions')
        .upsert({
          materi_id: materialId,
          talenta_id: user.userId,
          completed_at: new Date().toISOString()
        }, {
          onConflict: 'materi_id,talenta_id'
        });
    }

    return NextResponse.json({
      success: true,
      data: {
        score,
        correct,
        total,
        passed,
        results,
        submission
      }
    });
  } catch (error: any) {
    console.error('Quiz submission API error:', error);
    return NextResponse.json(
      { success: false, message: 'An error occurred' },
      { status: 500 }
    );
  }
}
