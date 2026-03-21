"use client";

import { useState, useRef, useCallback } from "react";

export function useRecorder() {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async (): Promise<{ success: boolean }> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      
      recorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      recorder.onstop = () => {
        audioChunksRef.current = [];
        stream.getTracks().forEach(track => track.stop()); // Stop microphone access
      };

      recorder.start();
      setRecording(true);
      return { success: true };
    } catch (err) {
      console.error("Error starting recording:", err);
      setRecording(false);
      return { success: false };
    }
  }, []);

  const stopRecording = useCallback((): Promise<string | null> => {
    return new Promise((resolve) => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                const reader = new FileReader();
                reader.readAsDataURL(audioBlob);
                reader.onloadend = () => {
                    const dataUri = reader.result as string;
                    resolve(dataUri);
                };
                audioChunksRef.current = [];
                mediaRecorderRef.current?.stream.getTracks().forEach(track => track.stop());
            };
            mediaRecorderRef.current.stop();
            setRecording(false);
        } else {
            resolve(null);
        }
    });
  }, [recording]);


  return { recording, startRecording, stopRecording };
}
