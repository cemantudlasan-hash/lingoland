'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';
import { StudentList } from './student-list';
import { AttendanceTracker } from './attendance-tracker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, CalendarRange, Users, CheckSquare, XSquare, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AttendancePage() {
    const { user } = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Get today's local date string formatted as YYYY-MM-DD
    const getLocalDateString = () => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const [activeDate, setActiveDate] = useState(getLocalDateString());

    // Lifted students query so it can be used for both list display and bulk edits
    const studentsCollectionRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, `users/${user.uid}/students`);
    }, [firestore, user]);

    const { data: students, isLoading } = useCollection(studentsCollectionRef);

    const handleMarkAllPresent = async () => {
        if (!students || students.length === 0 || !firestore || !user) {
            toast({
                variant: "destructive",
                title: "Action Restricted",
                description: "There are no students in your list to update.",
            });
            return;
        }
        setIsProcessing(true);
        const batch = writeBatch(firestore);

        students.forEach(student => {
            const attendanceDocRef = doc(firestore, `users/${user.uid}/students/${student.id}/attendance`, activeDate);
            batch.set(attendanceDocRef, { status: 'present', markedAt: new Date().toISOString() }, { merge: true });
        });

        try {
            await batch.commit();
            toast({
                title: "Attendance Updated",
                description: `Successfully marked all ${students.length} students as Present for ${activeDate}.`,
            });
        } catch (error) {
            console.error("Bulk update failed:", error);
            toast({
                variant: "destructive",
                title: "Operation Failed",
                description: "Failed to mark students as present. Please check your permissions.",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleClearDate = async () => {
        if (!students || students.length === 0 || !firestore || !user) {
            toast({
                variant: "destructive",
                title: "Action Restricted",
                description: "There are no student records to clear.",
            });
            return;
        }
        setIsProcessing(true);
        const batch = writeBatch(firestore);

        students.forEach(student => {
            const attendanceDocRef = doc(firestore, `users/${user.uid}/students/${student.id}/attendance`, activeDate);
            batch.delete(attendanceDocRef);
            
            // Also clean up any matching reminder
            const reminderDocRef = doc(firestore, `users/${user.uid}/students/${student.id}/reminders`, activeDate);
            batch.delete(reminderDocRef);
        });

        try {
            await batch.commit();
            toast({
                title: "Attendance Cleared",
                description: `Successfully removed all attendance & reminder documents for ${activeDate}.`,
            });
        } catch (error) {
            console.error("Bulk clear failed:", error);
            toast({
                variant: "destructive",
                title: "Operation Failed",
                description: "Failed to remove attendance records. Please try again.",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    const handleBulkStatusChange = async (status: string) => {
        if (!students || students.length === 0 || !firestore || !user || !status) return;
        setIsProcessing(true);
        const batch = writeBatch(firestore);

        students.forEach(student => {
            const attendanceDocRef = doc(firestore, `users/${user.uid}/students/${student.id}/attendance`, activeDate);
            batch.set(attendanceDocRef, { status: status, markedAt: new Date().toISOString() }, { merge: true });
        });

        try {
            await batch.commit();
            toast({
                title: "Attendance Updated",
                description: `Successfully updated all students to ${status.toUpperCase()} for ${activeDate}.`,
            });
        } catch (error) {
            console.error("Bulk status change failed:", error);
            toast({
                variant: "destructive",
                title: "Operation Failed",
                description: "Failed to update attendance status.",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (!user) {
        return (
            <div className="text-center text-gray-505 py-20 bg-zinc-950/20 backdrop-blur rounded-2xl border border-zinc-800">
                <p className="text-xl mb-4 font-semibold text-zinc-300">Please log in to use the Attendance Tracker.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6 w-full p-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Top Bulk Actions Panel */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Card className="bg-gradient-to-br from-indigo-950/40 via-zinc-950/80 to-purple-950/40 backdrop-blur-xl border border-indigo-500/20 shadow-2xl relative overflow-hidden">
                    <div className="absolute inset-0 bg-indigo-500/5 blur-3xl pointer-events-none" />
                    <CardHeader className="border-b border-white/5 pb-4">
                        <CardTitle className="flex items-center gap-2 text-white text-2xl font-black italic tracking-tight uppercase">
                            <CalendarRange className="h-6 w-6 text-indigo-400" />
                            Class Attendance Dashboard & Bulk Controls
                        </CardTitle>
                        <CardDescription className="text-zinc-400">
                            Configure active dates, mark entire classes present, edit status, or clear records across all students.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-end relative z-10">
                        {/* Active Date Selector */}
                        <div className="md:col-span-4 space-y-2">
                            <Label htmlFor="active-date-input" className="text-indigo-300 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
                                📅 Selected Active Date / Day
                            </Label>
                            <Input
                                id="active-date-input"
                                type="date"
                                value={activeDate}
                                onChange={(e) => setActiveDate(e.target.value)}
                                className="h-12 bg-zinc-900/60 border-zinc-800 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-semibold"
                            />
                        </div>

                        {/* Bulk Action Buttons */}
                        <div className="md:col-span-8 flex flex-wrap gap-3">
                            <Button
                                onClick={handleMarkAllPresent}
                                disabled={isProcessing || isLoading || !students?.length}
                                className="h-12 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-6 rounded-xl flex items-center gap-2 shadow-md shadow-indigo-600/10 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckSquare className="h-4 w-4" />}
                                Select All Present
                            </Button>

                            <Select
                                disabled={isProcessing || isLoading || !students?.length}
                                onValueChange={handleBulkStatusChange}
                            >
                                <SelectTrigger className="h-12 bg-zinc-900/60 border-zinc-850 text-white font-extrabold rounded-xl px-5 w-44 hover:bg-zinc-800 transition-colors">
                                    <span className="flex items-center gap-2">
                                        <Edit3 className="h-4 w-4 text-indigo-400" />
                                        <SelectValue placeholder="Set Class Status" />
                                    </span>
                                </SelectTrigger>
                                <SelectContent className="bg-zinc-950 border-zinc-800">
                                    <SelectItem value="present" className="font-bold text-green-400">Present</SelectItem>
                                    <SelectItem value="absent" className="font-bold text-rose-400">Absent</SelectItem>
                                    <SelectItem value="leave" className="font-bold text-yellow-400">Leave</SelectItem>
                                    <SelectItem value="holiday" className="font-bold text-blue-400">Holiday</SelectItem>
                                </SelectContent>
                            </Select>

                            <Button
                                onClick={handleClearDate}
                                disabled={isProcessing || isLoading || !students?.length}
                                variant="destructive"
                                className="h-12 bg-rose-600 hover:bg-rose-500 text-white font-extrabold px-6 rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
                            >
                                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <XSquare className="h-4 w-4" />}
                                Clear / Remove Date
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Attendance Workspace Split */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-1">
                    <StudentList
                        selectedStudent={selectedStudent}
                        setSelectedStudent={setSelectedStudent}
                        students={students || undefined}
                        isLoading={isLoading || false}
                    />
                </div>
                <div className="lg:col-span-2">
                    {selectedStudent ? (
                        <AttendanceTracker
                            selectedStudent={selectedStudent}
                        />
                    ) : (
                        <Card className="border border-white/5 bg-zinc-950/20 backdrop-blur p-12 rounded-xl text-center flex flex-col justify-center items-center gap-4 h-[450px] shadow-lg">
                            <Users className="h-16 w-16 text-indigo-500/60 animate-pulse" />
                            <h3 className="text-xl font-bold text-zinc-300">Select a student to manage their attendance</h3>
                            <p className="text-sm text-zinc-500 max-w-sm">
                                Choose a student from the dropdown list to customize dates, write reminders, and review summaries.
                            </p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
