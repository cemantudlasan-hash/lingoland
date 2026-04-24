
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Loader2,
  Download,
  Wand2,
  Maximize,
  Minimize,
  MousePointerClick,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  generatePresentation,
  type GeneratePresentationInput,
  type GeneratePresentationOutput,
} from '@/ai/flows/generate-presentation';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/components/ui/carousel';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/auth-context';
import Link from 'next/link';

const formSchema = z.object({
  topic: z.string().min(3, 'Topic must be at least 3 characters long.'),
  slideCount: z.coerce
    .number()
    .int()
    .min(3)
    .max(20, 'Cannot be more than 20 slides.'),
});

type FormValues = z.infer<typeof formSchema>;

const themes = [
    { name: 'Default', className: 'bg-white text-black' },
    { name: 'Dark', className: 'bg-gray-800 text-white' },
    { name: 'Sepia', className: 'bg-amber-100 text-stone-800' },
    { name: 'Blueprint', className: 'bg-blueprint text-white' },
    { name: 'Mint Stripes', className: 'bg-mint-stripes text-slate-800' },
    { name: 'Pastel Floral', className: 'bg-pastel-floral text-orange-900' },
    { name: 'Dotted Grid', className: 'bg-dotted-grid text-sky-900' },
    { name: 'Twilight', className: 'bg-twilight text-white' },
    { name: 'Sky', className: 'bg-sky text-blue-900' },
    { name: 'Rose Gold', className: 'bg-rose-gold text-rose-900' },
    { name: 'Forest', className: 'bg-forest text-teal-900' },
];

const fontFamilies = [
    { name: 'Default (PT Sans)', className: 'font-body' },
    { name: 'Roboto', className: 'font-roboto' },
    { name: 'Lato', className: 'font-lato' },
    { name: 'Montserrat', className: 'font-montserrat' },
];

const fontSizes = [
    { name: 'Small', className: 'text-lg', titleClassName: 'text-2xl', fullScreenClassName: 'text-[2.5vw] leading-tight', fullScreenTitleClassName: 'text-[4vw] leading-tight' },
    { name: 'Medium', className: 'text-xl', titleClassName: 'text-3xl', fullScreenClassName: 'text-[3vw] leading-tight', fullScreenTitleClassName: 'text-[5vw] leading-tight' },
    { name: 'Large', className: 'text-2xl', titleClassName: 'text-4xl', fullScreenClassName: 'text-[3.5vw] leading-tight', fullScreenTitleClassName: 'text-[6vw] leading-tight' },
    { name: 'Extra Large', className: 'text-3xl', titleClassName: 'text-5xl', fullScreenClassName: 'text-[4vw] leading-tight', fullScreenTitleClassName: 'text-[7vw] leading-tight' },
];


