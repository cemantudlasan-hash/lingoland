'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface Memo {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
}

export default function MemorandumPage() {
  const { user, isGuest } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const memosQuery = useMemoFirebase(() => {
    if (!firestore || !user || isGuest) return null;
    return query(collection(firestore, `users/${user.uid}/memorandums`), orderBy('createdAt', 'desc'));
  }, [firestore, user, isGuest]);

  const { data: memos, isLoading } = useCollection<Memo>(memosQuery);

  if (isGuest || !user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center p-8 text-center space-y-4">
        <h1 className="text-3xl font-black uppercase tracking-tight">Memorandum</h1>
        <p className="text-muted-foreground text-lg">Please sign in to access your personal memorandums.</p>
      </div>
    );
  }

  const handleCreateNew = () => {
    setIsCreating(true);
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const handleEdit = (memo: Memo) => {
    setIsCreating(false);
    setEditingId(memo.id);
    setTitle(memo.title);
    setContent(memo.content);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setTitle('');
    setContent('');
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Error', description: 'Title and content are required.', variant: 'destructive' });
      return;
    }
    if (!firestore || !user) return;

    setIsSaving(true);
    try {
      if (isCreating) {
        await addDoc(collection(firestore, `users/${user.uid}/memorandums`), {
          title: title.trim(),
          content: content.trim(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Success', description: 'Memorandum created.' });
      } else if (editingId) {
        await updateDoc(doc(firestore, `users/${user.uid}/memorandums`, editingId), {
          title: title.trim(),
          content: content.trim(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Success', description: 'Memorandum updated.' });
      }
      handleCancel();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save memorandum.', variant: 'destructive' });
    }
    setIsSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!firestore || !user) return;
    if (!confirm('Are you sure you want to delete this memorandum?')) return;
    try {
      await deleteDoc(doc(firestore, `users/${user.uid}/memorandums`, id));
      toast({ title: 'Success', description: 'Memorandum deleted.' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete memorandum.', variant: 'destructive' });
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-8 max-w-5xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase tracking-tight">Memorandum</h1>
          <p className="text-muted-foreground">Manage your personal notes and memorandums.</p>
        </div>
        {!isCreating && !editingId && (
          <Button onClick={handleCreateNew} className="bg-primary text-primary-foreground">
            <Plus className="mr-2 h-4 w-4" /> New Memo
          </Button>
        )}
      </div>

      {(isCreating || editingId) && (
        <Card className="border-2 border-primary/20 shadow-lg">
          <CardHeader>
            <CardTitle>{isCreating ? 'Create Memorandum' : 'Edit Memorandum'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              placeholder="Memorandum Title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)}
              className="font-bold text-lg"
            />
            <Textarea 
              placeholder="Write your content here..." 
              value={content} 
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[200px]"
            />
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={isSaving}>
              <X className="mr-2 h-4 w-4" /> Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Save Memo
            </Button>
          </CardFooter>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : memos && memos.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {memos.map(memo => (
            <Card key={memo.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="line-clamp-1" title={memo.title}>{memo.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {typeof memo.updatedAt?.toDate === 'function' ? format(memo.updatedAt.toDate(), 'MMM d, yyyy • h:mm a') : 'Just now'}
                </p>
              </CardHeader>
              <CardContent className="flex-grow">
                <p className="whitespace-pre-wrap text-sm line-clamp-6 text-muted-foreground">
                  {memo.content}
                </p>
              </CardContent>
              <CardFooter className="justify-end gap-2 pt-4 border-t border-border/50 bg-muted/20">
                <Button variant="ghost" size="sm" onClick={() => handleEdit(memo)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(memo.id)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : !isCreating && !editingId && (
        <div className="text-center p-12 border-2 border-dashed rounded-xl bg-card/50">
          <p className="text-muted-foreground text-lg mb-4">No memorandums found.</p>
          <Button onClick={handleCreateNew} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Create Your First Memo
          </Button>
        </div>
      )}
    </div>
  );
}
