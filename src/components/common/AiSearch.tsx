
'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, BrainCircuit } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleNavigationCommand } from '@/actions/quran';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';

const formSchema = z.object({
  command: z.string().min(3, 'Please enter a longer command.'),
});

export function AiSearch() {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { toast } = useToast();
  const { language } = useLanguage();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { command: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const result = await handleNavigationCommand(values.command, language);

        if (result.error) {
          toast({
            variant: 'destructive',
            title: 'Navigation Error',
            description: result.error,
          });
        } else if (result.path) {
          router.push(result.path);
          form.reset();
        } else {
           toast({
            variant: 'destructive',
            title: 'Unknown Command',
            description: "I couldn't understand that command. Please try something like 'Open Surah Fatiha' or 'Play Surah Baqarah'.",
          });
        }
      } catch (e) {
        toast({
          variant: 'destructive',
          title: 'An Error Occurred',
          description: 'Something went wrong. Please try again.',
        });
      }
    });
  }

  return (
    <TooltipProvider>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2 relative">
          <FormField
            control={form.control}
            name="command"
            render={({ field }) => (
              <FormItem className="flex-grow">
                <FormControl>
                  <div className="relative flex items-center">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <BrainCircuit className="absolute left-3 h-5 w-5 text-muted-foreground" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>You can say things like "Open Surah Fatiha" or "Play Yaseen"</p>
                      </TooltipContent>
                    </Tooltip>
                    <Input
                      placeholder="AI Search..."
                      className="bg-muted pl-10"
                      {...field}
                      disabled={isPending}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" size="icon" disabled={isPending} aria-label="Search">
            {isPending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div> : <Search size={16} />}
          </Button>
        </form>
      </Form>
    </TooltipProvider>
  );
}
