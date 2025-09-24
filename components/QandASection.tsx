import React, { useState, useEffect, useMemo } from 'react';
import { Guide, User, Question } from '../types';
import { db, functions } from '../services/firebase';
import Button from './common/Button';
import Spinner from './common/Spinner';
import LazyImage from './common/LazyImage';

interface QandASectionProps {
    guide: Guide;
    currentUser: User;
    allUsers: User[];
    addToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

const QandAItem: React.FC<{
    q: Question;
    asker?: User;
    // FIX: Add guide prop to make it available inside this component.
    guide: Guide;
    isGuideOwner: boolean;
    onAnswerSubmit: (questionId: string, answerText: string) => Promise<void>;
}> = ({ q, asker, guide, isGuideOwner, onAnswerSubmit }) => {
    const [showAnswerForm, setShowAnswerForm] = useState(false);
    const [answerText, setAnswerText] = useState('');
    const [isAnswering, setIsAnswering] = useState(false);

    const handleAnswer = async () => {
        if (!answerText.trim()) return;
        setIsAnswering(true);
        await onAnswerSubmit(q.id, answerText);
        setIsAnswering(false);
        setShowAnswerForm(false);
    };

    return (
        <div className="py-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
            <div className="flex items-start gap-3">
                <LazyImage src={asker?.avatarUrl || ''} alt={asker?.name || 'User'} className="w-10 h-10 rounded-full flex-shrink-0" placeholderClassName="rounded-full" />
                <div>
                    <p className="font-semibold text-sm">{asker?.name || 'A user'} asks:</p>
                    <p className="text-gray-800 dark:text-gray-200">{q.questionText}</p>
                </div>
            </div>
            {q.answerText ? (
                <div className="mt-3 pl-12 flex items-start gap-3">
                    <LazyImage src={guide.avatarUrl} alt={guide.name} className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-primary" placeholderClassName="rounded-full" />
                    <div>
                        <p className="font-semibold text-sm text-primary">{guide.name} answers:</p>
                        <p className="text-gray-800 dark:text-gray-200">{q.answerText}</p>
                    </div>
                </div>
            ) : isGuideOwner ? (
                <div className="mt-3 pl-12">
                    {!showAnswerForm ? (
                        <Button size="sm" variant="outline" onClick={() => setShowAnswerForm(true)}>Answer</Button>
                    ) : (
                        <div className="space-y-2">
                             <textarea
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                rows={3}
                                placeholder="Type your answer here..."
                                className="w-full p-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark-light focus:ring-2 focus:ring-primary"
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleAnswer} loading={isAnswering}>Submit</Button>
                                <Button size="sm" variant="ghost" onClick={() => setShowAnswerForm(false)}>Cancel</Button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <p className="mt-3 pl-12 text-sm text-gray-500 italic">Awaiting an answer from {guide.name}.</p>
            )}
        </div>
    );
};

const QandASection: React.FC<QandASectionProps> = ({ guide, currentUser, allUsers, addToast }) => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newQuestion, setNewQuestion] = useState('');
    const [isPosting, setIsPosting] = useState(false);

    useEffect(() => {
        if (!db) {
            addToast("Q&A is unavailable in mock mode.", "info");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        const query = db.collection('questions')
                        .where('guideId', '==', guide.id)
                        .orderBy('createdAt', 'desc');

        const unsubscribe = query.onSnapshot(
            snapshot => {
                setQuestions(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Question)));
                setIsLoading(false);
            },
            err => {
                console.error("Error fetching questions:", err);
                addToast("Could not load Q&A.", "error");
                setIsLoading(false);
            }
        );

        return () => unsubscribe();
    }, [guide.id, addToast]);

    const handleAskQuestion = async () => {
        if (!newQuestion.trim() || !functions) {
            addToast("Cannot post question.", "error");
            return;
        }
        setIsPosting(true);
        try {
            const post = functions.httpsCallable('postQuestion');
            await post({ guideId: guide.id, questionText: newQuestion });
            setNewQuestion('');
            addToast("Your question has been posted!", "success");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to post question.";
            console.error("Error posting question:", err);
            addToast(message, "error");
        } finally {
            setIsPosting(false);
        }
    };

    const handleAnswerSubmit = async (questionId: string, answerText: string) => {
        if (!functions) {
            addToast("Cannot post answer.", "error");
            return;
        }
        try {
            const post = functions.httpsCallable('postAnswer');
            await post({ questionId, answerText });
            addToast("Your answer has been posted!", "success");
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Failed to post answer.";
            console.error("Error posting answer:", err);
            addToast(message, "error");
        }
    };

    const isGuideOwner = currentUser.id === guide.id;

    return (
        <div>
            <h3 className="text-xl font-bold text-center mb-4">Questions & Answers</h3>
            {!isGuideOwner && (
                <div className="mb-6 p-4 bg-gray-100 dark:bg-dark-light rounded-lg">
                    <h4 className="font-semibold mb-2">Ask a question</h4>
                    <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        rows={3}
                        placeholder={`Have a question for ${guide.name}?`}
                        className="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-dark focus:ring-2 focus:ring-primary"
                    />
                    <Button onClick={handleAskQuestion} loading={isPosting} className="mt-2" disabled={!newQuestion.trim()}>
                        Post Question
                    </Button>
                </div>
            )}
            
            {isLoading ? <div className="flex justify-center p-8"><Spinner /></div> : (
                questions.length > 0 ? (
                    <div>
                        {questions.map(q => (
                            <QandAItem
                                key={q.id}
                                q={q}
                                asker={allUsers.find(u => u.id === q.userId)}
                                // FIX: Pass guide prop down to the child component.
                                guide={guide}
                                isGuideOwner={isGuideOwner}
                                onAnswerSubmit={handleAnswerSubmit}
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-gray-500 py-4">No questions have been asked yet. Be the first!</p>
                )
            )}
        </div>
    );
};

export default QandASection;