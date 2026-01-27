import React, { useState, useRef } from "react";

const VoiceRecorder = ({ onTranscription }) => {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  /*
    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];
  
        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
  
        mediaRecorder.onstop = async () => {
          const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
          const formData = new FormData();
          formData.append("file", audioBlob);
          console.log(audioBlob)
          // send to backend
          const res = await fetch("http://localhost:8000/stt", {
            method: "POST",
            body: formData,
          });
          const { text } = await res.json();
          onTranscription(text);
        };
  
        mediaRecorder.start();
        setRecording(true);
      } catch (err) {
        console.error("Mic access error:", err);
      }
    };
   */

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      // Specify MIME type for consistency (WebM with Opus)
      const options = { mimeType: 'audio/webm;codecs=opus' };
      if (!MediaRecorder.isTypeSupported(options.mimeType)) {
        // Fallback to browser default if WebM not supported
        console.warn('WebM not supported, using default MIME type');
        options.mimeType = undefined;
      }

      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: options.mimeType || 'audio/webm' });
        console.log('Audio blob size:', audioBlob.size, 'type:', audioBlob.type);

        if (audioBlob.size === 0) {
          console.error('Empty audio blob');
          return;
        }

        const formData = new FormData();
        formData.append("file", audioBlob, "recording.webm");  // Explicit filename

        // send to backend
        const res = await fetch("http://localhost:8000/stt", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          console.error('STT request failed:', res.status, await res.text());
          return;
        }

        const { text } = await res.json();
        onTranscription(text);
      };

      mediaRecorder.start();
      setRecording(true);
    } catch (err) {
      console.error("Mic access or recording error:", err);
    }
  };


  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <div>
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        style={{
          padding: "14px",
          borderRadius: "50%",
          backgroundColor: recording ? "red" : "gray",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        {recording ? "Recording..." : "Hold to Talk"}
      </button>
    </div>
  );
};

export default VoiceRecorder;
