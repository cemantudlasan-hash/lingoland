'use client';

import * as React from 'react';
import { useAuth } from '@/context/auth-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Loader2, Clapperboard, ExternalLink, Plus, Trash2, Edit3, UserPlus, Sparkles, Film, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { AddEditMovieDialog } from './add-movie-dialog';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { deleteDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function MovieRelaxPage() {
  const { user, isGuest, isAdmin, isLoading: isAuthLoading } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingMovie, setEditingMovie] = React.useState<any | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');

  const moviesQuery = useMemoFirebase(() => {
    if (!firestore || isGuest || !user) return null;
    return query(collection(firestore, 'movies'), orderBy('title', 'asc'));
  }, [firestore, isGuest, user]);

  const { data: movies, isLoading: isDataLoading } = useCollection(moviesQuery);

  const filteredMovies = React.useMemo(() => {
    if (!movies) return [];
    if (!searchTerm.trim()) return movies;
    
    const term = searchTerm.toLowerCase().trim();
    return movies.filter(movie => 
      movie.title.toLowerCase().includes(term)
    );
  }, [movies, searchTerm]);

  if (isAuthLoading) {
    return <div className="flex justify-center items-center h-[60vh]"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>;
  }

  if (isGuest || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-6">
        <div className="p-6 bg-primary/10 rounded-full">
            <Film className="h-20 w-20 text-primary animate-pulse" />
        </div>
        <div className="space-y-2">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-foreground">THEATRE ACCESS RESTRICTED</h2>
            <p className="text-muted-foreground text-lg">Please sign in or create an account to access Movie Relax.</p>
        </div>
        <Button asChild size="lg" className="h-14 px-10 text-xl font-bold rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600">
          <Link href="/auth">
            <UserPlus className="mr-2 h-6 w-6" /> Join the Community
          </Link>
        </Button>
      </div>
    );
  }

  const handleDelete = (id: string) => {
    if (!firestore) return;
    deleteDocumentNonBlocking(doc(firestore, 'movies', id));
    toast({ variant: 'destructive', title: 'Movie Removed', description: 'The link has been deleted from the board.' });
  };

  const handleEdit = (movie: any) => {
    setEditingMovie(movie);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingMovie(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase italic text-foreground flex items-center gap-4 justify-center md:justify-start">
              <Clapperboard className="h-8 w-8 md:h-10 md:w-10 text-primary" />
              Movie Relax
            </h1>
            <p className="text-muted-foreground font-medium text-base md:text-lg">Share and explore cinematic treasures with fellow linguists.</p>
          </div>
          <Button onClick={handleAdd} size="lg" className="h-14 px-8 text-xl font-bold rounded-2xl bg-primary shadow-xl shadow-primary/20 hover:scale-105 transition-transform w-full md:w-auto">
            <Plus className="mr-2 h-6 w-6" /> Post a Movie
          </Button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-2xl mx-auto w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Search by movie title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-12 h-14 bg-card/50 backdrop-blur-xl border-border/10 rounded-2xl text-lg shadow-inner focus-visible:ring-primary focus-visible:ring-offset-0"
          />
        </div>
      </div>

      {isDataLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin h-12 w-12 text-primary" /></div>
      ) : filteredMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredMovies.map((movie, index) => (
              <motion.div
                key={movie.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="group h-full flex flex-col bg-card/50 backdrop-blur-xl border-border/10 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl overflow-hidden rounded-[2.5rem]">
                  <div className="relative aspect-video bg-muted overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="text-8xl drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-transform duration-500 group-hover:scale-125 group-hover:rotate-6 select-none">
                        {movie.thumbnailEmoji || '🎬'}
                    </span>
                    <Badge className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border-none uppercase font-black text-[10px] tracking-widest px-3 py-1 text-white">
                        Movie Pick
                    </Badge>
                  </div>
                  <CardHeader className="p-6 pb-2">
                    <CardTitle className="text-xl md:text-2xl font-black text-card-foreground line-clamp-2 group-hover:text-primary transition-colors uppercase italic min-h-[3.5rem] flex items-center">{movie.title}</CardTitle>
                    <p className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Shared by {movie.authorName}</p>
                  </CardHeader>
                  <CardContent className="px-6 flex-grow pb-4">
                    <ScrollArea className="h-24 w-full pr-4">
                      <p className="text-foreground/80 font-medium italic text-sm md:text-base whitespace-pre-wrap">"{movie.description}"</p>
                    </ScrollArea>
                  </CardContent>
                  <CardFooter className="p-6 pt-0 flex flex-col gap-4">
                    <Button asChild className="w-full h-12 rounded-xl font-black uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 transition-all shadow-lg">
                      <a href={movie.url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" /> Watch Now
                      </a>
                    </Button>
                    <div className="flex justify-between items-center w-full">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase">
                            {movie.createdAt ? formatDistanceToNow(movie.createdAt.toDate(), { addSuffix: true }) : 'Recently'}
                        </span>
                        {(isAdmin || user?.uid === movie.authorId) && (
                            <div className="flex gap-1">
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(movie)} className="h-8 w-8 text-blue-400 hover:bg-blue-400/10">
                                    <Edit3 className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" onClick={() => handleDelete(movie.id)} className="h-8 w-8 text-destructive hover:bg-destructive/10">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        )}
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="text-center py-20 bg-muted/20 rounded-[3rem] border-4 border-dashed border-border/5 flex flex-col items-center gap-4 mx-4">
            {searchTerm ? (
              <>
                <Search className="h-12 w-12 text-muted-foreground/40" />
                <p className="text-lg md:text-xl font-bold text-muted-foreground px-4">No movies found matching "{searchTerm}"</p>
                <Button variant="ghost" onClick={() => setSearchTerm('')}>Clear Search</Button>
              </>
            ) : (
              <>
                <Sparkles className="h-12 w-12 text-primary/40" />
                <p className="text-lg md:text-xl font-bold text-muted-foreground px-4">The theatre is currently empty. Be the first to share a masterpiece!</p>
              </>
            )}
        </div>
      )}

      <AddEditMovieDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        movie={editingMovie}
      />
    </div>
  );
}
