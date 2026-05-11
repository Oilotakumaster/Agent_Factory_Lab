import { useState, useRef, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { TranscriptMessage, ConnectionState } from '../types';
import { decode, decodeAudioData, createBlob } from '../utils/audio';

const LIVE_API_MODEL_NAME = 'gemini-live-2.5-flash-native-audio';

export const EMOTIONS = [
  'neutral', 'listening', 'thinking', 'talking', 'smiling', 'happy', 'laughing', 'grateful', 'relieved',
  'confused', 'surprised', 'shocked', 'annoyed', 'angry', 'furious', 'disgusted', 'skeptical', 'sad', 'apologetic', 'tired'
];

export function useLiveAPI() {
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [transcripts, setTranscripts] = useState<TranscriptMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentEmotion, setCurrentEmotion] = useState<string>('neutral');
  const [emotionTick, setEmotionTick] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0);

  // Refs to hold mutable state that shouldn't trigger re-renders
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input?: AudioContext; output?: AudioContext }>({});
  const streamRef = useRef<MediaStream | null>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);
  const isInterruptedRef = useRef<boolean>(false);
  
  // Transcription accumulation refs
  const currentInputTranscription = useRef('');
  const currentOutputTranscription = useRef('');

  const cleanup = useCallback(() => {
    if (sessionRef.current) {
      try {
        sessionRef.current.close();
      } catch (e) {
        console.error('Error closing session:', e);
      }
      sessionRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    sourcesRef.current.forEach(source => {
      try {
        source.stop();
      } catch (e) {
        // Ignore errors if already stopped
      }
    });
    sourcesRef.current.clear();

    if (audioContextsRef.current.input) {
      audioContextsRef.current.input.close();
    }
    if (audioContextsRef.current.output) {
      audioContextsRef.current.output.close();
    }
    audioContextsRef.current = {};
    nextStartTimeRef.current = 0;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setVolume(0);
    
    currentInputTranscription.current = '';
    currentOutputTranscription.current = '';
  }, []);

  const connect = useCallback(async (systemInstruction: string = '你是一個友善、樂於助人的 AI 語音助手。請用繁體中文簡潔地回答。') => {
    if (connectionState === 'connecting' || connectionState === 'connected') return;

    setConnectionState('connecting');
    setError(null);
    setTranscripts([]); // Clear previous transcripts on new connection
    setCurrentEmotion('neutral');

    try {
      // 1. Initialize Audio Contexts (must be done after user interaction)
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const inputAudioContext = new AudioContextClass({ sampleRate: 16000 });
      const outputAudioContext = new AudioContextClass({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputAudioContext, output: outputAudioContext };

      const inputNode = inputAudioContext.createGain();
      const outputNode = outputAudioContext.createGain();
      outputNode.connect(outputAudioContext.destination);

      // Setup audio analyzer for volume visualizer
      const analyser = outputAudioContext.createAnalyser();
      analyser.fftSize = 256;
      outputNode.connect(analyser);
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        setVolume(sum / dataArray.length);
        animationFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      // 2. Get Microphone Access with noise suppression
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          noiseSuppression: true,
          echoCancellation: true,
          autoGainControl: true,
        }
      });
      streamRef.current = stream;

      // 3. Initialize GenAI Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });

      // 4. Connect to Live API
      const sessionPromise = ai.live.connect({
        model: LIVE_API_MODEL_NAME,
        callbacks: {
          onopen: () => {
            setConnectionState('connected');
            
            // Setup audio input streaming
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
              const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
              const pcmBlob = createBlob(inputData);
              
              // CRITICAL: Use sessionPromise to ensure we only send when ready
              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              }).catch(err => console.error("Failed to send audio:", err));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Tool Calls (Emotions)
            if (message.toolCall) {
              const call = message.toolCall.functionCalls?.find(c => c.name === 'setEmotion');
              if (call && call.args && call.args.emotion) {
                const emotion = call.args.emotion as string;
                if (EMOTIONS.includes(emotion)) {
                  setCurrentEmotion(emotion);
                  setEmotionTick(prev => prev + 1);
                }
                // Respond immediately to keep audio flowing
                sessionPromise.then(session => {
                  session.sendToolResponse({
                    functionResponses: [{
                      id: call.id,
                      name: call.name,
                      response: { success: true }
                    }]
                  });
                });
              }
            }

            // Handle Transcriptions
            if (message.serverContent?.outputTranscription) {
              currentOutputTranscription.current += message.serverContent.outputTranscription.text || '';
            } else if (message.serverContent?.inputTranscription) {
              currentInputTranscription.current += message.serverContent.inputTranscription.text || '';
            }

            if (message.serverContent?.turnComplete) {
              const userInput = currentInputTranscription.current.trim();
              let modelOutput = currentOutputTranscription.current.trim();
              const now = Date.now();

              // 標示被打斷的狀態
              if (isInterruptedRef.current && modelOutput) {
                modelOutput += ' ... (被打斷)';
              }

              if (userInput || modelOutput) {
                setTranscripts(prev => {
                  const newTranscripts = [...prev];
                  if (userInput) {
                    newTranscripts.push({ id: `${now}-user`, role: 'user', text: userInput, timestamp: now });
                  }
                  
                  if (modelOutput) {
                    const lastMsg = newTranscripts[newTranscripts.length - 1];
                    // 防呆機制：如果 AI 產出的內容跟上一句自己的話高度重複（子字串關係），代表是回音或雜音觸發的重複生成，則直接拋棄。
                    if (lastMsg && lastMsg.role === 'model' && userInput === '') {
                      if (modelOutput.includes(lastMsg.text) || lastMsg.text.includes(modelOutput)) {
                        return newTranscripts;
                      }
                    }
                    newTranscripts.push({ id: `${now}-model`, role: 'model', text: modelOutput, timestamp: now + 1 });
                  }
                  return newTranscripts;
                });
              }

              currentInputTranscription.current = '';
              currentOutputTranscription.current = '';
              isInterruptedRef.current = false;
            }

            // Handle Audio Output
            const base64EncodedAudioString = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64EncodedAudioString && audioContextsRef.current.output) {
              const outCtx = audioContextsRef.current.output;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outCtx.currentTime);
              
              try {
                const audioBuffer = await decodeAudioData(
                  decode(base64EncodedAudioString),
                  outCtx,
                  24000,
                  1,
                );
                
                const source = outCtx.createBufferSource();
                source.buffer = audioBuffer;
                source.connect(outputNode);
                
                source.addEventListener('ended', () => {
                  sourcesRef.current.delete(source);
                });

                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current = nextStartTimeRef.current + audioBuffer.duration;
                sourcesRef.current.add(source);
              } catch (err) {
                console.error("Error decoding/playing audio:", err);
              }
            }

            // Handle Interruption
            if (message.serverContent?.interrupted) {
              isInterruptedRef.current = true;
              sourcesRef.current.forEach(source => {
                try { source.stop(); } catch (e) {}
                sourcesRef.current.delete(source);
              });
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: any) => {
            console.error('Live API Error:', e);
            setError(e.message || '發生未知錯誤');
            setConnectionState('error');
            cleanup();
          },
          onclose: () => {
            setConnectionState('disconnected');
            cleanup();
          },
        },
        config: {
          generationConfig: {
            temperature: 1.1,         // 稍微提高溫度，增加隨機性與多樣性
            frequencyPenalty: 0.3,    // 懲罰重複出現的字詞
            presencePenalty: 0.2,     // 鼓勵帶入新話題
          },
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: {
                voiceName: 'Puck'
              }
            }
          },
          outputAudioTranscription: {},
          inputAudioTranscription: {},
          systemInstruction: systemInstruction + '\n\n【重要設定】每次你開口說話前，請務必先呼叫 setEmotion 函式，傳遞你當下最符合的情緒狀態。使用者會使用繁體中文（台灣）與你對話，請你務必專注精準辨識使用者的語音內容，並完全以繁體中文回應。\n如果對話過程中因為雜音導致你被打斷，請你「接著」被打斷的地方繼續講就好，絕對不要把整句話重頭唸一次。',
          tools: [{
            functionDeclarations: [{
              name: 'setEmotion',
              description: '設定你當下說話時的情緒狀態，務必在每次回覆時最先呼叫。',
              parameters: {
                type: 'OBJECT',
                properties: {
                  emotion: { 
                    type: 'STRING', 
                    enum: EMOTIONS, 
                    description: '當前情緒' 
                  }
                },
                required: ['emotion']
              }
            }]
          }]
        },
      });

      sessionRef.current = await sessionPromise;

    } catch (err: any) {
      console.error('Failed to connect:', err);
      setError(err.message || '無法建立連線，請檢查麥克風權限或網路狀態。');
      setConnectionState('error');
      cleanup();
    }
  }, [connectionState, cleanup]);

  const disconnect = useCallback(() => {
    cleanup();
    setConnectionState('disconnected');
  }, [cleanup]);

  return {
    connectionState,
    transcripts,
    error,
    currentEmotion,
    emotionTick,
    volume,
    connect,
    disconnect
  };
}
