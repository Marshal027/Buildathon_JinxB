import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Paperclip,
  Trash2,
  TrendingUp
} from 'lucide-react';

export default function ChatPage({ 
  messages, 
  onSubmitMessage, 
  onClearSession,
  machines,
  onAddTicket
}) {
  const [inputText, setInputText] = useState('');
  const [attachedImage, setAttachedImage] = useState(null);
  const [createdTicketMessageIds, setCreatedTicketMessageIds] = useState({});
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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
        
        {/* Module 1: AI Forecasting Gauges */}
        <div className="p-5 bg-[#141314]/50 border border-[#cac5cc]/10 rounded-2xl flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">AI Failure Prediction Models</h3>
          </div>

          <div className="flex flex-col gap-3.5">
            
            {/* Gauge 1: Extruder Alpha */}
            <div className="p-3 bg-[#1c1b1d] border border-white/5 rounded-xl">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-white/90">EX-02 Extruder Alpha</span>
                <span className="text-[10px] font-mono font-bold text-[#b0cbd8] px-2 py-0.5 rounded bg-[#b0cbd8]/10 border border-[#b0cbd8]/20">12% Prob / Normal</span>
              </div>
              <div className="w-full h-1.5 bg-[#2b292b] rounded-full overflow-hidden">
                <div className="w-[12%] h-full bg-[#b0cbd8] rounded-full"></div>
              </div>
            </div>

            {/* Gauge 2: Conveyor Beta */}
            <div className="p-3 bg-[#1e1919] border border-[#ffb4ab]/10 rounded-xl">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-white/90">T-42 Conveyor Beta</span>
                <span className="text-[10px] font-mono font-bold text-[#ffb4ab] px-2 py-0.5 rounded bg-red-950/20 border border-[#ffb4ab]/20 animate-pulse">78% Failure Risk / Critical</span>
              </div>
              <div className="w-full h-1.5 bg-[#2b292b] rounded-full overflow-hidden">
                <div className="w-[78%] h-full bg-[#ffb4ab] rounded-full"></div>
              </div>
            </div>

            {/* Gauge 3: Cooling Unit */}
            <div className="p-3 bg-[#1c1b1d] border border-white/5 rounded-xl">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="font-semibold text-white/90">CLS-042 Cooling Unit</span>
                <span className="text-[10px] font-mono font-bold text-[#9cd2b8] px-2 py-0.5 rounded bg-[#9cd2b8]/10 border border-[#9cd2b8]/20">4% Prob / Stable</span>
              </div>
              <div className="w-full h-1.5 bg-[#2b292b] rounded-full overflow-hidden">
                <div className="w-[4%] h-full bg-[#9cd2b8] rounded-full"></div>
              </div>
            </div>

          </div>
        </div>

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
              placeholder="Query AI diagnostic logs, or describe fault signals..."
              className="flex-1 text-xs pl-4 pr-24 py-3 rounded-2xl bg-[#1c1b1d] border border-white/5 focus:border-cyan-400 text-white placeholder-neutral-500 focus:outline-none transition-all"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />
            
            {/* Action buttons inside bar */}
            <div className="absolute right-2 flex items-center gap-1">
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
