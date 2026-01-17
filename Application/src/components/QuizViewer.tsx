'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Award, RotateCcw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { apiClient } from '@/lib/api';
import { useToast } from '@/contexts/ToastContext';

type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'SHORT_ANSWER' | 'ESSAY';

interface Question {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points?: number;
  explanation?: string;
}

interface QuizViewerProps {
  materialId: string;
  quizData: {
    questions: Question[];
    timeLimit?: number; // in minutes
    passingScore?: number; // percentage
    allowRetake?: boolean;
    showResults?: boolean;
  };
  onComplete?: (result: any) => void;
}

export default function QuizViewer({ materialId, quizData, onComplete }: QuizViewerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState(quizData.timeLimit ? quizData.timeLimit * 60 : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const { success, error: showError } = useToast();

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0 && !result) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev === null || prev <= 1) {
            handleSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeRemaining, result]);

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setShowExplanation(false);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setShowExplanation(false);
    }
  };

  const handleSubmit = async () => {
    // Validate all questions are answered
    const unanswered = quizData.questions.filter((q, idx) => {
      const answer = answers[q.id || idx.toString()];
      return !answer || (Array.isArray(answer) && answer.length === 0);
    });

    if (unanswered.length > 0) {
      showError(`Please answer all questions. ${unanswered.length} question(s) remaining.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await apiClient.submitQuiz(materialId, answers);
      if (response.success && response.data) {
        const resultData = response.data as any;
        setResult(resultData);
        if (resultData.passed) {
          success(`Quiz passed! Score: ${resultData.score}%`);
        } else {
          showError(`Quiz not passed. Score: ${resultData.score}%. Passing score: ${quizData.passingScore || 70}%`);
        }
        onComplete?.(resultData);
      } else {
        showError(response.message || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      showError('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetake = () => {
    setResult(null);
    setAnswers({});
    setCurrentQuestion(0);
    setTimeRemaining(quizData.timeLimit ? quizData.timeLimit * 60 : null);
    setShowExplanation(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderQuestion = (question: Question, index: number) => {
    const questionId = question.id || index.toString();
    const currentAnswer = answers[questionId];

    switch (question.type) {
      case 'TRUE_FALSE':
        return (
          <div className="space-y-3">
            <div className="flex gap-4">
              <label
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all flex-1 ${
                  currentAnswer === 'true'
                    ? 'bg-[#0EB0F9]/10 border-[#0EB0F9]'
                    : 'bg-card border-border hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name={questionId}
                  value="true"
                  checked={currentAnswer === 'true'}
                  onChange={() => handleAnswer(questionId, 'true')}
                  className="mr-3"
                />
                <span className="font-medium">True</span>
              </label>
              <label
                className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all flex-1 ${
                  currentAnswer === 'false'
                    ? 'bg-[#0EB0F9]/10 border-[#0EB0F9]'
                    : 'bg-card border-border hover:bg-muted/50'
                }`}
              >
                <input
                  type="radio"
                  name={questionId}
                  value="false"
                  checked={currentAnswer === 'false'}
                  onChange={() => handleAnswer(questionId, 'false')}
                  className="mr-3"
                />
                <span className="font-medium">False</span>
              </label>
            </div>
          </div>
        );

      case 'SHORT_ANSWER':
        return (
          <Input
            type="text"
            value={typeof currentAnswer === 'string' ? currentAnswer : ''}
            onChange={(e) => handleAnswer(questionId, e.target.value)}
            placeholder="Enter your answer"
            className="w-full"
          />
        );

      case 'ESSAY':
        return (
          <Textarea
            value={typeof currentAnswer === 'string' ? currentAnswer : ''}
            onChange={(e) => handleAnswer(questionId, e.target.value)}
            placeholder="Enter your answer"
            rows={6}
            className="w-full"
          />
        );

      case 'MULTIPLE_CHOICE':
      default:
        return (
          <div className="space-y-2">
            {question.options?.map((option, optIndex) => {
              const optionId = `${questionId}-${optIndex}`;
              const isSelected = currentAnswer === option;
              return (
                <label
                  key={optionId}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#0EB0F9]/10 border-[#0EB0F9]'
                      : 'bg-card border-border hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name={questionId}
                    value={option}
                    checked={isSelected}
                    onChange={() => handleAnswer(questionId, option)}
                    className="mr-3"
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
        );
    }
  };

  if (result) {
    const canRetake = quizData.allowRetake !== false;
    const showResults = quizData.showResults !== false;

    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6 text-[#0EB0F9]" />
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-6 bg-muted rounded-lg">
            <div className={`text-4xl font-bold mb-2 ${
              result.passed ? 'text-[#0EB0F9]' : 'text-red-600'
            }`}>
              {result.score}%
            </div>
            <div className="text-lg text-muted-foreground">
              {result.correct} out of {result.total} correct
            </div>
            {result.passed ? (
              <div className="mt-4 flex items-center justify-center gap-2 text-[#0EB0F9]">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Passed!</span>
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-center gap-2 text-red-600">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Not Passed</span>
                <span className="text-sm text-muted-foreground">
                  (Need {quizData.passingScore || 70}% to pass)
                </span>
              </div>
            )}
          </div>

          {showResults && result.results && (
            <div className="space-y-4">
              <h3 className="font-semibold">Review Answers</h3>
              {result.results.map((item: any, index: number) => {
                const question = quizData.questions[index];
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      item.isCorrect 
                        ? 'bg-[#0EB0F9]/10 border-[#0EB0F9]' 
                        : 'bg-red-50 dark:bg-red-950/20 border-red-300 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p className="font-medium">Question {index + 1}</p>
                      {item.isCorrect ? (
                        <CheckCircle2 className="w-5 h-5 text-[#0EB0F9] shrink-0" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0" />
                      )}
                    </div>
                    <p className="mb-3">{item.question}</p>
                    <div className="space-y-1 text-sm">
                      <div>
                        <span className="text-muted-foreground">Your answer: </span>
                        <span className={item.isCorrect ? 'text-[#0EB0F9] font-medium' : 'text-red-600 font-medium'}>
                          {item.userAnswer || 'No answer'}
                        </span>
                      </div>
                      {!item.isCorrect && (
                        <div>
                          <span className="text-muted-foreground">Correct answer: </span>
                          <span className="text-[#0EB0F9] font-medium">{item.correctAnswer}</span>
                        </div>
                      )}
                      {question.explanation && (
                        <div className="mt-2 p-2 bg-muted rounded text-xs">
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {canRetake && !result.passed && (
            <div className="flex justify-center pt-4 border-t">
              <Button onClick={handleRetake} variant="outline" className="bg-[#0EB0F9] hover:bg-[#0A9DE6] text-white">
                <RotateCcw className="w-4 h-4 mr-2" />
                Retake Quiz
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const question = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;
  const allAnswered = quizData.questions.every((q, idx) => {
    const answer = answers[q.id || idx.toString()];
    return answer && (Array.isArray(answer) ? answer.length > 0 : true);
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quiz</CardTitle>
          {timeRemaining !== null && (
            <div className={`flex items-center gap-2 ${
              timeRemaining < 60 ? 'text-red-600' : 'text-muted-foreground'
            }`}>
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div
            className="bg-[#0EB0F9] h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Question {currentQuestion + 1} of {quizData.questions.length}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h3 className="text-lg font-semibold">{question.question}</h3>
            {question.points && (
              <span className="text-xs bg-muted px-2 py-1 rounded">
                {question.points} {question.points === 1 ? 'point' : 'points'}
              </span>
            )}
          </div>
          {renderQuestion(question, currentQuestion)}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            Previous
          </Button>
          {currentQuestion === quizData.questions.length - 1 ? (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !allAnswered}
              className="bg-[#0EB0F9] hover:bg-[#0A9DE6]"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button 
              onClick={handleNext} 
              disabled={!answers[question.id || currentQuestion.toString()]}
              className="bg-[#0EB0F9] hover:bg-[#0A9DE6]"
            >
              Next
            </Button>
          )}
        </div>

        {!allAnswered && (
          <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4" />
            <span>Please answer all questions before submitting</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
