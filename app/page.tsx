'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Shield, AlertTriangle, CheckCircle, Download,
  Pen, Loader2, Bell, TrendingUp,
  ExternalLink, FileText, Zap, Eye,
  CalendarDays, Target, Star, Bookmark, BookmarkCheck,
  LayoutDashboard, Map, Plus, X, Save,
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

type Alert = {
  id: string;
  type: 'critical' | 'new' | 'warning';
  title: string;
  message: string;
  detectedBy: string[];
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

/* ── Constants ── */
const IMMIGRATION_OPTIONS = [
  'U.S. Citizen', 'Permanent Resident (Green Card)', 'F-1 Student Visa',
  'H4 Visa', 'H1-B Visa', 'DACA', 'Undocumented', 'Refugee / Asylee',
  'TPS Holder', 'Other',
];

const CIRCUMSTANCE_OPTIONS = [
  'Veteran', 'First-Generation Student', 'Low-Income', 'Disability',
  'Single Parent', 'Foster Youth', 'LGBTQ+', 'Minority',
  'Non-Traditional Student', 'International Student',
];

const DEFAULT_PROFILE: UserProfile = {
  name: '', immigrationStatus: '', school: '', major: '',
  location: '', gpa: '', circumstances: [],
};

const INITIAL_GRANTS: Grant[] = [
  {
    id: 'ca-dream-fund',
    name: 'California Dream Fund',
    amount: '$8,500/year',
    deadline: 'Aug 15, 2026',
    status: 'eligible',
    requirements: ['AB540 status', 'California resident 3+ years'],
  },
  {
    id: 'bay-area-stem',
    name: 'Bay Area STEM Immigrant Scholarship',
    amount: '$5,000 one-time',
    deadline: 'Sep 1, 2026',
    status: 'eligible',
    requirements: ['STEM major', 'immigrant status'],
  },
  {
    id: 'pell-grant',
    name: 'Federal Pell Grant',
    amount: '$7,395 max',
    deadline: 'Jun 30, 2026',
    status: 'ineligible',
    requirements: ['U.S. citizen or eligible noncitizen', 'FAFSA completion'],
  },
];

/* ── Helpers ── */
function loadProfile(): UserProfile {
  if (typeof window === 'undefined') return DEFAULT_PROFILE;
  try {
    const raw = localStorage.getItem('grantforge_profile');
    return raw ? { ...DEFAULT_PROFILE, ...JSON.parse(raw) } : DEFAULT_PROFILE;
  } catch { return DEFAULT_PROFILE; }
}

function saveProfile(p: UserProfile) {
  localStorage.setItem('grantforge_profile', JSON.stringify(p));
}

function loadSaved(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('grantforge_saved') || '[]');
  } catch { return []; }
}

function saveSavedIds(ids: string[]) {
  localStorage.setItem('grantforge_saved', JSON.stringify(ids));
}

function loadSavedGrants(): Grant[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem('grantforge_saved_grants') || '[]');
  } catch { return []; }
}

function saveSavedGrants(grants: Grant[]) {
  localStorage.setItem('grantforge_saved_grants', JSON.stringify(grants));
}

