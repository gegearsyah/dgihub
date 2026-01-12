'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Clock, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api';

interface QuizViewerProps {
  materialId: string;
  quizData: {
    questions: Array<{
      id: string;
      question: string;
      options: string[];
      correctAnswer: string;
      points?: number;
    }>;
    timeLimit?: number; // in minutes
    passingScore?: number; // percentage
  };
  onComplete?: (result: any) => void;
}

export default function QuizViewer({ materialId, quizData, onComplete }: QuizViewerProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(quizData.timeLimit ? quizData.timeLimit * 60 : null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (timeRemaining !== null && timeRemaining > 0) {
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
  }, [timeRemaining]);

  const handleAnswer = (questionId: string, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleNext = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await apiClient.submitQuiz(materialId, answers);
      if (response.success && response.data) {
        setResult(response.data);
        onComplete?.(response.data);
      } else {
        alert(response.message || 'Failed to submit quiz');
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      alert('Failed to submit quiz');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (result) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-6 h-6 text-primary" />
            Quiz Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center p-6 bg-muted rounded-lg">
            <div className="text-4xl font-bold text-primary mb-2">{result.score}%</div>
            <div className="text-lg text-muted-foreground">
              {result.correct} out of {result.total} correct
            </div>
            {result.passed ? (
              <div className="mt-4 flex items-center justify-center gap-2 text-success">
                <CheckCircle2 className="w-5 h-5" />
                <span className="font-semibold">Passed!</span>
              </div>
            ) : (
              <div className="mt-4 flex items-center justify-center gap-2 text-destructive">
                <XCircle className="w-5 h-5" />
                <span className="font-semibold">Not Passed</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold">Review Answers</h3>
            {result.results?.map((item: any, index: number) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  item.isCorrect ? 'bg-success/10 border-success' : 'bg-destructive/10 border-destructive'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-medium">Question {index + 1}</p>
                  {item.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  ) : (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                </div>
                <p className="mb-3">{item.question}</p>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="text-muted-foreground">Your answer: </span>
                    <span className={item.isCorrect ? 'text-success font-medium' : 'text-destructive font-medium'}>
                      {item.userAnswer}
                    </span>
                  </div>
                  {!item.isCorrect && (
                    <div>
                      <span className="text-muted-foreground">Correct answer: </span>
                      <span className="text-success font-medium">{item.correctAnswer}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const question = quizData.questions[currentQuestion];
  const progress = ((currentQuestion + 1) / quizData.questions.length) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Quiz</CardTitle>
          {timeRemaining !== null && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span className="font-mono">{formatTime(timeRemaining)}</span>
            </div>
          )}
        </div>
        <div className="w-full bg-muted rounded-full h-2 mt-2">
          <div
            className="bg-primary h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground mt-2">
          Question {currentQuestion + 1} of {quizData.questions.length}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-4">{question.question}</h3>
          <div className="space-y-2">
            {question.options.map((option, index) => {
              const optionId = `${question.id}-${index}`;
              const isSelected = answers[question.id] === option;
              return (
                <label
                  key={optionId}
                  className={`flex items-center p-4 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-primary/10 border-primary'
                      : 'bg-card border-border hover:bg-muted/50'
                  }`}
                >
                  <input
                    type="radio"
                    name={question.id}
                    value={option}
                    checked={isSelected}
                    onChange={() => handleAnswer(question.id, option)}
                    className="mr-3"
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
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
              disabled={isSubmitting || Object.keys(answers).length < quizData.questions.length}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
            </Button>
          ) : (
            <Button onClick={handleNext} disabled={!answers[question.id]}>
              Next
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
