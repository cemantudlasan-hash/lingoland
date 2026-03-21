
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/auth-context';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, writeBatch, getDocs, addDoc, deleteDoc, doc, setDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit, Trash2, UserPlus } from 'lucide-react';
// import { AddClassModal } from './add-class-modal';
// import { ExportAttendanceModal } from './export-attendance-modal';

const AddClassModal = ({ onClose, onAddClass, existingStudents }: { onClose: () => void; onAddClass: (students: any[]) => Promise<any>; existingStudents: any[] }) => {
    const [classData, setClassData] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [parsedStudents, setParsedStudents] = useState<any[]>([]);
    const [parseError, setParseError] = useState('');

    const handleParse = () => {
        setIsParsing(true);
        setParseError('');
        setParsedStudents([]);

        try {
            const lines = classData.trim().split('\n');
            const students = lines.map(line => {
                const parts = line.split(',').map(p => p.trim());
                if (parts.length < 4) throw new Error(`Invalid format on line: "${line}"`);
                return {
                    fullName: parts[0],
                    studentId: parts[1],
                    seatNumber: parts[2],
                    gradeLevel: parts[3],
                    nickname: parts[4] || ''
                };
            });
            setParsedStudents(students);
        } catch (error: any) {
            setParseError(error.message || 'Failed to parse data. Please check the format.');
        } finally {
            setIsParsing(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-card rounded-xl shadow-2xl p-6 w-full max-w-lg">
                <h3 className="text-2xl font-bold text-purple-700 mb-4">Add Whole Class</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    Paste student data below, with each student on a new line. Format: <br />
                    <code className="bg-muted p-1 rounded">FullName, StudentID, SeatNumber, GradeLevel, Nickname (optional)</code>
                </p>
                <Textarea
                    value={classData}
                    onChange={(e) => setClassData(e.target.value)}
                    rows={10}
                    placeholder="John Doe, 101, 1, 4A, Johnny..."
                />
                <Button onClick={handleParse} className="mt-2" disabled={isParsing}>
                    {isParsing ? 'Parsing...' : 'Parse Data'}
                </Button>

                {parseError && <p className="text-red-500 text-xs mt-2">{parseError}</p>}

                {parsedStudents.length > 0 && (
                    <div className="mt-4">
                        <h4 className="font-semibold">Review {parsedStudents.length} Students:</h4>
                        <ul className="text-xs list-disc pl-5 max-h-40 overflow-y-auto">
                            {parsedStudents.map((s, i) => <li key={i}>{s.fullName} ({s.studentId})</li>)}
                        </ul>
                        <Button onClick={() => onAddClass(parsedStudents)} className="mt-4 w-full">Confirm and Add Class</Button>
                    </div>
                )}

                <div className="flex justify-end mt-4">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                </div>
            </div>
        </div>
    );
};

const ExportAttendanceModal = ({ onClose, students, firestore, user }: { onClose: () => void; students: any[]; firestore: any; user: any }) => {
    const [startDate, setStartDate] = useState<Date | undefined>(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
    const [endDate, setEndDate] = useState<Date | undefined>(new Date());
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        if (!startDate || !endDate) {
            alert('Please select a start and end date.');
            return;
        }
        setIsExporting(true);

        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Student Name,Student ID,Date,Status\n";

        for (const student of students) {
            const attendanceQuery = query(collection(firestore, `users/${user.uid}/students/${student.id}/attendance`));
            const attendanceSnapshot = await getDocs(attendanceQuery);
            attendanceSnapshot.forEach(doc => {
                const date = doc.id;
                const docDate = new Date(date);
                if (docDate >= startDate && docDate <= endDate) {
                    const status = doc.data().status;
                    csvContent += `"${student.fullName}","${student.studentId}","${date}","${status}"\n`;
                }
            });
        }

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "attendance_export.csv");
        document.body.appendChild(link);
        link.click();
        setIsExporting(false);
        onClose();
    };


    return (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-card rounded-xl shadow-2xl p-6 w-full max-w-md">
                <h3 className="text-2xl font-bold text-green-700 mb-4">Export Attendance</h3>
                <p className="text-muted-foreground mb-4">Select a date range to export.</p>
                {/* Simplified date pickers for brevity. A proper date picker would be better. */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Start Date</Label>
                        <Input type="date" value={startDate?.toISOString().split('T')[0]} onChange={e => setStartDate(new Date(e.target.value))} />
                    </div>
                    <div>
                        <Label>End Date</Label>
                        <Input type="date" value={endDate?.toISOString().split('T')[0]} onChange={e => setEndDate(new Date(e.target.value))} />
                    </div>
                </div>

                <div className="flex justify-end space-x-2 mt-6">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleExport} disabled={isExporting} className="bg-green-600 hover:bg-green-700">
                        {isExporting ? 'Exporting...' : 'Export to CSV'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export const StudentList = ({ setSelectedStudent, selectedStudent }: { setSelectedStudent: (student: any) => void, selectedStudent: any }) => {
    const { user } = useAuth();
    const firestore = useFirestore();
    const [showAddStudentModal, setShowAddStudentModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ fullName: '', studentId: '', seatNumber: '', gradeLevel: '', nickname: '' });
    const [addStudentError, setAddStudentError] = useState('');
    const [confirmDeleteModal, setConfirmDeleteModal] = useState(null);
    const [selectedGradeFilter, setSelectedGradeFilter] = useState('All Grades');

    const [showEditStudentModal, setShowEditStudentModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [editStudentError, setEditStudentError] = useState('');

    const [uploadedImage, setUploadedImage] = useState(null);
    const [isProcessingImage, setIsProcessingImage] = useState(false);
    const [imageProcessingError, setImageProcessingError] = useState('');

    const [showAddClassModal, setShowAddClassModal] = useState(false);
    const [showDeleteAllInGradeModal, setShowDeleteAllInGradeModal] = useState(false);
    const [gradeToDelete, setGradeToDelete] = useState('');
    const [deleteAllInGradeError, setDeleteAllInGradeError] = useState('');
    const [isDeletingAllInGrade, setIsDeletingAllInGrade] = useState(false);

    const [showExportModal, setShowExportModal] = useState(false);

    const studentsCollectionRef = useMemoFirebase(() => {
        if (!firestore || !user) return null;
        return collection(firestore, `users/${user.uid}/students`);
    }, [firestore, user]);

    const { data: students, isLoading } = useCollection(studentsCollectionRef);

    const uniqueGradeLevels = useMemo(() => {
        if (!students) return ['All Grades'];
        const grades = new Set(students.map(s => s.gradeLevel));
        return ['All Grades', ...Array.from(grades).sort()];
    }, [students]);

    const filteredStudents = useMemo(() => {
        if (!students) return [];
        let currentStudents = students;
        if (selectedGradeFilter !== 'All Grades') {
            currentStudents = students.filter(student => student.gradeLevel === selectedGradeFilter);
        }
        return currentStudents.sort((a, b) => {
            const seatA = parseInt(a.seatNumber, 10) || a.seatNumber;
            const seatB = parseInt(b.seatNumber, 10) || b.seatNumber;

            if (typeof seatA === 'number' && typeof seatB === 'number') {
                if (seatA !== seatB) return seatA - seatB;
            } else {
                const seatCompare = String(seatA).localeCompare(String(seatB));
                if (seatCompare !== 0) return seatCompare;
            }

            const idA = parseInt(a.studentId, 10) || a.studentId;
            const idB = parseInt(b.studentId, 10) || b.id;

            if (typeof idA === 'number' && typeof idB === 'number') return idA - idB;
            return String(idA).localeCompare(String(idB));
        });
    }, [students, selectedGradeFilter]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewStudent(prev => ({ ...prev, [name]: value }));
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingStudent(prev => ({ ...prev, [name]: value }));
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        if (!firestore || !user) return;
        setAddStudentError('');

        if (!newStudent.fullName || !newStudent.studentId || !newStudent.seatNumber || !newStudent.gradeLevel) {
            setAddStudentError('All fields are required.');
            return;
        }

        try {
            const studentsRef = collection(firestore, `users/${user.uid}/students`);
            const qId = query(studentsRef, where("studentId", "==", newStudent.studentId), where("gradeLevel", "==", newStudent.gradeLevel));
            const querySnapshotId = await getDocs(qId);
            if (!querySnapshotId.empty) {
                setAddStudentError(`Student ID '${newStudent.studentId}' already exists in Grade Level '${newStudent.gradeLevel}'.`);
                return;
            }

            const qSeat = query(studentsRef, where("seatNumber", "==", newStudent.seatNumber), where("gradeLevel", "==", newStudent.gradeLevel));
            const querySnapshotSeat = await getDocs(qSeat);
            if (!querySnapshotSeat.empty) {
                setAddStudentError(`Seat Number '${newStudent.seatNumber}' already exists in Grade Level '${newStudent.gradeLevel}'.`);
                return;
            }

            await addDoc(studentsRef, {
                ...newStudent,
                createdAt: new Date().toISOString()
            });
            setNewStudent({ fullName: '', studentId: '', seatNumber: '', gradeLevel: '', nickname: '' });
            setShowAddStudentModal(false);
        } catch (error) {
            console.error("Error adding student:", error);
            setAddStudentError("Failed to add student. Please try again.");
        }
    };
    
    const handleUpdateStudent = async (e) => {
        e.preventDefault();
        if (!firestore || !user || !editingStudent) return;
        setEditStudentError('');

        if (!editingStudent.fullName || !editingStudent.studentId || !editingStudent.seatNumber || !editingStudent.gradeLevel) {
            setEditStudentError('All fields are required.');
            return;
        }

        try {
            const studentsRef = collection(firestore, `users/${user.uid}/students`);
            const studentDocRef = doc(firestore, `users/${user.uid}/students`, editingStudent.id);
            await setDoc(studentDocRef, {
                fullName: editingStudent.fullName,
                nickname: editingStudent.nickname,
                studentId: editingStudent.studentId,
                seatNumber: editingStudent.seatNumber,
                gradeLevel: editingStudent.gradeLevel,
                updatedAt: new Date().toISOString()
            }, { merge: true });

            setEditingStudent(null);
            setShowEditStudentModal(false);
        } catch (error) {
            console.error("Error updating student:", error);
            setEditStudentError("Failed to update student. Please try again.");
        }
    };

    const handleDeleteStudent = async (studentIdToDelete) => {
        if (!firestore || !user) return;
        try {
            await deleteDoc(doc(firestore, `users/${user.uid}/students`, studentIdToDelete));
            setConfirmDeleteModal(null);
            setSelectedStudent(null);
        } catch (error) {
            console.error("Error deleting student:", error);
        }
    };

    const handleDeleteAllInGrade = async () => {
        if (!firestore || !user || !gradeToDelete) return;
        setIsDeletingAllInGrade(true);
        setDeleteAllInGradeError('');

        try {
            const q = query(collection(firestore, `users/${user.uid}/students`), where("gradeLevel", "==", gradeToDelete));
            const querySnapshot = await getDocs(q);
            if (querySnapshot.empty) {
                setDeleteAllInGradeError('No students found in this grade.');
                return;
            }
            const batch = writeBatch(firestore);
            querySnapshot.forEach(doc => {
                batch.delete(doc.ref);
            });
            await batch.commit();
            setShowDeleteAllInGradeModal(false);
            setSelectedStudent(null);
        } catch (error) {
            console.error("Error deleting students by grade:", error);
            setDeleteAllInGradeError('Failed to delete students.');
        } finally {
            setIsDeletingAllInGrade(false);
        }
    };

    const handleAddClass = async (parsedStudents: any[]) => {
        if (!firestore || !user) return;
        const batch = writeBatch(firestore);
        let addedCount = 0;
        for (const studentData of parsedStudents) {
            if (studentData.studentId && studentData.gradeLevel) {
                const newDocRef = doc(collection(firestore, `users/${user.uid}/students`));
                batch.set(newDocRef, { ...studentData, createdAt: new Date().toISOString() });
                addedCount++;
            }
        }
        await batch.commit();
        alert(`Successfully added ${addedCount} students.`);
        setShowAddClassModal(false);
    };

    return (
        <div className="bg-white dark:bg-card p-6 rounded-xl shadow-xl h-full">
            <h2 className="text-2xl font-semibold text-indigo-600 mb-4">Student List</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                <Button
                    onClick={() => setShowAddStudentModal(true)}
                    className="bg-indigo-600 hover:bg-indigo-700"
                >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Single Student
                </Button>
                <Button onClick={() => setShowAddClassModal(true)} className="bg-purple-600 hover:bg-purple-700">
                    Add Whole Class
                </Button>
                <Button onClick={() => setShowDeleteAllInGradeModal(true)} variant="destructive">
                    Delete All in Grade
                </Button>
                <Button onClick={() => setShowExportModal(true)} className="bg-green-600 hover:bg-green-700">
                    Export Attendance
                </Button>
            </div>

            <div className="mb-4">
                <Label htmlFor="gradeFilter" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Filter by Grade Level:</Label>
                <Select
                    value={selectedGradeFilter}
                    onValueChange={(value) => setSelectedGradeFilter(value)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select a grade" />
                    </SelectTrigger>
                    <SelectContent>
                        {uniqueGradeLevels.map(grade => (
                            <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {isLoading ? <p>Loading students...</p> : (
                filteredStudents.length === 0 ? (
                    <p className="text-center text-gray-500 mt-8 p-4 bg-gray-50 dark:bg-muted rounded-lg shadow-inner">No students found.</p>
                ) : (
                    <div className="mb-4">
                        <Label htmlFor="studentSelect" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">Select Student:</Label>
                        <Select
                            value={selectedStudent ? selectedStudent.id : ''}
                            onValueChange={(studentId) => {
                                const student = filteredStudents.find(s => s.id === studentId);
                                setSelectedStudent(student || null);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="-- Select a student --" />
                            </SelectTrigger>
                            <SelectContent>
                                {filteredStudents.map(student => (
                                    <SelectItem key={student.id} value={student.id}>
                                        {student.fullName} {student.nickname ? `(${student.nickname})` : ''} | ID: {student.studentId} | Seat: {student.seatNumber} | Grade: {student.gradeLevel}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )
            )}

            {selectedStudent && (
                <div className="flex justify-end space-x-2 mt-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            setEditingStudent(selectedStudent);
                            setShowEditStudentModal(true);
                        }}
                        title="Edit Student"
                    >
                        <Edit className="h-5 w-5 text-blue-500" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteModal(selectedStudent);
                        }}
                        title="Delete Student"
                    >
                        <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                </div>
            )}

             {showAddStudentModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-card rounded-xl shadow-2xl p-6 w-full max-w-md h-[90vh] overflow-y-auto">
                        <h3 className="text-2xl font-bold text-indigo-700 mb-5">Add New Student</h3>
                        <form onSubmit={handleAddStudent} className="space-y-4">
                            <div>
                                <Label htmlFor="fullName" className="text-gray-700 dark:text-gray-300">Full Name:</Label>
                                <Input id="fullName" name="fullName" value={newStudent.fullName} onChange={handleInputChange} required />
                            </div>
                             <div>
                                <Label htmlFor="nickname" className="text-gray-700 dark:text-gray-300">Nickname (Optional):</Label>
                                <Input id="nickname" name="nickname" value={newStudent.nickname} onChange={handleInputChange} />
                            </div>
                            <div>
                                <Label htmlFor="studentId" className="text-gray-700 dark:text-gray-300">Student ID:</Label>
                                <Input id="studentId" name="studentId" value={newStudent.studentId} onChange={handleInputChange} required />
                            </div>
                             <div>
                                <Label htmlFor="seatNumber" className="text-gray-700 dark:text-gray-300">Seat Number:</Label>
                                <Input id="seatNumber" name="seatNumber" value={newStudent.seatNumber} onChange={handleInputChange} required />
                            </div>
                            <div>
                                <Label htmlFor="gradeLevel" className="text-gray-700 dark:text-gray-300">Grade Level:</Label>
                                <Input id="gradeLevel" name="gradeLevel" value={newStudent.gradeLevel} onChange={handleInputChange} required />
                            </div>

                            {addStudentError && <p className="text-red-500 text-xs italic">{addStudentError}</p>}
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setShowAddStudentModal(false)}>Cancel</Button>
                                <Button type="submit">Add Student</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showEditStudentModal && editingStudent && (
                 <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-card rounded-xl shadow-2xl p-6 w-full max-w-md">
                        <h3 className="text-2xl font-bold text-blue-700 mb-5">Edit Student</h3>
                        <form onSubmit={handleUpdateStudent} className="space-y-4">
                             <div>
                                <Label htmlFor="editFullName" className="text-gray-700 dark:text-gray-300">Full Name:</Label>
                                <Input id="editFullName" name="fullName" value={editingStudent.fullName} onChange={handleEditInputChange} required />
                            </div>
                            <div>
                                <Label htmlFor="editNickname" className="text-gray-700 dark:text-gray-300">Nickname (Optional):</Label>
                                <Input id="editNickname" name="nickname" value={editingStudent.nickname} onChange={handleEditInputChange} />
                            </div>
                            <div>
                                <Label htmlFor="editStudentId" className="text-gray-700 dark:text-gray-300">Student ID:</Label>
                                <Input id="editStudentId" name="studentId" value={editingStudent.studentId} onChange={handleEditInputChange} required />
                            </div>
                            <div>
                                <Label htmlFor="editSeatNumber" className="text-gray-700 dark:text-gray-300">Seat Number:</Label>
                                <Input id="editSeatNumber" name="seatNumber" value={editingStudent.seatNumber} onChange={handleEditInputChange} required />
                            </div>
                             <div>
                                <Label htmlFor="editGradeLevel" className="text-gray-700 dark:text-gray-300">Grade Level:</Label>
                                <Input id="editGradeLevel" name="gradeLevel" value={editingStudent.gradeLevel} onChange={handleEditInputChange} required />
                            </div>

                            {editStudentError && <p className="text-red-500 text-xs italic">{editStudentError}</p>}
                            <div className="flex justify-end space-x-2">
                                <Button type="button" variant="outline" onClick={() => setShowEditStudentModal(false)}>Cancel</Button>
                                <Button type="submit">Update Student</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {confirmDeleteModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-card rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
                        <h3 className="text-2xl font-bold text-red-700 mb-4">Confirm Deletion</h3>
                        <p className="mb-6 text-gray-700 dark:text-gray-300">Are you sure you want to delete <span className="font-bold">{confirmDeleteModal.fullName}</span>?</p>
                        <div className="flex justify-center space-x-4">
                            <Button variant="outline" onClick={() => setConfirmDeleteModal(null)}>Cancel</Button>
                            <Button variant="destructive" onClick={() => handleDeleteStudent(confirmDeleteModal.id)}>Delete</Button>
                        </div>
                    </div>
                </div>
            )}

            {showAddClassModal && (
                <AddClassModal
                    onClose={() => setShowAddClassModal(false)}
                    onAddClass={handleAddClass}
                    existingStudents={students || []}
                />
            )}

            {showDeleteAllInGradeModal && (
                <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-card rounded-xl shadow-2xl p-6 w-full max-w-sm text-center">
                        <h3 className="text-2xl font-bold text-red-700 mb-4">Delete Grade</h3>
                        <p className="mb-6 text-gray-700 dark:text-gray-300">
                            This will permanently delete all students in the selected grade. This cannot be undone.
                        </p>
                        <Select onValueChange={setGradeToDelete}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a grade to delete" />
                            </SelectTrigger>
                            <SelectContent>
                                {uniqueGradeLevels.filter(g => g !== 'All Grades').map(grade => (
                                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {deleteAllInGradeError && <p className="text-red-500 text-xs mt-2">{deleteAllInGradeError}</p>}
                        <div className="flex justify-center space-x-4 mt-6">
                            <Button variant="outline" onClick={() => setShowDeleteAllInGradeModal(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteAllInGrade} disabled={!gradeToDelete || isDeletingAllInGrade}>
                                {isDeletingAllInGrade ? 'Deleting...' : 'Delete'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {showExportModal && students && (
                <ExportAttendanceModal
                    onClose={() => setShowExportModal(false)}
                    students={students}
                    firestore={firestore}
                    user={user}
                />
            )}

        </div>
    );
};
