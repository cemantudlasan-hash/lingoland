"use client";

import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { collection, addDoc, updateDoc, doc, serverTimestamp, Timestamp } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Student, StudentGroup } from "./students-table";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface StudentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  student: Student | null;
  existingGroups: StudentGroup[];
}

const DEFAULT_STATE: Omit<Student, 'id' | 'createdAt' | 'updatedAt'> = {
  tableId: "",
  classSession: "",
  fullName: "",
  nickname: "",
  seatNo: "",
  assignmentName: "",
  assignmentScore: "",
  activityName: "",
  activityScore: "",
  homeworkName: "",
  homeworkScore: "",
  readingName: "",
  readingScore: "",
  projectName: "",
  projectScore: "",
};

export function StudentDialog({ isOpen, onOpenChange, student, existingGroups }: StudentDialogProps) {
  const [formData, setFormData] = React.useState(DEFAULT_STATE);
  const [submissionDate, setSubmissionDate] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  React.useEffect(() => {
    if (student) {
      setFormData(student);
      if (student.updatedAt && typeof student.updatedAt.toDate === "function") {
         const date = student.updatedAt.toDate();
         const offset = date.getTimezoneOffset() * 60000;
         const localISOTime = (new Date(date.getTime() - offset)).toISOString().slice(0, 16);
         setSubmissionDate(localISOTime);
      } else {
         setSubmissionDate("");
      }
    } else {
      setFormData(DEFAULT_STATE);
      setSubmissionDate("");
    }
  }, [student, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user?.uid) return;

    const originalTableId = student?.tableId?.toLowerCase().trim();

    // 1. Check ID Uniqueness
    const isDuplicateId = existingGroups.some(g => 
        g.tableId.toLowerCase().trim() === formData.tableId.toLowerCase().trim() &&
        (originalTableId ? g.tableId.toLowerCase().trim() !== originalTableId : true)
    );

    if (isDuplicateId) {
        toast({ title: "ID Already Taken", description: `Student ID ${formData.tableId} is used by another student.`, variant: "destructive" });
        setIsSubmitting(false);
        return;
    }

    // 2. Check Seat No. Uniqueness in Class
    if (formData.seatNo && formData.classSession) {
        const isDuplicateSeat = existingGroups.some(g => 
            g.classSession.toLowerCase().trim() === formData.classSession.toLowerCase().trim() && 
            g.seatNo.toLowerCase().trim() === formData.seatNo.toLowerCase().trim() &&
            (originalTableId ? g.tableId.toLowerCase().trim() !== originalTableId : true)
        );

        if (isDuplicateSeat) {
            toast({ title: "Seat Already Taken", description: `Seat ${formData.seatNo} is already occupied in ${formData.classSession} by someone else.`, variant: "destructive" });
            setIsSubmitting(false);
            return;
        }
    }

    try {
      const classRef = collection(firestore, `users/${user.uid}/students`);
      
      let finalUpdatedAt = serverTimestamp();
      if (submissionDate) {
         finalUpdatedAt = Timestamp.fromDate(new Date(submissionDate));
      }

      if (student?.id) {
        // Update
        await updateDoc(doc(firestore, `users/${user.uid}/students`, student.id), {
          ...formData,
          updatedAt: finalUpdatedAt
        });
        toast({ title: "Record Updated", description: `${formData.fullName}'s specific submission has been updated.` });
      } else {
        // Create
        await addDoc(classRef, {
          ...formData,
          createdAt: finalUpdatedAt,
          updatedAt: finalUpdatedAt
        });
        toast({ title: student ? "Record Added" : "Student Added", description: `${formData.fullName}'s new submission has been recorded.` });
      }
      onOpenChange(false);
    } catch (error) {
      console.error(error);
      toast({ title: "Error", description: "Something went wrong while saving.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
             {student?.id ? "Edit Student Record" : student ? `Add Record for ${student.fullName}` : "Add New Student"}
          </DialogTitle>
          <DialogDescription>
             {student?.id ? "Update the scores or details for this specific submission." : student ? "Fill out the new scores below. This will be securely linked to their existing ID." : "Enter the student's details and their scores out of 100 for each curriculum metric."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-primary uppercase tracking-wider border-b pb-2">Identification</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tableId">ID Number <span className="text-red-500">*</span></Label>
                <Input id="tableId" name="tableId" required value={formData.tableId} onChange={handleChange} placeholder="e.g. 2026-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="classSession">Class Session <span className="text-red-500">*</span></Label>
                <Input id="classSession" name="classSession" required value={formData.classSession} onChange={handleChange} placeholder="e.g. Section A" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="seatNo">Seat No.</Label>
                <Input id="seatNo" name="seatNo" value={formData.seatNo} onChange={handleChange} placeholder="e.g. A4" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name <span className="text-red-500">*</span></Label>
                <Input id="fullName" name="fullName" required value={formData.fullName} onChange={handleChange} placeholder="Jane Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nickname">Nickname</Label>
                <Input id="nickname" name="nickname" value={formData.nickname} onChange={handleChange} placeholder="Janey" />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-primary uppercase tracking-wider border-b pb-2">Assignments & Activities</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
              <div className="grid grid-cols-3 gap-2 border p-3 rounded-xl bg-muted/20">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="assignmentName" className="text-xs">Assignment Name</Label>
                  <Input id="assignmentName" name="assignmentName" value={formData.assignmentName} onChange={handleChange} placeholder="Ch 1 Essay" className="h-8" />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="assignmentScore" className="text-xs">Score / 100</Label>
                  <Input type="number" min="0" max="100" id="assignmentScore" name="assignmentScore" value={formData.assignmentScore} onChange={handleChange} className="h-8 pl-1 pr-1 font-bold text-center" />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 border p-3 rounded-xl bg-muted/20">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="activityName" className="text-xs">Activity Name</Label>
                  <Input id="activityName" name="activityName" value={formData.activityName} onChange={handleChange} placeholder="Group Work" className="h-8" />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="activityScore" className="text-xs">Score / 100</Label>
                  <Input type="number" min="0" max="100" id="activityScore" name="activityScore" value={formData.activityScore} onChange={handleChange} className="h-8 pl-1 pr-1 font-bold text-center" />
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-primary uppercase tracking-wider border-b pb-2">Core Metrics (Out of 100)</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
              
              <div className="grid grid-cols-3 gap-2 border p-3 rounded-xl bg-muted/20">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="homeworkName" className="text-xs">Homework Name</Label>
                  <Input id="homeworkName" name="homeworkName" value={formData.homeworkName || ""} onChange={handleChange} placeholder="Ch 2 Math" className="h-8" />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="homeworkScore" className="text-xs">Score</Label>
                  <Input type="number" min="0" max="100" id="homeworkScore" name="homeworkScore" value={formData.homeworkScore} onChange={handleChange} className="h-8 pl-1 pr-1 font-bold text-center" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border p-3 rounded-xl bg-muted/20">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="readingName" className="text-xs">Reading Name</Label>
                  <Input id="readingName" name="readingName" value={formData.readingName || ""} onChange={handleChange} placeholder="Book Report" className="h-8" />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="readingScore" className="text-xs">Score</Label>
                  <Input type="number" min="0" max="100" id="readingScore" name="readingScore" value={formData.readingScore} onChange={handleChange} className="h-8 pl-1 pr-1 font-bold text-center" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 border p-3 rounded-xl bg-muted/20">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="projectName" className="text-xs">Project Name</Label>
                  <Input id="projectName" name="projectName" value={formData.projectName || ""} onChange={handleChange} placeholder="Science Fair" className="h-8" />
                </div>
                <div className="col-span-1 space-y-2">
                  <Label htmlFor="projectScore" className="text-xs">Score</Label>
                  <Input type="number" min="0" max="100" id="projectScore" name="projectScore" value={formData.projectScore} onChange={handleChange} className="h-8 pl-1 pr-1 font-bold text-center" />
                </div>
              </div>

            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-primary uppercase tracking-wider border-b pb-2">Submission Details</h4>
            <div className="space-y-2">
              <Label htmlFor="submissionDate">Override Submission Date / Time</Label>
              <Input 
                type="datetime-local" 
                id="submissionDate" 
                value={submissionDate} 
                onChange={(e) => setSubmissionDate(e.target.value)} 
                className="max-w-[200px]"
              />
              <p className="text-xs text-muted-foreground">Leave empty to use the current date and time.</p>
            </div>
          </div>

          <DialogFooter className="pt-4 border-t border-border/50">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="font-bold shadow-md">
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {student?.id ? "Save Changes" : student ? "Add Specific Record" : "Create Empty Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
