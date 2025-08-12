
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '../ui/button';
import { LoaderCircle, Check, X, RefreshCw, Send } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { handleWritingSubmission } from '@/actions/quran';
import { useLanguage } from '@/contexts/LanguageContext';
import { arabicAlphabet } from '@/lib/kids-data';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

export function WritingCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const { language } = useLanguage();
    const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
    const [feedback, setFeedback] = useState<{ type: 'correct' | 'incorrect' | 'info'; message: string } | null>(null);
    const [hasDrawn, setHasDrawn] = useState(false);

    const currentLetter = arabicAlphabet[currentLetterIndex];

    const setupCanvas = useCallback(() => {
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
        setupCanvas();
    }, [setupCanvas]);

    const getCoords = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { offsetX: 0, offsetY: 0 };
        const rect = canvas.getBoundingClientRect();
    
        if ('touches' in event.nativeEvent && event.nativeEvent.touches.length > 0) {
            return {
                offsetX: event.nativeEvent.touches[0].clientX - rect.left,
                offsetY: event.nativeEvent.touches[0].clientY - rect.top,
            };
        }
        return {
            offsetX: (event as React.MouseEvent<HTMLCanvasElement>).nativeEvent.offsetX,
            offsetY: (event as React.MouseEvent<HTMLCanvasElement>).nativeEvent.offsetY,
        };
    };

    const startDrawing = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        const { offsetX, offsetY } = getCoords(event);
        const ctx = canvasRef.current?.getContext('2d');
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(offsetX, offsetY);
            setIsDrawing(true);
            setHasDrawn(true);
        }
    };

    const draw = (event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = getCoords(event);
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

    const clearCanvas = useCallback(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx?.clearRect(0, 0, canvas.width, canvas.height);
            setFeedback(null);
            setHasDrawn(false);
        }
    }, []);

    const handleSubmit = async () => {
        const canvas = canvasRef.current;
        if (!canvas || !hasDrawn) return;

        setIsProcessing(true);
        setFeedback(null);
        const imageDataUri = canvas.toDataURL('image/png');
        
        try {
            const result = await handleWritingSubmission(imageDataUri, currentLetter.name, language);

            setFeedback({
                type: result.isCorrect ? 'correct' : 'incorrect',
                message: result.feedback,
            });
            
            if (result.isCorrect) {
                setTimeout(() => {
                    if (currentLetterIndex < arabicAlphabet.length - 1) {
                        setCurrentLetterIndex(currentLetterIndex + 1);
                        clearCanvas();
                    } else {
                         setFeedback({ type: 'info', message: language === 'ur' ? 'شاباش! آپ نے تمام حروف مکمل کر لیے ہیں۔' : 'Congratulations! You have completed all the letters.' });
                    }
                }, 2000); // Wait 2 seconds before moving to the next letter
            }
        } catch (error) {
             setFeedback({ type: 'incorrect', message: language === 'ur' ? 'کچھ غلط ہو گیا۔ براہ کرم دوبارہ کوشش کریں.' : 'Something went wrong. Please try again.'});
        } finally {
            setIsProcessing(false);
        }
    };
    
    // Reset canvas when letter changes
    useEffect(() => {
      clearCanvas();
    }, [currentLetterIndex, clearCanvas]);

    // Prevent scrolling while drawing on canvas on mobile
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const preventScroll = (e: TouchEvent) => {
            if (isDrawing) {
                e.preventDefault();
            }
        };

        canvas.addEventListener('touchmove', preventScroll, { passive: false });

        return () => {
            canvas.removeEventListener('touchmove', preventScroll);
        };
    }, [isDrawing]);

    return (
        <Card>
            <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-4">
                    <p className="text-2xl text-muted-foreground">
                        {language === 'ur' ? 'یہ حرف لکھیں:' : 'Write this letter:'}
                    </p>
                    <span className="font-arabic text-6xl font-bold text-primary">{currentLetter.letter}</span>
                </div>
            </CardHeader>
            <CardContent className="flex justify-center items-center">
                <canvas
                    ref={canvasRef}
                    width="300"
                    height="300"
                    className="bg-white border-2 border-dashed border-gray-300 rounded-lg cursor-crosshair shadow-inner touch-none"
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
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
                    <Button onClick={handleSubmit} disabled={isProcessing || !hasDrawn}>
                        {isProcessing ? <LoaderCircle className="animate-spin mr-2" /> : <Send className="mr-2" />}
                        {language === 'ur' ? 'جمع کرائیں' : 'Submit'}
                    </Button>
                </div>
            </CardFooter>
        </Card>
    );
}
