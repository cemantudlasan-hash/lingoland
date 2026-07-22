'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, writeBatch, doc, type FirestoreError } from 'firebase/firestore';
import { useCountryHolidays } from '@/lib/holidays';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Globe, Loader2, Calendar } from 'lucide-react';

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getDatesBetween = (startDateStr: string, endDateStr: string) => {
    const dates = [];
    let currentDate = new Date(startDateStr + 'T00:00:00');
    const endDate = new Date(endDateStr + 'T00:00:00');

    while (currentDate <= endDate) {
        dates.push(formatDate(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

const BulkUpdateModal = ({ startDate, endDate, onClose, onConfirm, initialStatus, initialReminderText }: any) => {
    const [status, setStatus] = useState(initialStatus || '');
    const [reminderText, setReminderText] = useState(initialReminderText || '');

    const handleConfirmClick = () => {
        onConfirm(status, reminderText);
    };

    const displayStartDate = new Date(startDate).toLocaleDateString();
    const displayEndDate = new Date(endDate).toLocaleDateString();

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-card rounded-xl shadow-2xl p-6 w-full max-w-sm">
                <h3 className="text-2xl font-bold text-indigo-700 mb-4">
                    Update Attendance for Range: <br />
                    <span className="text-lg font-normal text-gray-600 dark:text-gray-300">{displayStartDate} to {displayEndDate}</span>
                </h3>
                <div className="mb-4">
                    <div className="flex flex-wrap gap-3 justify-center">
                        {['present', 'absent', 'leave', 'holiday'].map(s => (
                            <button
                                key={s}
                                onClick={() => setStatus(s)}
                                className={`py-2 px-4 rounded-lg font-bold transition duration-300 ease-in-out transform hover:scale-105 shadow-md ${status === s ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600'}`}
                            >
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="mb-6">
                    <label htmlFor="bulkReminderText" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2 mt-4">Reminder (Optional):</label>
                    <textarea
                        id="bulkReminderText"
                        value={reminderText}
                        onChange={(e) => setReminderText(e.target.value)}
                        className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-2 px-3 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-400 transition duration-200 h-24 resize-none bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                        placeholder="Add a reminder for this date range..."
                    ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                    <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg">Cancel</button>
                    <button onClick={handleConfirmClick} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg" disabled={!status}>Apply</button>
                </div>
            </div>
        </div>
    );
};

export const AttendanceTracker = ({ selectedStudent }: { selectedStudent: any }) => {
    const { user } = useAuth();
    const firestore = useFirestore();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>({});
    const [reminders, setReminders] = useState<Record<string, string>>({});
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartDate, setDragStartDate] = useState<string | null>(null);
    const [dragEndDate, setDragEndDate] = useState<string | null>(null);
    const [dragHoverDate, setDragHoverDate] = useState<string | null>(null);
    const [statusModal, setStatusModal] = useState<{ show: boolean; date: string | null; currentStatus: string; reminderText: string }>({ show: false, date: null, currentStatus: '', reminderText: '' });
    const [showBulkUpdateModal, setShowBulkUpdateModal] = useState(false);
    
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Auto Country & Public Holiday Hook
    const {
        countryCode,
        setCountryCode,
        countryInfo,
        supportedCountries,
        holidaysMap,
        isLoading: isLoadingHolidays,
    } = useCountryHolidays(year);

    useEffect(() => {
        if (!selectedStudent || !user || !firestore) {
            setAttendanceRecords({});
            setReminders({});
            return;
        }

        const attendanceCollectionRef = collection(firestore, `users/${user.uid}/students/${selectedStudent.id}/attendance`);
        const unsubscribeAttendance = onSnapshot(attendanceCollectionRef, (snapshot) => {
            const records: Record<string, string> = {};
            snapshot.docs.forEach(doc => {
                records[doc.id] = doc.data().status;
            });
            setAttendanceRecords(records);
        }, (error: FirestoreError) => {
            const contextualError = new FirestorePermissionError({
                operation: 'list',
                path: attendanceCollectionRef.path,
            });
            errorEmitter.emit('permission-error', contextualError);
        });

        const remindersCollectionRef = collection(firestore, `users/${user.uid}/students/${selectedStudent.id}/reminders`);
        const unsubscribeReminders = onSnapshot(remindersCollectionRef, (snapshot) => {
            const fetchedReminders: Record<string, string> = {};
            snapshot.docs.forEach(doc => {
                fetchedReminders[doc.id] = doc.data().text;
            });
            setReminders(fetchedReminders);
        }, (error: FirestoreError) => {
            const contextualError = new FirestorePermissionError({
                operation: 'list',
                path: remindersCollectionRef.path,
            });
            errorEmitter.emit('permission-error', contextualError);
        });

        return () => {
            unsubscribeAttendance();
            unsubscribeReminders();
        };
    }, [selectedStudent, user, firestore]);

    const handleMarkAttendanceAndReminder = async () => {
        if (!selectedStudent || !statusModal.date || !user || !firestore) return;
    
        const batch = writeBatch(firestore);
    
        const attendanceDocRef = doc(firestore, `users/${user.uid}/students/${selectedStudent.id}/attendance`, statusModal.date);
        if (statusModal.currentStatus) {
            batch.set(attendanceDocRef, { status: statusModal.currentStatus, markedAt: new Date().toISOString() }, { merge: true });
        } else {
            batch.delete(attendanceDocRef);
        }
    
        const reminderDocRef = doc(firestore, `users/${user.uid}/students/${selectedStudent.id}/reminders`, statusModal.date);
        if (statusModal.reminderText.trim()) {
            batch.set(reminderDocRef, { text: statusModal.reminderText.trim(), updatedAt: new Date().toISOString() }, { merge: true });
        } else {
            batch.delete(reminderDocRef);
        }
    
        try {
            await batch.commit();
            setStatusModal({ show: false, date: null, currentStatus: '', reminderText: '' });
        } catch (error) {
            console.error("Error saving changes:", error);
        }
    };
    
    const handleMouseDown = (dayInfo: any) => {
        if (!dayInfo) return;
        setIsDragging(true);
        setDragStartDate(dayInfo.formattedDate);
        setDragEndDate(dayInfo.formattedDate);
        setDragHoverDate(dayInfo.formattedDate);
    };

    const handleMouseEnter = (dayInfo: any) => {
        if (!isDragging || !dayInfo) return;
        setDragHoverDate(dayInfo.formattedDate);
    };
    
    const handleMouseUp = useCallback(() => {
        if (isDragging) {
            setIsDragging(false);
            if (dragStartDate && dragHoverDate) {
                const start = new Date(dragStartDate);
                const end = new Date(dragHoverDate);
                const finalStartDate = formatDate(start < end ? start : end);
                const finalEndDate = formatDate(start > end ? start : end);

                if (finalStartDate === finalEndDate) {
                    setStatusModal({
                        show: true,
                        date: finalStartDate,
                        currentStatus: attendanceRecords[finalStartDate] || '',
                        reminderText: reminders[finalStartDate] || ''
                    });
                } else {
                    setShowBulkUpdateModal(true);
                    setDragStartDate(finalStartDate);
                    setDragEndDate(finalEndDate);
                }
            }
            setDragHoverDate(null);
        }
    }, [isDragging, dragStartDate, dragHoverDate, attendanceRecords, reminders]);

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseUp]);
    
    const handleBulkUpdateConfirm = async (status: string, reminderText: string) => {
        if (!selectedStudent || !dragStartDate || !dragEndDate || !user || !firestore) return;

        const datesToUpdate = getDatesBetween(dragStartDate, dragEndDate);
        const batch = writeBatch(firestore);

        datesToUpdate.forEach(dateString => {
            const attendanceDocRef = doc(firestore, `users/${user.uid}/students/${selectedStudent.id}/attendance`, dateString);
            batch.set(attendanceDocRef, { status: status, markedAt: new Date().toISOString() }, { merge: true });

            const reminderDocRef = doc(firestore, `users/${user.uid}/students/${selectedStudent.id}/reminders`, dateString);
            if (reminderText.trim()) {
                batch.set(reminderDocRef, { text: reminderText.trim(), updatedAt: new Date().toISOString() }, { merge: true });
            } else {
                batch.delete(reminderDocRef);
            }
        });

        try {
            await batch.commit();
            setShowBulkUpdateModal(false);
            setDragStartDate(null);
            setDragEndDate(null);
        } catch (error) {
            console.error("Error performing bulk update:", error);
        }
    };
    
    const handleBulkUpdateClose = () => {
        setShowBulkUpdateModal(false);
        setDragStartDate(null);
        setDragEndDate(null);
        setDragHoverDate(null);
    };

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(year, month, i);
        calendarDays.push({ dateObject: dayDate, formattedDate: formatDate(dayDate) });
    }

    const calculateSummary = useCallback((records: Record<string, string>, targetYear: number, targetMonth: number | null = null) => {
        let summary = { presents: 0, absences: 0, leaves: 0, holidays: 0 };
        Object.entries(records).forEach(([dateString, status]) => {
            const [recordYear, recordMonth] = dateString.split('-').map(Number);
            if (recordYear === targetYear && (targetMonth === null || recordMonth === (targetMonth + 1))) {
                if (status === 'present') summary.presents++;
                if (status === 'absent') summary.absences++;
                if (status === 'leave') summary.leaves++;
                if (status === 'holiday') summary.holidays++;
            }
        });
        return summary;
    }, []);

    const monthlySummary = calculateSummary(attendanceRecords, year, month);
    const yearlySummary = calculateSummary(attendanceRecords, year);
    
    const getDayStatusClass = (dayInfo: any) => {
        if (!dayInfo) return 'bg-gray-50 dark:bg-gray-800';

        let baseClass = 'p-2 sm:p-3 rounded-xl flex flex-col items-center justify-center h-16 sm:h-20 cursor-pointer transform transition-all duration-200 ease-in-out hover:scale-[1.03] hover:shadow-lg relative overflow-hidden';
        
        if (isDragging && dragStartDate && dragHoverDate) {
            const start = new Date(dragStartDate);
            const end = new Date(dragHoverDate);
            const currentDay = new Date(dayInfo.formattedDate);
            const selectionStart = start < end ? start : end;
            const selectionEnd = start > end ? start : end;
            if (currentDay >= selectionStart && currentDay <= selectionEnd) {
                 baseClass += ' ring-4 ring-blue-400 ring-opacity-70 bg-blue-100 dark:bg-blue-900';
            }
        }
        
        const status = attendanceRecords[dayInfo.formattedDate];
        const holidayEntries = holidaysMap[dayInfo.formattedDate];
        const isOfficialHoliday = holidayEntries && holidayEntries.length > 0;
        
        if (status === 'present') return `${baseClass} bg-green-200 text-green-800 border border-green-400 shadow-md`;
        if (status === 'absent') return `${baseClass} bg-red-200 text-red-800 border border-red-400 shadow-md`;
        if (status === 'leave') return `${baseClass} bg-yellow-200 text-yellow-800 border border-yellow-400 shadow-md`;
        if (status === 'holiday' || isOfficialHoliday) return `${baseClass} bg-purple-200 text-purple-900 border border-purple-400 shadow-md`;
        
        if (reminders[dayInfo.formattedDate]) return `${baseClass} bg-blue-100 text-blue-700 border border-blue-300 shadow-md`;

        return `${baseClass} bg-white dark:bg-card text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 shadow-sm`;
    };

    const getDayStatusText = (dayInfo: any) => {
        if (!dayInfo) return null;
        const holidayEntries = holidaysMap[dayInfo.formattedDate];
        const holidayName = holidayEntries && holidayEntries.length > 0 ? holidayEntries[0].name : null;
        const status = attendanceRecords[dayInfo.formattedDate];
        const reminderText = reminders[dayInfo.formattedDate];

        const mainText = holidayName ? holidayName.split(' ')[0] : status ? status.charAt(0).toUpperCase() : '';
        const tooltipText = (holidayName ? `🎈 Holiday: ${holidayName}\n` : '') + (status ? `Status: ${status}\n` : '') + (reminderText ? `Reminder: ${reminderText}` : '');
        const truncatedReminder = reminderText ? (reminderText.length > 15 ? reminderText.substring(0, 12) + '...' : reminderText) : '';
        
        return (
            <span title={tooltipText.trim()} className="flex flex-col items-center justify-center h-full w-full">
                <span className="font-extrabold text-lg sm:text-xl flex items-center gap-1">
                    {dayInfo.dateObject.getDate()}
                    {holidayName && <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse inline-block" />}
                </span>
                {holidayName ? (
                    <span className="text-[10px] sm:text-xs mt-0.5 font-bold text-purple-700 dark:text-purple-300 truncate max-w-full px-1 bg-purple-300/40 rounded">
                        {holidayName.length > 10 ? holidayName.substring(0, 9) + '…' : holidayName}
                    </span>
                ) : mainText ? (
                    <span className="text-xs sm:text-sm mt-1 font-semibold block">{mainText}</span>
                ) : null}
                {truncatedReminder && <span className="text-xs text-blue-600 mt-0.5 font-medium text-center leading-tight">{truncatedReminder}</span>}
            </span>
        );
    };

    return (
        <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-xl border border-indigo-500/10">
            <h2 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-4 tracking-tight">
                Attendance for {selectedStudent.fullName} {selectedStudent.nickname ? `(${selectedStudent.nickname})` : ''} ({selectedStudent.gradeLevel})
            </h2>

            {/* Header with Navigation and Country Selector */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg text-white">
                <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold transition-all text-sm">Prev</button>
                    <h3 className="text-xl font-black tracking-wide flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-indigo-200" />
                        {monthName} {year}
                    </h3>
                    <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold transition-all text-sm">Next</button>
                </div>

                {/* Country Auto-Sync Dropdown */}
                <div className="flex items-center gap-2 bg-white/15 px-3 py-2 rounded-xl border border-white/20 backdrop-blur-md">
                    <Globe className="h-4 w-4 text-indigo-200" />
                    <span className="text-lg leading-none">{countryInfo.flag}</span>
                    <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="bg-transparent text-white font-extrabold text-sm focus:outline-none cursor-pointer border-none [&>option]:text-gray-900 [&>option]:bg-white"
                    >
                        {supportedCountries.map(c => (
                            <option key={c.code} value={c.code}>
                                {c.flag} {c.name}
                            </option>
                        ))}
                    </select>
                    {isLoadingHolidays && (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    )}
                </div>
            </div>

            {/* Calendar Grid */}
            <div className={`grid grid-cols-7 gap-2 text-center text-sm mb-6 bg-white dark:bg-card p-4 rounded-2xl shadow-xl ${isDragging ? 'select-none' : ''}`}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => <div key={day} className="font-extrabold text-indigo-700 dark:text-indigo-400 p-2 border-b-2 border-indigo-200 dark:border-indigo-800">{day}</div>)}
                {calendarDays.map((dayInfo, index) => (
                    <div key={index} className={getDayStatusClass(dayInfo)} onMouseDown={() => handleMouseDown(dayInfo)} onMouseEnter={() => handleMouseEnter(dayInfo)}>
                        {dayInfo && getDayStatusText(dayInfo)}
                    </div>
                ))}
            </div>

            {/* Summaries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <div className="bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-950/40 dark:to-blue-900/40 p-4 rounded-xl shadow-xl border border-blue-300 dark:border-blue-800">
                    <h4 className="text-lg font-extrabold text-blue-800 dark:text-blue-300 mb-2">Monthly Summary ({monthName})</h4>
                    <p className="font-bold text-black dark:text-white">Presents: <span className="font-bold text-green-600">{monthlySummary.presents}</span></p>
                    <p className="font-bold text-black dark:text-white">Absences: <span className="font-bold text-red-600">{monthlySummary.absences}</span></p>
                </div>
                 <div className="bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-950/40 dark:to-purple-900/40 p-4 rounded-xl shadow-xl border border-purple-300 dark:border-purple-800">
                    <h4 className="text-lg font-extrabold text-purple-800 dark:text-purple-300 mb-2">Yearly Summary ({year} - {countryInfo.flag} {countryInfo.name})</h4>
                    <p className="font-bold text-black dark:text-white">Presents: <span className="font-bold text-green-600">{yearlySummary.presents}</span></p>
                    <p className="font-bold text-black dark:text-white">Absences: <span className="font-bold text-red-600">{yearlySummary.absences}</span></p>
                </div>
            </div>
            
            {statusModal.show && (
                 <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-card rounded-xl shadow-2xl p-6 w-full max-w-sm">
                        <h3 className="text-2xl font-bold text-indigo-700 mb-4">Manage Day: {statusModal.date}</h3>
                        <div className="mb-4">
                            <div className="flex flex-wrap gap-3 justify-center">
                                {['present', 'absent', 'leave', 'holiday'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setStatusModal(prev => ({ ...prev, currentStatus: prev.currentStatus === status ? '' : status }))}
                                        className={`py-2 px-4 rounded-lg font-bold transition-all ${statusModal.currentStatus === status ? 'bg-indigo-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'}`}
                                    >
                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                    </button>
                                ))}
                                <button
                                    onClick={() => setStatusModal(prev => ({ ...prev, currentStatus: '' }))}
                                    className={`py-2 px-4 rounded-lg font-bold transition-all ${!statusModal.currentStatus ? 'bg-rose-600 text-white shadow-md' : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-rose-500/10 hover:text-rose-500'}`}
                                >
                                    Unselect
                                </button>
                            </div>
                        </div>
                         <div className="mb-6">
                            <label htmlFor="reminderText" className="block text-sm font-bold mb-2">Reminder (Optional):</label>
                            <textarea
                                id="reminderText"
                                value={statusModal.reminderText}
                                onChange={(e) => setStatusModal(prev => ({ ...prev, reminderText: e.target.value }))}
                                className="w-full p-2 border rounded dark:bg-zinc-800 dark:border-zinc-700"
                            ></textarea>
                        </div>
                        <div className="flex justify-end space-x-2">
                             <button onClick={() => setStatusModal({ show: false, date: null, currentStatus: '', reminderText: '' })} className="py-2 px-4 bg-gray-300 rounded">Cancel</button>
                            <button onClick={handleMarkAttendanceAndReminder} className="py-2 px-4 bg-indigo-600 text-white rounded">Save</button>
                        </div>
                    </div>
                </div>
            )}
            
            {showBulkUpdateModal && (
                <BulkUpdateModal
                    startDate={dragStartDate}
                    endDate={dragEndDate}
                    onClose={handleBulkUpdateClose}
                    onConfirm={handleBulkUpdateConfirm}
                    initialStatus={''}
                    initialReminderText={''}
                />
            )}
        </div>
    );
};