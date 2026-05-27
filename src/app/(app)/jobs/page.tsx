
"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import type { Job } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Briefcase, MapPin, Globe, Check, School2, Search, PlusCircle, Edit, Trash2, UserPlus, Loader2, Calendar, Filter, X } from "lucide-react";
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
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";



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
    if (firestoreJobs) {
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
    toast({ title: 'Job Deleted', description: `"${jobToDelete.title}" has been removed.` });
    setJobToDelete(null);
    setIsDeleteDialogOpen(false);
  }

  const onJobSave = () => {
    // This function is now just for refreshing data if needed.
    // The dialog handles its own save logic.
  }

  return (
    <div className="flex flex-col gap-6 w-full min-h-screen">
      {/* modern dashboard header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2"
      >
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-1">
            Job Board
          </h1>
          <p className="text-muted-foreground">
            Discover your next career move in the Lingolandverse
          </p>
        </div>
        {user && !isGuest && (
          <Button onClick={handleAddJobClick} className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95">
            <PlusCircle className="mr-2 h-4 w-4" />
            Post a Job
          </Button>
        )}
      </motion.div>

      {/* glass search/filter bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center p-4 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 shadow-2xl"
      >
        <div className="md:col-span-8 relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            placeholder="Search by city or country..."
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="pl-10 h-12 bg-white/5 border-white/10 focus-visible:ring-primary focus-visible:border-primary/50 text-white placeholder:text-muted-foreground/50 rounded-xl"
          />
        </div>
        <div className="md:col-span-4 flex items-center justify-between md:justify-end gap-6 px-2">
          <div className="flex items-center space-x-3">
            <Switch
              id="remote-only"
              checked={remoteOnly}
              onCheckedChange={setRemoteOnly}
              className="data-[state=checked]:bg-primary"
            />
            <Label htmlFor="remote-only" className="text-sm font-medium text-white/80 cursor-pointer">Remote Only</Label>
          </div>
          {locationFilter && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocationFilter("")}
              className="text-muted-foreground hover:text-white"
            >
              <X className="h-4 w-4 mr-1" /> Clear
            </Button>
          )}
        </div>
      </motion.div>

      {isGuest ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center p-12 text-center bg-white/5 backdrop-blur-sm border border-dashed border-white/20 rounded-3xl gap-6 mt-8"
        >
          <div className="p-4 bg-primary/10 rounded-full">
            <Briefcase className="h-12 w-12 text-primary" />
          </div>
          <div className="space-y-2 max-w-sm">
            <h3 className="text-2xl font-bold text-white">Unlock Opportunities</h3>
            <p className="text-muted-foreground">Sign in to view detailed candidate requirements and apply for top teaching positions.</p>
          </div>
          <Button asChild size="lg" className="px-8 rounded-xl font-bold shadow-xl shadow-primary/20">
            <Link href="/auth">Connect Now</Link>
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
          {/* jobs list pane */}
          <div className="lg:col-span-4 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {filteredJobs.length} Openings Found
              </h2>
            </div>

            <ScrollArea className="h-[calc(100vh-280px)] pr-4">
              <div className="flex flex-col gap-3">
                {isLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-24 w-full bg-white/5 animate-pulse rounded-2xl" />
                  ))
                ) : filteredJobs.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground bg-white/5 rounded-2xl border border-dashed border-white/10">
                    No results found
                  </div>
                ) : (
                  <LayoutGroup>
                    {filteredJobs.map((job, index) => (
                      <motion.button
                        layout
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={job.id}
                        className={cn(
                          "relative w-full text-left p-4 rounded-2xl transition-all duration-300 group overflow-hidden border",
                          selectedJobId === job.id
                            ? "bg-primary/20 border-primary/50 shadow-lg shadow-primary/10"
                            : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                        )}
                        onClick={() => handleSelectJob(job)}
                      >
                        {selectedJobId === job.id && (
                          <motion.div
                            layoutId="active-job"
                            className="absolute left-0 top-0 bottom-0 w-1 bg-primary"
                          />
                        )}
                        <div className="space-y-1 relative z-10 min-w-0">
                          <div className="flex justify-between items-start gap-2">
                            <p className={cn(
                              "font-bold text-lg transition-colors line-clamp-2 flex-1",
                              selectedJobId === job.id ? "text-primary" : "text-white"
                            )}>
                              {job.title}
                            </p>
                            {job.isRemote && (
                              <Badge variant="outline" className="text-[10px] py-0 px-2 border-primary/30 text-primary/80 shrink-0 mt-1">Remote</Badge>
                            )}
                          </div>
                          <p className="text-sm text-white/60 font-medium group-hover:text-white/80 transition-colors truncate">{job.company}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{job.location}</span>
                          </div>
                        </div>
                      </motion.button>
                    ))}
                  </LayoutGroup>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* details pane */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {selectedJob ? (
                <motion.div
                  key={selectedJob.id}
                  initial={{ opacity: 0, scale: 0.98, x: 10 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.98, x: -10 }}
                  transition={{ type: "spring", damping: 20 }}
                  className="w-full h-auto lg:h-[calc(100vh-280px)] flex flex-col"
                >
                  <Card className="bg-white/5 backdrop-blur-md border-white/10 rounded-3xl overflow-hidden shadow-2xl h-full flex flex-col">
                    <div className="h-2 w-full bg-gradient-to-r from-primary to-indigo-500" />
                    <CardHeader className="p-8">
                      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                        <div className="space-y-3 flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-3">
                            <CardTitle className="text-3xl font-black text-white leading-tight break-words">{selectedJob.title}</CardTitle>
                            <Badge className="bg-primary/20 text-primary border-primary/30 hover:bg-primary/30 shrink-0">
                              {selectedJob.type}
                            </Badge>
                          </div>
                          <CardDescription className="text-lg font-medium text-white/70 truncate">at {selectedJob.company}</CardDescription>
                        </div>


                        <div className="flex gap-2 w-full md:w-auto">
                          {user && (isAdmin || user.uid === selectedJob.userId) && (
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleEditJobClick(selectedJob)} className="border-white/10 bg-white/5 hover:bg-white/10 text-white">
                                <Edit className="h-4 w-4 mr-2" /> Edit
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(selectedJob)} className="text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-4 text-sm text-white/50 pt-6">
                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                          <MapPin className="h-4 w-4 text-primary" />
                          <span>{selectedJob.location}</span>
                        </div>
                        {selectedJob.isRemote && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                            <Globe className="h-4 w-4 text-primary" />
                            <span>Worldwide Remote</span>
                          </div>
                        )}
                        {selectedJob.createdAt && (
                          <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-full border border-white/5">
                            <Calendar className="h-4 w-4 text-primary" />
                            <span>{formatDistanceToNow(selectedJob.createdAt.toDate(), { addSuffix: true })}</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>

                    <div className="flex-1 overflow-y-auto min-h-0 overflow-x-hidden">
                      <CardContent className="px-8 pb-8 space-y-10">
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                            <Briefcase className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-white text-lg">Job Description</h3>
                          </div>
                          <p className="text-white/70 leading-relaxed whitespace-pre-line text-base">
                            {selectedJob.description}
                          </p>
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-2 pb-2 border-b border-white/5">
                            <Check className="h-5 w-5 text-primary" />
                            <h3 className="font-bold text-white text-lg">Requirements</h3>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedJob.requirements.map((req, i) => (
                              <div key={i} className="flex items-start gap-3 p-3 bg-white/5 rounded-xl border border-white/5 group transition-colors hover:border-primary/30">
                                <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20">
                                  <Check className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-white/80 text-sm leading-snug">{req}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </div>

                    <CardFooter className="p-8 bg-white/5 border-t border-white/10 flex justify-between items-center shrink-0">
                      <div className="hidden md:block">
                        <p className="text-xs text-muted-foreground">Ready to take the next step?</p>
                        <p className="text-sm font-semibold text-white">Apply now to start your journey.</p>
                      </div>
                      <Button onClick={handleApplyClick} size="lg" className="bg-primary hover:bg-primary/90 text-white px-10 rounded-xl font-bold transition-all shadow-xl shadow-primary/20 active:scale-95 w-full md:w-auto">
                        Apply for this Position
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center text-center h-full min-h-[400px] rounded-3xl border border-dashed border-white/10 bg-white/5 p-12"
                >
                  <div className="animate-bounce-slow">
                    <Briefcase className="h-20 w-20 text-white/10" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-6">Select a position</h3>
                  <p className="text-muted-foreground mt-2 max-w-xs mx-auto">Click on a job from the list to view full details and apply.</p>
                </motion.div>
              )}
            </AnimatePresence>
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




