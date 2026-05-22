import React, { useState, useEffect } from 'react';
import { 
  Mail, 
  Inbox, 
  Send, 
  Trash2, 
  Archive, 
  PenSquare, 
  Search, 
  Filter, 
  Clock, 
  User, 
  CornerUpLeft, 
  AlertTriangle,
  CheckCircle,
  X,
  Loader
} from 'lucide-react';

export default function MailSystemPage() {
  const [emails, setEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEmailId, setSelectedEmailId] = useState(null);
  const [activeFolder, setActiveFolder] = useState('inbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  
  // Compose modal state
  const [isComposing, setIsComposing] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composePriority, setComposePriority] = useState('normal');
  const [composeBody, setComposeBody] = useState('');
  
  // Notification toast state
  const [toastMessage, setToastMessage] = useState(null);

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/emails/');
      if (res.ok) {
        const data = await res.json();
        setEmails(data);
        if (data.length > 0) {
          // Find first email for current active folder
          const firstInFolder = data.find(e => e.folder === activeFolder);
          if (firstInFolder) {
            setSelectedEmailId(firstInFolder.id);
          } else {
            setSelectedEmailId(data[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching emails:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const selectedEmail = emails.find(e => e.id === selectedEmailId);

  // Filtered emails list
  const filteredEmails = emails.filter(email => {
    const matchesFolder = email.folder === activeFolder;
    const matchesSearch = 
      email.sender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || email.priority === priorityFilter;
    
    return matchesFolder && matchesSearch && matchesPriority;
  });

  const handleSelectEmail = async (id) => {
    setSelectedEmailId(id);
    const email = emails.find(e => e.id === id);
    if (email && !email.read) {
      // Optimistically mark as read
      setEmails(prev => prev.map(e => e.id === id ? { ...e, read: true } : e));
      try {
        await fetch(`/api/emails/${id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ read: true })
        });
      } catch (err) {
        console.error("Error marking email as read:", err);
      }
    }
  };

  const handleDeleteEmail = async (id) => {
    const email = emails.find(e => e.id === id);
    if (!email) return;

    if (email.folder === 'trash') {
      // Permanently delete
      setEmails(prev => prev.filter(e => e.id !== id));
      try {
        await fetch(`/api/emails/${id}/`, { method: 'DELETE' });
        triggerToast("Message permanently deleted");
      } catch (err) {
        console.error("Error deleting email:", err);
      }
    } else {
      // Move to trash folder
      setEmails(prev => prev.map(e => e.id === id ? { ...e, folder: 'trash' } : e));
      try {
        await fetch(`/api/emails/${id}/`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ folder: 'trash' })
        });
        triggerToast("Message moved to Trash");
      } catch (err) {
        console.error("Error moving email to trash:", err);
      }
    }

    // Select another email if the deleted one was selected
    if (selectedEmailId === id) {
      const remaining = emails.filter(e => e.id !== id && e.folder === activeFolder);
      if (remaining.length > 0) {
        setSelectedEmailId(remaining[0].id);
      } else {
        setSelectedEmailId(null);
      }
    }
  };

  const handleArchiveEmail = async (id) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, folder: 'archive' } : e));
    try {
      await fetch(`/api/emails/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder: 'archive' })
      });
      triggerToast("Message archived");
    } catch (err) {
      console.error("Error archiving email:", err);
    }
    if (selectedEmailId === id) {
      const remaining = emails.filter(e => e.id !== id && e.folder === activeFolder);
      if (remaining.length > 0) {
        setSelectedEmailId(remaining[0].id);
      } else {
        setSelectedEmailId(null);
      }
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!composeTo.trim() || !composeSubject.trim() || !composeBody.trim()) {
      alert("Please fill in all composition fields.");
      return;
    }

    const payload = {
      sender: 'Admin Supervisor',
      sender_role: 'manager',
      recipient: composeTo,
      subject: composeSubject,
      body: composeBody,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: 'Today',
      priority: composePriority,
      read: true,
      folder: 'sent'
    };

    try {
      const res = await fetch('/api/emails/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const newEmail = await res.json();
        setEmails(prev => [newEmail, ...prev]);
        setIsComposing(false);
        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        setComposePriority('normal');
        triggerToast("Email dispatched successfully");
        // Automatically select the newly created sent email if viewing sent
        if (activeFolder === 'sent') {
          setSelectedEmailId(newEmail.id);
        }
      } else {
        alert("Failed to save and send email.");
      }
    } catch (err) {
      console.error("Error sending email:", err);
    }
  };

  const handleReply = (email) => {
    setComposeTo(email.sender);
    setComposeSubject(`RE: ${email.subject}`);
    setComposePriority(email.priority);
    setComposeBody(`\n\n--- On ${email.date} at ${email.timestamp}, ${email.sender} wrote:\n> ${email.body}`);
    setIsComposing(true);
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-[#ffb4ab]/15 border-[#ffb4ab]/30 text-[#ffb4ab]';
      case 'high':
        return 'bg-amber-500/15 border-amber-500/30 text-amber-300';
      case 'normal':
        return 'bg-[#9cd2b8]/15 border-[#9cd2b8]/30 text-[#9cd2b8]';
      case 'low':
        return 'bg-[#cac5cc]/15 border-[#cac5cc]/30 text-[#cac5cc]/80';
      default:
        return 'bg-neutral-800 text-neutral-400';
    }
  };

  const getSenderAvatarColor = (role) => {
    switch (role) {
      case 'manager':
        return 'from-[#265a46] to-[#4e6158] text-[#9acfb6]';
      case 'engineer':
        return 'from-[#2a4e61] to-[#4a5861] text-[#9abecf]';
      case 'operator':
        return 'from-[#5b4a61] to-[#4e4252] text-[#d6bfe0]';
      case 'system':
        return 'from-[#612a2a] to-[#4a3636] text-[#cf9a9a]';
      default:
        return 'from-neutral-700 to-neutral-800 text-neutral-300';
    }
  };

  return (
    <div className="flex flex-col h-screen p-4 lg:p-6 overflow-hidden max-w-[1600px] mx-auto w-full text-white relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[#1c1b1d] border border-[#9cd2b8]/30 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5 z-[1000] animate-bounce">
          <CheckCircle className="w-4 h-4 text-[#9cd2b8]" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 select-none pb-4 border-b border-white/5 shrink-0">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-white uppercase flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#9cd2b8]" />
            Opsync Mail System
          </h2>
          <p className="text-xs text-[#cac5cc]/60 mt-0.5">Secure internal communications for engineering and management staff</p>
        </div>

        <button
          onClick={() => setIsComposing(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#9cd2b8] text-black font-semibold text-xs active:scale-95 transition-all shadow-[0_0_20px_rgba(156,210,184,0.2)] hover:shadow-[0_0_25px_rgba(156,210,184,0.4)] cursor-pointer"
        >
          <PenSquare className="w-4 h-4" />
          Compose Mail
        </button>
      </div>

      {/* Main Mail Dashboard Body */}
      <div className="flex-1 flex gap-5 mt-5 min-h-0">
        
        {/* Sidebar Folders */}
        <div className="w-48 hidden md:flex flex-col gap-1.5 shrink-0">
          <button
            onClick={() => {
              setActiveFolder('inbox');
              const firstInFolder = emails.find(e => e.folder === 'inbox');
              if (firstInFolder) setSelectedEmailId(firstInFolder.id);
            }}
            className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeFolder === 'inbox'
                ? 'bg-[#9cd2b8]/15 border-l-2 border-[#9cd2b8] text-[#9cd2b8]'
                : 'text-[#cac5cc]/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Inbox className="w-4 h-4" />
              <span>Inbox</span>
            </div>
            {emails.filter(e => e.folder === 'inbox' && !e.read).length > 0 && (
              <span className="bg-[#9cd2b8] text-black px-1.5 py-0.5 rounded-full text-[9px] font-bold">
                {emails.filter(e => e.folder === 'inbox' && !e.read).length}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              setActiveFolder('sent');
              const firstInFolder = emails.find(e => e.folder === 'sent');
              if (firstInFolder) setSelectedEmailId(firstInFolder.id);
            }}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeFolder === 'sent'
                ? 'bg-[#9cd2b8]/15 border-l-2 border-[#9cd2b8] text-[#9cd2b8]'
                : 'text-[#cac5cc]/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Sent Messages</span>
          </button>

          <button
            onClick={() => {
              setActiveFolder('archive');
              const firstInFolder = emails.find(e => e.folder === 'archive');
              if (firstInFolder) setSelectedEmailId(firstInFolder.id);
            }}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeFolder === 'archive'
                ? 'bg-[#9cd2b8]/15 border-l-2 border-[#9cd2b8] text-[#9cd2b8]'
                : 'text-[#cac5cc]/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>Archive</span>
          </button>

          <button
            onClick={() => {
              setActiveFolder('trash');
              const firstInFolder = emails.find(e => e.folder === 'trash');
              if (firstInFolder) setSelectedEmailId(firstInFolder.id);
            }}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeFolder === 'trash'
                ? 'bg-[#9cd2b8]/15 border-l-2 border-[#9cd2b8] text-[#9cd2b8]'
                : 'text-[#cac5cc]/70 hover:bg-white/5 hover:text-white'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            <span>Trash Bin</span>
          </button>
        </div>

        {/* Mails List Pane */}
        <div className="w-full md:w-96 flex flex-col gap-3 bg-[#141314]/50 border border-white/5 rounded-2xl p-3.5 shrink-0 min-h-0">
          
          {/* Controls */}
          <div className="flex flex-col gap-2 shrink-0">
            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-[#cac5cc]/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input 
                type="text"
                placeholder="Search mail contents..."
                className="text-xs pl-8 pr-3 py-2 rounded-xl bg-white/5 border border-white/5 text-white placeholder-neutral-500 focus:outline-none focus:border-[#9cd2b8] w-full transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1.5 bg-white/5 p-1 rounded-lg">
              <Filter className="w-3 h-3 text-[#cac5cc]/50 ml-1.5" />
              <select 
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-transparent text-[11px] text-[#cac5cc] px-1 cursor-pointer focus:outline-none w-full"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical Alarm</option>
                <option value="high">High Alert</option>
                <option value="normal">Normal info</option>
                <option value="low">Low Priority</option>
              </select>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-neutral-500 gap-2">
                <Loader className="w-5 h-5 animate-spin text-[#9cd2b8]" />
                <span className="text-[11px]">Syncing emails...</span>
              </div>
            ) : filteredEmails.length === 0 ? (
              <div className="text-center py-10 text-xs text-[#cac5cc]/40">
                No mail found in this folder
              </div>
            ) : (
              filteredEmails.map(email => (
                <div
                  key={email.id}
                  onClick={() => handleSelectEmail(email.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer select-none flex flex-col gap-1.5 relative group ${
                    selectedEmailId === email.id
                      ? 'bg-[#9cd2b8]/10 border-[#9cd2b8]/30 shadow-md'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  {/* Unread indicator */}
                  {!email.read && (
                    <div className="absolute top-3 right-3 w-1.5 h-1.5 rounded-full bg-[#9cd2b8] animate-pulse"></div>
                  )}

                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-neutral-300 truncate w-32">
                      {email.sender}
                    </span>
                    <span className="text-[9px] text-neutral-500">
                      {email.timestamp}
                    </span>
                  </div>

                  <div className="text-xs font-semibold text-white truncate max-w-[280px]">
                    {email.subject}
                  </div>

                  <div className="text-[11px] text-[#cac5cc]/60 line-clamp-2 max-w-[280px]">
                    {email.body}
                  </div>

                  <div className="flex items-center justify-between mt-1">
                    <span className={`text-[9px] font-mono border px-1.5 py-0.5 rounded capitalize ${getPriorityBadgeColor(email.priority)}`}>
                      {email.priority}
                    </span>
                    
                    {/* Instant delete button on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteEmail(email.id);
                      }}
                      className="p-1 rounded bg-[#ba1a1a]/20 hover:bg-[#ba1a1a]/40 border border-[#ffb4ab]/30 text-[#ffb4ab] opacity-0 group-hover:opacity-100 transition-all duration-200 active:scale-90 cursor-pointer"
                      title={email.folder === 'trash' ? 'Delete Permanently' : 'Move to Trash'}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Detailed Mail View Pane */}
        <div className="flex-1 hidden md:flex flex-col bg-[#141314]/50 border border-white/5 rounded-2xl p-5 min-h-0 relative">
          {selectedEmail ? (
            <div className="flex flex-col h-full">
              {/* Mail Meta Header */}
              <div className="flex justify-between items-start pb-4 border-b border-white/5 shrink-0">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${getSenderAvatarColor(selectedEmail.sender_role)} flex items-center justify-center font-bold text-xs uppercase shadow-inner`}>
                    {selectedEmail.sender.slice(0, 2)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-white">{selectedEmail.sender}</h3>
                      <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-[#cac5cc]/60 capitalize">{selectedEmail.sender_role}</span>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      To: {selectedEmail.recipient}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className="text-[10px] text-neutral-400 flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {selectedEmail.date} at {selectedEmail.timestamp}
                  </span>
                  <span className={`text-[9px] font-mono border px-1.5 py-0.5 rounded uppercase font-bold tracking-tight ${getPriorityBadgeColor(selectedEmail.priority)}`}>
                    {selectedEmail.priority} Priority
                  </span>
                </div>
              </div>

              {/* Subject Title */}
              <h2 className="text-base font-bold text-white mt-5 mb-3 select-text leading-tight shrink-0">
                {selectedEmail.subject}
              </h2>

              {/* Mail Content Body */}
              <div className="flex-1 overflow-y-auto text-xs text-[#cac5cc] leading-relaxed whitespace-pre-wrap select-text pr-2 py-2">
                {selectedEmail.body}
              </div>

              {/* Message Action Controls */}
              <div className="flex items-center gap-2.5 pt-4 border-t border-white/5 shrink-0 mt-auto">
                <button
                  onClick={() => handleReply(selectedEmail)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold active:scale-95 transition-all border border-white/10 cursor-pointer"
                >
                  <CornerUpLeft className="w-3.5 h-3.5 text-[#9cd2b8]" />
                  Reply Message
                </button>

                {selectedEmail.folder !== 'archive' && (
                  <button
                    onClick={() => handleArchiveEmail(selectedEmail.id)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold active:scale-95 transition-all border border-white/10 cursor-pointer"
                  >
                    <Archive className="w-3.5 h-3.5 text-neutral-400" />
                    Archive
                  </button>
                )}

                <button
                  onClick={() => handleDeleteEmail(selectedEmail.id)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#ba1a1a]/15 hover:bg-[#ba1a1a]/25 text-[#ffb4ab] text-xs font-semibold active:scale-95 transition-all border border-[#ffb4ab]/25 cursor-pointer ml-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {selectedEmail.folder === 'trash' ? 'Delete Permanently' : 'Delete'}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-2 select-none">
              <Mail className="w-8 h-8 opacity-40 text-neutral-400" />
              <span className="text-xs">Select a message from the panel to read its details</span>
            </div>
          )}
        </div>

      </div>

      {/* Compose Dialog Modal */}
      {isComposing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4">
          <div className="bg-[#1c1b1d] border border-white/10 rounded-2xl w-full max-w-lg p-5 flex flex-col gap-4 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <h3 className="text-sm font-bold uppercase tracking-tight flex items-center gap-2">
                <PenSquare className="w-4 h-4 text-[#9cd2b8]" />
                New Dispatch Mail
              </h3>
              <button 
                onClick={() => setIsComposing(false)}
                className="p-1 hover:bg-white/10 rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-neutral-400 uppercase font-semibold">Recipient Email / Target</label>
                <input 
                  type="text" 
                  placeholder="e.g. sarah.miller@opsync.com"
                  required
                  className="bg-white/5 border border-white/5 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#9cd2b8] text-white"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-400 uppercase font-semibold">Subject</label>
                  <input 
                    type="text" 
                    placeholder="Subject title"
                    required
                    className="bg-white/5 border border-white/5 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#9cd2b8] text-white"
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[10px] text-neutral-400 uppercase font-semibold">Priority Level</label>
                  <select 
                    className="bg-white/5 border border-white/5 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#9cd2b8] text-white cursor-pointer"
                    value={composePriority}
                    onChange={(e) => setComposePriority(e.target.value)}
                  >
                    <option value="low">Low Priority</option>
                    <option value="normal">Normal</option>
                    <option value="high">High Alert</option>
                    <option value="critical">Critical Alarm</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-neutral-400 uppercase font-semibold">Message Body</label>
                <textarea 
                  rows="6"
                  placeholder="Draft your dispatch message details here..."
                  required
                  className="bg-white/5 border border-white/5 rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-[#9cd2b8] text-white resize-none"
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2 justify-end">
                <button
                  type="button"
                  onClick={() => setIsComposing(false)}
                  className="px-3.5 py-2 text-xs font-semibold hover:bg-white/5 rounded-xl text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#9cd2b8] text-black text-xs font-bold rounded-xl active:scale-95 transition-all cursor-pointer shadow-[0_0_15px_rgba(156,210,184,0.15)]"
                >
                  <Send className="w-3.5 h-3.5" />
                  Dispatch Mail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
