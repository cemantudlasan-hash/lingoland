"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Job } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect, useRef } from "react";
import { Loader2, Upload, Trash2, Image as ImageIcon, Link2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { collection, doc, serverTimestamp, addDoc, getDocs, writeBatch } from "firebase/firestore";
import { setDocumentNonBlocking } from "@/firebase/non-blocking-updates";

function getGoogleDriveFileId(url: string) {
  if (!url) return null;
  const dMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch && dMatch[1]) return dMatch[1];
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) return idMatch[1];
  return null;
}

export function resolveImageUrl(url: string) {
  if (!url) return "";
  const driveId = getGoogleDriveFileId(url);
  if (driveId) {
    return `https://lh3.googleusercontent.com/d/${driveId}`;
  }
  return url;
}

export const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      reject(new Error("Please upload an image file (PNG, JPG, WebP)."));
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read image file."));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to parse image file."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX_WIDTH = 1200;
        const MAX_HEIGHT = 1200;
        let width = img.width;
        let height = img.height;

        if (width > MAX_WIDTH || height > MAX_HEIGHT) {
          const ratio = Math.min(MAX_WIDTH / width, MAX_HEIGHT / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.82);
        resolve(compressedDataUrl);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const jobSchema = z.object({
  title: z.string().min(3, "Title is required."),
  company: z.string().min(2, "Company name is required."),
  location: z.string().min(2, "Location is required."),
  type: z.enum(["Full-time", "Part-time", "Contract"]),
  isRemote: z.boolean().default(false),
  description: z.string().min(10, "Description must be at least 10 characters."),
  requirements: z.string().min(10, "Requirements must be at least 10 characters."),
  contactEmail: z.string().email("A valid contact email is required.").optional().or(z.literal("")),
});

type JobFormValues = z.infer<typeof jobSchema>;

type AddEditJobDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onJobSave: (newJobId?: string) => void;
  job: Job | null;
};

