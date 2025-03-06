'use client';

import { useRef, useState } from 'react';

export default function Home() {
  const socket = useRef(null);
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState(''); 
  const [partialTranscript, setPartialTranscript] = useState(''); 

  const getToken = async () => {
    const response = await fetch('/api/token');
    const data = await response.json();

    if (data.error) {
      console.error('Error fetching token:', data.error);
      alert(data.error);
      return null;
    }

    return data.token;
  };

  const handleFileChange = (event) => {
    setFile(event.target.files[0]); 
  };

  const startTranscription = async () => {
    if (!file) {
      alert('Please select an audio file first.');
      return;
    }

    const token = await getToken();
    if (!token) return;

    socket.current = new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`);

    socket.current.onopen = async () => {
      console.log('WebSocket connection established');
      setIsProcessing(true);
      await processAudioFile(file);
    };

    socket.current.onmessage = (event) => {
      const res = JSON.parse(event.data);
      console.log('WebSocket Message:', res);

      if (res.message_type === 'SessionBegins') {
        console.log('Session ID:', res.session_id);
      }

      if (res.message_type === 'PartialTranscript') {
        console.log('Partial:', res.text);
        setPartialTranscript(res.text); 
      }

      if (res.message_type === 'FinalTranscript') {
        console.log('Final:', res.text);
        setTranscript((prev) => prev + ' ' + res.text); 
        setPartialTranscript(''); 
      }

      if (res.message_type === 'SessionTerminated') {
        console.log('Session Terminated.');
        closeConnection();
      }
    };

    socket.current.onerror = (event) => {
      console.error('WebSocket error:', event);
      closeConnection();
    };

    socket.current.onclose = (event) => {
      console.log('WebSocket closed:', event);
      socket.current = null;
      setIsProcessing(false);
    };
  };

  const processAudioFile = async (audioFile) => {
    const reader = new FileReader();
    reader.readAsArrayBuffer(audioFile);

    reader.onload = async () => {
      const audioData = new Uint8Array(reader.result);
      console.log(`File loaded: ${audioFile.name}, Size: ${audioData.length} bytes`);

      for (let i = 0; i < audioData.length; i += 4000) {
        if (!socket.current || socket.current.readyState !== WebSocket.OPEN) return;

        const chunk = audioData.slice(i, i + 4000);
        socket.current.send(chunk);
        await new Promise(resolve => setTimeout(resolve, 50)); 
      }

      console.log('All audio sent. Terminating session...');
      socket.current.send(JSON.stringify({ terminate_session: true }));
    };
  };

  const closeConnection = () => {
    if (socket.current) {
      console.log('Closing WebSocket connection...');
      socket.current.close();
      socket.current = null;
    }
    setIsProcessing(false);
  };

  return (
    <div className="App">
      <header>
        <h1 className="header__title">File-Based Real-Time Transcription</h1>
        <p className="header__sub-title">
          Upload an audio file to transcribe it in real-time.
        </p>
      </header>

      <div className="real-time-interface">
        <input type="file" accept="audio/*" onChange={handleFileChange} />
        {!isProcessing && (
          <button className="real-time-interface__button" onClick={startTranscription}>
            Start Transcription
          </button>
        )}
      </div>

      <div className="real-time-interface__message">
        <p><strong>Transcript:</strong> {transcript} <span style={{ opacity: 0.6 }}>{partialTranscript}</span></p>
      </div>
    </div>
  );
}

