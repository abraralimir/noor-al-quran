'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { handleNavigationCommand } from '@/actions/quran';

const formSchema = z.object({
  command: z.string().min(3, 'Please enter a longer command.'),
});

export function AiSearch() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { command: '' },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await handleNavigationCommand(values.command);

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
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
        <FormField
          control={form.control}
          name="command"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Input
                  placeholder="e.g., 'Play Surah Al-Fatiha'"
                  className="bg-muted"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="icon" disabled={isLoading} aria-label="Search">
          {isLoading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div> : <Search size={16} />}
        </Button>
      </form>
    </Form>
  );
}
