
'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Play, Pause, LoaderCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { handleTutorQuery } from '@/actions/quran';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/use-translation';
import { useAudioPlayer } from '@/hooks/use-audio-player';

const formSchema = z.object({
  question: z.string().min(1, 'Message cannot be empty.'),
});

type Message = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  audioUrl?: string;
  surahNumber?: number;
  ayahNumber?: number;
};

function ChatAudioPlayer({ audioUrl, surahNumber, ayahNumber }: { audioUrl: string, surahNumber?: number, ayahNumber?: number }) {
  const { togglePlayPause, isPlaying, isLoading, src } = useAudioPlayer();
  const isThisAudioPlaying = isPlaying && src === audioUrl;

  const title = surahNumber && ayahNumber ? `Surah ${surahNumber}, Ayah ${ayahNumber}` : 'Recitation';

  const handlePlay = () => {
    togglePlayPause(audioUrl, { title, artist: 'Noor Al Quran' });
  };
  
  return (
    <Button variant="outline" size="sm" onClick={handlePlay} className="mt-2">
      {isLoading && src === audioUrl ? (
        <LoaderCircle className="h-4 w-4 animate-spin mr-2" />
      ) : isThisAudioPlaying ? (
        <Pause className="h-4 w-4 mr-2" />
      ) : (
        <Play className="h-4 w-4 mr-2" />
      )}
      {isThisAudioPlaying ? 'Pause' : 'Play Recitation'}
    </Button>
  )
}

export function TutorChat() {
  const { language } = useLanguage();
  const { t } = useTranslation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { question: '' },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo(0, scrollAreaRef.current.scrollHeight);
    }
  }, [messages]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const userMessage: Message = {
      id: Date.now(),
      role: 'user',
      content: values.question,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    form.reset();

    try {
      const result = await handleTutorQuery(values.question, language);
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: result.answer,
        audioUrl: result.audioUrl,
        surahNumber: result.surahNumber,
        ayahNumber: result.ayahNumber,
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (e) {
      const errorMessage: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-[calc(75vh-100px)]">
      <ScrollArea className="flex-grow p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map(message => (
            <div
              key={message.id}
              className={cn(
                'flex items-start gap-3',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/40x40.png" alt="AI Tutor" data-ai-hint="robot assistant"/>
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  'max-w-xs md:max-w-md lg:max-w-lg p-3 rounded-2xl',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-none'
                    : 'bg-muted rounded-bl-none'
                )}
              >
                <p className={cn("text-sm whitespace-pre-wrap", language === 'ur' && message.role === 'assistant' ? 'text-right font-urdu' : '')}
                   dir={language === 'ur' && message.role === 'assistant' ? 'rtl' : 'ltr'}>
                  {message.content}
                </p>
                {message.audioUrl && (
                  <ChatAudioPlayer 
                    audioUrl={message.audioUrl} 
                    surahNumber={message.surahNumber}
                    ayahNumber={message.ayahNumber}
                  />
                )}
              </div>
               {message.role === 'user' && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/40x40.png" alt="User" data-ai-hint="person icon"/>
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-3 justify-start">
               <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/40x40.png" alt="AI Tutor" data-ai-hint="robot assistant"/>
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
              <div className="bg-muted p-3 rounded-2xl rounded-bl-none">
                <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 bg-foreground/50 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="h-2 w-2 bg-foreground/50 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="h-2 w-2 bg-foreground/50 rounded-full animate-pulse"></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 border-t">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
            <FormField
              control={form.control}
              name="question"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <Input
                      placeholder={t('tutorInputPlaceholder')}
                      autoComplete="off"
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" size="icon" disabled={isLoading} aria-label="Send message">
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
