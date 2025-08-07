
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Headphones, MessageCircleQuestion } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl md:text-6xl font-headline font-bold text-primary mb-4">
          Noor Al Quran
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Your digital gateway to the Holy Quran. Read, listen, and learn with an intuitive and serene experience designed for reflection and study.
        </p>
      </section>

      <section className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-2xl">
        <Image
          src="/book-1283468.jpg"
          alt="Quran on a stand"
          fill
          style={{ objectFit: 'cover' }}
          className="opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </section>


      <section className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <Card className="hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
          <CardHeader>
            <div className="mx-auto bg-accent/20 p-4 rounded-full w-fit">
              <BookOpen className="w-10 h-10 text-accent-foreground" />
            </div>
            <CardTitle className="font-headline mt-4">Read the Quran</CardTitle>
            <CardDescription>
              Immerse yourself in the holy text with a clean, readable interface and optional English translations.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default" className="bg-primary hover:bg-primary/90">
              <Link href="/read">Start Reading</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
          <CardHeader>
            <div className="mx-auto bg-accent/20 p-4 rounded-full w-fit">
              <Headphones className="w-10 h-10 text-accent-foreground" />
            </div>
            <CardTitle className="font-headline mt-4">Listen to Recitations</CardTitle>
            <CardDescription>
              Experience the divine verses through beautiful audio recitations by Sheikh Alafasy.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default" className="bg-primary hover:bg-primary/90">
              <Link href="/listen">Listen Now</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-300 transform hover:-translate-y-1">
          <CardHeader>
            <div className="mx-auto bg-accent/20 p-4 rounded-full w-fit">
              <MessageCircleQuestion className="w-10 h-10 text-accent-foreground" />
            </div>
            <CardTitle className="font-headline mt-4">AI Quran Tutor</CardTitle>
            <CardDescription>
              Have your questions about the Quran answered by our knowledgeable AI assistant.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="default" className="bg-primary hover:bg-primary/90">
              <Link href="/tutor">Ask a Question</Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
