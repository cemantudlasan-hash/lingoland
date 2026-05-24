"use client";

import * as React from "react";
import { useAuth } from "@/context/auth-context";
import { useFirestore } from "@/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Student, StudentGroup } from "./students-table";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Clipboard, AlertCircle, CheckCircle2, UserPlus, Info } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface BulkStudentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  existingGroups: StudentGroup[];
}

interface ParsedStudent {
  tableId: string;
  fullName: string;
  nickname: string;
  seatNo: string;
  classSession: string;
  errors: string[];
}

export function BulkStudentDialog({ isOpen, onOpenChange, existingGroups }: BulkStudentDialogProps) {
  const [rawText, setRawText] = React.useState("");
  const [skipHeader, setSkipHeader] = React.useState(true);
  const [parsedStudents, setParsedStudents] = React.useState<ParsedStudent[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const { user } = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  // Helper to determine if a line is likely a header
  const isHeaderLine = (line: string) => {
    const lower = line.toLowerCase();
    return lower.includes("id") || lower.includes("name") || lower.includes("seat") || lower.includes("class") || lower.includes("session");
  };

  // Perform parsing whenever input text or skipping header toggle changes
  React.useEffect(() => {
    if (!rawText.trim()) {
      setParsedStudents([]);
      return;
    }

    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    let startIdx = 0;

    // Auto-detect if the first line is a header if the toggle is set to skip
    if (skipHeader && lines.length > 0 && isHeaderLine(lines[0])) {
      startIdx = 1;
    }

    const parsed: ParsedStudent[] = [];

    // First pass: extract columns
    for (let i = startIdx; i < lines.length; i++) {
      const line = lines[i];
      const delimiter = line.includes("\t") ? "\t" : ",";
      const cols = line.split(delimiter).map(c => c.trim());

      const tableId = cols[0] || "";
      const fullName = cols[1] || "";
      const nickname = cols[2] || "";
      const seatNo = cols[3] || "";
      const classSession = cols[4] || "";

      const errors: string[] = [];
      if (!tableId) errors.push("Missing ID Number");
      if (!fullName) errors.push("Missing Full Name");
      if (!classSession) errors.push("Missing Class Session");

      parsed.push({
        tableId,
        fullName,
        nickname,
        seatNo,
        classSession,
        errors,
      });
    }

    // Second pass: cross-validate duplicates within the pasted list and against DB
    const idCounts: Record<string, number> = {};
    const seatKeys: Record<string, number> = {};

    parsed.forEach(row => {
      if (row.tableId) {
        idCounts[row.tableId.toLowerCase()] = (idCounts[row.tableId.toLowerCase()] || 0) + 1;
      }
      if (row.seatNo && row.classSession) {
        const key = `${row.classSession.toLowerCase()}-${row.seatNo.toLowerCase()}`;
        seatKeys[key] = (seatKeys[key] || 0) + 1;
      }
    });

    parsed.forEach(row => {
      if (row.tableId) {
        // Duplicates within pasted list
        if (idCounts[row.tableId.toLowerCase()] > 1) {
          row.errors.push("Duplicate ID in copy-paste list");
        }
        // Duplicates in existing roster
        const isDbDuplicate = existingGroups.some(g => g.tableId.toLowerCase().trim() === row.tableId.toLowerCase().trim());
        if (isDbDuplicate) {
          row.errors.push(`ID ${row.tableId} is already taken in roster`);
        }
      }

      if (row.seatNo && row.classSession) {
        // Duplicate seats in pasted list
        const key = `${row.classSession.toLowerCase()}-${row.seatNo.toLowerCase()}`;
        if (seatKeys[key] > 1) {
          row.errors.push("Duplicate seat inside copy-paste list for this class");
        }
        // Duplicate seats in existing roster
        const isDbSeatDuplicate = existingGroups.some(g => 
          g.classSession.toLowerCase().trim() === row.classSession.toLowerCase().trim() &&
          g.seatNo.toLowerCase().trim() === row.seatNo.toLowerCase().trim()
        );
        if (isDbSeatDuplicate) {
          row.errors.push(`Seat ${row.seatNo} is already occupied in ${row.classSession}`);
        }
      }
    });

    setParsedStudents(parsed);
  }, [rawText, skipHeader, existingGroups]);

  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !user?.uid) return;
    if (parsedStudents.length === 0) return;

    // Check if there are any blocking errors
    const hasErrors = parsedStudents.some(s => s.errors.length > 0);
    if (hasErrors) {
      toast({
        title: "Validation Errors",
        description: "Please resolve all highlighting errors before importing.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const classRef = collection(firestore, `users/${user.uid}/students`);
      
      // Batch write simulation using Promise.all of individual addDoc requests
      const promises = parsedStudents.map(student => {
        return addDoc(classRef, {
          tableId: student.tableId,
          fullName: student.fullName,
          nickname: student.nickname || "",
          seatNo: student.seatNo || "",
          classSession: student.classSession,
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
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      await Promise.all(promises);

      toast({
        title: "Bulk Import Successful",
        description: `Successfully registered ${parsedStudents.length} students into your classroom database!`,
      });

      // Clear input and close modal
      setRawText("");
      onOpenChange(false);
    } catch (err) {
      console.error(err);
      toast({
        title: "Import Failed",
        description: "Could not import the roster list. Check your connection.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalValid = parsedStudents.filter(s => s.errors.length === 0).length;
  const totalErrors = parsedStudents.filter(s => s.errors.length > 0).length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] md:max-w-[850px] max-h-[90vh] flex flex-col bg-slate-950 border-slate-800 text-slate-100 p-6 overflow-hidden">
        <DialogHeader className="border-b border-slate-800 pb-3 flex-shrink-0">
          <DialogTitle className="text-2xl font-black flex items-center gap-2 text-primary">
            <UserPlus className="h-6 w-6 text-indigo-400" />
            Bulk Import Students
          </DialogTitle>
          <DialogDescription className="text-slate-400 text-sm">
            Copy and paste student roster rows directly from Google Sheets, Microsoft Excel, or raw CSV lists.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-6 py-4 pr-1">
          {/* Instructions Box */}
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex gap-3 text-xs leading-relaxed text-slate-300">
            <Info className="h-5 w-5 text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-200 mb-1">Copy-Paste Roster Format Instructions:</p>
              <p className="mb-2">
                Pasted fields should be separated by **Tabs** (default when copying from spreadsheet grids) or **Commas**. Each student must be on a new line.
              </p>
              <p className="text-slate-400 font-semibold">
                Expected columns: <span className="text-indigo-300">Student ID</span>, <span className="text-indigo-300">Full Name</span>, <span className="text-indigo-300">Nickname</span>, <span className="text-indigo-300">Seat No.</span>, <span className="text-indigo-300">Class Session</span>
              </p>
            </div>
          </div>

          <form onSubmit={handleBulkSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="rawText" className="text-slate-300 text-sm font-bold flex justify-between items-center">
                <span>Roster Copy-Paste Area</span>
                <span className="text-[10px] text-slate-500 font-normal">Auto-detects delimiters</span>
              </Label>
              <div className="relative">
                <Textarea
                  id="rawText"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`2026-001\tJane Doe\tJaney\tSeat A1\tSection A&#10;2026-002\tJohn Smith\tJohnny\tSeat A2\tSection A`}
                  className="min-h-[140px] font-mono text-xs bg-slate-900 border-slate-800 text-slate-100 placeholder-slate-600 focus-visible:ring-indigo-500"
                />
                {!rawText && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-slate-600 gap-1.5">
                    <Clipboard className="h-6 w-6 stroke-[1.5]" />
                    <span className="text-xs">Paste excel columns here...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/30 p-3 rounded-lg border border-slate-900">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="skipHeader"
                  checked={skipHeader}
                  onCheckedChange={(checked) => setSkipHeader(!!checked)}
                  className="border-slate-700 data-[state=checked]:bg-indigo-600"
                />
                <label
                  htmlFor="skipHeader"
                  className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-300 cursor-pointer"
                >
                  Skip first row (if headers are present)
                </label>
              </div>

              {parsedStudents.length > 0 && (
                <div className="flex gap-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                    <CheckCircle2 className="h-3 w-3 mr-1" /> {totalValid} Ready
                  </Badge>
                  {totalErrors > 0 && (
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 text-[10px]">
                      <AlertCircle className="h-3 w-3 mr-1" /> {totalErrors} Highlighted Errors
                    </Badge>
                  )}
                </div>
              )}
            </div>

            {parsedStudents.length > 0 && (
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-bold">Roster Preview & Validation</Label>
                <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/20">
                  <ScrollArea className="max-h-[220px] w-full">
                    <Table className="text-xs">
                      <TableHeader className="bg-slate-900 border-slate-800 sticky top-0 z-10">
                        <TableRow>
                          <TableHead className="text-slate-400 font-bold">ID No.</TableHead>
                          <TableHead className="text-slate-400 font-bold">Full Name</TableHead>
                          <TableHead className="text-slate-400 font-bold">Nickname</TableHead>
                          <TableHead className="text-slate-400 font-bold">Seat</TableHead>
                          <TableHead className="text-slate-400 font-bold">Class Session</TableHead>
                          <TableHead className="text-slate-400 font-bold text-right">Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {parsedStudents.map((student, idx) => (
                          <TableRow
                            key={idx}
                            className={`border-slate-900 hover:bg-slate-900/30 ${student.errors.length > 0 ? "bg-rose-950/20" : ""}`}
                          >
                            <TableCell className={`font-bold ${!student.tableId ? "text-rose-400 italic" : "text-slate-200"}`}>
                              {student.tableId || "Missing"}
                            </TableCell>
                            <TableCell className={!student.fullName ? "text-rose-400 italic" : "text-slate-200"}>
                              {student.fullName || "Missing"}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {student.nickname || "-"}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {student.seatNo || "-"}
                            </TableCell>
                            <TableCell className={!student.classSession ? "text-rose-400 italic" : "text-slate-200"}>
                              {student.classSession || "Missing"}
                            </TableCell>
                            <TableCell className="text-right">
                              {student.errors.length > 0 ? (
                                <div className="flex flex-col items-end gap-1">
                                  {student.errors.map((err, eIdx) => (
                                    <Badge
                                      key={eIdx}
                                      variant="destructive"
                                      className="text-[9px] px-1 py-0 border-none bg-rose-500/80 text-white leading-normal max-w-[180px] truncate"
                                      title={err}
                                    >
                                      ⚠️ {err}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[9px] px-1.5 py-0">
                                  ✨ Valid
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </div>
            )}

            <DialogFooter className="border-t border-slate-800 pt-4 flex-shrink-0 flex gap-2 sm:justify-end">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="text-slate-400 hover:text-slate-200 hover:bg-slate-900">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || parsedStudents.length === 0 || totalErrors > 0}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 shadow-md shadow-indigo-500/10"
              >
                {isSubmitting ? (
                  <React.Fragment>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </React.Fragment>
                ) : (
                  `Import ${parsedStudents.length} Students`
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