export function AddEditJobDialog({ isOpen, onOpenChange, onJobSave, job }: AddEditJobDialogProps) {
  const { user, isGuest, userProfile } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [urlInput, setUrlInput] = useState<string>("");
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (job && isOpen) {
      reset({
        ...job,
        requirements: Array.isArray(job.requirements) ? job.requirements.join("\n") : job.requirements || "",
      });
      const initialImg = job.imageUrl || "";
      setImageUrl(initialImg);
      setUrlInput(initialImg && !initialImg.startsWith("data:") ? initialImg : "");
    } else if (!job && isOpen) {
      reset({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        isRemote: false,
        description: "",
        requirements: "",
        contactEmail: "",
      });
      setImageUrl("");
      setUrlInput("");
    }
  }, [job, isOpen, reset]);

  const processFile = async (file: File) => {
    setIsProcessingImage(true);
    try {
      const compressedDataUrl = await compressImageFile(file);
      setImageUrl(compressedDataUrl);
      setUrlInput("");
      toast({
        title: "Image Added",
        description: `${file.name} processed and ready to be posted.`,
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Image Error",
        description: err.message || "Failed to process image.",
      });
    } finally {
      setIsProcessingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processFile(file);
    }
  };

  const handleUrlChange = (val: string) => {
    setUrlInput(val);
    const resolved = resolveImageUrl(val.trim());
    setImageUrl(resolved);
  };

  const handleRemoveImage = () => {
    setImageUrl("");
    setUrlInput("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: JobFormValues) => {
    if (!user || isGuest || !firestore || !userProfile) return;
    setIsSubmitting(true);

    try {
      const finalJobData: any = {
        ...data,
        imageUrl: imageUrl.trim() || null,
        requirements: data.requirements.split("\n").filter((r) => r.trim() !== ""),
      };

      if (job) {
        // Editing existing job
        const jobRef = doc(firestore, "jobs", job.id);
        setDocumentNonBlocking(jobRef, { ...finalJobData, updatedAt: serverTimestamp() }, { merge: true });
        toast({ title: "Job Updated!", description: `"${finalJobData.title}" has been updated.` });
        onJobSave();
      } else {
        // Adding new job
        const jobsCollection = collection(firestore, "jobs");
        const dataToSave = {
          ...finalJobData,
          userId: user.uid,
          createdAt: serverTimestamp(),
        };
        const docRef = await addDoc(jobsCollection, dataToSave);

        // Notify all users
        const usersSnapshot = await getDocs(collection(firestore, "users"));
        const batch = writeBatch(firestore);
        usersSnapshot.forEach((userDoc) => {
          if (userDoc.id !== user.uid && userDoc.id !== "guest") {
            const notificationRef = doc(collection(firestore, `users/${userDoc.id}/notifications`));
            batch.set(notificationRef, {
              userId: userDoc.id,
              type: "new_job",
              text: `A new job has been posted: "${finalJobData.title}"`,
              link: `/jobs?jobId=${docRef.id}`,
              isRead: false,
              createdAt: serverTimestamp(),
              fromUserName: "LingoLand Jobs",
            });
          }
        });
        await batch.commit();

        toast({ title: "Job Posted!", description: `"${finalJobData.title}" is now live.` });
        onJobSave(docRef.id);
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error saving job:", error);
      toast({ variant: "destructive", title: "Save Failed", description: "There was a problem saving the job posting." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          reset();
          setImageUrl("");
          setUrlInput("");
        }
        onOpenChange(open);
      }}
    >
      <DialogContent className="sm:max-w-[650px] max-h-[92vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="text-xl font-bold">
            {job ? "Edit Job Opening" : "Post a New Job Opening"}
          </DialogTitle>
          <DialogDescription>
            {job ? "Update the details and flyer/picture below." : "Fill out the details and upload a job poster or picture."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 px-6 overflow-y-auto flex-1 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input id="title" {...register("title")} placeholder="e.g., ESL Primary Teacher" />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="company">Company / School Name</Label>
              <Input id="company" {...register("company")} placeholder="e.g., Lingoland Academy" />
              {errors.company && <p className="text-sm text-destructive">{errors.company.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input id="location" {...register("location")} placeholder="e.g., Tokyo, Japan or Remote" />
              {errors.location && <p className="text-sm text-destructive">{errors.location.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Job Type</Label>
              <Controller
                name="type"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full-time">Full-time</SelectItem>
                      <SelectItem value="Part-time">Part-time</SelectItem>
                      <SelectItem value="Contract">Contract</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          {/* Picture / Flyer Upload Section */}
          <div className="space-y-2 pt-2 pb-1 border-y border-white/10">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2 font-semibold text-sm text-zinc-200">
                <ImageIcon className="h-4 w-4 text-primary" />
                Job Picture / Hiring Poster / Flyer (Optional)
              </Label>
              {imageUrl && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="h-7 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" /> Remove Picture
                </Button>
              )}
            </div>

            {imageUrl ? (
              <div className="relative group rounded-2xl overflow-hidden border border-white/15 bg-zinc-950/80 p-2 shadow-inner">
                <div className="relative w-full h-48 md:h-56 rounded-xl overflow-hidden bg-black/50 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageUrl}
                    alt="Job poster preview"
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-xs">
                    <Button
                      type="button"
                      size="sm"
                      variant="secondary"
                      onClick={() => fileInputRef.current?.click()}
                      className="shadow-md"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" /> Replace Picture
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="destructive"
                      onClick={handleRemoveImage}
                      className="shadow-md"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Remove
                    </Button>
                  </div>
                </div>
                <div className="p-2 flex items-center justify-between text-xs text-zinc-400">
                  <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Picture attached
                  </span>
                  <span className="text-[11px] text-zinc-400">Users can click to view it on the job card</span>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="job-image-upload"
                />
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const file = e.dataTransfer.files?.[0];
                    if (file) await processFile(file);
                  }}
                  className="cursor-pointer border-2 border-dashed border-white/20 hover:border-primary/60 bg-zinc-900/50 hover:bg-zinc-900/80 transition-all rounded-2xl p-5 flex flex-col items-center justify-center text-center gap-2 group"
                >
                  <div className="h-10 w-10 rounded-full bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
                    {isProcessingImage ? (
                      <Loader2 className="h-5 w-5 text-primary animate-spin" />
                    ) : (
                      <Upload className="h-5 w-5 text-primary group-hover:scale-110 transition-transform" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
                      {isProcessingImage ? "Processing image..." : "Click or drag & drop to upload a picture"}
                    </p>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      PNG, JPG, or WebP. Ideal for hiring posters, flyers, or company photos.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
                    <Input
                      value={urlInput}
                      onChange={(e) => handleUrlChange(e.target.value)}
                      placeholder="Or paste an image URL / Google Drive link..."
                      className="pl-9 text-xs h-9 bg-zinc-900 border-white/10"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description</Label>
            <Textarea id="description" {...register("description")} rows={4} placeholder="Describe the role, responsibilities, and benefits..." />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea id="requirements" {...register("requirements")} rows={4} placeholder="List each requirement on a new line." />
            {errors.requirements && <p className="text-sm text-destructive">{errors.requirements.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div className="space-y-2">
              <Label htmlFor="contactEmail">Contact Email (Optional)</Label>
              <Input id="contactEmail" type="email" {...register("contactEmail")} placeholder="hr@example.com" />
              {errors.contactEmail && <p className="text-sm text-destructive">{errors.contactEmail.message}</p>}
            </div>
            <div className="flex items-center space-x-2 pt-6">
              <Controller
                name="isRemote"
                control={control}
                render={({ field }) => (
                  <Switch
                    id="isRemote"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
              <Label htmlFor="isRemote" className="cursor-pointer text-sm">This job is fully remote</Label>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-background/95 backdrop-blur-md pt-3 pb-2 border-t border-white/10 mt-6">
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || isProcessingImage}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {job ? "Save Changes" : "Post Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
