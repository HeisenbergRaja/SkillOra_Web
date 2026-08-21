import React, { useState } from 'react';
import { X } from 'lucide-react';
import { QuizQuestion } from '@/types/quiz';
import { UploadTextField } from './UploadTextField';
import { UploadLabel } from './UploadLabel';

interface Props {
  question: QuizQuestion;
  onDismiss: () => void;
  onSave: (q: QuizQuestion) => void;
}

export function QuestionEditDialog({ question, onDismiss, onSave }: Props) {
  const [text, setText] = useState(question.question || '');
  const [options, setOptions] = useState<string[]>(
    question.options?.length === 4 ? [...question.options] : ['', '', '', '']
  );
  const [correct, setCorrect] = useState<number>(question.correctAnswer ?? 0);
  const [explanation, setExplanation] = useState(question.explanation || '');

  const handleSave = () => {
    if (text.trim() && options.every(o => o.trim())) {
      onSave({
        ...question,
        question: text.trim(),
        options: options.map(o => o.trim()),
        correctAnswer: correct,
        explanation: explanation.trim()
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
      <div className="bg-[var(--background)] w-full max-w-md rounded-2xl flex flex-col max-h-[90vh]">
        <div className="p-5 border-b border-white/5 flex items-center justify-between shrink-0">
          <h2 className="text-[var(--primary)] text-lg font-bold">Edit Question</h2>
          <button onClick={onDismiss} className="text-white/70 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 overflow-y-auto flex-1 flex flex-col space-y-4">
          <div>
            <UploadLabel text="Question" />
            <UploadTextField value={text} onChange={(e) => setText(e.target.value)} placeholder="Question text" isTextArea />
          </div>
          
          <div className="space-y-3">
            {options.map((opt, i) => (
              <div key={i} className="flex flex-col">
                <UploadLabel text={`Option ${String.fromCharCode(65 + i)}`} />
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <UploadTextField 
                      value={opt} 
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[i] = e.target.value;
                        setOptions(newOpts);
                      }} 
                      placeholder={`Option ${String.fromCharCode(65 + i)}`} 
                    />
                  </div>
                  <div 
                    onClick={() => setCorrect(i)}
                    className="shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-colors"
                    style={{
                      borderColor: correct === i ? 'var(--avatar-bg)' : 'rgba(255,255,255,0.3)'
                    }}
                  >
                    {correct === i && <div className="w-3 h-3 rounded-full bg-[var(--avatar-bg)]" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <UploadLabel text="Explanation" />
            <UploadTextField value={explanation} onChange={(e) => setExplanation(e.target.value)} placeholder="Explanation" isTextArea />
          </div>
        </div>

        <div className="p-5 border-t border-white/5 flex justify-end space-x-3 shrink-0">
          <button onClick={onDismiss} className="px-4 py-2 text-white/70 hover:text-white font-medium">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2 bg-[var(--avatar-bg)] text-[#20271E] font-bold rounded-xl hover:bg-[#9AB063] transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
