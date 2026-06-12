'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Camera, 
  Upload, 
  RefreshCw, 
  AlertCircle, 
  Check, 
  X, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Info, 
  Sparkles, 
  HelpCircle, 
  RotateCcw, 
  SwitchCamera,
  Trash2,
  FileCheck2,
  Award
} from 'lucide-react';
import { scanWorksheet, ScanWorksheetOutput } from '@/ai/flows/scan-worksheet';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

export function WorksheetScanner() {
  const { toast } = useToast();
  
  // Media capture states
  const [stream, setStream] = React.useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = React.useState<'user' | 'environment'>('environment');
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [additionalInstructions, setAdditionalInstructions] = React.useState('');
  const [isCameraActive, setIsCameraActive] = React.useState(false);
  const [cameraError, setCameraError] = React.useState<string | null>(null);
  const [videoAspectRatio, setVideoAspectRatio] = React.useState<number | null>(null);

  // Video and Canvas refs
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  // AI Evaluation states
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingStep, setLoadingStep] = React.useState(0);
  const [gradedResult, setGradedResult] = React.useState<ScanWorksheetOutput | null>(null);

  // Loading animation loop
  React.useEffect(() => {
    if (!isLoading) return;
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 4);
    }, 2000);
    return () => clearInterval(interval);
  }, [isLoading]);

  const loadingMessages = [
    "Reading worksheet answers...",
    "Scanning text using Gemini AI...",
    "Grading correct and wrong answers...",
    "Finalizing scores and details..."
  ];

  // Camera stream initializer
  const startCamera = async () => {
    setCameraError(null);
    setIsCameraActive(true);
    setCapturedImage(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.error("Camera access error:", err);
      setCameraError(
        "Could not access your camera. Please check permissions or switch to File Upload mode."
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
    setVideoAspectRatio(null);
  };

  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'));
  };

  // Switch camera when facingMode changes
  React.useEffect(() => {
    if (isCameraActive) {
      startCamera();
    }
  }, [facingMode]);

  // Clean up stream on unmount
  React.useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Capture Image function
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        // Flip canvas horizontally if using front camera for mirrored preview
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  // File Upload handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an image file (PNG/JPG).",
          variant: "destructive"
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result as string);
        stopCamera();
      };
      reader.readAsDataURL(file);
    }
  };

  // Grade Worksheet via AI Server Action
  const handleGradeWorksheet = async () => {
    if (!capturedImage) return;
    setIsLoading(true);
    setLoadingStep(0);
    setGradedResult(null);
    try {
      const result = await scanWorksheet({
        imageDataUri: capturedImage,
        additionalInstructions: additionalInstructions.trim() || undefined
      });
      setGradedResult(result);
      toast({
        title: "Worksheet Graded! 🎉",
        description: `Score: ${result.score.correctCount}/${result.score.totalCount} (${Math.round(result.score.percentage)}%)`,
      });
    } catch (err: any) {
      console.error("AI grading error:", err);
      toast({
        title: "Evaluation Failed",
        description: err.message || "An error occurred while evaluating the worksheet. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Manual override togglers
  const handleToggleCorrect = (idx: number) => {
    if (!gradedResult) return;
    const updatedQuestions = [...gradedResult.questions];
    const prevVal = updatedQuestions[idx].isCorrect;
    updatedQuestions[idx].isCorrect = !prevVal;

    // Recalculate score
    const correctCount = updatedQuestions.filter((q) => q.isCorrect).length;
    const totalCount = updatedQuestions.length;
    const percentage = totalCount > 0 ? (correctCount / totalCount) * 100 : 0;

    setGradedResult({
      ...gradedResult,
      score: {
        correctCount,
        totalCount,
        percentage
      },
      questions: updatedQuestions
    });
  };

  // Reset tool helper
  const handleReset = () => {
    setCapturedImage(null);
    setGradedResult(null);
    setAdditionalInstructions('');
    stopCamera();
  };

  return (
    <div className="w-full flex flex-col h-full gap-6">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input Camera & Image Capture Controls */}
        <div className="xl:col-span-6 space-y-4">
          <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Camera className="h-4 w-4 text-teal-400" />
                Worksheet Capture Sources
              </CardTitle>
              <CardDescription className="text-xs">
                Take a photo or upload an image of the student worksheet to begin AI grading.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Media viewer block */}
              <div 
                style={{ aspectRatio: videoAspectRatio ? videoAspectRatio : undefined }}
                className={`relative bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner transition-all duration-300 ${
                  !videoAspectRatio ? 'aspect-[4/3]' : ''
                }`}
              >
                {isCameraActive ? (
                  <>
                    <video 
                      ref={videoRef} 
                      autoPlay 
                      playsInline 
                      muted 
                      onLoadedMetadata={() => {
                        if (videoRef.current) {
                          const { videoWidth, videoHeight } = videoRef.current;
                          if (videoWidth && videoHeight) {
                            setVideoAspectRatio(videoWidth / videoHeight);
                          }
                        }
                      }}
                      className={`w-full h-full object-contain ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`} 
                    />
                    {/* Overlay Grid lines for layout alignment */}
                    <div className="absolute inset-0 border border-teal-500/10 pointer-events-none grid grid-cols-3 grid-rows-3">
                      <div className="border-r border-b border-teal-500/10" />
                      <div className="border-r border-b border-teal-500/10" />
                      <div className="border-b border-teal-500/10" />
                      <div className="border-r border-b border-teal-500/10" />
                      <div className="border-r border-b border-teal-500/10" />
                      <div className="border-b border-teal-500/10" />
                    </div>
                  </>
                ) : capturedImage ? (
                  <img 
                    src={capturedImage} 
                    alt="Captured worksheet" 
                    className="w-full h-full object-contain" 
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 space-y-3">
                    <FileText className="w-12 h-12 text-slate-700 animate-pulse" />
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">No Source Image</p>
                      <p className="text-[10px] mt-1 max-w-[200px]">Activate your camera or drag and drop files to start scanning.</p>
                    </div>
                  </div>
                )}
                
                {/* Error Banner */}
                {cameraError && (
                  <div className="absolute inset-x-0 bottom-0 bg-rose-950/90 border-t border-rose-500/30 p-2 flex items-center gap-2 text-[10px] text-rose-300">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{cameraError}</span>
                  </div>
                )}
              </div>

              {/* Action Stream Controls */}
              <div className="flex flex-wrap gap-2 justify-center">
                {!isCameraActive ? (
                  <Button 
                    onClick={startCamera} 
                    variant="outline" 
                    className="gap-1.5 text-xs bg-slate-950/40 border-slate-800 hover:bg-slate-800/40 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Start Camera
                  </Button>
                ) : (
                  <>
                    <Button 
                      onClick={capturePhoto} 
                      className="gap-1.5 text-xs bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      Capture Photo
                    </Button>
                    <Button 
                      onClick={toggleCameraFacing} 
                      variant="outline" 
                      className="p-2 aspect-square bg-slate-950/40 border-slate-800 hover:bg-slate-800/40 cursor-pointer"
                      title="Flip Camera"
                    >
                      <SwitchCamera className="w-3.5 h-3.5" />
                    </Button>
                    <Button 
                      onClick={stopCamera} 
                      variant="destructive" 
                      className="gap-1.5 text-xs cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Cancel
                    </Button>
                  </>
                )}

                {/* File Uploader button */}
                <label className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileUpload} 
                    className="hidden" 
                  />
                  <Button 
                    asChild
                    variant="outline" 
                    className="gap-1.5 text-xs bg-slate-950/40 border-slate-800 hover:bg-slate-800/40 cursor-pointer"
                  >
                    <span>
                      <Upload className="w-3.5 h-3.5" />
                      Upload Image
                    </span>
                  </Button>
                </label>
              </div>

              {/* Grading Instructions / Answer Key Box */}
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                <Label htmlFor="answer-key-instructions" className="text-xs font-semibold text-slate-350">
                  Optional Answer Key & Grading Guidelines
                </Label>
                <Textarea 
                  id="answer-key-instructions"
                  value={additionalInstructions}
                  onChange={(e) => setAdditionalInstructions(e.target.value)}
                  placeholder="e.g. Q1: active, Q2: cooperate. Or: 'Allow minor spelling mistakes', 'Correct answer key is: 1A, 2C, 3B'"
                  className="text-xs min-h-[68px] bg-slate-950/50 border-slate-850 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 rounded-xl"
                />
              </div>

              {/* Action buttons */}
              {capturedImage && (
                <div className="flex gap-2 pt-2 border-t border-slate-800">
                  <Button 
                    onClick={handleReset} 
                    variant="ghost" 
                    className="flex-1 gap-1.5 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/10 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Reset
                  </Button>
                  <Button 
                    onClick={handleGradeWorksheet} 
                    disabled={isLoading}
                    className="flex-1 gap-1.5 text-xs bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-slate-950 font-black uppercase tracking-wider shadow-lg shadow-teal-500/10 cursor-pointer"
                  >
                    {isLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Grading...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Grade with AI
                      </>
                    )}
                  </Button>
                </div>
              )}

            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Grading Results Report */}
        <div className="xl:col-span-6 flex flex-col gap-2 min-h-[400px]">
          
          <AnimatePresence mode="wait">
            
            {/* Loading scan state */}
            {isLoading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="w-full h-full flex flex-col items-center justify-center p-10 bg-slate-900/20 border border-slate-800 rounded-3xl text-center space-y-6"
              >
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center border-2 border-teal-500/20 animate-spin-slow shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                  <Sparkles className="w-8 h-8 animate-pulse text-teal-400" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-base font-bold text-white font-mono uppercase tracking-wider animate-pulse">
                    {loadingMessages[loadingStep]}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Analyzing handwriting and evaluate responses against key objectives.
                  </p>
                </div>
                {/* Processing bar */}
                <div className="w-full max-w-xs h-1.5 bg-slate-950 border border-slate-850 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-teal-500"
                    animate={{ width: ["0%", "100%"] }}
                    transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            )}

            {/* Empty initial state */}
            {!isLoading && !gradedResult && (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-full h-full flex flex-col items-center justify-center p-12 bg-slate-900/10 border border-slate-800 border-dashed rounded-3xl text-center text-slate-500 space-y-4 min-h-[380px]"
              >
                <div className="w-14 h-14 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <FileCheck2 className="w-6 h-6 text-slate-600" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-300 uppercase tracking-wide">Worksheet Grading Report</h4>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Perform a camera snapshot or drag in a picture of student paper assignments, then select "Grade with AI" to generate the score report card.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Graded evaluation scorecard */}
            {!isLoading && gradedResult && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 w-full"
              >
                {/* Score Summary Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  
                  {/* Final Score Card */}
                  <div className="sm:col-span-5 bg-white text-slate-950 p-6 rounded-3xl flex flex-col items-start justify-center shadow-lg border relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 text-teal-650 opacity-10 font-bold select-none">
                      <Award className="w-16 h-16" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider font-mono">SCORES DETECTED</span>
                    <span className="text-4xl font-extrabold tabular-nums tracking-tight">
                      {gradedResult.score.correctCount} / {gradedResult.score.totalCount}
                    </span>
                    <p className="text-[10px] text-teal-600 font-bold font-mono mt-1">
                      {Math.round(gradedResult.score.percentage)}% Correct Items
                    </p>
                  </div>

                  {/* General feedback summary */}
                  <div className="sm:col-span-7 bg-slate-900/40 border border-slate-800 p-6 rounded-3xl flex flex-col justify-center gap-2">
                    <span className="text-[9px] font-bold text-teal-400 uppercase tracking-wider font-mono">GENERAL FEEDBACK SUMMARY</span>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans font-medium italic">
                      "{gradedResult.generalFeedback}"
                    </p>
                  </div>

                </div>

                {/* Scanned items details */}
                <Card className="bg-slate-900/40 border-slate-800 backdrop-blur-md">
                  <CardHeader className="pb-3 border-b border-slate-800/60">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-sm font-semibold flex items-center gap-2">
                        <FileCheck2 className="h-4 w-4 text-teal-400" />
                        Evaluation Summary Checklist
                      </CardTitle>
                      <span className="text-[9px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 uppercase tracking-wide flex items-center gap-1">
                        <Info className="w-3 h-3" /> Click check/cross to override grading
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="max-h-[360px] overflow-y-auto divide-y divide-slate-850">
                      {gradedResult.questions.map((q, idx) => (
                        <div 
                          key={idx}
                          className="p-4 flex items-start gap-3 justify-between hover:bg-slate-800/10 transition-colors"
                        >
                          <div className="space-y-1 min-w-0 flex-grow text-left">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-xs font-black font-mono text-teal-400">
                                Q{q.questionNumber || idx + 1}:
                              </span>
                              <p className="text-xs font-bold text-white leading-normal truncate max-w-md">
                                {q.questionText}
                              </p>
                            </div>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 pt-1.5 text-[11px] text-slate-400 leading-normal">
                              <div>
                                Student: <strong className="text-slate-200 font-mono">{q.studentAnswer || "-"}</strong>
                              </div>
                              <div>
                                Expected: <strong className="text-teal-300 font-mono">{q.correctAnswer}</strong>
                              </div>
                            </div>

                            {q.feedback && (
                              <p className="text-[10px] text-slate-500 italic mt-1 leading-normal font-sans">
                                Note: {q.feedback}
                              </p>
                            )}
                          </div>

                          {/* Action toggle overrides */}
                          <div className="flex-shrink-0 pt-0.5">
                            <button
                              onClick={() => handleToggleCorrect(idx)}
                              className={`p-2 rounded-xl border transition-all cursor-pointer shadow-md flex items-center justify-center ${
                                q.isCorrect 
                                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-450 hover:bg-rose-500/10 hover:border-rose-500/30 hover:text-rose-400"
                                  : "bg-rose-500/10 border-rose-500/40 text-rose-450 hover:bg-emerald-500/10 hover:border-emerald-500/30 hover:text-emerald-450"
                              }`}
                              title={q.isCorrect ? "Mark Incorrect" : "Mark Correct"}
                            >
                              {q.isCorrect ? (
                                <CheckCircle className="w-4 h-4" />
                              ) : (
                                <XCircle className="w-4 h-4" />
                              )}
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

              </motion.div>
            )}

          </AnimatePresence>

        </div>

      </div>
      
      {/* Hidden canvas used to draw camera frames */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
