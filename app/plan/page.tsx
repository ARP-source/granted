'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Shield, LayoutDashboard, Map, MessageSquare, Send,
  Sparkles, Loader2, Trash2, Bookmark, ArrowLeft,
  CalendarDays, CheckCircle, AlertTriangle, Star,
} from 'lucide-react';

/* ── Types ── */
type Grant = {
  id: string;
  name: string;
  amount: string;
  deadline: string;
  status: 'eligible' | 'ineligible' | 'new';
  requirements: string[];
  matchScore?: number;
  matchReason?: string;
};

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
};

type UserProfile = {
  name: string;
  immigrationStatus: string;
  school: string;
  major: string;
  location: string;
  gpa: string;
  circumstances: string[];
};

/* ── Helpers ── */
function loadSavedGrants(): Grant[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('grantforge_saved_grants') || '[]'); }
  catch { return []; }
}

function loadSavedIds(): string[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('grantforge_saved') || '[]'); }
  catch { return []; }
}

function loadProfile(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('grantforge_profile');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

function loadChatHistory(grantId: string): ChatMessage[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem(`grantforge_chat_${grantId}`) || '[]'); }
  catch { return []; }
}

function saveChatHistory(grantId: string, messages: ChatMessage[]) {
  localStorage.setItem(`grantforge_chat_${grantId}`, JSON.stringify(messages));
}

