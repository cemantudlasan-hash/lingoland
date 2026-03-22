"use client";

import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, onSnapshot, deleteDoc, doc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Search, Edit2, Trash2, GraduationCap, Calculator } from "lucide-react";
import { StudentDialog } from "./student-dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Download } from "lucide-react";
import * as XLSX from "xlsx";

export interface Student {
  id?: string;
  tableId: string;
  classSession: string;
  fullName: string;
  nickname: string;
  seatNo: string;
  assignmentName: string;
  assignmentScore: number | string;
  activityName: string;
  activityScore: number | string;
  homeworkName: string;
  homeworkScore: number | string;
  readingName: string;
  readingScore: number | string;
  projectName: string;
  projectScore: number | string;
  percentage?: number; 
  createdAt?: any;
  updatedAt?: any;
}

export interface StudentGroup {
   tableId: string;
   classSession: string;
   fullName: string;
   nickname: string;
   seatNo: string;
   records: Student[];
   overallPercentage: number;
   latestUpdate: any;
}

const getPercentageColor = (percentage: number) => {
  if (percentage >= 90) return "bg-green-500/10 text-green-500 border-green-500/20";
  if (percentage >= 80) return "bg-blue-500/10 text-blue-500 border-blue-500/20";
  if (percentage >= 70) return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  return "bg-red-500/10 text-red-500 border-red-500/20";
};

