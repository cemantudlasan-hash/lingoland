'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useFirestore } from '@/firebase';
import { collection, onSnapshot, writeBatch, doc, type FirestoreError } from 'firebase/firestore';
import { useCountryHolidays } from '@/lib/holidays';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { useToast } from '@/hooks/use-toast';
import {
    Globe,
    Loader2,
    Calendar,
    CheckSquare,
    Check,
    X,
    Edit3,
    Trash2,
    ChevronLeft,
    ChevronRight,
    Sparkles,
    CalendarDays,
    RotateCcw
} from 'lucide-react';

const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const formatDisplayDate = (dateStr: string) => {
    try {
        const [y, m, d] = dateStr.split('-').map(Number);
        const date = new Date(y, m - 1, d);
        return date.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return dateStr;
    }
};

const getDatesBetween = (startDateStr: string, endDateStr: string) => {
    const dates: string[] = [];
    let currentDate = new Date(startDateStr + 'T00:00:00');
    const endDate = new Date(endDateStr + 'T00:00:00');

    while (currentDate <= endDate) {
        dates.push(formatDate(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

interface MultiDayEditModalProps {
    dates: string[];
    studentName: string;
    onClose: () => void;
    onConfirm: (status: string, reminderText: string, isClear: boolean) => Promise<void>;
    onRemoveDate: (dateStr: string) => void;
    isSaving: boolean;
}

const MultiDayEditModal = ({
    dates,
    studentName,
    onClose,
    onConfirm,
    onRemoveDate,
    isSaving
}: MultiDayEditModalProps) => {
    const [status, setStatus] = useState<string>('present');
    const [isClearMode, setIsClearMode] = useState<boolean>(false);
    const [reminderText, setReminderText] = useState<string>('');

    const sortedDates = useMemo(() => [...dates].sort(), [dates]);

    const handleApply = () => {
        onConfirm(status, reminderText, isClearMode);
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-indigo-500/20 rounded-2xl shadow-2xl p-6 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden text-gray-900 dark:text-gray-100">
                {/* Modal Header */}
                <div className="flex items-start justify-between pb-3 border-b border-gray-200 dark:border-zinc-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                            <Sparkles className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-indigo-700 dark:text-indigo-400 leading-tight">
                                Update Selected Days ({dates.length})
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                For student: <span className="font-bold text-gray-800 dark:text-gray-200">{studentName}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        disabled={isSaving}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500 dark:text-gray-400 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
                    {/* Selected Dates Chips Preview */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400">
                                Selected Dates ({dates.length})
                            </span>
                            <span className="text-[11px] text-gray-500">
                                Click × to remove any date
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 bg-gray-50 dark:bg-zinc-950/50 rounded-xl border border-gray-200 dark:border-zinc-800">
                            {sortedDates.map(dateStr => (
                                <span
                                    key={dateStr}
                                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-200 border border-indigo-200 dark:border-indigo-800"
                                >
                                    <span>{formatDisplayDate(dateStr)}</span>
                                    {dates.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => onRemoveDate(dateStr)}
                                            className="hover:text-rose-600 transition-colors"
                                            title="Remove date"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Status Selection */}
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-2">
                            Select Attendance Status
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {[
                                { key: 'present', label: 'Present', color: 'bg-green-600 hover:bg-green-700 text-white', activeRing: 'ring-2 ring-green-400' },
                                { key: 'absent', label: 'Absent', color: 'bg-rose-600 hover:bg-rose-700 text-white', activeRing: 'ring-2 ring-rose-400' },
                                { key: 'leave', label: 'Leave', color: 'bg-amber-500 hover:bg-amber-600 text-white', activeRing: 'ring-2 ring-amber-300' },
                                { key: 'holiday', label: 'Holiday', color: 'bg-purple-600 hover:bg-purple-700 text-white', activeRing: 'ring-2 ring-purple-400' }
                            ].map(item => {
                                const isSelected = !isClearMode && status === item.key;
                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        onClick={() => {
                                            setStatus(item.key);
                                            setIsClearMode(false);
                                        }}
                                        className={`py-2.5 px-3 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5 shadow-sm ${
                                            isSelected
                                                ? `${item.color} ${item.activeRing} scale-[1.02] shadow-md font-black`
                                                : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-zinc-700'
                                        }`}
                                    >
                                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                                        {item.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Clear / Unmark Option */}
                        <div className="mt-2.5">
                            <button
                                type="button"
                                onClick={() => setIsClearMode(prev => !prev)}
                                className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 ${
                                    isClearMode
                                        ? 'bg-rose-500 text-white border-rose-600 shadow-md font-black'
                                        : 'bg-gray-50 dark:bg-zinc-950/40 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-zinc-800 hover:border-rose-400 hover:text-rose-500'
                                }`}
                            >
                                <Trash2 className="h-3.5 w-3.5" />
                                {isClearMode ? '✓ Will Clear / Delete Records for Selected Days' : 'Clear / Remove Attendance for Selected Days'}
                            </button>
                        </div>
                    </div>

                    {/* Optional Reminder / Note */}
                    {!isClearMode && (
                        <div>
                            <label htmlFor="multiReminderText" className="block text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-400 mb-1.5">
                                Note / Reminder (Optional)
                            </label>
                            <textarea
                                id="multiReminderText"
                                value={reminderText}
                                onChange={(e) => setReminderText(e.target.value)}
                                className="w-full p-3 text-sm rounded-xl border border-gray-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 h-20 resize-none transition-all placeholder:text-gray-400"
                                placeholder="Add note or reminder for all selected days..."
                            />
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                <div className="pt-3 border-t border-gray-200 dark:border-zinc-800 flex items-center justify-end gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSaving}
                        className="py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleApply}
                        disabled={isSaving || dates.length === 0}
                        className="py-2.5 px-5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all shadow-md shadow-indigo-600/20 flex items-center gap-2 hover:scale-[1.02] active:scale-95"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Applying...
                            </>
                        ) : (
                            <>
                                <Check className="h-4 w-4 stroke-[3]" />
                                Apply to {dates.length} {dates.length === 1 ? 'Day' : 'Days'}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export const AttendanceTracker = ({ selectedStudent }: { selectedStudent: any }) => {
    const { user } = useAuth();
    const firestore = useFirestore();
    const { toast } = useToast();

    const [currentDate, setCurrentDate] = useState(new Date());
    const [attendanceRecords, setAttendanceRecords] = useState<Record<string, string>>({});
    const [reminders, setReminders] = useState<Record<string, string>>({});

    // Multi-select state
    const [selectedDates, setSelectedDates] = useState<string[]>([]);
    const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
    const [showMultiEditModal, setShowMultiEditModal] = useState(false);
    const [isSavingMulti, setIsSavingMulti] = useState(false);
    const [isMultiDragging, setIsMultiDragging] = useState(false);

    // Normal drag state
    const [isDragging, setIsDragging] = useState(false);
    const [dragStartDate, setDragStartDate] = useState<string | null>(null);
    const [dragEndDate, setDragEndDate] = useState<string | null>(null);
    const [dragHoverDate, setDragHoverDate] = useState<string | null>(null);

    // Single date modal
    const [statusModal, setStatusModal] = useState<{ show: boolean; date: string | null; currentStatus: string; reminderText: string }>({
        show: false,
        date: null,
        currentStatus: '',
        reminderText: ''
    });

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const todayDate = useMemo(() => new Date(), []);
    const isViewingCurrentMonth = todayDate.getFullYear() === year && todayDate.getMonth() === month;

    // Auto Country & Public Holiday Hook
    const {
        countryCode,
        setCountryCode,
        countryInfo,
        supportedCountries,
        holidaysMap,
        isLoading: isLoadingHolidays,
    } = useCountryHolidays(year);

    // Clear selections if student changes
    useEffect(() => {
        setSelectedDates([]);
    }, [selectedStudent?.id]);

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

    // Single day save handler
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
            toast({
                title: statusModal.currentStatus ? "Attendance Saved" : "Attendance Cleared",
                description: `Successfully updated attendance for ${statusModal.date}.`,
            });
            setStatusModal({ show: false, date: null, currentStatus: '', reminderText: '' });
        } catch (error) {
            console.error("Error saving changes:", error);
            toast({
                variant: "destructive",
                title: "Save Failed",
                description: "Failed to update attendance record.",
            });
        }
    };

    // Toggle a date selection in multi-select mode
    const toggleDateSelection = useCallback((dateStr: string) => {
        setSelectedDates(prev => {
            if (prev.includes(dateStr)) {
                return prev.filter(d => d !== dateStr);
            } else {
                return [...prev, dateStr];
            }
        });
    }, []);

    // Calendar mouse interactions
    const handleDayMouseDown = (dayInfo: any, e: React.MouseEvent) => {
        if (!dayInfo) return;

        // If in multi-select mode or holding modifier key (Ctrl, Cmd, Shift)
        if (isMultiSelectMode || e.ctrlKey || e.metaKey || e.shiftKey) {
            if (!isMultiSelectMode) {
                setIsMultiSelectMode(true);
            }
            setIsMultiDragging(true);
            toggleDateSelection(dayInfo.formattedDate);
            return;
        }

        // Normal drag range mode
        setIsDragging(true);
        setDragStartDate(dayInfo.formattedDate);
        setDragEndDate(dayInfo.formattedDate);
        setDragHoverDate(dayInfo.formattedDate);
    };

    const handleDayMouseEnter = (dayInfo: any) => {
        if (!dayInfo) return;

        if (isMultiDragging && isMultiSelectMode) {
            setSelectedDates(prev => prev.includes(dayInfo.formattedDate) ? prev : [...prev, dayInfo.formattedDate]);
            return;
        }

        if (isDragging) {
            setDragHoverDate(dayInfo.formattedDate);
        }
    };

    const handleMouseUp = useCallback(() => {
        if (isMultiDragging) {
            setIsMultiDragging(false);
        }

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
                    // Range selected: add range into selectedDates and open multi-edit modal
                    const rangeDates = getDatesBetween(finalStartDate, finalEndDate);
                    setSelectedDates(rangeDates);
                    setShowMultiEditModal(true);
                }
            }
            setDragHoverDate(null);
        }
    }, [isMultiDragging, isDragging, dragStartDate, dragHoverDate, attendanceRecords, reminders]);

    useEffect(() => {
        window.addEventListener('mouseup', handleMouseUp);
        return () => window.removeEventListener('mouseup', handleMouseUp);
    }, [handleMouseUp]);

    // Multi-day bulk update confirmation
    const handleMultiUpdateConfirm = async (status: string, reminderText: string, isClear: boolean) => {
        if (!selectedStudent || selectedDates.length === 0 || !user || !firestore) return;

        setIsSavingMulti(true);
        const batch = writeBatch(firestore);

        selectedDates.forEach(dateStr => {
            const attendanceDocRef = doc(firestore, `users/${user.uid}/students/${selectedStudent.id}/attendance`, dateStr);
            if (isClear) {
                batch.delete(attendanceDocRef);
            } else if (status) {
                batch.set(attendanceDocRef, { status, markedAt: new Date().toISOString() }, { merge: true });
            }

            const reminderDocRef = doc(firestore, `users/${user.uid}/students/${selectedStudent.id}/reminders`, dateStr);
            if (isClear) {
                batch.delete(reminderDocRef);
            } else if (reminderText.trim()) {
                batch.set(reminderDocRef, { text: reminderText.trim(), updatedAt: new Date().toISOString() }, { merge: true });
            }
        });

        try {
            await batch.commit();
            toast({
                title: isClear ? "Attendance Cleared" : "Attendance Updated",
                description: `Successfully ${isClear ? 'cleared' : `set to ${status.toUpperCase()}`} for ${selectedDates.length} selected day(s).`,
            });
            setSelectedDates([]);
            setShowMultiEditModal(false);
        } catch (error) {
            console.error("Error updating selected days:", error);
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: "Failed to update selected days. Please check permissions and try again.",
            });
        } finally {
            setIsSavingMulti(false);
        }
    };

    const handleRemoveDateFromMultiModal = (dateStr: string) => {
        setSelectedDates(prev => {
            const next = prev.filter(d => d !== dateStr);
            if (next.length === 0) {
                setShowMultiEditModal(false);
            }
            return next;
        });
    };

    // Calendar generation
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthName = currentDate.toLocaleString('default', { month: 'long' });

    const calendarDays = [];
    for (let i = 0; i < firstDay; i++) calendarDays.push(null);
    for (let i = 1; i <= daysInMonth; i++) {
        const dayDate = new Date(year, month, i);
        calendarDays.push({ dateObject: dayDate, formattedDate: formatDate(dayDate) });
    }

    // Current month dates list
    const currentMonthDateStrings = useMemo(() => {
        const list: string[] = [];
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(year, month, i);
            list.push(formatDate(d));
        }
        return list;
    }, [year, month, daysInMonth]);

    // Quick selection helpers
    const selectAllWeekdays = () => {
        const weekdays = currentMonthDateStrings.filter(dateStr => {
            const [y, m, d] = dateStr.split('-').map(Number);
            const dayOfWeek = new Date(y, m - 1, d).getDay();
            return dayOfWeek >= 1 && dayOfWeek <= 5; // Monday to Friday
        });
        setSelectedDates(prev => Array.from(new Set([...prev, ...weekdays])));
        setIsMultiSelectMode(true);
    };

    const selectAllDaysInMonth = () => {
        setSelectedDates(prev => Array.from(new Set([...prev, ...currentMonthDateStrings])));
        setIsMultiSelectMode(true);
    };

    const selectAllUnmarkedInMonth = () => {
        const unmarked = currentMonthDateStrings.filter(dateStr => !attendanceRecords[dateStr]);
        setSelectedDates(prev => Array.from(new Set([...prev, ...unmarked])));
        setIsMultiSelectMode(true);
    };

    const clearSelection = () => {
        setSelectedDates([]);
    };

    // Categorize selected dates by current view vs previous/other months
    const selectedInThisMonth = useMemo(() => {
        return selectedDates.filter(d => {
            const [y, m] = d.split('-').map(Number);
            return y === year && m === (month + 1);
        });
    }, [selectedDates, year, month]);

    const selectedInOtherMonths = useMemo(() => {
        return selectedDates.filter(d => {
            const [y, m] = d.split('-').map(Number);
            return !(y === year && m === (month + 1));
        });
    }, [selectedDates, year, month]);

    // Summaries
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
        if (!dayInfo) return 'bg-gray-50/50 dark:bg-zinc-900/30 border border-transparent rounded-xl';

        const isSelected = selectedDates.includes(dayInfo.formattedDate);

        let baseClass = 'p-2 sm:p-3 rounded-xl flex flex-col items-center justify-center h-16 sm:h-20 cursor-pointer transform transition-all duration-200 ease-in-out hover:scale-[1.03] hover:shadow-lg relative overflow-hidden select-none';

        // Multi-select highlight
        if (isSelected) {
            baseClass += ' ring-4 ring-indigo-500 ring-offset-2 dark:ring-offset-zinc-900 scale-[1.03] shadow-lg shadow-indigo-500/20 z-10';
        }

        // Drag range highlight
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

        if (status === 'present') return `${baseClass} bg-green-200 text-green-900 dark:bg-green-900/50 dark:text-green-200 border border-green-400 dark:border-green-600 shadow-sm`;
        if (status === 'absent') return `${baseClass} bg-red-200 text-red-900 dark:bg-red-900/50 dark:text-red-200 border border-red-400 dark:border-red-600 shadow-sm`;
        if (status === 'leave') return `${baseClass} bg-yellow-200 text-yellow-900 dark:bg-yellow-900/50 dark:text-yellow-200 border border-yellow-400 dark:border-yellow-600 shadow-sm`;
        if (status === 'holiday' || isOfficialHoliday) return `${baseClass} bg-purple-200 text-purple-900 dark:bg-purple-900/50 dark:text-purple-200 border border-purple-400 dark:border-purple-600 shadow-sm`;

        if (reminders[dayInfo.formattedDate]) return `${baseClass} bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-200 border border-blue-300 dark:border-blue-700 shadow-sm`;

        return `${baseClass} bg-white dark:bg-zinc-800/80 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-700 shadow-sm`;
    };

    const getDayStatusText = (dayInfo: any) => {
        if (!dayInfo) return null;
        const holidayEntries = holidaysMap[dayInfo.formattedDate];
        const holidayName = holidayEntries && holidayEntries.length > 0 ? holidayEntries[0].name : null;
        const status = attendanceRecords[dayInfo.formattedDate];
        const reminderText = reminders[dayInfo.formattedDate];
        const isSelected = selectedDates.includes(dayInfo.formattedDate);

        const mainText = holidayName ? holidayName.split(' ')[0] : status ? status.charAt(0).toUpperCase() : '';
        const tooltipText = (holidayName ? `🎈 Holiday: ${holidayName}\n` : '') + (status ? `Status: ${status}\n` : '') + (reminderText ? `Reminder: ${reminderText}` : '');
        const truncatedReminder = reminderText ? (reminderText.length > 15 ? reminderText.substring(0, 12) + '...' : reminderText) : '';

        return (
            <span title={tooltipText.trim()} className="flex flex-col items-center justify-center h-full w-full relative">
                {/* Checkmark badge when day is selected */}
                {isSelected && (
                    <span className="absolute top-0.5 right-0.5 bg-indigo-600 text-white rounded-full p-0.5 shadow-md flex items-center justify-center animate-in zoom-in-75 duration-150 z-20">
                        <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                )}

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
                {truncatedReminder && (
                    <span className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 font-medium text-center leading-tight">
                        {truncatedReminder}
                    </span>
                )}
            </span>
        );
    };

    return (
        <div className="bg-white dark:bg-card p-6 rounded-2xl shadow-xl border border-indigo-500/10">
            <h2 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mb-4 tracking-tight">
                Attendance for {selectedStudent.fullName} {selectedStudent.nickname ? `(${selectedStudent.nickname})` : ''} ({selectedStudent.gradeLevel})
            </h2>

            {/* Header with Navigation and Country Selector */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-4 rounded-2xl shadow-lg text-white">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                        className="p-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold transition-all text-sm flex items-center gap-1 active:scale-95"
                        title="Previous Month"
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Prev
                    </button>
                    <h3 className="text-xl font-black tracking-wide flex items-center gap-2 mx-1">
                        <Calendar className="h-5 w-5 text-indigo-200" />
                        {monthName} {year}
                    </h3>
                    <button
                        onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                        className="p-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold transition-all text-sm flex items-center gap-1 active:scale-95"
                        title="Next Month"
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </button>

                    {/* Quick jump to Current Month when viewing previous/future months */}
                    {!isViewingCurrentMonth && (
                        <button
                            onClick={() => setCurrentDate(new Date())}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-white/25 hover:bg-white/40 text-white font-extrabold transition-all ml-1 flex items-center gap-1 shadow-sm"
                            title="Jump to Current Month"
                        >
                            <RotateCcw className="h-3 w-3" />
                            Current Month
                        </button>
                    )}
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

            {/* Multi-Select Toolbar & Quick Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 bg-indigo-50/80 dark:bg-zinc-800/60 p-3 rounded-xl border border-indigo-100 dark:border-zinc-700">
                <div className="flex items-center gap-2">
                    <button
                        type="button"
                        onClick={() => setIsMultiSelectMode(prev => !prev)}
                        className={`px-3 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 transition-all shadow-sm ${
                            isMultiSelectMode
                                ? 'bg-indigo-600 text-white shadow-indigo-500/30 ring-2 ring-indigo-400'
                                : 'bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 border border-gray-200 dark:border-zinc-600'
                        }`}
                    >
                        <CheckSquare className="h-4 w-4" />
                        {isMultiSelectMode ? 'Multi-Select Mode (Active)' : 'Select Multiple Days'}
                    </button>

                    {isMultiSelectMode && (
                        <span className="text-xs text-indigo-700 dark:text-indigo-300 font-bold hidden sm:inline">
                            Click or drag to toggle days
                        </span>
                    )}
                </div>

                {/* Quick Select Helpers */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
                    <button
                        type="button"
                        onClick={selectAllWeekdays}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 transition-all"
                        title="Select all Monday-Friday days in this month"
                    >
                        Mon-Fri
                    </button>
                    <button
                        type="button"
                        onClick={selectAllDaysInMonth}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 transition-all"
                        title="Select all days in current month"
                    >
                        All Month
                    </button>
                    <button
                        type="button"
                        onClick={selectAllUnmarkedInMonth}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-zinc-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 transition-all"
                        title="Select all days with no attendance status"
                    >
                        Unmarked
                    </button>
                    {selectedDates.length > 0 && (
                        <button
                            type="button"
                            onClick={clearSelection}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 transition-all flex items-center gap-1"
                            title="Clear all selections"
                        >
                            <X className="h-3 w-3" />
                            Clear ({selectedDates.length})
                        </button>
                    )}
                </div>
            </div>

            {/* Persistent Selection Banner across months */}
            {selectedDates.length > 0 && (
                <div className="mb-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-600 text-white p-3.5 rounded-xl shadow-lg flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <CalendarDays className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <p className="font-black text-sm sm:text-base leading-tight">
                                {selectedDates.length} {selectedDates.length === 1 ? 'day' : 'days'} selected
                            </p>
                            <p className="text-xs text-indigo-200 font-medium">
                                {selectedInThisMonth.length} in {monthName} {year}
                                {selectedInOtherMonths.length > 0 && ` • ${selectedInOtherMonths.length} in previous/other months`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => setShowMultiEditModal(true)}
                            className="px-4 py-2 bg-white text-indigo-700 hover:bg-indigo-50 font-black rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center gap-1.5 hover:scale-105 active:scale-95"
                        >
                            <Edit3 className="h-4 w-4" />
                            Update / Edit Selected Days
                        </button>
                        <button
                            type="button"
                            onClick={clearSelection}
                            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs transition-all"
                            title="Deselect all"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Calendar Grid */}
            <div className={`grid grid-cols-7 gap-2 text-center text-sm mb-6 bg-white dark:bg-card p-4 rounded-2xl shadow-xl ${isDragging || isMultiDragging ? 'select-none' : ''}`}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="font-extrabold text-indigo-700 dark:text-indigo-400 p-2 border-b-2 border-indigo-200 dark:border-indigo-800">
                        {day}
                    </div>
                ))}
                {calendarDays.map((dayInfo, index) => (
                    <div
                        key={index}
                        className={getDayStatusClass(dayInfo)}
                        onMouseDown={(e) => handleDayMouseDown(dayInfo, e)}
                        onMouseEnter={() => handleDayMouseEnter(dayInfo)}
                    >
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

            {/* Single Day Modal */}
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
                            />
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button onClick={() => setStatusModal({ show: false, date: null, currentStatus: '', reminderText: '' })} className="py-2 px-4 bg-gray-300 rounded font-bold">Cancel</button>
                            <button onClick={handleMarkAttendanceAndReminder} className="py-2 px-4 bg-indigo-600 text-white rounded font-bold">Save</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Multi-Day Edit Modal */}
            {showMultiEditModal && selectedDates.length > 0 && (
                <MultiDayEditModal
                    dates={selectedDates}
                    studentName={selectedStudent.fullName}
                    onClose={() => setShowMultiEditModal(false)}
                    onConfirm={handleMultiUpdateConfirm}
                    onRemoveDate={handleRemoveDateFromMultiModal}
                    isSaving={isSavingMulti}
                />
            )}
        </div>
    );
};