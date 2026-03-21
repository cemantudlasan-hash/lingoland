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
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import type { Application, Job } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { collection, serverTimestamp } from "firebase/firestore";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField } from "@/components/ui/form";
import { addDocumentNonBlocking } from "@/firebase/non-blocking-updates";


const applySchema = z.object({
  name: z.string().min(2, "Name is required."),
  email: z.string().email("A valid email is required."),
  contactNumber: z.string().optional(),
  whyHire: z.string().min(10, "This field is required (min 10 characters)."),
  skillsExperience: z.string().min(10, "This field is required (min 10 characters)."),
  education: z.string().min(5, "This field is required (min 5 characters)."),
  trainings: z.string().optional(),
  hasTefl: z.boolean().default(false),
  hasTesol: z.boolean().default(false),
  hasToiec: z.boolean().default(false),
});

type ApplyFormValues = z.infer<typeof applySchema>;

type ApplyJobDialogProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  job: Job | null;
};

export function ApplyJobDialog({ isOpen, onOpenChange, job }: ApplyJobDialogProps) {
    const { user, userProfile } = useAuth();
    const firestore = useFirestore();
    const { register, handleSubmit, reset, setValue, control, formState: { errors } } = useForm<ApplyFormValues>({
        resolver: zodResolver(applySchema),
        defaultValues: {
            whyHire: "",
            skillsExperience: "",
            education: "",
            trainings: "",
            hasTefl: false,
            hasTesol: false,
            hasToiec: false,
        }
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        if (user && userProfile && isOpen) {
            setValue('name', userProfile.displayName || '');
            setValue('email', user.email || '');
        } else if (!isOpen) {
            reset(); // Reset form when dialog closes
        }
    }, [user, userProfile, isOpen, setValue, reset]);


    const onSubmit = async (data: ApplyFormValues) => {
        if (!firestore || !user || !job) return;
        setIsSubmitting(true);
        try {
            const applicationData: Omit<Application, 'id' | 'appliedAt'> = {
                applicantName: data.name,
                applicantEmail: data.email,
                applicantContactNumber: data.contactNumber || "",
                applicantId: user.uid,
                whyHire: data.whyHire,
                skillsExperience: data.skillsExperience,
                education: data.education,
                trainings: data.trainings || "",
                certificates: {
                  tefl: data.hasTefl,
                  tesol: data.hasTesol,
                  toiec: data.hasToiec
                }
            };

            const applicationsRef = collection(firestore, 'jobs', job.id, 'applications');
            addDocumentNonBlocking(applicationsRef, { ...applicationData, appliedAt: serverTimestamp() });

            onOpenChange(false);
            toast({
                title: "Application Sent!",
                description: `Your application for the ${job?.title} position has been submitted.`,
                className: "bg-black text-white",
            });
        } catch (error) {
             toast({
                variant: "destructive",
                title: "Submission Failed",
                description: "Could not submit your application. Please try again.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

  if (!job) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Apply for: {job.title}</DialogTitle>
          <DialogDescription>
            Submit your details below to apply. Good luck!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto pr-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" {...register("name")} />
                {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" {...register("email")} />
                {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
            </div>
          </div>
           <div className="space-y-2">
            <Label htmlFor="contactNumber">Contact Number (Optional)</Label>
            <Input id="contactNumber" type="tel" {...register("contactNumber")} />
            {errors.contactNumber && <p className="text-sm text-destructive">{errors.contactNumber.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="whyHire">Why should we hire you?</Label>
            <Textarea id="whyHire" {...register("whyHire")} />
            {errors.whyHire && <p className="text-sm text-destructive">{errors.whyHire.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="skillsExperience">What are your skills and experience?</Label>
            <Textarea id="skillsExperience" {...register("skillsExperience")} />
            {errors.skillsExperience && <p className="text-sm text-destructive">{errors.skillsExperience.message}</p>}
          </div>
          
           <div className="space-y-2">
            <Label htmlFor="education">Degree and Education</Label>
            <Textarea id="education" {...register("education")} />
            {errors.education && <p className="text-sm text-destructive">{errors.education.message}</p>}
          </div>

           <div className="space-y-2">
            <Label htmlFor="trainings">Trainings (Optional)</Label>
            <Textarea id="trainings" {...register("trainings")} />
          </div>

          <div className="space-y-2">
              <Label>Certificates (Optional)</Label>
              <div className="flex flex-col sm:flex-row gap-4 rounded-lg border p-4">
                  <FormField
                      control={control}
                      name="hasTefl"
                      render={({ field }) => (
                          <div className="flex items-center space-x-2">
                              <Checkbox id="hasTefl" checked={field.value} onCheckedChange={field.onChange} />
                              <Label htmlFor="hasTefl">TEFL</Label>
                          </div>
                      )}
                  />
                  <FormField
                      control={control}
                      name="hasTesol"
                      render={({ field }) => (
                          <div className="flex items-center space-x-2">
                              <Checkbox id="hasTesol" checked={field.value} onCheckedChange={field.onChange} />
                              <Label htmlFor="hasTesol">TESOL</Label>
                          </div>
                      )}
                  />
                  <FormField
                      control={control}
                      name="hasToiec"
                      render={({ field }) => (
                          <div className="flex items-center space-x-2">
                              <Checkbox id="hasToiec" checked={field.value} onCheckedChange={field.onChange} />
                              <Label htmlFor="hasToiec">TOEIC</Label>
                          </div>
                      )}
                  />
              </div>
          </div>
          
          <DialogFooter className="sticky bottom-0 bg-background pt-4 -mb-4">
            <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Application
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