function StudentRow({ group, onEdit, onDelete, onAddRecord, onDeleteAll, onExport }: { group: StudentGroup, onEdit: (s: Student) => void, onDelete: (s: Student) => void, onAddRecord: (g: StudentGroup) => void, onDeleteAll: (g: StudentGroup) => void, onExport: (g: StudentGroup) => void }) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const formattedDate = group.latestUpdate?.toDate 
      ? format(group.latestUpdate.toDate(), "MMM d, h:mm a") 
      : "Just now";

  const renderScore = (score: number | string | undefined, name?: string) => {
      if (score === "" || score === null || score === undefined || Number.isNaN(Number(score))) {
          return <span className="text-muted-foreground italic text-sm">No submission</span>;
      }
      return (
          <div className="flex flex-col">
             {name ? <span className="text-xs text-muted-foreground truncate max-w-[150px]" title={name}>{name}</span> : <div className="h-4" />}
             <span className="font-bold text-foreground text-lg">{score}/100</span>
          </div>
      );
  };

  return (
    <React.Fragment>
      <TableRow className="hover:bg-muted/20 cursor-pointer group-hover" onClick={() => setIsExpanded(!isExpanded)}>
        <TableCell className="font-medium">
          <div>{group.tableId}</div>
          <Badge variant="outline" className="text-[10px] bg-primary/5 text-primary mt-1 border-primary/20">{group.classSession}</Badge>
        </TableCell>
        <TableCell>
          <div className="font-bold text-foreground truncate">{group.fullName}</div>
          <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">"{group.nickname}"</span>
              <Badge variant="outline" className="text-[10px] h-4">Seat {group.seatNo}</Badge>
          </div>
        </TableCell>
        <TableCell className="text-center font-bold">
           <Badge variant="secondary">{group.records.length} {group.records.length === 1 ? 'Record' : 'Records'}</Badge>
        </TableCell>
        <TableCell className="text-center">
          <Badge variant="outline" className={getPercentageColor(group.overallPercentage) + " text-base px-3 py-1 font-black"}>
              {group.overallPercentage === 0 ? "N/A" : `${group.overallPercentage.toFixed(1)}%`}
          </Badge>
        </TableCell>
        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
          {formattedDate}
        </TableCell>
        <TableCell className="text-right">
          <div className="flex justify-end gap-2 items-center">
            <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}>
                {isExpanded ? <ChevronUp className="h-4 w-4 mr-2" /> : <ChevronDown className="h-4 w-4 mr-2" />}
                {isExpanded ? "Hide" : "Expand"}
            </Button>
          </div>
        </TableCell>
      </TableRow>
      <AnimatePresence>
        {isExpanded && (
          <TableRow className="bg-muted/10">
            <TableCell colSpan={6} className="p-0 border-b-2 border-primary/20 shadow-inner">
               <motion.div 
                 initial={{ height: 0, opacity: 0 }} 
                 animate={{ height: 'auto', opacity: 1 }} 
                 exit={{ height: 0, opacity: 0 }}
                 transition={{ duration: 0.2 }}
                 className="p-4 sm:p-6 flex flex-col gap-4 overflow-hidden bg-primary/5"
               >
                  <div className="flex items-center justify-between border-b pb-3 mb-2">
                     <p className="font-bold text-primary text-sm uppercase tracking-wider">
                        Submission History
                     </p>
                     <div className="flex items-center gap-2">
                         <Button size="sm" variant="outline" className="h-8 shadow-sm text-xs border-green-500/30 text-green-600 hover:bg-green-500/10 hover:text-green-700" onClick={(e) => { e.stopPropagation(); onExport(group); }}>
                             <Download className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                             <span className="hidden sm:inline">Export Excel</span>
                         </Button>
                         <Button size="sm" variant="destructive" onClick={(e) => { e.stopPropagation(); onDeleteAll(group); }} className="h-8 shadow-sm text-xs">
                             <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                             <span className="hidden sm:inline">Delete All</span>
                         </Button>
                         <Button size="sm" onClick={(e) => { e.stopPropagation(); onAddRecord(group); }} className="h-8 shadow-sm text-xs">
                             <Plus className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                             <span className="hidden sm:inline">Add New Record</span>
                         </Button>
                     </div>
                  </div>
                  
                  <div className="space-y-4">
                     {group.records.map((record, index) => {
                        const recDate = record.updatedAt?.toDate ? format(record.updatedAt.toDate(), "MMM d, yyyy - h:mm a") : "Just now";
                        return (
                           <div key={record.id || index} className="bg-background rounded-xl p-4 border shadow-sm relative group">
                              <div className="flex justify-between items-center mb-3">
                                 <Badge variant="outline" className="bg-muted/50 text-muted-foreground font-medium">Recorded: {recDate}</Badge>
                                 <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-blue-500 hover:bg-blue-500/10" onClick={() => onEdit(record)}>
                                       <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7 text-red-500 hover:bg-red-500/10" onClick={() => onDelete(record)}>
                                       <Trash2 className="h-3 w-3" />
                                    </Button>
                                 </div>
                              </div>
                              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                  <div className="bg-muted/20 rounded-lg p-3">
                                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Assignment</p>
                                     {renderScore(record.assignmentScore, record.assignmentName)}
                                  </div>
                                  <div className="bg-muted/20 rounded-lg p-3">
                                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Activity</p>
                                     {renderScore(record.activityScore, record.activityName)}
                                  </div>
                                  <div className="bg-muted/20 rounded-lg p-3">
                                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Homework</p>
                                     {renderScore(record.homeworkScore, record.homeworkName)}
                                  </div>
                                  <div className="bg-muted/20 rounded-lg p-3">
                                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Reading</p>
                                     {renderScore(record.readingScore, record.readingName)}
                                  </div>
                                  <div className="bg-muted/20 rounded-lg p-3">
                                     <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">Project</p>
                                     {renderScore(record.projectScore, record.projectName)}
                                  </div>
                              </div>
                           </div>
                        );
                     })}
                  </div>
               </motion.div>
            </TableCell>
          </TableRow>
        )}
      </AnimatePresence>
    </React.Fragment>
  );
}

