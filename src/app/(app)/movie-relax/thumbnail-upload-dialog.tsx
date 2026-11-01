'use client';

import * as React from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  Loader2,
  Image as ImageIcon,
  Upload,
  Link2,
  Trash2,
  Save,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { useFirestore } from '@/firebase';
import { doc, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';

function getGoogleDriveFileId(url: string) {
  if (!url) return null;
  const dMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];
  return null;
}

export function resolveImageUrl(url: string) {
  if (!url) return '';
  const driveId = getGoogleDriveFileId(url);
  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }
  return url;
}

export const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please upload an image file (PNG, JPG, WebP).'));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to parse image file.'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1280;
        const MAX_HEIGHT = 720;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
        resolve(compressedDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

interface UploadThumbnailDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  movie: any | null;
}

export function UploadThumbnailDialog({
  isOpen,
  onOpenChange,
  movie,
}: UploadThumbnailDialogProps) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [previewUrl, setPreviewUrl] = React.useState<string>('');
  const [urlInput, setUrlInput] = React.useState<string>('');
  const [isProcessingFile, setIsProcessingFile] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (movie) {
      const currentUrl = movie.thumbnailUrl || '';
      setPreviewUrl(currentUrl);
      setUrlInput(currentUrl.startsWith('data:') ? '' : currentUrl);
    } else {
      setPreviewUrl('');
      setUrlInput('');
    }
  }, [movie, isOpen]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    try {
      const compressedDataUrl = await compressImageFile(file);
      setPreviewUrl(compressedDataUrl);
      setUrlInput('');
      toast({
        title: 'Image Selected',
        description: `${file.name} compressed and ready to save.`,
      });
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: err.message || 'Could not process the selected image.',
      });
    } finally {
      setIsProcessingFile(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    const resolved = resolveImageUrl(val.trim());
    setPreviewUrl(resolved);
  };

  const handleClearThumbnail = () => {
    setPreviewUrl('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!firestore || !movie?.id) return;

    setIsSaving(true);
    try {
      const movieRef = doc(firestore, 'movies', movie.id);
      const finalThumbnailUrl = previewUrl.trim() || null;

      await setDocumentNonBlocking(
        movieRef,
        {
          thumbnailUrl: finalThumbnailUrl,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      toast({
        title: 'Thumbnail Updated',
        description: finalThumbnailUrl
          ? `Thumbnail saved for "${movie.title}".`
          : `Thumbnail reset to default emoji for "${movie.title}".`,
      });

      onOpenChange(false);
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Save Failed',
        description: err.message || 'Failed to update movie thumbnail.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!movie) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl rounded-[2rem] bg-card border-border shadow-2xl p-6 md:p-8">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary">
              <ImageIcon className="h-6 w-6" />
            </div>
            <div>
              <DialogTitle className="text-2xl font-black uppercase tracking-tight text-foreground">
                Upload Movie Thumbnail
              </DialogTitle>
              <DialogDescription className="text-sm font-medium text-muted-foreground">
                Set a custom poster or thumbnail for this movie pick.
              </DialogDescription>
            </div>
          </div>
          <Badge variant="outline" className="w-fit font-bold uppercase tracking-wider text-xs border-primary/30 text-primary px-2.5 py-0.5 mt-1">
            {movie.title}
          </Badge>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Live Preview Container (16:9 Aspect Ratio) */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-black uppercase tracking-wider text-primary">
                Live Card Preview
              </Label>
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleClearThumbnail}
                  className="text-xs font-semibold text-destructive hover:underline flex items-center gap-1"
                >
                  <Trash2 className="h-3 w-3" /> Revert to Emoji
                </button>
              )}
            </div>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-muted/60 border border-border/20 shadow-inner flex items-center justify-center group">
              {previewUrl ? (
                <>
                  <img
                    src={previewUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onError={() => {
                      toast({
                        variant: 'destructive',
                        title: 'Invalid Image Link',
                        description: 'Could not load image from the provided URL.',
                      });
                    }}
                  />
                  <div className="absolute inset-0 bg-black/20 pointer-events-none" />
                </>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 select-none">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/40 to-purple-900/40 opacity-70" />
                  <span className="text-7xl drop-shadow-[0_0_20px_rgba(255,255,255,0.3)] relative z-10">
                    {movie.thumbnailEmoji || '🎬'}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium relative z-10">
                    No custom thumbnail set (using fallback emoji)
                  </span>
                </div>
              )}

              <Badge className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border-none uppercase font-black text-[10px] tracking-widest px-2.5 py-1 text-white">
                Movie Pick
              </Badge>
            </div>
          </div>

          {/* Option 1: Direct File Upload */}
          <div className="space-y-2">
            <Label className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Upload className="h-3.5 w-3.5 text-primary" />
              Upload Image File
            </Label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              disabled={isProcessingFile}
              onClick={() => fileInputRef.current?.click()}
              className="w-full h-12 rounded-xl border-dashed border-2 border-border/50 hover:border-primary hover:bg-primary/5 font-semibold text-sm transition-all"
            >
              {isProcessingFile ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Upload className="h-4 w-4 mr-2 text-primary" />
              )}
              {isProcessingFile ? 'Optimizing Image...' : 'Choose Image (PNG, JPG, WebP)'}
            </Button>
          </div>

          {/* Option 2: Image URL / Google Drive */}
          <div className="space-y-2">
            <Label htmlFor="thumbnailUrlInput" className="text-xs font-black uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <Link2 className="h-3.5 w-3.5 text-primary" />
              Or Enter Direct Image URL / Drive Link
            </Label>
            <Input
              id="thumbnailUrlInput"
              placeholder="https://... (e.g. IMDb poster, TMDB, or Google Drive)"
              value={urlInput}
              onChange={(e) => handleUrlChange(e.target.value)}
              className="bg-muted/50 rounded-xl h-11 text-sm font-medium"
            />
          </div>
        </div>

        <DialogFooter className="pt-4 flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="rounded-xl font-bold uppercase tracking-wider text-xs h-12"
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={isSaving || isProcessingFile}
            onClick={handleSave}
            className="flex-1 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-wider text-sm h-12 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all"
          >
            {isSaving ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : (
              <Save className="h-5 w-5 mr-2" />
            )}
            Save Thumbnail
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