export function PresentationForm() {
  const [presentation, setPresentation] =
    React.useState<GeneratePresentationOutput | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const presentationContainerRef = React.useRef<HTMLDivElement>(null);

  const [visibleWordCounts, setVisibleWordCounts] = React.useState<{
    [key: number]: number;
  }>({});
  const allWordsOnSlide = React.useRef<{ [key: number]: string[] }>({});

  const [isFullscreen, setIsFullscreen] = React.useState(false);
  
  const [theme, setTheme] = React.useState(themes[0].className);
  const [fontFamily, setFontFamily] = React.useState(fontFamilies[0].className);
  const [fontSize, setFontSize] = React.useState(fontSizes[1]);

  const { toast } = useToast();
  const { user, isGuest, isLoading: isAuthLoading } = useAuth();

  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;
  }

  if (isGuest || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="p-6 bg-primary/10 rounded-full">
          <MousePointerClick className="h-20 w-20 text-primary animate-pulse" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-foreground">PRESENTATION MAKER ACCESS RESTRICTED</h2>
          <p className="text-muted-foreground text-lg">Please sign in or create an account to access the Presentation Maker.</p>
        </div>
        <Button asChild size="lg" className="h-14 px-10 text-xl font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600">
          <Link href="/auth">Sign In or Create Account</Link>
        </Button>
      </div>
    );
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      topic: '',
      slideCount: 5,
    },
  });

  const setupWordAnimation = React.useCallback((slides: GeneratePresentationOutput['slides']) => {
    const wordCounts: { [key: number]: number } = {};
    const wordsBySlide: { [key: number]: string[] } = {};
    (slides || []).forEach((slide, index) => {
      wordCounts[index] = 0;
      wordsBySlide[index] = slide.content.flatMap((point) => point.split(' '));
    });
    setVisibleWordCounts(wordCounts);
    allWordsOnSlide.current = wordsBySlide;
  }, []);

  const handleRevealNextWord = React.useCallback(() => {
    if (!presentation) return;

    setVisibleWordCounts((prevCounts) => {
      const currentSlideIndex = api?.selectedScrollSnap() || 0;
      const currentWords = allWordsOnSlide.current[currentSlideIndex];
      if (!currentWords) return prevCounts;
      const currentVisibleCount = prevCounts[currentSlideIndex] || 0;

      if (currentVisibleCount < currentWords.length) {
        return {
          ...prevCounts,
          [currentSlideIndex]: currentVisibleCount + 1,
        };
      }
      return prevCounts;
    });
  }, [presentation, api]);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!presentation) return;
      if (event.key === ' ' || event.key === 'ArrowRight') {
        event.preventDefault();
        handleRevealNextWord();
      }
    };
    
    // Use the ref for the event listener target
    const container = presentationContainerRef.current;
    
    // We only want the listener on the container when it's in fullscreen
    if (container && isFullscreen) {
        container.addEventListener('keydown', handleKeyDown);
        container.setAttribute('tabindex', '0'); // Make it focusable
        container.focus(); // Focus it to receive key events
    }

    return () => {
      if (container) {
        container.removeEventListener('keydown', handleKeyDown);
      }
    };
  }, [presentation, handleRevealNextWord, isFullscreen]);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    const onSelect = () => {
      setCurrent(api.selectedScrollSnap() + 1);
      if (presentation) {
        // Reset word counts for all slides to ensure animation starts fresh on slide change
        setupWordAnimation(presentation.slides);
      }
    };
    
    const onReInit = () => {
        setCount(api.scrollSnapList().length);
        setCurrent(api.selectedScrollSnap() + 1);
        if (presentation) {
            setupWordAnimation(presentation.slides);
        }
    }
    
    onReInit(); // Initial setup

    api.on("select", onSelect);
    api.on("reInit", onReInit);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onReInit);
    };
  }, [api, presentation, setupWordAnimation]);

  const onSubmit = async (values: FormValues) => {
    setIsLoading(true);
    setPresentation(null);
    try {
      const result = await generatePresentation(values);
      setPresentation(result);
      setupWordAnimation(result.slides);
    } catch (e) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Could not generate the presentation. Please try again.',
      });
    }
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (!presentation) return;

    const { title, slides } = presentation;
    const filename = `${title.replace(/\s+/g, '_')}_presentation.html`;

    const slideHtml = slides
      .map(
        (slide) => `
        <div style="page-break-after: always; padding: 40px; border: 1px solid #ccc; margin-bottom: 20px;">
            <h2 style="font-size: 24px; font-family: Arial, sans-serif;">${slide.title}</h2>
            <ul style="font-size: 18px; font-family: Arial, sans-serif; line-height: 1.6;">
                ${slide.content.map((point) => `<li>${point}</li>`).join('')}
            </ul>
        </div>
    `
      )
      .join('');

    const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="utf-8">
            <title>${title}</title>
            <style>
                body { font-family: Arial, sans-serif; }
                @media print {
                    div {
                       break-inside: avoid;
                    }
                }
            </style>
        </head>
        <body>
            <h1 style="font-size: 36px; text-align: center;">${title}</h1>
            ${htmlContent}
        </body>
        </html>
    `;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download Started',
      description:
        'Your presentation.html file is downloading. You can open this file in PowerPoint.',
    });
  };

  const handleFullScreen = () => {
    if (presentationContainerRef.current) {
      if (!document.fullscreenElement) {
        presentationContainerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const handleCreateNew = () => {
    setPresentation(null);
    form.reset();
  };

  const renderAnimatedContent = (
    content: string[],
    visibleCount: number
  ) => {
    let wordCounter = 0;
    return content
      .map((point, pointIndex) => {
        const words = point.split(' ');
        const visibleWords = [];
        for (let i = 0; i < words.length; i++) {
          if (wordCounter < visibleCount) {
            visibleWords.push(words[i]);
            wordCounter++;
          }
        }
        if (visibleWords.length > 0) {
          return <li key={pointIndex}>{visibleWords.join(' ')}</li>;
        }
        return null;
      })
      .filter(Boolean);
  };
  
  return (
    <div className="space-y-8">
      {isLoading && (
        <div className="flex items-center justify-center rounded-lg border p-12">
          <Loader2 className="mr-2 h-8 w-8 animate-spin" />
          <p className="ml-4 text-muted-foreground">
            Generating your presentation...
          </p>
        </div>
      )}

      {presentation ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap justify-between items-center gap-4">
                <div>
                  <CardTitle>{presentation.title}</CardTitle>
                  <CardDescription>
                    Here is your generated presentation with{' '}
                    {presentation.slides.length} slides.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleCreateNew} variant="secondary">
                    <Wand2 className="mr-2 h-4 w-4" />
                    Create New
                  </Button>
                  <Button onClick={handleDownload} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download for PowerPoint
                  </Button>
                  <Button onClick={handleFullScreen} variant="outline">
                    <Maximize className="mr-2 h-4 w-4" />
                    Fullscreen
                  </Button>
                </div>
              </div>
            </CardHeader>
             <CardContent className="flex flex-col items-center gap-4 pt-0">
                <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 py-4">
                    <div className="flex items-center gap-2">
                        <Label htmlFor="theme-select">Theme:</Label>
                        <Select value={theme} onValueChange={setTheme}>
                            <SelectTrigger id="theme-select" className="w-[180px]">
                                <SelectValue placeholder="Select a theme" />
                            </SelectTrigger>
                            <SelectContent>
                                {themes.map((t) => (
                                    <SelectItem key={t.name} value={t.className}>{t.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="font-select">Font:</Label>
                        <Select value={fontFamily} onValueChange={setFontFamily}>
                            <SelectTrigger id="font-select" className="w-[180px]">
                                <SelectValue placeholder="Select a font" />
                            </SelectTrigger>
                            <SelectContent>
                                {fontFamilies.map((f) => (
                                    <SelectItem key={f.name} value={f.className} className={f.className}>{f.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-center gap-2">
                        <Label htmlFor="size-select">Size:</Label>
                        <Select value={fontSize.className} onValueChange={(value) => setFontSize(fontSizes.find(s => s.className === value) || fontSizes[1])}>
                            <SelectTrigger id="size-select" className="w-[180px]">
                                <SelectValue placeholder="Select a size" />
                            </SelectTrigger>
                            <SelectContent>
                                {fontSizes.map((s) => (
                                    <SelectItem key={s.name} value={s.className}>{s.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </CardContent>
          </Card>
          
          <div
            ref={presentationContainerRef}
            className={cn(
                'relative h-[450px] w-full mt-4', 
                isFullscreen && 'fixed inset-0 z-50 w-screen h-screen !m-0'
            )}
            onClick={isFullscreen ? undefined : handleRevealNextWord}
          >
            {isFullscreen && (
              <>
                <Button
                  onClick={(e) => { e.stopPropagation(); handleFullScreen(); }}
                  variant="secondary"
                  className="absolute top-4 right-4 z-20 h-auto p-2 gap-1.5 bg-black/20 text-white/80 hover:bg-black/30 hover:text-white"
                >
                  <Minimize className="h-4 w-4" />
                  <span className="text-xs">Exit</span>
                </Button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 rounded-full bg-black/30 text-white/80 px-3 py-1 text-sm font-mono">
                  {current} / {count}
                </div>
              </>
            )}
            <Carousel setApi={setApi} className="w-full h-full">
              <CarouselContent className="h-full">
                  {presentation.slides.map((slide, index) => (
                      <CarouselItem key={index} className="h-full">
                          <div 
                              className={cn(
                                  "w-full h-full cursor-pointer flex",
                                  theme, fontFamily
                              )}
                              onClick={!isFullscreen ? undefined : handleRevealNextWord}
                          >
                              <div className={cn(
                                  "w-full overflow-y-auto",
                                  !isFullscreen && "flex flex-col justify-center items-start p-8 md:p-16 border rounded-lg",
                                  isFullscreen && "py-24 px-8 md:px-16 lg:px-24"
                              )}>
                                <div className={cn("max-w-5xl w-full", isFullscreen && "mx-auto")}>
                                      <h2 className={cn("font-bold text-left",
                                          !isFullscreen ? `mb-6 ${fontSize.titleClassName}` : `mb-8 lg:mb-16 ${fontSize.fullScreenTitleClassName}`
                                      )}>
                                          {slide.title}
                                      </h2>
                                      <ul className={cn("list-disc text-left",
                                          !isFullscreen ? `space-y-4 pl-12 mx-auto ${fontSize.className}` : `space-y-4 md:space-y-6 lg:space-y-8 pl-8 ${fontSize.fullScreenClassName}`
                                      )}>
                                          {renderAnimatedContent(slide.content, visibleWordCounts[index] || 0)}
                                      </ul>
                                  </div>
                              </div>
                          </div>
                      </CarouselItem>
                  ))}
              </CarouselContent>
              <CarouselPrevious className={cn(
                  "absolute z-10",
                  !isFullscreen ? "left-4 top-1/2 -translate-y-1/2" : "left-4 bottom-4 bg-black/20 text-white hover:bg-black/40"
              )} />
              <CarouselNext className={cn(
                  "absolute z-10",
                  !isFullscreen ? "right-4 top-1/2 -translate-y-1/2" : "right-4 bottom-4 bg-black/20 text-white hover:bg-black/40"
              )} />
            </Carousel>
          </div>

          <div className={cn('py-2 text-center text-sm text-muted-foreground', isFullscreen && 'hidden')}>
            Slide {current} of {count}
          </div>
          <div className={cn("mt-2 flex items-center justify-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground", isFullscreen && "hidden")}>
            <MousePointerClick className="h-4 w-4" />
            <p>Click or press Spacebar to reveal text</p>
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
            <CardTitle>Presentation Maker</CardTitle>
            <CardDescription className="text-gray-300">
              Enter a topic to generate a presentation outline.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="topic"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Topic
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., The History of the Internet, Benefits of Regular Exercise"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="slideCount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-semibold">
                        Number of Slides
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="3"
                          max="20"
                          className="w-[180px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Generate Presentation
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