/* ── Component ── */
export default function HomePage() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [editing, setEditing] = useState(false);
  const [editProfile, setEditProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [customTag, setCustomTag] = useState('');
  const [addingTag, setAddingTag] = useState(false);

  const [grants, setGrants] = useState<Grant[]>(INITIAL_GRANTS);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepProgress, setSweepProgress] = useState<string[]>([]);
  const [activeGrant, setActiveGrant] = useState<Grant | null>(null);
  const [appStep, setAppStep] = useState<'research' | 'eligible' | 'applied' | 'awarded'>('research');

  // Load from localStorage on mount
  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    setEditProfile(p);
    setSavedIds(loadSaved());
  }, []);

  const eligibleCount = grants.filter(g => g.status === 'eligible').length;
  const newCount = grants.filter(g => g.status === 'new').length;

  /* ── Profile editing ── */
  const startEdit = () => { setEditProfile({ ...profile }); setEditing(true); };
  const cancelEdit = () => { setEditing(false); setAddingTag(false); setCustomTag(''); };
  const saveEdit = () => {
    setProfile(editProfile);
    saveProfile(editProfile);
    setEditing(false);
    setAddingTag(false);
    setCustomTag('');
  };
  const toggleCircumstance = (c: string) => {
    setEditProfile(prev => ({
      ...prev,
      circumstances: prev.circumstances.includes(c)
        ? prev.circumstances.filter(x => x !== c)
        : [...prev.circumstances, c],
    }));
  };
  const addCustomTag = () => {
    if (customTag.trim() && !editProfile.circumstances.includes(customTag.trim())) {
      setEditProfile(prev => ({ ...prev, circumstances: [...prev.circumstances, customTag.trim()] }));
      setCustomTag('');
      setAddingTag(false);
    }
  };

  /* ── Bookmark ── */
  const toggleSave = (grant: Grant, e: React.MouseEvent) => {
    e.stopPropagation();
    let newIds: string[];
    let currentSaved = loadSavedGrants();
    if (savedIds.includes(grant.id)) {
      newIds = savedIds.filter(id => id !== grant.id);
      currentSaved = currentSaved.filter(g => g.id !== grant.id);
    } else {
      newIds = [...savedIds, grant.id];
      if (!currentSaved.find(g => g.id === grant.id)) {
        currentSaved.push(grant);
      }
    }
    setSavedIds(newIds);
    saveSavedIds(newIds);
    saveSavedGrants(currentSaved);
  };

  /* ── Sweep ── */
  const runSweep = async () => {
    setIsSweeping(true);
    setSweepProgress([]);
    const steps = [
      'Initializing Policy Sentinel agents…',
      'Bright Data crawling 3 funding sources…',
      'TokenRouter analyzing policy changes (GPT-4o)…',
      'Evermind comparing eligibility deltas…',
      'Generating plain-English alerts…',
      'Dashboard updated ✓',
    ];
    for (let i = 0; i < steps.length; i++) {
      await new Promise(r => setTimeout(r, 900));
      setSweepProgress(prev => [...prev, steps[i]]);
    }
    try {
      const res = await fetch('/api/agent/sweep', { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Sweep failed');
      if (result.alerts?.length) setAlerts(prev => [...result.alerts, ...prev].slice(0, 10));
      const updated = Array.isArray(result.updatedGrants) ? result.updatedGrants : [];
      const newGrants = Array.isArray(result.newGrants) ? result.newGrants : [];
      setGrants([...updated, ...newGrants]);
    } catch (err) {
      console.error('Sweep failed:', err);
      setAlerts(prev => [{
        id: `err_${Date.now()}`, type: 'critical', title: 'Sweep failed',
        message: 'Failed to connect to Policy Sentinel agents. Please try again.',
        detectedBy: ['Frontend'], timestamp: new Date().toISOString(),
      }, ...prev]);
    } finally {
      setIsSweeping(false);
    }
  };

  useEffect(() => { if (!activeGrant) setAppStep('research'); }, [activeGrant]);
  const stepOrder = ['research', 'eligible', 'applied', 'awarded'] as const;
  const stepIdx = stepOrder.indexOf(appStep);

  const profileComplete = !!(profile.name || profile.immigrationStatus || profile.school);

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
          <Link href="/" className="nav-tab nav-tab--active">
            <LayoutDashboard /> Dashboard
          </Link>
          <Link href="/plan" className="nav-tab">
            <Map /> My Plan
            {savedIds.length > 0 && <span className="nav-badge">{savedIds.length}</span>}
          </Link>
        </nav>

        <div className="header-status">
          <span className="status-dot" />
          Policy Sentinel Active
        </div>
      </header>

      {/* ── Dashboard ── */}
      <div className="dashboard">
        {/* ── LEFT: Profile + Stats ── */}
        <aside>
          <div className="card">
            {!editing ? (
              /* ── View Mode ── */
              <>
                <div className="profile-avatar">
                  {(profile.name || '?').charAt(0).toUpperCase()}
                </div>
                {profile.name && (
                  <div className="profile-field">
                    <div className="profile-label">Name</div>
                    <div className="profile-value">{profile.name}</div>
                  </div>
                )}
                {profile.immigrationStatus && (
                  <div className="profile-field">
                    <div className="profile-label">Immigration Status</div>
                    <div className="profile-value profile-value--alert">{profile.immigrationStatus}</div>
                  </div>
                )}
                {profile.school && (
                  <div className="profile-field">
                    <div className="profile-label">School</div>
                    <div className="profile-value">{profile.school}</div>
                  </div>
                )}
                {profile.major && (
                  <div className="profile-field">
                    <div className="profile-label">Major</div>
                    <div className="profile-value">{profile.major}</div>
                  </div>
                )}
                {profile.location && (
                  <div className="profile-field">
                    <div className="profile-label">Location</div>
                    <div className="profile-value">{profile.location}</div>
                  </div>
                )}
                {profile.gpa && (
                  <div className="profile-field">
                    <div className="profile-label">GPA</div>
                    <div className="profile-value">{profile.gpa}</div>
                  </div>
                )}
                {profile.circumstances.length > 0 && (
                  <div className="profile-field">
                    <div className="profile-label">Circumstances</div>
                    <div className="tags-container" style={{ marginTop: 6 }}>
                      {profile.circumstances.map(c => (
                        <span key={c} className="tag tag--selected">{c}</span>
                      ))}
                    </div>
                  </div>
                )}
                {!profileComplete && (
                  <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    Set up your profile to get personalized grant matching.
                  </div>
                )}
                <hr className="profile-divider" />
                <button className="btn btn-secondary" style={{ width: '100%' }} onClick={startEdit}>
                  <Pen /> {profileComplete ? 'Edit Profile' : 'Set Up Profile'}
                </button>
              </>
            ) : (
              /* ── Edit Mode ── */
              <div className="profile-form">
                <div className="form-group">
                  <label className="form-label">Name</label>
                  <input className="form-input" value={editProfile.name} placeholder="Your name"
                    onChange={e => setEditProfile(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Immigration / Citizenship Status</label>
                  <select className="form-select" value={editProfile.immigrationStatus}
                    onChange={e => setEditProfile(p => ({ ...p, immigrationStatus: e.target.value }))}>
                    <option value="">Select status…</option>
                    {IMMIGRATION_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">School</label>
                  <input className="form-input" value={editProfile.school} placeholder="e.g. San Jose State University"
                    onChange={e => setEditProfile(p => ({ ...p, school: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Major / Field of Study</label>
                  <input className="form-input" value={editProfile.major} placeholder="e.g. Statistics"
                    onChange={e => setEditProfile(p => ({ ...p, major: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Location</label>
                  <input className="form-input" value={editProfile.location} placeholder="e.g. Sunnyvale, CA"
                    onChange={e => setEditProfile(p => ({ ...p, location: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">GPA (optional)</label>
                  <input className="form-input" value={editProfile.gpa} placeholder="e.g. 3.7"
                    onChange={e => setEditProfile(p => ({ ...p, gpa: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Circumstances</label>
                  <div className="tags-container">
                    {CIRCUMSTANCE_OPTIONS.map(c => (
                      <button key={c} type="button"
                        className={`tag ${editProfile.circumstances.includes(c) ? 'tag--selected' : ''}`}
                        onClick={() => toggleCircumstance(c)}>
                        {c}
                      </button>
                    ))}
                    {editProfile.circumstances
                      .filter(c => !CIRCUMSTANCE_OPTIONS.includes(c))
                      .map(c => (
                        <button key={c} type="button" className="tag tag--selected" onClick={() => toggleCircumstance(c)}>
                          {c} <X style={{ width: 10, height: 10 }} />
                        </button>
                      ))
                    }
                    {addingTag ? (
                      <input className="tag-input" value={customTag} autoFocus
                        placeholder="Type…"
                        onChange={e => setCustomTag(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') addCustomTag(); if (e.key === 'Escape') { setAddingTag(false); setCustomTag(''); } }}
                        onBlur={() => { if (customTag.trim()) addCustomTag(); else { setAddingTag(false); } }}
                      />
                    ) : (
                      <button type="button" className="tag tag-add" onClick={() => setAddingTag(true)}>
                        <Plus style={{ width: 10, height: 10 }} /> Add
                      </button>
                    )}
                  </div>
                </div>
                <div className="form-actions">
                  <button className="btn btn-secondary" onClick={cancelEdit}><X /> Cancel</button>
                  <button className="btn btn-primary" onClick={saveEdit}><Save /> Save</button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Stats */}
          <div className="card" style={{ marginTop: 16 }}>
            <div className="card-header">
              <div className="card-icon card-icon--cyan"><TrendingUp /></div>
              <h2>Overview</h2>
            </div>
            <div className="stats-row">
              <div className="stat-box">
                <div className="stat-number stat-number--emerald">{eligibleCount}</div>
                <div className="stat-label">Eligible</div>
              </div>
              <div className="stat-box">
                <div className="stat-number stat-number--rose">{grants.filter(g => g.status === 'ineligible').length}</div>
                <div className="stat-label">Blocked</div>
              </div>
              <div className="stat-box">
                <div className="stat-number stat-number--cyan">{newCount}</div>
                <div className="stat-label">New</div>
              </div>
            </div>
            <div className="sidebar-section">
              <div className="sidebar-section-title">Saved for Planning</div>
              <div className="funding-bar">
                <div className="funding-fill" style={{ width: `${Math.round((savedIds.length / Math.max(grants.length, 1)) * 100)}%` }} />
              </div>
              <div className="funding-label">
                <span>{savedIds.length} saved</span>
                <span>{grants.length} tracked</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── CENTER: Grants ── */}
        <main className="grants-section">
          <button id="btn-sweep" onClick={runSweep} disabled={isSweeping} className="btn btn-primary btn-sweep">
            {isSweeping ? (<><Loader2 className="spin" /> Running Policy Sentinel Sweep…</>) : (<><Zap /> Run Policy Sentinel Sweep</>)}
          </button>

          {isSweeping && (
            <div className="sweep-log">
              <div className="sweep-log-title"><Eye /> Live Agent Log</div>
              {sweepProgress.map((step, i) => (
                <div key={i} className="sweep-step"><CheckCircle />{step}</div>
              ))}
            </div>
          )}

          <div className="section-header">
            <h2>Tracked Opportunities</h2>
            <span className="section-count">{grants.length} grants</span>
          </div>

          <div className="grants-grid">
            {grants.map(grant => (
              <div key={grant.id} id={`grant-${grant.id}`}
                className={`grant-card grant-card--${grant.status} ${activeGrant?.id === grant.id ? 'grant-card--active' : ''}`}
                onClick={() => setActiveGrant(grant)}>
                <button
                  className={`bookmark-btn ${savedIds.includes(grant.id) ? 'bookmark-btn--saved' : ''}`}
                  onClick={(e) => toggleSave(grant, e)}
                  title={savedIds.includes(grant.id) ? 'Remove from plan' : 'Save to plan'}
                >
                  {savedIds.includes(grant.id) ? <BookmarkCheck /> : <Bookmark />}
                </button>
                <div className="grant-top">
                  <h3 className="grant-name">{grant.name}</h3>
                  <span className={`grant-badge grant-badge--${grant.status}`}>
                    {grant.status === 'eligible' && <><CheckCircle /> Eligible</>}
                    {grant.status === 'ineligible' && <><AlertTriangle /> Ineligible</>}
                    {grant.status === 'new' && <><Star /> New Match</>}
                  </span>
                </div>
                <div className="grant-amount">{grant.amount}</div>
                <div className="grant-meta">
                  <div className="grant-meta-row">
                    <span className="grant-meta-label"><CalendarDays style={{ width: 13, height: 13, display: 'inline', verticalAlign: -2, marginRight: 4 }} />Deadline</span>
                    <span className="grant-meta-value">{grant.deadline}</span>
                  </div>
                  {grant.matchScore && (
                    <div className="grant-meta-row">
                      <span className="grant-meta-label"><Target style={{ width: 13, height: 13, display: 'inline', verticalAlign: -2, marginRight: 4 }} />Match Score</span>
                      <span className="grant-meta-value grant-meta-value--match">{grant.matchScore}%</span>
                    </div>
                  )}
                </div>
                {grant.requirements.length > 0 && (
                  <div className="grant-reqs">
                    <div className="grant-reqs-title">Requirements</div>
                    {grant.requirements.slice(0, 3).map((req, i) => (
                      <span key={i} className="grant-req-tag">{req}</span>
                    ))}
                    {grant.requirements.length > 3 && <span className="grant-req-tag">+{grant.requirements.length - 3} more</span>}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Detail Panel */}
          {activeGrant && (
            <div className="detail-panel" id="detail-panel">
              <div className="detail-header">
                <div>
                  <div className="detail-title">{activeGrant.name}</div>
                  <div className="detail-amount">{activeGrant.amount}</div>
                </div>
                <button className="detail-close" onClick={() => setActiveGrant(null)}>✕</button>
              </div>
              <div className="progress-track">
                {stepOrder.map((step, i) => (
                  <div key={step} style={{ display: 'contents' }}>
                    <div className="progress-step">
                      <div className={`progress-dot ${i === stepIdx ? 'progress-dot--active' : i < stepIdx ? 'progress-dot--done' : ''}`}>
                        {i < stepIdx ? <CheckCircle style={{ width: 16, height: 16 }} /> : i + 1}
                      </div>
                      <span className="progress-label">{step}</span>
                    </div>
                    {i < stepOrder.length - 1 && (
                      <div className={`progress-line ${i < stepIdx ? 'progress-line--done' : ''}`} />
                    )}
                  </div>
                ))}
              </div>
              <div className="detail-actions">
                <button id="action-start" className="detail-action detail-action--indigo" onClick={() => setAppStep('eligible')}>
                  <ExternalLink /> Start Application
                </button>
                <button id="action-prefill" className="detail-action detail-action--emerald" onClick={() => setAppStep('applied')}>
                  <FileText /> Pre-fill My Info
                </button>
                <button id="action-download" className="detail-action detail-action--cyan" onClick={() => {}}>
                  <Download /> Download PDF
                </button>
              </div>
            </div>
          )}
        </main>

        {/* ── RIGHT: Alerts ── */}
        <aside>
          <div className="card">
            <div className="card-header">
              <div className="card-icon card-icon--amber"><Bell /></div>
              <h2>Policy Alerts</h2>
            </div>
            {alerts.length === 0 ? (
              <div className="alert-empty">
                <div className="alert-empty-icon"><Bell /></div>
                <div className="alert-empty-text">
                  No alerts yet.<br />
                  Run a sweep to detect policy changes and new opportunities.
                </div>
              </div>
            ) : (
              <div className="alerts-list">
                {alerts.map(a => (
                  <div key={a.id} className={`alert-item alert-item--${a.type}`}>
                    <div className="alert-top">
                      <div className="alert-title">{a.title}</div>
                      <div className="alert-time">
                        {new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                    <div className="alert-body">
                      {a.message.length > 140 ? a.message.substring(0, 140) + '…' : a.message}
                    </div>
                    <div className="alert-tags">
                      {a.detectedBy.map((by, i) => <span key={i} className="alert-tag">{by}</span>)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
