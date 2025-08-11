
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../ui/button';
import { LoaderCircle, Check, X, RefreshCw, Send, Volume2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { handleWritingSubmission, getInstructionAudio } from '@/actions/quran';
import { useLanguage } from '@/contexts/LanguageContext';
import { arabicAlphabet } from '@/lib/kids-data';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function WritingCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { language } = useLanguage();
    const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
    const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | 'info'; message: string } | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const currentLetter = arabicAlphabet[currentLetterIndex];

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            if(ctx) {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 10;
                ctx.lineCap = 'round';
            }
        }
    }, []);

    useEffect(() => {
        // Preload and play initial instruction audio
        const playInitialInstruction = async () => {
            const text = language === 'ur' 
                ? `چلو ${currentLetter.name} لکھتے ہیں` 
                : `Let's write ${currentLetter.name}`;
            setIsLoading(true);
            const { audioDataUri } = await getInstructionAudio(text);
            playAudio(audioDataUri);
            setIsLoading(false);
        };
        playInitialInstruction();
    }, [currentLetterIndex, language]);

    const playAudio = (audioDataUri: string) => {
        if (!audioRef.current) {
            audioRef.current = new Audio();
            audioRef.current.addEventListener('ended', () => setIsLoading(false));
            audioRef.current.addEventListener('error', () => setIsLoading(false));
            audioRef.current.addEventListener('canplay', () => audioRef.current?.play());
        }
        setIsLoading(true);
        audioRef.current.src = audioDataUri;
    };

    const startDrawing = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = nativeEvent;
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY);
            setIsDrawing(true);
        }
    };

    const draw = ({ nativeEvent }: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.lineTo(offsetX, offsetY);
            ctx.stroke();
        }
    };

    const stopDrawing = () => {
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.closePath();
            setIsDrawing(false);
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            setFeedback(null);
        }
    };

    const handleSubmit = async () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        setIsProcessing(true);
        setFeedback(null);
        const imageDataUri = canvas.toDataURL('image/png');
        
        const result = await handleWritingSubmission(imageDataUri, currentLetter.name, language);

        setFeedback({
            type: result.isCorrect ? 'correct' : 'incorrect',
            message: result.feedback,
        });

        playAudio(result.feedbackAudio);
        
        if (result.isCorrect) {
            setTimeout(() => {
                if (currentLetterIndex < arabicAlphabet.length - 1) {
                    setCurrentLetterIndex(currentLetterIndex + 1);
                    clearCanvas();
                } else {
                     setFeedback({ type: 'info', message: language === 'ur' ? 'شاباش! آپ نے تمام حروف مکمل کر لیے ہیں۔' : 'Congratulations! You have completed all the letters.' });
                }
            }, 3000); // Wait 3 seconds before moving to the next letter
        }
        setIsProcessing(false);
    };

    const handleInstructionAudio = async () => {
        const text = language === 'ur'
            ? `${currentLetter.name} لکھیں`
            : `Write ${currentLetter.name}`;
        const { audioDataUri } = await getInstructionAudio(text);
        playAudio(audioDataUri);
    };

    return (
        <Card>
            <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-4">
                    <p className="text-2xl text-muted-foreground">
                        {language === 'ur' ? 'یہ حرف لکھیں:' : 'Write this letter:'}
                    </p>
                    <span className="font-arabic text-6xl font-bold text-primary">{currentLetter.letter}</span>
                    <Button onClick={handleInstructionAudio} size="icon" variant="ghost" disabled={isLoading}>
                       {isLoading ? <LoaderCircle className="animate-spin" /> : <Volume2 />}
                    </Button>
                </div>
            </CardHeader>
            <CardContent className="flex justify-center items-center">
                <canvas
                    ref={canvasRef}
                    width="300"
                    height="300"
                    className="bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair shadow-inner"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                />
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                 {feedback && (
                    <Alert variant={feedback.type === 'correct' ? 'default' : (feedback.type === 'incorrect' ? 'destructive' : 'default')} className="w-full">
                       {feedback.type === 'correct' ? <Check className="h-4 w-4" /> : (feedback.type === 'incorrect' ? <X className="h-4 w-4" /> : null)}
                       <AlertTitle>{feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}</AlertTitle>
                       <AlertDescription>{feedback.message}</AlertDescription>
                    </Alert>
                )}
                <div className="flex justify-center gap-4">
                    <Button onClick={clearCanvas} variant="outline" disabled={isProcessing}>
                        <RefreshCw className="mr-2" />
                        {language === 'ur' ? 'صاف کریں' : 'Clear'}
                    </Button>
                    <Button onClick={handleSubmit} disabled={isProcessing}>
                        {isProcessing ? <LoaderCircle className="animate-spin mr-2" /> : <Send className="mr-2" />}
                        {language === 'ur' ? 'جمع کرائیں' : 'Submit'}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
