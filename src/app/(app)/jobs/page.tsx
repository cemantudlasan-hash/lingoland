
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MapPin, Globe, Check, School2, Search, PlusCircle, Edit, Trash2, UserPlus, Loader2, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ApplyJobDialog } from "./apply-job-dialog";
import { AddEditJobDialog } from "./add-edit-job-dialog";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
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
import { useAuth } from "@/context/auth-context";
import dynamic from 'next/dynamic';
import Link from "next/link";
import { useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, addDoc, setDoc, deleteDoc, doc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { addDocumentNonBlocking, deleteDocumentNonBlocking, setDocumentNonBlocking } from "@/firebase/non-blocking-updates";
import Image from "next/image";
import { formatDistanceToNow } from 'date-fns';


function JobsPageComponent() {
    const { user, isAdmin, isGuest } = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
    const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [jobToDelete, setJobToDelete] = useState<Job | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [locationFilter, setLocationFilter] = useState("");
    const [remoteOnly, setRemoteOnly] = useState(false);
    
    const jobsQuery = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, "jobs"), orderBy("createdAt", "desc"));
    }, [firestore]);

    const { data: firestoreJobs, isLoading } = useCollection<Job>(jobsQuery);

    useEffect(() => {
        if(firestoreJobs) {
            setJobs(firestoreJobs);
        }
    }, [firestoreJobs]);

    const filteredJobs = useMemo(() => {
        if (!jobs) return [];
        return jobs.filter(job => {
            const locationMatch = job.location.toLowerCase().includes(locationFilter.toLowerCase());
            const remoteMatch = !remoteOnly || job.isRemote;
            return locationMatch && remoteMatch;
        });
    }, [jobs, locationFilter, remoteOnly]);
    
     useEffect(() => {
        if (filteredJobs.length > 0 && (!selectedJobId || !filteredJobs.find(j => j.id === selectedJobId))) {
            setSelectedJobId(filteredJobs[0].id);
        } else if (filteredJobs.length === 0) {
            setSelectedJobId(null);
        }
    }, [filteredJobs, selectedJobId]);
    
    const selectedJob = useMemo(() => {
        return filteredJobs.find(j => j.id === selectedJobId) || null;
    }, [filteredJobs, selectedJobId]);

    const handleApplyClick = () => {
        if (selectedJob) {
            setIsApplyDialogOpen(true);
        }
    };
    
    const handleSelectJob = (job: Job) => {
        setSelectedJobId(job.id);
    }
    
    const handleAddJobClick = () => {
        setEditingJob(null);
        setIsAddEditDialogOpen(true);
    }
    
    const handleEditJobClick = (job: Job) => {
        setEditingJob(job);
        setIsAddEditDialogOpen(true);
    }
    
    const handleDeleteClick = (job: Job) => {
        setJobToDelete(job);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteJob = async () => {
        if (!jobToDelete || !firestore) return;

        const jobRef = doc(firestore, 'jobs', jobToDelete.id);
        deleteDocumentNonBlocking(jobRef);
        toast({title: 'Job Deleted', description: `"${jobToDelete.title}" has been removed.`});
        setJobToDelete(null);
        setIsDeleteDialogOpen(false);
    }
    
    const onJobSave = () => {
      // This function is now just for refreshing data if needed.
      // The dialog handles its own save logic.
    }

    return (
        <div className="flex flex-col gap-8 max-w-7xl mx-auto">
            <Card>
                <CardHeader className="text-white bg-gradient-to-r from-purple-500 to-indigo-600">
                    <CardTitle>Find Your Next Teaching Job</CardTitle>
                    <CardDescription className="text-gray-300">Search for opportunities or post a new opening.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row gap-4 items-center pt-6 bg-gray-200/50 backdrop-blur-sm text-black">
                    <div className="relative w-full md:flex-grow">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input 
                            placeholder="Search by city or country..."
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                            className="pl-10 bg-gray-100"
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch id="remote-only" checked={remoteOnly} onCheckedChange={setRemoteOnly} />
                        <Label htmlFor="remote-only">Show remote jobs only</Label>
                    </div>
                    {user && !isGuest && (
                        <div className="flex items-center gap-2">
                            <div className="border-l border-border h-8 mx-2 hidden md:block"></div>
                            <Button onClick={handleAddJobClick} className="bg-blue-600 hover:bg-blue-700">
                                <PlusCircle className="mr-2 h-4 w-4"/>
                                Post a Job
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
            {isGuest ? (
                 <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full gap-4 border border-dashed rounded-lg p-12">
                    <Briefcase className="h-16 w-16" />
                    <h3 className="text-xl font-bold">Do you need a job, or do you want to post a job?</h3>
                    <p>Sign-in or create an account to view and apply for job openings.</p>
                    <Button asChild>
                        <Link href="/auth">Sign In or Create Account</Link>
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    {/* Job List */}
                    <div className="md:col-span-4 lg:col-span-3 space-y-2">
                        <h2 className="text-xl font-bold px-4">{filteredJobs.length} Openings Found</h2>
                        <Card className="p-2 max-h-[60vh] overflow-y-auto bg-white text-black">
                             {isLoading ? <div className="flex justify-center p-4"><Loader2 className="animate-spin" /></div> : (
                                <div className="space-y-1">
                                    {filteredJobs.map(job => (
                                        <button
                                            key={job.id} 
                                            className={`w-full text-left p-3 rounded-lg transition-colors ${selectedJob?.id === job.id ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                                            onClick={() => handleSelectJob(job)}
                                        >
                                            <p className="font-semibold text-blue-800">{job.title}</p>
                                            <p className="text-sm text-gray-700">{job.company}</p>
                                            <div className="flex items-center gap-2 text-sm text-gray-500 pt-1">
                                                <MapPin className="h-4 w-4" />
                                                <span>{job.location}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                             )}
                        </Card>
                    </div>

                    {/* Job Details */}
                    <div className="md:col-span-8 lg:col-span-9">
                        {selectedJob ? (
                            <Card className="sticky top-24 bg-white text-black">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-2xl text-blue-900">{selectedJob.title}</CardTitle>
                                            <CardDescription className="text-base text-gray-600">{selectedJob.company}</CardDescription>
                                        </div>
                                        <Badge variant={selectedJob.type === 'Full-time' ? 'default' : 'secondary'} className="bg-blue-100 text-blue-800">
                                            {selectedJob.type}
                                        </Badge>
                                    </div>
                                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 pt-2">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            <span>{selectedJob.location}</span>
                                        </div>
                                        {selectedJob.isRemote && (
                                            <div className="flex items-center gap-2">
                                                <Globe className="h-4 w-4" />
                                                <span>Remote</span>
                                            </div>
                                        )}
                                        {selectedJob.createdAt && (
                                            <div className="flex items-center gap-2">
                                                <Calendar className="h-4 w-4" />
                                                <span>Posted {formatDistanceToNow(selectedJob.createdAt.toDate(), { addSuffix: true })}</span>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <h3 className="font-bold mb-2 text-gray-800">Job Description</h3>
                                        <p className="text-gray-600 whitespace-pre-line">{selectedJob.description}</p>
                                    </div>
                                    <div>
                                        <h3 className="font-bold mt-4 mb-2 text-gray-800">Requirements</h3>
                                        <ul className="space-y-2">
                                            {selectedJob.requirements.map((req, i) => (
                                                <li key={i} className="flex items-start gap-2">
                                                    <Check className="h-4 w-4 mt-1 text-green-500 flex-shrink-0" />
                                                    <span className="text-gray-600">{req}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-between">
                                    {!isGuest && (
                                        <Button onClick={handleApplyClick} className="bg-blue-600 hover:bg-blue-700">
                                            <School2 className="mr-2 h-4 w-4" />
                                            Apply for this Job
                                        </Button>
                                    )}
                                    {user && (isAdmin || user.uid === selectedJob.userId) && (
                                        <div className="flex gap-2">
                                            <Button variant="secondary" onClick={() => handleEditJobClick(selectedJob)}><Edit className="mr-2 h-4 w-4"/>Edit</Button>
                                            <Button variant="destructive" onClick={() => handleDeleteClick(selectedJob)}><Trash2 className="mr-2 h-4 w-4"/>Delete</Button>
                                        </div>
                                    )}
                                </CardFooter>
                            </Card>
                        ) : (
                            <div className="flex flex-col items-center justify-center text-center h-full rounded-lg border border-dashed p-8">
                                <Briefcase className="h-16 w-16 text-muted-foreground/50" />
                                <h3 className="text-xl font-semibold mt-4">No jobs match your criteria</h3>
                                <p className="text-muted-foreground mt-1">Try adjusting your filters.</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
            <ApplyJobDialog
                isOpen={isApplyDialogOpen}
                onOpenChange={setIsApplyDialogOpen}
                job={selectedJob}
            />
            <AddEditJobDialog
                isOpen={isAddEditDialogOpen}
                onOpenChange={setIsAddEditDialogOpen}
                onJobSave={onJobSave}
                job={editingJob}
            />
             <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the "{jobToDelete?.title}" job posting.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteJob} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}

const JobsPage = dynamic(() => Promise.resolve(JobsPageComponent), { ssr: false });

export default JobsPage;
export const preload = () => import('./page');

    

    
