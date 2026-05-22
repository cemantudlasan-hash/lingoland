'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { collection, query, orderBy, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, type Timestamp } from 'firebase/firestore';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Edit2, Trash2, Save, X, Bell, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Memo {
  id: string;
  title: string;
  content: string;
  createdAt: Timestamp | null;
  updatedAt: Timestamp | null;
  notifyAt?: Timestamp | null;
  showPopup?: boolean;
  notified?: boolean | null;
}

export function MemorandumTool() {
  const { user, isGuest } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notifyAt, setNotifyAt] = useState('');
  const [showPopup, setShowPopup] = useState(false);
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
    setNotifyAt('');
    setShowPopup(false);
  };

  const handleEdit = (memo: Memo) => {
    setIsCreating(false);
    setEditingId(memo.id);
    setTitle(memo.title);
    setContent(memo.content);
    if (memo.notifyAt) {
      const date = typeof memo.notifyAt.toDate === 'function' ? memo.notifyAt.toDate() : new Date(memo.notifyAt.seconds * 1000);
      try {
        const localString = format(date, "yyyy-MM-dd'T'HH:mm");
        setNotifyAt(localString);
      } catch (e) {
        console.error("Error formatting notifyAt:", e);
        setNotifyAt('');
      }
    } else {
      setNotifyAt('');
    }
    setShowPopup(memo.showPopup || false);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingId(null);
    setTitle('');
    setContent('');
    setNotifyAt('');
    setShowPopup(false);
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({ title: 'Error', description: 'Title and content are required.', variant: 'destructive' });
      return;
    }
    if (!firestore || !user) return;

    setIsSaving(true);
    try {
      const newNotifyAtDate = notifyAt ? new Date(notifyAt) : null;
      
      let isNotifyAtChanged = false;
      if (isCreating) {
        isNotifyAtChanged = !!newNotifyAtDate;
      } else if (editingId) {
        const originalMemo = memos?.find(m => m.id === editingId);
        const oldNotifyAt = originalMemo?.notifyAt;
        const oldNotifyAtDate = oldNotifyAt ? (typeof oldNotifyAt.toDate === 'function' ? oldNotifyAt.toDate() : new Date(oldNotifyAt.seconds * 1000)) : null;
        
        if (newNotifyAtDate?.getTime() !== oldNotifyAtDate?.getTime()) {
          isNotifyAtChanged = true;
        }
      }

      if (isCreating) {
        await addDoc(collection(firestore, `users/${user.uid}/memorandums`), {
          title: title.trim(),
          content: content.trim(),
          notifyAt: newNotifyAtDate,
          showPopup: newNotifyAtDate ? showPopup : false,
          notified: newNotifyAtDate ? false : null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        toast({ title: 'Success', description: 'Memorandum created.' });
      } else if (editingId) {
        const updateData: any = {
          title: title.trim(),
          content: content.trim(),
          notifyAt: newNotifyAtDate,
          showPopup: newNotifyAtDate ? showPopup : false,
          updatedAt: serverTimestamp(),
        };
        if (isNotifyAtChanged) {
          updateData.notified = newNotifyAtDate ? false : null;
        }
        await updateDoc(doc(firestore, `users/${user.uid}/memorandums`, editingId), updateData);
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

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    try {
      const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
      if (isNaN(date.getTime())) {
        return 'Just now';
      }
      return format(date, 'MMM d, yyyy • h:mm a');
    } catch (e) {
      console.error('Error formatting date:', e);
      return 'Just now';
    }
  };

  const formatNotifyDate = (timestamp: any) => {
    if (!timestamp) return '';
    try {
      const date = typeof timestamp.toDate === 'function' ? timestamp.toDate() : new Date(timestamp.seconds * 1000);
      if (isNaN(date.getTime())) {
        return '';
      }
      return format(date, 'MMM d, yyyy • h:mm a');
    } catch (e) {
      console.error('Error formatting date:', e);
      return '';
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border/50 pt-4">
              <div className="space-y-2">
                <Label htmlFor="notifyAt" className="text-sm font-semibold">Notification Date & Time (Optional)</Label>
                <Input
                  id="notifyAt"
                  type="datetime-local"
                  value={notifyAt}
                  onChange={(e) => setNotifyAt(e.target.value)}
                  className="w-full text-foreground bg-background"
                />
              </div>
              {notifyAt && (
                <div className="flex items-center space-x-2 pt-8">
                  <Switch
                    id="showPopup"
                    checked={showPopup}
                    onCheckedChange={setShowPopup}
                  />
                  <Label htmlFor="showPopup" className="cursor-pointer text-sm font-medium">Show pop-up message on screen</Label>
                </div>
              )}
            </div>
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
                  {formatDate(memo.updatedAt)}
                </p>
              </CardHeader>
              <CardContent className="flex-grow space-y-4">
                <p className="whitespace-pre-wrap text-sm line-clamp-6 text-muted-foreground">
                  {memo.content}
                </p>
                {memo.notifyAt && (
                  <div className="flex flex-wrap items-center gap-2 pt-2">
                    <span className={cn(
                      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border",
                      memo.notified 
                        ? "bg-muted text-muted-foreground border-border" 
                        : "bg-primary/10 text-primary border-primary/20"
                    )}>
                      <Bell className={cn("h-3 w-3", !memo.notified && "animate-pulse")} />
                      <span>
                        {memo.notified ? 'Notified: ' : 'Notify: '}
                        {formatNotifyDate(memo.notifyAt)}
                      </span>
                    </span>
                    {memo.showPopup && !memo.notified && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-500 border border-indigo-500/20">
                        <Eye className="h-3 w-3" />
                        <span>Pop-up</span>
                      </span>
                    )}
                  </div>
                )}
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
