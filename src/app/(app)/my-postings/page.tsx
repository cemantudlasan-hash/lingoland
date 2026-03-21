
"use client";

import { useState, useMemo, Fragment } from "react";
import type { Application, Job } from "@/lib/types";
import { useAuth } from "@/context/auth-context";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, deleteDoc, type FirestoreError } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Briefcase, UserCheck, Mail, Phone, Trash2, CheckCircle, XCircle, Calendar } from "lucide-react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { deleteDocumentNonBlocking } from "@/firebase/non-blocking-updates";


function ApplicationsList({ jobId, onDeleteClick }: { jobId: string, onDeleteClick: (app: Application) => void }) {
    const firestore = useFirestore();
    const { toast } = useToast();

    const applicationsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, `jobs/${jobId}/applications`));
    }, [firestore, jobId]);

    const { data: applications, isLoading } = useCollection<Application>(applicationsQuery);

    if (isLoading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin"/></div>
    }

    if (!applications || applications.length === 0) {
        return <p className="text-center text-muted-foreground p-8">No applications yet for this job.</p>
    }

    return (
       <div className="space-y-4">
        {applications.map(app => (
          <Collapsible key={app.id} className="border rounded-lg">
            <CollapsibleTrigger asChild>
              <div className="flex justify-between items-center p-4 cursor-pointer hover:bg-muted">
                <div className="flex items-center gap-4">
                  <UserCheck />
                  <div className="font-medium">
                    <p>{app.applicantName}</p>
                    <p className="text-sm text-muted-foreground">{app.applicantEmail}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">{app.appliedAt ? formatDistanceToNow(app.appliedAt.toDate(), { addSuffix: true }) : 'N/A'}</p>
                    <Button variant="ghost" size="sm">View Details</Button>
                </div>
              </div>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="p-4 border-t space-y-4 bg-white text-black">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <h4 className="font-semibold">Contact Number</h4>
                    <p>{app.applicantContactNumber || "Not provided"}</p>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold">Certificates</h4>
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1">{app.certificates?.tefl ? <CheckCircle className="text-green-500"/> : <XCircle className="text-destructive"/>} TEFL</span>
                        <span className="flex items-center gap-1">{app.certificates?.tesol ? <CheckCircle className="text-green-500"/> : <XCircle className="text-destructive"/>} TESOL</span>
                        <span className="flex items-center gap-1">{app.certificates?.toiec ? <CheckCircle className="text-green-500"/> : <XCircle className="text-destructive"/>} TOEIC</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                    <h4 className="font-semibold">Why should we hire you?</h4>
                    <p className="whitespace-pre-line text-sm">{app.whyHire}</p>
                </div>
                 <div className="space-y-1">
                    <h4 className="font-semibold">Skills & Experience</h4>
                    <p className="whitespace-pre-line text-sm">{app.skillsExperience}</p>
                </div>
                 <div className="space-y-1">
                    <h4 className="font-semibold">Education</h4>
                    <p className="whitespace-pre-line text-sm">{app.education}</p>
                </div>
                {app.trainings && (
                    <div className="space-y-1">
                        <h4 className="font-semibold">Trainings</h4>
                        <p className="whitespace-pre-line text-sm">{app.trainings}</p>
                    </div>
                )}
                <div className="flex justify-end pt-4">
                    <Button variant="destructive" size="sm" onClick={() => onDeleteClick(app)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Application
                    </Button>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        ))}
      </div>
    )
}


export default function MyPostingsPage() {
    const { user } = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [deletingApplication, setDeletingApplication] = useState<Application | null>(null);

    const userJobsQuery = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return query(collection(firestore, 'jobs'), where('userId', '==', user.uid));
    }, [firestore, user]);

    const { data: userJobs, isLoading } = useCollection<Job>(userJobsQuery);

    const selectedJob = useMemo(() => {
        if (!userJobs || !selectedJobId) return null;
        return userJobs.find(job => job.id === selectedJobId);
    }, [userJobs, selectedJobId]);

    const handleDeleteApplication = async () => {
        if (!deletingApplication || !selectedJobId || !firestore) return;

        const appRef = doc(firestore, `jobs/${selectedJobId}/applications`, deletingApplication.id);
        deleteDocumentNonBlocking(appRef);

        toast({
            title: "Application Deleted",
            description: `The application from ${deletingApplication.applicantName} has been removed.`,
        });
        setDeletingApplication(null);
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-full"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    }
    
    if (!user) {
         return (
             <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full gap-4 border border-dashed rounded-lg p-12">
                <Briefcase className="h-16 w-16" />
                <h3 className="text-xl font-bold">Please log in</h3>
                <p>You need to be logged in to view your job postings.</p>
                <Button asChild>
                    <Link href="/auth">Login</Link>
                </Button>
            </div>
        );
    }

    if (!userJobs || userJobs.length === 0) {
        return (
             <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full gap-4 border border-dashed rounded-lg p-12">
                <Briefcase className="h-16 w-16" />
                <h3 className="text-xl font-bold">You haven't posted any jobs yet.</h3>
                <p>Post a job on the job board to see it here.</p>
                <Button asChild>
                    <Link href="/jobs">Go to Job Board</Link>
                </Button>
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                <div className="md:col-span-4 lg:col-span-3 space-y-2">
                     <h2 className="text-xl font-bold px-4">Your Job Postings ({userJobs.length})</h2>
                     <Card className="p-2 max-h-[70vh] overflow-y-auto">
                        <div className="space-y-1">
                            {userJobs.map(job => (
                                <button
                                    key={job.id} 
                                    className={`w-full text-left p-3 rounded-lg transition-colors ${selectedJobId === job.id ? 'bg-primary/10' : 'hover:bg-muted'}`}
                                    onClick={() => setSelectedJobId(job.id)}
                                >
                                    <p className="font-semibold text-primary">{job.title}</p>
                                    <p className="text-sm text-muted-foreground">{job.company}</p>
                                </button>
                            ))}
                        </div>
                    </Card>
                </div>
                <div className="md:col-span-8 lg:col-span-9">
                    {selectedJobId && selectedJob ? (
                         <Card>
                            <CardHeader className="bg-background/80 backdrop-blur-sm border-b">
                                <CardTitle>Applications for: {selectedJob.title}</CardTitle>
                                <CardDescription className="flex items-center gap-4">
                                    <Badge variant="secondary">{selectedJob.type}</Badge> 
                                    <span>at {selectedJob.location}</span>
                                    {selectedJob.createdAt && (
                                        <span className="flex items-center gap-1 text-xs">
                                            <Calendar className="h-3 w-3" />
                                            Posted {formatDistanceToNow(selectedJob.createdAt.toDate(), { addSuffix: true })}
                                        </span>
                                    )}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                               <ApplicationsList jobId={selectedJobId} onDeleteClick={setDeletingApplication} />
                            </CardContent>
                        </Card>
                    ) : (
                         <div className="flex flex-col items-center justify-center text-center h-full rounded-lg border border-dashed p-8">
                            <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                            <h3 className="text-xl font-semibold mt-4">Select a Job</h3>
                            <p className="text-muted-foreground mt-1">Choose a job from the list to see who has applied.</p>
                        </div>
                    )}
                </div>
            </div>
             <AlertDialog open={!!deletingApplication} onOpenChange={(open) => !open && setDeletingApplication(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the application from <strong>{deletingApplication?.applicantName}</strong>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteApplication} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
