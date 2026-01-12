'use client';

import { useState } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
  points?: number;
}

interface QuizBuilderProps {
  onSave: (quizData: {
    questions: Question[];
    timeLimit?: number;
    passingScore?: number;
  }) => void;
  onCancel?: () => void;
  initialData?: {
    questions: Question[];
    timeLimit?: number;
    passingScore?: number;
  };
}

export default function QuizBuilder({ onSave, onCancel, initialData }: QuizBuilderProps) {
  const [questions, setQuestions] = useState<Question[]>(
    initialData?.questions || [
      {
        id: '1',
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1
      }
    ]
  );
  const [timeLimit, setTimeLimit] = useState<number | undefined>(initialData?.timeLimit);
  const [passingScore, setPassingScore] = useState<number>(initialData?.passingScore || 70);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        question: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1
      }
    ]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const addOption = (questionId: string) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          return { ...q, options: [...q.options, ''] };
        }
        return q;
      })
    );
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = q.options.filter((_, i) => i !== optionIndex);
          // If removed option was correct answer, clear it
          if (q.correctAnswer === q.options[optionIndex]) {
            return { ...q, options: newOptions, correctAnswer: '' };
          }
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const handleSave = () => {
    // Validate
    const validQuestions = questions.filter(
      (q) =>
        q.question.trim() &&
        q.options.filter((opt) => opt.trim()).length >= 2 &&
        q.correctAnswer &&
        q.options.includes(q.correctAnswer)
    );

    if (validQuestions.length === 0) {
      alert('Please add at least one valid question');
      return;
    }

    onSave({
      questions: validQuestions,
      timeLimit,
      passingScore
    });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Create Quiz</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quiz Settings */}
        <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
          <div>
            <Label htmlFor="timeLimit">Time Limit (minutes, optional)</Label>
            <Input
              id="timeLimit"
              type="number"
              min="0"
              value={timeLimit || ''}
              onChange={(e) =>
                setTimeLimit(e.target.value ? parseInt(e.target.value) : undefined)
              }
              placeholder="No limit"
            />
          </div>
          <div>
            <Label htmlFor="passingScore">Passing Score (%)</Label>
            <Input
              id="passingScore"
              type="number"
              min="0"
              max="100"
              value={passingScore}
              onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          {questions.map((question, qIndex) => (
            <Card key={question.id} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-semibold">Question {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeQuestion(question.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Question Text</Label>
                  <Textarea
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(question.id, 'question', e.target.value)
                    }
                    placeholder="Enter your question here..."
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Options</Label>
                  <div className="space-y-2 mt-2">
                    {question.options.map((option, oIndex) => (
                      <div key={oIndex} className="flex items-center gap-2">
                        <input
                          type="radio"
                          name={`correct-${question.id}`}
                          checked={question.correctAnswer === option}
                          onChange={() =>
                            updateQuestion(question.id, 'correctAnswer', option)
                          }
                          disabled={!option.trim()}
                        />
                        <Input
                          value={option}
                          onChange={(e) =>
                            updateOption(question.id, oIndex, e.target.value)
                          }
                          placeholder={`Option ${oIndex + 1}`}
                        />
                        {question.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeOption(question.id, oIndex)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    {question.options.length < 6 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addOption(question.id)}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Points</Label>
                  <Input
                    type="number"
                    min="1"
                    value={question.points || 1}
                    onChange={(e) =>
                      updateQuestion(question.id, 'points', parseInt(e.target.value) || 1)
                    }
                    className="w-24"
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Button onClick={addQuestion} variant="outline" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>

        <div className="flex gap-2 pt-4 border-t">
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          )}
          <Button onClick={handleSave} className="flex-1">
            <Save className="w-4 h-4 mr-2" />
            Save Quiz
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
