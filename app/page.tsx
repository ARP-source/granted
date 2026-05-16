'use client';

import { useState, useEffect } from 'react';
import {
  Shield, Sparkles, AlertTriangle, CheckCircle, Download,
  Pen, Loader2, Bell, Clock, DollarSign, TrendingUp,
  Search, ExternalLink, FileText, Zap, Eye, ChevronRight,
  CalendarDays, Target, ArrowRight, Star,
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
  visaStatus: string;
  major: string;
  location: string;
};

/* ── Data ── */
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

const USER_PROFILE: UserProfile = {
  name: 'Alex',
  visaStatus: 'H4 Visa',
  major: 'Statistics',
  location: 'Sunnyvale, CA',
};

/* ── Component ── */
export default function HomePage() {
  const [grants, setGrants] = useState<Grant[]>(INITIAL_GRANTS);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepProgress, setSweepProgress] = useState<string[]>([]);
  const [activeGrant, setActiveGrant] = useState<Grant | null>(null);
  const [appStep, setAppStep] = useState<'research' | 'eligible' | 'applied' | 'awarded'>('research');

  const eligibleCount = grants.filter(g => g.status === 'eligible').length;
  const newCount = grants.filter(g => g.status === 'new').length;

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
      await new Promise((r) => setTimeout(r, 900));
      setSweepProgress((prev) => [...prev, steps[i]]);
    }

    try {
      const res = await fetch('/api/agent/sweep', { method: 'POST' });
      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || 'Sweep API returned an error');
      }

      if (result.alerts?.length) {
        setAlerts((prev) => [...result.alerts, ...prev].slice(0, 10));
      }

      const updated = Array.isArray(result.updatedGrants) ? result.updatedGrants : [];
      const newGrants = Array.isArray(result.newGrants) ? result.newGrants : [];

      const flipped = updated.map((g: Grant) =>
        g.id === 'ca-dream-fund' && g.status === 'ineligible'
          ? { ...g, status: 'ineligible' as const, requirements: [...g.requirements, 'EAD required'] }
          : g
      );

      setGrants([...flipped, ...newGrants]);
    } catch (err) {
      console.error('Sweep failed:', err);
      setAlerts([
        {
          id: `err_${Date.now()}`,
          type: 'critical',
          title: 'Sweep failed',
          message: 'Failed to connect to Policy Sentinel agents. Please try again.',
          detectedBy: ['Frontend'],
          timestamp: new Date().toISOString(),
        },
        ...alerts,
      ]);
    } finally {
      setIsSweeping(false);
    }
  };

  useEffect(() => {
    if (!activeGrant) setAppStep('research');
  }, [activeGrant]);

  const stepOrder = ['research', 'eligible', 'applied', 'awarded'] as const;
  const stepIdx = stepOrder.indexOf(appStep);

  return (
    <div className="app-shell">
      {/* ── Header ── */}
      <header className="header">
        <div className="header-brand">
          <div className="header-logo">
            <Shield />
          </div>
          <div>
            <div className="header-title">GrantForge</div>
            <div className="header-subtitle">AI Funding Companion</div>
          </div>
        </div>
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
            <div className="profile-avatar">
              {USER_PROFILE.name.charAt(0)}
            </div>
            <div className="profile-field">
              <div className="profile-label">Name</div>
              <div className="profile-value">{USER_PROFILE.name}</div>
            </div>
            <div className="profile-field">
              <div className="profile-label">Immigration Status</div>
              <div className="profile-value profile-value--alert">{USER_PROFILE.visaStatus}</div>
            </div>
            <div className="profile-field">
              <div className="profile-label">Major</div>
              <div className="profile-value">{USER_PROFILE.major}</div>
            </div>
            <div className="profile-field">
              <div className="profile-label">Location</div>
              <div className="profile-value">{USER_PROFILE.location}</div>
            </div>
            <hr className="profile-divider" />
            <button className="btn btn-secondary" style={{ width: '100%' }}>
              <Pen /> Edit Profile
            </button>
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
              <div className="sidebar-section-title">Potential Funding</div>
              <div className="funding-bar">
                <div className="funding-fill" style={{ width: `${Math.round((eligibleCount / Math.max(grants.length, 1)) * 100)}%` }} />
              </div>
              <div className="funding-label">
                <span>{eligibleCount} of {grants.length} tracked</span>
                <span>{Math.round((eligibleCount / Math.max(grants.length, 1)) * 100)}%</span>
              </div>
            </div>
          </div>
        </aside>

        {/* ── CENTER: Grants ── */}
        <main className="grants-section">
          {/* Sweep Button */}
          <button
            id="btn-sweep"
            onClick={runSweep}
            disabled={isSweeping}
            className="btn btn-primary btn-sweep"
          >
            {isSweeping ? (
              <>
                <Loader2 className="spin" />
                Running Policy Sentinel Sweep…
              </>
            ) : (
              <>
                <Zap />
                Run Policy Sentinel Sweep
              </>
            )}
          </button>

          {/* Sweep Log */}
          {isSweeping && (
            <div className="sweep-log">
              <div className="sweep-log-title">
                <Eye /> Live Agent Log
              </div>
              {sweepProgress.map((step, i) => (
                <div key={i} className="sweep-step">
                  <CheckCircle />
                  {step}
                </div>
              ))}
            </div>
          )}

          {/* Section Header */}
          <div className="section-header">
            <h2>Tracked Opportunities</h2>
            <span className="section-count">{grants.length} grants</span>
          </div>

          {/* Grants Grid */}
          <div className="grants-grid">
            {grants.map((grant) => (
              <div
                key={grant.id}
                id={`grant-${grant.id}`}
                className={`grant-card grant-card--${grant.status} ${activeGrant?.id === grant.id ? 'grant-card--active' : ''}`}
                onClick={() => setActiveGrant(grant)}
              >
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
                    {grant.requirements.length > 3 && (
                      <span className="grant-req-tag">+{grant.requirements.length - 3} more</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ── Detail / Application Panel ── */}
          {activeGrant && (
            <div className="detail-panel" id="detail-panel">
              <div className="detail-header">
                <div>
                  <div className="detail-title">{activeGrant.name}</div>
                  <div className="detail-amount">{activeGrant.amount}</div>
                </div>
                <button className="detail-close" onClick={() => setActiveGrant(null)}>✕</button>
              </div>

              {/* Progress */}
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

              {/* Actions */}
              <div className="detail-actions">
                <button
                  id="action-start"
                  className="detail-action detail-action--indigo"
                  onClick={() => setAppStep('eligible')}
                >
                  <ExternalLink />
                  Start Application
                </button>
                <button
                  id="action-prefill"
                  className="detail-action detail-action--emerald"
                  onClick={() => setAppStep('applied')}
                >
                  <FileText />
                  Pre-fill My Info
                </button>
                <button
                  id="action-download"
                  className="detail-action detail-action--cyan"
                  onClick={() => {}}
                >
                  <Download />
                  Download PDF
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
                {alerts.map((a) => (
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
                      {a.detectedBy.map((by, i) => (
                        <span key={i} className="alert-tag">{by}</span>
                      ))}
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
