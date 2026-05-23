import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import './Editor.css'

function Editor() {
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState(null) // 'success' | 'error' | null

  // Fetch the markdown content on mount
  useEffect(() => {
    fetch('/api/docs')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch')
        return res.json()
      })
      .then((data) => setContent(data.content))
      .catch((err) => console.error('Error fetching docs:', err))
  }, [])

  const handleSave = () => {
    setIsSaving(true)
    setSaveStatus(null)

    fetch('/api/docs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ content }),
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to save')
        return res.json()
      })
      .then((data) => {
        if (data.success) {
          setSaveStatus('success')
          setTimeout(() => setSaveStatus(null), 3000)
        } else {
          setSaveStatus('error')
        }
      })
      .catch((err) => {
        console.error('Error saving docs:', err)
        setSaveStatus('error')
      })
      .finally(() => {
        setIsSaving(false)
      })
  }

  // Basic HTML parser for previewing Markdown
  const renderPreview = (text) => {
    if (!text) return <p className="preview-empty">No content to preview.</p>

    const lines = text.split('\n')
    return lines.map((line, idx) => {
      // Headers
      if (line.startsWith('# ')) {
        return <h1 key={idx} className="preview-h1">{line.replace('# ', '')}</h1>
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} className="preview-h2">{line.replace('## ', '')}</h2>
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="preview-h3">{line.replace('### ', '')}</h3>
      }
      // Bold text / Q&A answers
      if (line.startsWith('**Answer:**') || line.startsWith('**')) {
        // Strip bold wrapper
        const cleanText = line.replace(/\*\*/g, '')
        return <p key={idx} className="preview-p"><strong>{cleanText.split(':')[0]}:</strong>{cleanText.split(':').slice(1).join(':')}</p>
      }
      // Empty lines
      if (!line.trim()) {
        return <div key={idx} className="preview-spacer"></div>
      }
      // Regular paragraphs
      return <p key={idx} className="preview-p">{line}</p>
    })
  }

  return (
    <div className="editor-page">
      <header className="editor-header">
        <div className="header-left">
          <Link to="/chat" className="back-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>Back to Chat</span>
          </Link>
          <div className="divider"></div>
          <h1>Troubleshooting Doc Editor</h1>
        </div>
        
        <div className="header-actions">
          {saveStatus === 'success' && (
            <span className="save-toast success">✓ Saved successfully</span>
          )}
          {saveStatus === 'error' && (
            <span className="save-toast error">✗ Error saving file</span>
          )}
          <button 
            className={`btn-save ${isSaving ? 'saving' : ''}`}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="spinner"></span>
                Saving...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                  <polyline points="17 21 17 13 7 13 7 21"></polyline>
                  <polyline points="7 3 7 8 15 8"></polyline>
                </svg>
                Save Changes
              </>
            )}
          </button>
        </div>
      </header>

      <div className="editor-layout">
        <section className="pane pane-write">
          <div className="pane-header">
            <span>EDIT MARKDOWN</span>
            <span className="file-tag">troubleshooting_docs.md</span>
          </div>
          <textarea
            className="markdown-textarea"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your markdown here..."
          />
        </section>

        <section className="pane pane-preview">
          <div className="pane-header">
            <span>LIVE PREVIEW</span>
          </div>
          <div className="preview-content">
            {renderPreview(content)}
          </div>
        </section>
      </div>
    </div>
  )
}

export default Editor
