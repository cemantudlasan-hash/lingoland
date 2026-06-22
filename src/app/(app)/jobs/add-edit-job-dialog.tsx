
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
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { collection, doc, serverTimestamp, setDoc, addDoc, getDocs, writeBatch } from "firebase/firestore";
import { setDocumentNonBlocking, addDocumentNonBlocking } from "@/firebase/non-blocking-updates";

const jobSchema = z.object({
  title: z.string().min(3, "Title is required."),
  company: z.string().min(2, "Company name is required."),
  location: z.string().min(2, "Location is required."),
  type: z.enum(["Full-time", "Part-time", "Contract"]),
  isRemote: z.boolean().default(false),
  description: z.string().min(10, "Description must be at least 10 characters."),
  requirements: z.string().min(10, "Requirements must be at least 10 characters."),
  contactEmail: z.string().email("A valid contact email is required.").optional().or(z.literal('')),
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

    useEffect(() => {
        if(job && isOpen) {
            reset({
                ...job,
                requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : job.requirements || "",
            });
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
        }
    }, [job, isOpen, reset]);

    const onSubmit = async (data: JobFormValues) => {
        if (!user || isGuest || !firestore || !userProfile) return;
        setIsSubmitting(true);

        try {
            const finalJobData = {
                ...data,
                requirements: data.requirements.split('\n').filter(r => r.trim() !== ''),
            };

            if (job) { // Editing existing job
                const jobRef = doc(firestore, "jobs", job.id);
                setDocumentNonBlocking(jobRef, { ...finalJobData, updatedAt: serverTimestamp() }, { merge: true });
                toast({ title: "Job Updated!", description: `"${finalJobData.title}" has been updated.` });
                onJobSave();
            } else { // Adding new job
                const jobsCollection = collection(firestore, "jobs");
                const dataToSave = {
                    ...finalJobData,
                    userId: user.uid,
                    createdAt: serverTimestamp(),
                };
                const docRef = await addDoc(jobsCollection, dataToSave);
                
                // Notify all users
                const usersSnapshot = await getDocs(collection(firestore, 'users'));
                const batch = writeBatch(firestore);
                usersSnapshot.forEach(userDoc => {
                    if (userDoc.id !== user.uid && userDoc.id !== 'guest') { // Don't notify the poster or guest
                        const notificationRef = doc(collection(firestore, `users/${userDoc.id}/notifications`));
                        batch.set(notificationRef, {
                            userId: userDoc.id,
                            type: 'new_job',
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
    <Dialog open={isOpen} onOpenChange={(open) => {
        if(!open) {
          reset();
        };
        onOpenChange(open);
    }}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{job ? "Edit Job Opening" : "Post a New Job Opening"}</DialogTitle>
          <DialogDescription>
            {job ? "Update the details below." : "Fill out the details below to post a new job."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="title">Job Title</Label>
                <Input id="title" {...register("title")} />
                {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>
             <div className="space-y-2">
                <Label htmlFor="company">Company Name</Label>
                <Input id="company" {...register("company")} />
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
          
           <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea id="description" {...register("description")} rows={5}/>
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
            </div>
            
            <div className="space-y-2">
                <Label htmlFor="requirements">Requirements</Label>
                <Textarea id="requirements" {...register("requirements")} rows={5} placeholder="List each requirement on a new line."/>
                {errors.requirements && <p className="text-sm text-destructive">{errors.requirements.message}</p>}
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                 <div className="space-y-2">
                    <Label htmlFor="contactEmail">Contact Email (Optional)</Label>
                    <Input id="contactEmail" type="email" {...register("contactEmail")} />
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
                    <Label htmlFor="isRemote">This job is fully remote</Label>
                </div>
            </div>

          <DialogFooter className="sticky bottom-0 bg-background py-4">
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {job ? "Save Changes" : "Post Job"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
