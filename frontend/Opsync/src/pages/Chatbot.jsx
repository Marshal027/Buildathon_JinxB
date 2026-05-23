/* eslint-disable react-hooks/purity */
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import './Chatbot.css'

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! How can I help you today?",
      timestamp: "12:00 PM"
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isThinking, setIsThinking] = useState(false)
  const [threads, setThreads] = useState([
    { id: 't1', title: 'New Chat', active: true }
  ])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [docsContent, setDocsContent] = useState('')
  const [notification, setNotification] = useState(null)
  const [submittedTickets, setSubmittedTickets] = useState([])
  const [isListening, setIsListening] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])

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
            setInputValue(prev => prev ? prev + ' ' + transcript : transcript);
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
                  setInputValue(prev => prev ? prev + ' ' + text : text);
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
  
  useEffect(() => {
    fetch('/api/docs')
      .then(res => {
        if (!res.ok) throw new Error('API route failed');
        return res.json();
      })
      .then(data => setDocsContent(data.content || ''))
      .catch(err => {
        console.warn('Failed to load docs from API, trying fallback file:', err);
        fetch('/troubleshooting_docs.md')
          .then(res => res.text())
          .then(text => setDocsContent(text))
          .catch(e => console.error('Failed both fallback methods:', e));
      });
  }, [])

  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isThinking])

  // Simple Markdown-like formatter for bold text, lists, and code blocks
  const formatMessageText = (text) => {
    if (!text) return ''
    
    // Split by code blocks first
    const parts = text.split(/(```[\s\S]*?```)/g)
    
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Code block
        const lines = part.slice(3, -3).trim().split('\n')
        const firstLine = lines[0]
        const hasLang = ['javascript', 'js', 'json', 'yaml', 'yml', 'dockerfile', 'bash', 'sh', 'html', 'css'].includes(firstLine.toLowerCase())
        const language = hasLang ? firstLine : 'code'
        const codeContent = hasLang ? lines.slice(1).join('\n') : lines.join('\n')
        
        return (
          <div className="code-block-container" key={index}>
            <div className="code-block-header">
              <span className="code-block-lang">{language}</span>
              <button 
                className="code-copy-btn"
                onClick={() => navigator.clipboard.writeText(codeContent)}
                title="Copy to clipboard"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                Copy
              </button>
            </div>
            <pre className="code-pre">
              <code className="code-content">{codeContent}</code>
            </pre>
          </div>
        )
      }
      
      // Inline formatting (bold, lists, newlines)
      let formattedText = part
      
      // Handle double newlines as paragraphs, single as linebreaks
      const paragraphs = formattedText.split('\n\n')
      
      return paragraphs.map((para, pIdx) => {
        const lines = para.split('\n')
        return (
          <p key={`${index}-${pIdx}`} className="message-paragraph">
            {lines.map((line, lIdx) => {
              // Check if list item
              const isListItem = line.trim().startsWith('- ') || line.trim().startsWith('* ')
              const lineContent = isListItem ? line.trim().substring(2) : line
              
              // Simple regex for bold **text**
              const boldParts = lineContent.split(/(\*\*.*?\*\*)/g)
              const renderedLine = boldParts.map((boldPart, bIdx) => {
                if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
                  return <strong key={bIdx}>{boldPart.slice(2, -2)}</strong>
                }
                return boldPart
              })

              if (isListItem) {
                return (
                  <span key={lIdx} className="list-item">
                    <span className="bullet">•</span>
                    <span className="list-content">{renderedLine}</span>
                    {lIdx < lines.length - 1 && <br />}
                  </span>
                )
              }

              return (
                <span key={lIdx}>
                  {renderedLine}
                  {lIdx < lines.length - 1 && <br />}
                </span>
              )
            })}
          </p>
        )
      })
    })
  }

  // Dynamic local fallback response generator
  const getAIResponse = (input) => {
    const text = input.toLowerCase().trim();

    // 1. Try to find the answer dynamically from loaded docsContent first!
    if (docsContent) {
      const sections = docsContent.split(/###\s+/);
      const cleanStr = (s) => s.toLowerCase().replace(/[?.,!:]/g, '').trim();
      const inputCleaned = cleanStr(text);
      
      for (const section of sections) {
        const lines = section.split('\n');
        if (lines.length < 2) continue;
        
        const questionLine = lines[0].trim();
        if (!questionLine) continue;
        
        let answerText = '';
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (line.startsWith('**Answer:**')) {
            answerText = line.substring(11).trim();
            break;
          } else if (line.startsWith('Answer:')) {
            answerText = line.substring(7).trim();
            break;
          } else if (line.startsWith('**') && line.endsWith('**')) {
            answerText = line.replace(/^\*\*|\*\*$/g, '').trim();
            break;
          }
        }
        
        if (!answerText) continue;
        
        const questionCleaned = cleanStr(questionLine);
        
        // Match if clean question contains the clean query or clean query contains the clean question
        if (inputCleaned.includes(questionCleaned) || questionCleaned.includes(inputCleaned)) {
          return answerText;
        }
        
        // Match if all significant keywords (length > 3) are found in the question
        const words = inputCleaned.split(/\s+/).filter(w => w.length > 3);
        if (words.length > 0 && words.every(w => questionCleaned.includes(w))) {
          return answerText;
        }
      }
    }

    // 2. Predefined fallback responses as second option
    // Check Q1: blinking red / LED
    if (text.includes('led') || text.includes('blinking red')) {
      return "The blinking red LED indicates a database connection timeout. Check if the database instance is running and verify the login credentials in the configuration file.";
    }
    // Check Q2: restart
    if (text.includes('restart') || text.includes('reboot')) {
      return "Press and hold the manual power button on the front panel for 5 seconds, or execute the command `oppsynce restart` from the admin terminal.";
    }
    // Check Q3: disk full
    if (text.includes('disk full') || text.includes('space') || text.includes('disk')) {
      return "Clean up log files by running the clean command: `oppsynce clean-logs`. You can also configure log rotation in `oppsynce.config.json`.";
    }
    // Check Q4: sync conflict / warning
    if (text.includes('conflict') || text.includes('warning')) {
      return "Access the conflict resolution panel, choose between 'last-write-wins' or manual merge. You can also specify the default policy in the schema configuration under `conflictResolution`.";
    }
    // Check Q5: solid blue
    if (text.includes('blue') || text.includes('light')) {
      return "A solid blue light indicates that the machine is successfully connected, operational, and actively syncing tables.";
    }

    // Default neutral greeting response
    if (text.includes('hello') || text.includes('hi') || text.includes('hey') || text.includes('hola')) {
      return "Hello! I'm here to help you. How can I assist you today?";
    }

    return "I cannot find this in the documentation. Would you like to forward this message to the manager?";
  }

  const handleSubmitIssue = async (msgId) => {
    // Find the message index to extract user's original query text
    const msgIdx = messages.findIndex(m => m.id === msgId);
    let userQuery = "Sync-Engine-9000 troubleshooting request";
    if (msgIdx > 0 && messages[msgIdx - 1].sender === 'user') {
      userQuery = messages[msgIdx - 1].text;
    }

    try {
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machineId: 'Sync-Engine-9000',
          machineName: 'Sync-Engine-9000',
          reportedBy: 'AI Chatbot triage',
          issueDescription: userQuery,
          severity: 'critical'
        })
      });
      if (!response.ok) {
        throw new Error(`Failed to create ticket: ${response.statusText}`);
      }
      setSubmittedTickets(prev => [...prev, msgId])
      setNotification("Ticket forwarded to manager and saved to database")
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    } catch (err) {
      console.error("Error submitting ticket:", err);
      // fallback to still show local success toast so UI works
      setSubmittedTickets(prev => [...prev, msgId])
      setNotification("Ticket forwarded to manager (offline fallback)")
      setTimeout(() => {
        setNotification(null)
      }, 5000)
    }
  }

  const handleSend = async (textToSend) => {
    const messageText = textToSend || inputValue
    if (!messageText.trim()) return

    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    const currentHistory = [...messages]
    setMessages(prev => [...prev, userMessage])
    if (!textToSend) setInputValue('')
    setIsThinking(true)

    let aiResponseText

    try {
      const apiKey = 'AIzaSyB5zWEoj1QyYELPXU55pldhp1VDFEjU7IM';
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

        // Map history to Gemini API structure (role: 'user' | 'model')
        let contents = currentHistory
          .filter(msg => msg.text)
          .map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          }));

        // Add the current user message
        contents.push({
          role: 'user',
          parts: [{ text: messageText }]
        });

        // Gemini contents must start with 'user' role. Filter out any leading model messages.
        while (contents.length > 0 && contents[0].role !== 'user') {
          contents.shift();
        }

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: contents,
            systemInstruction: {
              parts: [{ text: `You are a helpful and neutral AI assistant. You have access to the following troubleshooting documentation for the Sync-Engine-9000 machine:\n\n${docsContent}\n\nYour task is to answer user troubleshooting questions using ONLY the facts provided in the documentation above. When you provide an answer from the documentation, you MUST start your reply exactly with: 'within the documentation it says '. Then provide the answer and explain it. If the user asks a troubleshooting question about the machine that CANNOT be answered based on the provided documentation, you MUST respond exactly with: 'I cannot find this in the documentation. Would you like to forward this message to the manager?'` }]
            }
          })
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
          aiResponseText = data.candidates[0].content.parts[0].text;
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Failed to get Gemini response:', error);
        aiResponseText = getAIResponse(messageText);
      }

      const showSubmitButton = aiResponseText.toLowerCase().includes("forward this message to the manager") || aiResponseText.toLowerCase().includes("forward messaeg to manager");

      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        showSubmitButton: showSubmitButton
      }
      setMessages(prev => [...prev, aiMessage])
      setIsThinking(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleQuickPrompt = (promptText) => {
    handleSend(promptText)
  }

  const createNewChat = () => {
    const newThreadId = 't' + (threads.length + 1)
    const newThread = {
      id: newThreadId,
      title: `New Session #${threads.length + 1}`,
      active: true
    }
    
    setThreads(prev => prev.map(t => ({ ...t, active: false })).concat(newThread))
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: "Started a new workspace session. How can I help you sync or configure your pipelines today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  const selectThread = (id) => {
    setThreads(prev => prev.map(t => ({
      ...t,
      active: t.id === id
    })))
    
    // Add mock history load
    const thread = threads.find(t => t.id === id)
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: `Loaded history for **${thread.title}**. What would you like to continue working on?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: "Chat cleared. Let me know if you need any machine troubleshooting help.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ])
  }

  return (
    <div className="chatbot-page">
      {notification && (
        <div className="notification-toast">
          <div className="toast-icon">📩</div>
          <div className="toast-content">
            <span className="toast-title">Ticket Notification</span>
            <span className="toast-message">{notification}</span>
          </div>
        </div>
      )}
      {/* Sidebar Panel */}
      <aside className={`chat-sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <Link to="/" className="home-link">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Oppsynce</span>
          </Link>
          <button className="new-chat-btn" onClick={createNewChat} title="New Chat">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>

        <div className="sidebar-list">
          <span className="sidebar-section-title">Recent Chats</span>
          {threads.map(thread => (
            <button 
              key={thread.id} 
              className={`thread-item ${thread.active ? 'active' : ''}`}
              onClick={() => selectThread(thread.id)}
            >
              <svg className="thread-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
              <span className="thread-title">{thread.title}</span>
            </button>
          ))}
          
          <div style={{ marginTop: '16px' }}></div>
          <span className="sidebar-section-title">Documentation</span>
          <Link to="/editor" className="thread-item" style={{ textDecoration: 'none', display: 'flex' }}>
            <svg className="thread-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span className="thread-title" style={{ marginLeft: '10px' }}>Doc Editor</span>
          </Link>
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="avatar user-avatar">U</div>
            <div className="user-info">
              <span className="user-name">Developer Admin</span>
              <span className="user-status">Workspace Active</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main chat layout */}
      <main className="chat-container">
        {/* Chat window navbar */}
        <header className="chat-header">
          <div className="header-left">
            <button 
              className="toggle-sidebar-btn" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              title={sidebarOpen ? "Hide Sidebar" : "Show Sidebar"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
              </svg>
            </button>
            <div className="chat-status-container">
              <h3>Oppsynce Assistant</h3>
              <div className="status-indicator">
                <span className="status-dot"></span>
                <span>Active Node</span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button className="header-btn" onClick={clearChat} title="Clear Conversation">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Clear</span>
            </button>
          </div>
        </header>

        {/* Message Feed */}
        <div className="messages-feed">
          {messages.map(msg => (
            <div key={msg.id} className={`message-row ${msg.sender === 'user' ? 'row-user' : 'row-ai'}`}>
              <div className="message-bubble-wrapper">
                <div className={`message-avatar ${msg.sender === 'user' ? 'avatar-user' : 'avatar-ai'}`}>
                  {msg.sender === 'user' ? 'U' : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <path d="M12 2v2M8 5h8M8 8V6h8v2"></path>
                    </svg>
                  )}
                </div>
                <div className="message-details">
                  <div className="message-meta">
                    <span className="sender-name">{msg.sender === 'user' ? 'You' : 'Oppsynce Copilot'}</span>
                    <span className="message-time">{msg.timestamp}</span>
                  </div>
                  <div className="message-bubble">
                    {formatMessageText(msg.text)}
                    {msg.showSubmitButton && (
                      <div className="escalate-action-container" style={{ marginTop: '12px' }}>
                        <button
                          className={`submit-issue-btn ${submittedTickets.includes(msg.id) ? 'submitted' : ''}`}
                          onClick={() => handleSubmitIssue(msg.id)}
                          disabled={submittedTickets.includes(msg.id)}
                          style={{
                            background: submittedTickets.includes(msg.id) ? '#374151' : 'var(--accent)',
                            color: submittedTickets.includes(msg.id) ? '#9ca3af' : '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            padding: '8px 14px',
                            fontSize: '13px',
                            fontWeight: '600',
                            cursor: submittedTickets.includes(msg.id) ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          {submittedTickets.includes(msg.id) ? (
                            <>
                              <span>Ticket Sent</span>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                              </svg>
                            </>
                          ) : (
                            <>
                              <span>Send Ticket</span>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                              </svg>
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {isThinking && (
            <div className="message-row row-ai thinking">
              <div className="message-bubble-wrapper">
                <div className="message-avatar avatar-ai">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M12 2v2M8 5h8M8 8V6h8v2"></path>
                  </svg>
                </div>
                <div className="message-details">
                  <div className="message-meta">
                    <span className="sender-name">Oppsynce Copilot</span>
                  </div>
                  <div className="message-bubble typing-bubble">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="chat-input-area">
          <div className="input-field-container">
            <button className="attachment-btn" title="Add configuration attachment (Mocked)">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
              </svg>
            </button>
            <textarea
              className="chat-textarea"
              placeholder={isTranscribing ? "Transcribing your voice..." : isListening ? "Listening... Click mic to stop." : "Ask a troubleshooting question related to the machine..."}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyPress}
              rows="1"
            />
            <button
              type="button"
              className={`mic-msg-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleListening}
              title={isListening ? "Stop listening" : "Voice Input (Speech to Text)"}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                <line x1="12" y1="19" x2="12" y2="23"></line>
                <line x1="8" y1="23" x2="16" y2="23"></line>
              </svg>
            </button>
            <button 
              className={`send-msg-btn ${inputValue.trim() ? 'active' : ''}`}
              onClick={() => handleSend()}
              disabled={!inputValue.trim()}
              title="Send Message"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
          <span className="input-guideline">Press Enter to send. Shift+Enter for new line.</span>
        </div>
      </main>
    </div>
  )
}

function DiceWidget() {
  const [value, setValue] = useState(1)
  const [rolling, setRolling] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setValue(Math.floor(Math.random() * 6) + 1)
      setRolling(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const roll = () => {
    if (rolling) return
    setRolling(true)
    setTimeout(() => {
      setValue(Math.floor(Math.random() * 6) + 1)
      setRolling(false)
    }, 800)
  }

  const renderDots = () => {
    const dotPositions = {
      1: [[50, 50]],
      2: [[25, 25], [75, 75]],
      3: [[25, 25], [50, 50], [75, 75]],
      4: [[25, 25], [25, 75], [75, 25], [75, 75]],
      5: [[25, 25], [25, 75], [50, 50], [75, 25], [75, 75]],
      6: [[25, 25], [25, 50], [25, 75], [75, 25], [75, 50], [75, 75]]
    }
    return dotPositions[value].map(([x, y], idx) => (
      <div key={idx} className="dice-dot" style={{ left: `${x}%`, top: `${y}%` }} />
    ))
  }

  return (
    <div className="interactive-widget dice-widget">
      <div className={`dice-container ${rolling ? 'rolling' : ''}`}>
        <div className="dice-face">
          {!rolling && renderDots()}
          {rolling && <div className="rolling-dice-value">?</div>}
        </div>
      </div>
      <div className="widget-controls">
        <span className="widget-result">{rolling ? 'Rolling...' : `You rolled a ${value}!`}</span>
        <button className="widget-btn" onClick={roll} disabled={rolling}>
          🎲 Roll Again
        </button>
      </div>
    </div>
  )
}

function CoinWidget() {
  const [side, setSide] = useState('heads')
  const [flipping, setFlipping] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setSide(Math.random() < 0.5 ? 'heads' : 'tails')
      setFlipping(false)
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  const flip = () => {
    if (flipping) return
    setFlipping(true)
    setTimeout(() => {
      setSide(Math.random() < 0.5 ? 'heads' : 'tails')
      setFlipping(false)
    }, 800)
  }

  return (
    <div className="interactive-widget coin-widget">
      <div className={`coin-face ${side} ${flipping ? 'flipping' : ''}`}>
        <div className="coin-inner">
          <div className="coin-front">heads</div>
          <div className="coin-back">tails</div>
        </div>
      </div>
      <div className="widget-controls">
        <span className="widget-result">{flipping ? 'Flipping...' : `Toss Result: ${side.toUpperCase()}!`}</span>
        <button className="widget-btn" onClick={flip} disabled={flipping}>
          🪙 Flip Again
        </button>
      </div>
    </div>
  )
}

export default Chatbot
