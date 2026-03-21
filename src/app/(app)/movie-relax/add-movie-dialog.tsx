'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Clapperboard, Send, Save } from 'lucide-react';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { collection, doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { addDocumentNonBlocking, setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

const forbiddenKeywords = [
  'porn', 'xxx', 'hentai', 'sex', 'casino', 'betting', 'gambling', 'slot', 
  'poker', 'lottery', 'scam', 'phishing', 'prize', 'winner', 'free-gift'
];

const containsForbiddenLink = (url: string): boolean => {
  const normalizedUrl = url.toLowerCase();
  return forbiddenKeywords.some(keyword => normalizedUrl.includes(keyword));
};

const movieSchema = z.object({
  title: z.string().min(2, "Title is required."),
  url: z.string().url("A valid URL is required."),
  description: z.string().min(5, "Description must be at least 5 characters."),
});

type MovieFormValues = z.infer<typeof movieSchema>;

const EMOJI_MAP: Record<string, string> = {
    'action': '💥',
    'comedy': '😂',
    'horror': '👻',
    'scary': '😱',
    'drama': '🎭',
    'love': '💖',
    'romance': '🌹',
    'sci-fi': '🚀',
    'space': '👽',
    'fantasy': '🧙',
    'magic': '✨',
    'war': '⚔️',
    'history': '📜',
    'crime': '🕵️',
    'mystery': '🔍',
    'thriller': '🔪',
    'anime': '🎎',
    'japan': '🎌',
    'music': '🎸',
    'hero': '🦸',
    'superhero': '⚡',
    'adventure': '🗺️',
    'family': '👨‍👩‍👧‍👦',
    'animated': '🎨',
    'documentary': '📽️',
    'sports': '🏆',
};

const generateEmoji = (title: string, description: string): string => {
    const text = (title + ' ' + description).toLowerCase();
    for (const [keyword, emoji] of Object.entries(EMOJI_MAP)) {
        if (text.includes(keyword)) return emoji;
    }
    const defaultEmojis = ['🎬', '🍿', '🎞️', '🎥', '📽️', '📼', '📺'];
    return defaultEmojis[Math.floor(Math.random() * defaultEmojis.length)];
};

export function AddEditMovieDialog({ 
  isOpen, 
  onOpenChange, 
  movie 
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void; 
  movie?: any;
}) {
  const { user, userProfile } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
  });

  React.useEffect(() => {
    if (movie) {
      reset({
        title: movie.title,
        url: movie.url,
        description: movie.description,
      });
    } else {
      reset({ title: '', url: '', description: '' });
    }
  }, [movie, reset, isOpen]);

  const onSubmit = async (data: MovieFormValues) => {
    if (!user || !firestore || !userProfile) return;

    if (containsForbiddenLink(data.url)) {
      toast({
        variant: "destructive",
        title: "Harmful Link Detected",
        description: "Your post was blocked because the link contains restricted keywords (e.g., gambling, adult, or suspicious content).",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const thumbnailEmoji = generateEmoji(data.title, data.description);
      
      if (movie) {
        // Edit
        const movieRef = doc(firestore, 'movies', movie.id);
        setDocumentNonBlocking(movieRef, {
          ...data,
          thumbnailEmoji,
          updatedAt: serverTimestamp(),
        }, { merge: true });
        toast({ title: 'Success', description: 'Movie link updated successfully.' });
      } else {
        // Add
        const moviesCol = collection(firestore, 'movies');
        addDocumentNonBlocking(moviesCol, {
          ...data,
          thumbnailEmoji,
          authorId: user.uid,
          authorName: userProfile.displayName,
          createdAt: serverTimestamp(),
        });
        toast({ title: 'Posted!', description: 'Your movie has been added to the board.' });
      }
      onOpenChange(false);
    } catch (e) {
      toast({ variant: 'destructive', title: 'Error', description: 'Something went wrong. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-[2rem] bg-card border-border shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl font-black uppercase tracking-tighter italic text-foreground flex items-center gap-2">
            <Clapperboard className="h-8 w-8 text-primary" />
            {movie ? 'Modify Link' : 'Post New Content'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base">
            Share an external cinematic experience with the community.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-primary">Movie Title</Label>
            <Input id="title" {...register('title')} placeholder="e.g., Inception" className="bg-muted/50 rounded-xl h-12" />
            {errors.title && <p className="text-xs text-destructive font-bold">{errors.title.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="url" className="text-xs font-black uppercase tracking-widest text-primary">External Link (URL)</Label>
            <Input id="url" {...register('url')} placeholder="https://..." className="bg-muted/50 rounded-xl h-12" />
            {errors.url && <p className="text-xs text-destructive font-bold">{errors.url.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-primary">Description</Label>
            <Textarea id="description" {...register('description')} placeholder="Why is this a must-watch?" className="bg-muted/50 rounded-xl min-h-[100px] resize-none" />
            {errors.description && <p className="text-xs text-destructive font-bold">{errors.description.message}</p>}
          </div>
          <DialogFooter className="pt-4">
            <Button type="submit" disabled={isSubmitting} className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black uppercase text-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
              {isSubmitting ? <Loader2 className="animate-spin mr-2 h-6 w-6" /> : movie ? <Save className="mr-2 h-6 w-6"/> : <Send className="mr-2 h-6 w-6" />}
              {movie ? 'Save Changes' : 'Post to Relax'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