/* ── Component ── */
export default function PlanPage() {
  const [savedGrants, setSavedGrants] = useState<Grant[]>([]);
  const [selectedGrant, setSelectedGrant] = useState<Grant | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSavedGrants(loadSavedGrants());
    setProfile(loadProfile());
  }, []);

  useEffect(() => {
    if (selectedGrant) {
      setMessages(loadChatHistory(selectedGrant.id));
    }
  }, [selectedGrant]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const removeGrant = (grantId: string) => {
    const updated = savedGrants.filter(g => g.id !== grantId);
    setSavedGrants(updated);
    localStorage.setItem('grantforge_saved_grants', JSON.stringify(updated));
    const ids = loadSavedIds().filter(id => id !== grantId);
    localStorage.setItem('grantforge_saved', JSON.stringify(ids));
    localStorage.removeItem(`grantforge_chat_${grantId}`);
    if (selectedGrant?.id === grantId) {
      setSelectedGrant(null);
      setMessages([]);
    }
  };

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || !selectedGrant || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: messageText,
      timestamp: new Date().toISOString(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageText,
          grantContext: selectedGrant,
          userProfile: profile,
          history: newMessages.slice(-10),
        }),
      });

      const data = await res.json();

      const aiMsg: ChatMessage = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: data.response || 'I wasn\'t able to generate a response. Please try again.',
        timestamp: new Date().toISOString(),
      };

      const updated = [...newMessages, aiMsg];
      setMessages(updated);
      saveChatHistory(selectedGrant.id, updated);
    } catch (err) {
      console.error('Chat error:', err);
      const errMsg: ChatMessage = {
        id: `msg_${Date.now()}_err`,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString(),
      };
      const updated = [...newMessages, errMsg];
      setMessages(updated);
      saveChatHistory(selectedGrant.id, updated);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    'Am I eligible for this?',
    'What documents do I need?',
    'Help me plan a timeline',
    'Help me write the essay',
  ];

  return (
    <div className="app-shell">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo"><Shield /></div>
          <div>
            <div className="header-title">GrantForge</div>
            <div className="header-subtitle">AI Funding Companion</div>
          </div>
        </div>

        <nav className="nav-tabs">
          <Link href="/" className="nav-tab">
            <LayoutDashboard /> Dashboard
          </Link>
          <Link href="/plan" className="nav-tab nav-tab--active">
            <Map /> My Plan
            {savedGrants.length > 0 && <span className="nav-badge">{savedGrants.length}</span>}
          </Link>
        </nav>

        <div className="header-status">
          <span className="status-dot" />
          Policy Sentinel Active
        </div>
      </header>

      {/* ── Content ── */}
      {savedGrants.length === 0 ? (
        <div className="plan-empty">
          <div className="plan-empty-icon"><Bookmark /></div>
          <div className="plan-empty-title">No grants saved yet</div>
          <div className="plan-empty-text">
            Go to the Dashboard and bookmark the grants you&apos;re interested in.
            They&apos;ll appear here so you can plan your applications with AI.
          </div>
          <Link href="/" className="btn btn-primary">
            <ArrowLeft /> Back to Dashboard
          </Link>
        </div>
      ) : (
        <div className="plan-layout">
          {/* ── Left: Saved Grants List ── */}
          <div className="plan-sidebar">
            <div className="section-header" style={{ marginBottom: 4 }}>
              <h2>Saved Grants</h2>
              <span className="section-count">{savedGrants.length}</span>
            </div>
            {savedGrants.map(grant => (
              <div
                key={grant.id}
                className={`plan-grant ${selectedGrant?.id === grant.id ? 'plan-grant--active' : ''}`}
                onClick={() => setSelectedGrant(grant)}
              >
                <div className="plan-grant-name">{grant.name}</div>
                <div className="plan-grant-meta">
                  <span className="plan-grant-amount">{grant.amount}</span>
                  <span>{grant.deadline}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
                  <span className={`grant-badge grant-badge--${grant.status}`} style={{ fontSize: '0.62rem' }}>
                    {grant.status === 'eligible' && <><CheckCircle /> Eligible</>}
                    {grant.status === 'ineligible' && <><AlertTriangle /> Ineligible</>}
                    {grant.status === 'new' && <><Star /> New</>}
                  </span>
                  <button className="plan-grant-remove" onClick={e => { e.stopPropagation(); removeGrant(grant.id); }}>
                    <Trash2 style={{ width: 12, height: 12, verticalAlign: -1 }} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* ── Right: Chat Panel ── */}
          {selectedGrant ? (
            <div className="chat-panel">
              <div className="chat-header">
                <div className="chat-header-info">
                  <h3>{selectedGrant.name}</h3>
                  <p>{selectedGrant.amount} · Deadline: {selectedGrant.deadline}</p>
                </div>
                <span className={`grant-badge grant-badge--${selectedGrant.status}`}>
                  {selectedGrant.status === 'eligible' && <><CheckCircle /> Eligible</>}
                  {selectedGrant.status === 'ineligible' && <><AlertTriangle /> Ineligible</>}
                  {selectedGrant.status === 'new' && <><Star /> New</>}
                </span>
              </div>

              <div className="chat-messages">
                {messages.length === 0 ? (
                  <div className="chat-welcome">
                    <div className="chat-welcome-icon"><Sparkles /></div>
                    <h3>Plan your application</h3>
                    <p>Ask me anything about {selectedGrant.name}. I&apos;ll help with eligibility, documents, strategy, and more.</p>
                    <div className="chat-suggestions">
                      {suggestions.map(s => (
                        <button key={s} className="chat-suggestion" onClick={() => sendMessage(s)}>{s}</button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map(msg => (
                      <div key={msg.id} className={`chat-msg chat-msg--${msg.role}`}>
                        <div className="chat-bubble">{msg.content}</div>
                        <div className="chat-msg-time">
                          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="chat-msg chat-msg--assistant">
                        <div className="chat-bubble">
                          <Loader2 className="spin" style={{ width: 16, height: 16, display: 'inline', verticalAlign: -3 }} /> Thinking…
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              <div className="chat-input-bar">
                <textarea
                  className="chat-input"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                  placeholder={`Ask about ${selectedGrant.name}…`}
                  rows={1}
                />
                <button className="chat-send" onClick={() => sendMessage()} disabled={!input.trim() || isLoading}>
                  <Send />
                </button>
              </div>
            </div>
          ) : (
            <div className="chat-select-prompt">
              <MessageSquare />
              <p>Select a grant from the list to start planning your application.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
