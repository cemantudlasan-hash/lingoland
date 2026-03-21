
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/auth-context';
import { StudentList } from './student-list';
import { AttendanceTracker } from './attendance-tracker';
import type { UserProfile } from '@/lib/types'; // Assuming student type is similar to UserProfile for now

export default function AttendancePage() {
    const { user } = useAuth();
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

    if (!user) {
        return (
            <div className="text-center text-gray-500 py-20">
                <p className="text-xl mb-4 font-semibold">Please log in to use the Attendance Tracker.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
                <StudentList
                    selectedStudent={selectedStudent}
                    setSelectedStudent={setSelectedStudent}
                />
            </div>
            <div className="lg:col-span-2">
                {selectedStudent ? (
                    <AttendanceTracker
                        selectedStudent={selectedStudent}
                    />
                ) : (
                    <div className="text-center text-gray-500 py-20 bg-white dark:bg-card p-6 rounded-xl shadow-xl h-full flex flex-col justify-center items-center">
                        <p className="text-xl mb-4 font-semibold">Select a student to manage their attendance.</p>
                        <p className="text-md">Or add a new student if the list is empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