export function StudentsTable() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedClass, setSelectedClass] = React.useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingStudent, setEditingStudent] = React.useState<Student | null>(null);
  
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const studentsRef = React.useMemo(() => {
    if (!firestore || !user?.uid) return null;
    return collection(firestore, `users/${user.uid}/students`);
  }, [firestore, user?.uid]);

  const studentsQuery = useMemoFirebase(() => {
    if (!studentsRef) return null;
    return query(studentsRef, orderBy("createdAt", "desc"));
  }, [studentsRef]);

  // Subscribe to students collection
  React.useEffect(() => {
    if (!studentsQuery) return;
    const unsubscribe = onSnapshot(studentsQuery, (snapshot) => {
      const data: Student[] = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() } as Student);
      });
      setStudents(data);
    }, (error) => {
      console.error("Error fetching students:", error);
    });
    return () => unsubscribe();
  }, [studentsQuery]);

  const uniqueClasses = React.useMemo(() => {
    const classes = new Set(students.map(s => s.classSession).filter(Boolean));
    return Array.from(classes).sort();
  }, [students]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}'s specific record? This cannot be undone.`)) return;
    try {
      if (firestore && user?.uid) {
        await deleteDoc(doc(firestore, `users/${user.uid}/students`, id));
        toast({ title: "Record Deleted", description: "The specific submission has been permanently removed." });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete student record.", variant: "destructive" });
    }
  };

  const handleDeleteAll = async (group: StudentGroup) => {
    if (!confirm(`Are you sure you want to completely delete ALL ${group.records.length} records for ${group.fullName}? This cannot be undone.`)) return;
    try {
      if (firestore && user?.uid) {
        const deletePromises = group.records.map(record => deleteDoc(doc(firestore!, `users/${user!.uid}/students`, record.id!)));
        await Promise.all(deletePromises);
        toast({ title: "All Records Deleted", description: `Every submission for ${group.fullName} has been removed entirely.` });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete all student records.", variant: "destructive" });
    }
  };

  const handleExportExcel = (group: StudentGroup) => {
    try {
      const wsData = [
        ["Student Portfolio Export", "", "", "", "", ""],
        ["Student ID", group.tableId, "", "Class Session", group.classSession, ""],
        ["Name", group.fullName, "", "Seat No.", group.seatNo || "N/A", ""],
        ["Nickname", group.nickname || "N/A", "", "Overall Grade", `${group.overallPercentage.toFixed(1)}%`, ""],
        ["Export Date", format(new Date(), "MMM d, yyyy h:mm a"), "", "Total Records", group.records.length, ""],
        [],
        ["Date Submitted", "Assignment Name", "Assignment Score", "Activity Name", "Activity Score", "Homework Name", "Homework Score", "Reading Name", "Reading Score", "Project Name", "Project Score"]
      ];

      group.records.forEach(r => {
        wsData.push([
           r.updatedAt?.toDate ? format(r.updatedAt.toDate(), "MMM d, yyyy h:mm a") : "Unknown",
           r.assignmentName || "No Submission", r.assignmentScore || "0",
           r.activityName || "No Submission", r.activityScore || "0",
           r.homeworkName || "No Submission", r.homeworkScore || "0",
           r.readingName || "No Submission", r.readingScore || "0",
           r.projectName || "No Submission", r.projectScore || "0"
        ]);
      });

      const ws = XLSX.utils.aoa_to_sheet(wsData);
      
      const colWidths = [
          { wch: 22 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 }, { wch: 20 }, { wch: 15 }
      ];
      ws['!cols'] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Student Records");

      const safeName = group.fullName.replace(/[^a-z0-9]/gi, '_').toLowerCase();
      XLSX.writeFile(wb, `${safeName}_portfolio_${group.tableId}.xlsx`);
      
      toast({ title: "Export Successful", description: "The Excel file has been securely downloaded." });
    } catch (e) {
      toast({ title: "Export Failed", description: "Could not generate Excel file.", variant: "destructive" });
    }
  };

  const studentGroups = React.useMemo(() => {
    const groups = new Map<string, StudentGroup>();
    
    students.forEach(doc => {
       const key = doc.tableId.toLowerCase().trim();
       if (!groups.has(key)) {
           groups.set(key, {
              tableId: doc.tableId,
              classSession: doc.classSession,
              fullName: doc.fullName,
              nickname: doc.nickname,
              seatNo: doc.seatNo,
              records: [],
              overallPercentage: 0,
              latestUpdate: doc.updatedAt
           });
       }
       
       const group = groups.get(key)!;
       group.records.push(doc);
       
       if (doc.updatedAt && group.latestUpdate && doc.updatedAt.toMillis() > group.latestUpdate.toMillis()) {
           group.fullName = doc.fullName;
           group.nickname = doc.nickname;
           group.seatNo = doc.seatNo;
           group.classSession = doc.classSession;
           group.latestUpdate = doc.updatedAt;
       }
    });

    return Array.from(groups.values()).map(group => {
       group.records.sort((a, b) => {
          const timeA = a.updatedAt?.toMillis?.() || 0;
          const timeB = b.updatedAt?.toMillis?.() || 0;
          return timeB - timeA;
       });

       let validScoreCount = 0;
       let totalScore = 0;
       
       group.records.forEach(r => {
           const scores = [r.assignmentScore, r.activityScore, r.homeworkScore, r.readingScore, r.projectScore];
           scores.forEach(s => {
               if (s !== "" && s !== null && s !== undefined && !Number.isNaN(Number(s))) {
                   validScoreCount++;
                   totalScore += Number(s);
               }
           });
       });

       group.overallPercentage = validScoreCount === 0 ? 0 : (totalScore / (validScoreCount * 100)) * 100;
       return group;
    });
  }, [students]);

  const filteredGroups = studentGroups.filter(g => {
    const matchesSearch = g.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          g.tableId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (g.nickname || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesClass = selectedClass === "all" || g.classSession === selectedClass;
    
    return matchesSearch && matchesClass;
  }).sort((a, b) => {
     const numA = parseInt(a.tableId, 10);
     const numB = parseInt(b.tableId, 10);
     if (!isNaN(numA) && !isNaN(numB) && numA !== numB) {
         return numA - numB;
     }
     return a.tableId.localeCompare(b.tableId);
  });

  const handleAddRecord = (group: StudentGroup) => {
     // Trigger dialog with partial state pre-filled
     const partialStudent = {
        tableId: group.tableId,
        fullName: group.fullName,
        nickname: group.nickname,
        seatNo: group.seatNo,
        classSession: group.classSession,
        assignmentName: "", assignmentScore: "",
        activityName: "", activityScore: "",
        homeworkName: "", homeworkScore: "",
        readingName: "", readingScore: "",
        projectName: "", projectScore: "",
     };
     setEditingStudent(partialStudent as Student);
     setIsDialogOpen(true);
  };

  return (
    <Card className="border-border/50 shadow-xl bg-card overflow-hidden">
      <CardHeader className="border-b border-border/50 bg-muted/20 pb-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
                <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
                <CardTitle className="text-xl">Class Roster</CardTitle>
                <CardDescription>Comprehensive view of student metrics and grades</CardDescription>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {uniqueClasses.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search students..."
                className="pl-9 w-full sm:w-64 bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button onClick={() => { setEditingStudent(null); setIsDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" /> Add Student
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="font-bold">ID No.</TableHead>
                <TableHead className="font-bold min-w-[200px]">Student Info</TableHead>
                <TableHead className="font-bold text-center">Submissions</TableHead>
                <TableHead className="font-bold text-center whitespace-nowrap"><Calculator className="inline h-4 w-4 mr-1" /> Dynamic % Grade</TableHead>
                <TableHead className="font-bold whitespace-nowrap">Last Updated</TableHead>
                <TableHead className="text-right font-bold w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGroups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-48 text-center text-muted-foreground">
                    {searchQuery || selectedClass !== "all" ? "No students found matching filters." : "Your class roster is empty. Add a student to get started!"}
                  </TableCell>
                </TableRow>
              ) : (
                filteredGroups.map((group) => (
                   <StudentRow 
                      key={group.tableId} 
                      group={group} 
                      onAddRecord={handleAddRecord}
                      onEdit={(record) => { setEditingStudent(record); setIsDialogOpen(true); }}
                      onDelete={(record) => handleDelete(record.id!, record.fullName)}
                      onDeleteAll={handleDeleteAll}
                      onExport={handleExportExcel}
                   />
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <StudentDialog 
        isOpen={isDialogOpen} 
        onOpenChange={setIsDialogOpen} 
        student={editingStudent} 
        existingGroups={studentGroups}
      />
    </Card>
  );
}
