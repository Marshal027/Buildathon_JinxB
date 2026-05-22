import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Paperclip,
  Trash2,
  TrendingUp,
  Mic,
  MicOff
} from 'lucide-react';

export default function ChatPage({ 
  messages, 
  onSubmitMessage, 
  onClearSession,
  machines,
  onSubmitIssue,
  onAddTicket
}) {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [createdTicketMessageIds, setCreatedTicketMessageIds] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const transcribeAudio = async (base64Data, mimeType) => {
    const apiKey = 'AIzaSyDYNtpQwVOnD4BVLARdyXYhs-4tm18Hots';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inlineData: {
                mimeType: mimeType,
                data: base64Data
              }
            },
            {
              text: "Transcribe this audio file to text exactly. If there is only noise or silence, return nothing. Do not add any extra feedback, comments, or explanations."
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Transcription API failed');
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    return text ? text.trim() : '';
  };

  const toggleListening = async () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      if (isListening) {
        recognitionRef.current?.stop();
        setIsListening(false);
        return;
      }

      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText(prev => prev ? prev + ' ' + transcript : transcript);
          }
        };

        recognitionRef.current = recognition;
        recognition.start();
      } catch (e) {
        console.error('Failed to initialize speech recognition:', e);
        setIsListening(false);
      }
    } else {
      // Firefox fallback using MediaRecorder + Gemini Transcribe
      if (isListening) {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
        setIsListening(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunksRef.current = [];
        
        let mimeType = 'audio/ogg';
        if (MediaRecorder.isTypeSupported('audio/webm')) {
          mimeType = 'audio/webm';
        } else if (MediaRecorder.isTypeSupported('audio/wav')) {
          mimeType = 'audio/wav';
        }

        const mediaRecorder = new MediaRecorder(stream, { mimeType });
        mediaRecorderRef.current = mediaRecorder;

        mediaRecorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          stream.getTracks().forEach(track => track.stop());

          const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
          setIsTranscribing(true);

          try {
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
              const base64Data = reader.result.split(',')[1];
              try {
                const text = await transcribeAudio(base64Data, mimeType);
                if (text) {
                  setInputText(prev => prev ? prev + ' ' + text : text);
                }
              } catch (err) {
                console.error('Gemini transcription failed:', err);
                alert('Voice transcription failed. Please check internet connection.');
              } finally {
                setIsTranscribing(false);
              }
            };
          } catch (err) {
            console.error('Error reading audio blob:', err);
            setIsTranscribing(false);
          }
        };

        mediaRecorder.start();
        setIsListening(true);
      } catch (err) {
        console.error('Microphone access denied or error:', err);
        alert('Could not access microphone. Please allow microphone permissions.');
        setIsListening(false);
      }
    }
  };

  const handleCreateTicket = async (msgId, userQuery) => {
    if (createdTicketMessageIds[msgId]) return;
    if (onAddTicket) {
      try {
        await onAddTicket({
          machineId: 'Sync-Engine-9000',
          machineName: 'Sync-Engine-9000',
          reportedBy: 'AI Chatbot triage',
          issueDescription: userQuery,
          severity: 'critical'
        });
        setCreatedTicketMessageIds(prev => ({
          ...prev,
          [msgId]: true
        }));
      } catch (err) {
        console.error("Failed to create ticket:", err);
      }
    }
  };

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() && !attachedImage) return;

    onSubmitMessage(inputText, attachedImage || undefined);
    setInputText('');
    setAttachedImage(null);
  };

  const handleImageUploaded = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full p-4 lg:p-6 overflow-hidden max-w-[1600px] mx-auto w-full">
      
      {/* LEFT COLUMN: Predictive analytics array and ROI meters */}
      <div className="w-full lg:w-96 flex flex-col gap-5 select-none overflow-y-auto shrink-0 pb-4 pr-1">
        


        {/* Module 2: ROI Analysis details */}
        <div className="p-5 bg-gradient-to-br from-[#2a302a]/30 to-[#141514]/30 border border-[#9cd2b8]/20 rounded-2xl flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#9cd2b8]" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-[#9cd2b8]">Supervisory ROI Metrics</h3>
          </div>
          
          <div className="grid grid-cols-2 gap-3.5 mt-1.5">
            <div className="p-3 bg-[#1c1b1d]/80 rounded-xl border border-[#9cd2b8]/10">
              <span className="text-[10px] text-[#cac5cc]/60 uppercase block">Downtime Saved</span>
              <span className="text-xl font-bold text-white font-mono mt-0.5">142.5 hrs</span>
            </div>
            <div className="p-3 bg-[#1c1b1d]/80 rounded-xl border border-[#9cd2b8]/10">
              <span className="text-[10px] text-[#cac5cc]/60 uppercase block">Est. Savings</span>
              <span className="text-xl font-bold text-[#9cd2b8] font-mono mt-0.5">$428.5k</span>
            </div>
          </div>
          <p className="text-[11px] text-[#cac5cc]/60 leading-relaxed mt-1">
            Calculated dynamically against historical component diagnostics from integrated smart factory signals logs.
          </p>
        </div>

        {/* Module 3: Active Telemetric Anomalies */}
        <div className="p-5 bg-[#141314]/50 border border-[#cac5cc]/10 rounded-2xl flex flex-col gap-3">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">Anomalous Activity Spectrum</span>
          <div className="flex flex-col gap-2.5">
            <div className="p-2.5 rounded-xl bg-red-950/15 border border-[#ffb4ab]/20 text-[11px] leading-relaxed text-[#ffb4ab]">
              <strong>Conveyor Beta Temp Critical:</strong> Core bearing temp spiked to 82.3°C under load line. Immediate inspection dispatched.
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN: AI Chatbot messaging arena */}
      <div className="flex-1 flex flex-col bg-[#141314]/50 border border-[#cac5cc]/10 rounded-2xl overflow-hidden min-h-[460px]">
        
        {/* Chat Area Header */}
        <div className="p-4 bg-gradient-to-r from-[#201f21] to-[#242325] border-b border-[#cac5cc]/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-950 to-blue-900 border border-cyan-400/40 flex items-center justify-center text-cyan-400">
              <Bot className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">opp sync AI Assistant</h3>
              <p className="text-[11px] text-[#cac5cc]/60">Gemini-Powered Smart Diagnostic Diagnostic Desk</p>
            </div>
          </div>
          
          <button 
            type="button"
            onClick={onClearSession}
            className="p-1.5 rounded-lg text-[#cac5cc]/50 hover:text-[#ffb4ab] hover:bg-white/5 transition-all cursor-pointer"
            title="Clear Chat Logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Messages feed area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          
          {/* Welcome baseline message */}
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#cac5cc]/40 select-none">
              <Sparkles className="w-12 h-12 mb-3 text-cyan-500 opacity-60 animate-bounce" />
              <h4 className="text-sm font-semibold text-white/70">Co-Pilot Telemetry Diagnosis</h4>
              <p className="text-xs max-w-sm mt-1.5 leading-relaxed text-[#cac5cc]/60">
                Type anomalous issues about available operational assets. Try attaching camera photos for visual diagnostic assessments using multimodals.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <div 
                key={msg.id}
                className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                {/* Profile placeholder avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border select-none text-xs font-bold ${
                  msg.role === 'user' 
                    ? 'bg-[#b0cbd8] text-neutral-900 border-[#b0cbd8]' 
                    : 'bg-cyan-950 text-cyan-400 border-cyan-400/30'
                }`}>
                  {msg.role === 'user' ? 'ME' : 'AI'}
                </div>

                {/* Msg text body card */}
                <div className={`p-4 rounded-2xl flex flex-col gap-2 ${
                  msg.role === 'user'
                    ? 'bg-[#2b2a2b] text-white rounded-tr-none'
                    : 'bg-[#1c1b1d] border border-white/5 text-white/90 rounded-tl-none font-sans'
                }`}>
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="Attached diagnostic proof" 
                      className="max-h-48 rounded-lg object-cover border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                  {msg.showSubmitButton && (
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => onSubmitIssue && onSubmitIssue(msg.id, msg.associatedUserQuestion)}
                        disabled={msg.submitted}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                          msg.submitted
                            ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed border border-neutral-700'
                            : 'bg-cyan-500 hover:bg-cyan-400 text-[#0a0a0b] shadow-lg active:scale-95 font-bold'
                        }`}
                      >
                        {msg.submitted ? (
                          <>
                            <span>Issue Submitted</span>
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                          </>
                        ) : (
                          <>
                            <span>Submit Issue</span>
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="22" y1="2" x2="11" y2="13"></line>
                              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                  
                  {msg.role === 'assistant' && msg.cannot_answer && (
                    <div className="mt-3 p-3 bg-red-950/20 border border-[#ffb4ab]/20 rounded-xl flex flex-col gap-2">
                      <p className="text-[11px] text-[#ffb4ab] font-semibold">Do you want to create a ticket?</p>
                      {createdTicketMessageIds[msg.id] ? (
                        <span className="text-[10px] text-[#9cd2b8] font-mono">✓ Ticket Created Successfully!</span>
                      ) : (
                        <button
                          onClick={() => {
                            const msgIndex = messages.findIndex(m => m.id === msg.id);
                            const userQuery = msgIndex > 0 ? messages[msgIndex - 1].content : "Unresolved diagnostic issue";
                            handleCreateTicket(msg.id, userQuery);
                          }}
                          className="py-1.5 px-3 bg-[#ffb4ab] hover:bg-[#ffb4ab]/80 text-neutral-900 font-bold text-[11px] rounded-lg transition-all active:scale-95 cursor-pointer self-start"
                        >
                          Submit Ticket
                        </button>
                      )}
                    </div>
                  )}
                  <span className="text-[9px] font-mono text-[#cac5cc]/50 self-end mt-1">{msg.timestamp}</span>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Dynamic Image Attachment Bar indicator */}
        {attachedImage && (
          <div className="px-4 py-2 bg-black/40 border-t border-white/5 flex items-center justify-between select-none animate-fadeIn">
            <div className="flex items-center gap-2">
              <img 
                src={attachedImage} 
                alt="Upload preview" 
                className="w-10 h-10 object-cover rounded border border-white/10" 
                referrerPolicy="no-referrer"
              />
              <span className="text-xs text-[#9cd2b8] font-mono">Attachment ready...</span>
            </div>
            <button 
              type="button"
              onClick={() => setAttachedImage(null)} 
              className="text-xs text-[#ffb4ab] hover:underline cursor-pointer"
            >
              Remove
            </button>
          </div>
        )}

        {/* Input Control Tray */}
        <div className="p-4 bg-gradient-to-t from-black to-transparent border-t border-[#cac5cc]/10 flex flex-col gap-2">
          
          <form onSubmit={handleSendMessage} className="flex items-center gap-2 relative">
            <input 
              type="text"
              placeholder={isTranscribing ? "Transcribing your voice..." : isListening ? "Listening... Click mic to stop." : "Query AI diagnostic logs, or describe fault signals..."}
              className="flex-1 text-xs pl-4 pr-32 py-3 rounded-2xl bg-[#1c1b1d] border border-white/5 focus:border-cyan-400 text-white placeholder-neutral-500 focus:outline-none transition-all"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            {/* Action buttons inside bar */}
            <div className="absolute right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-1.5 rounded-lg transition-all cursor-pointer flex items-center justify-center ${
                  isListening 
                    ? 'text-red-400 bg-red-950/20 border border-red-500/35 animate-pulse' 
                    : 'text-[#cac5cc]/60 hover:text-cyan-400 hover:bg-white/5'
                }`}
                title={isListening ? "Listening... click to stop" : "Voice Input (Speech to Text)"}
              >
                {isListening ? (
                  <MicOff className="w-3.5 h-3.5" />
                ) : (
                  <Mic className="w-3.5 h-3.5" />
                )}
              </button>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-lg text-[#cac5cc]/60 hover:text-cyan-400 hover:bg-white/5 transition-all cursor-pointer"
                title="Attach fault signals image"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>
              
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>

          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef}
            className="hidden" 
            accept="image/*"
            onChange={handleImageUploaded}
          />

          {/* Shortcut Prompt chips */}
          <div className="flex flex-wrap gap-2.5 mt-1 select-none">
            <button 
              type="button"
              onClick={() => setInputText('How is the current status of Conveyor Beta? My belt is making a heavy squealing sound under tension.')}
              className="text-[10px] px-2.5 py-1 rounded bg-white/5 border border-white/5 text-[#cac5cc]/75 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              Squealing Noise
            </button>
            <button 
              type="button"
              onClick={() => setInputText('Spindle axis thermal sensor is indicating 115 degrees Celsius. Should I stop the production?')}
              className="text-[10px] px-2.5 py-1 rounded bg-white/5 border border-white/5 text-[#cac5cc]/75 hover:bg-white/10 hover:text-white transition-all cursor-pointer"
            >
              Overheating Spindle
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}
