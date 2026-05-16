'use client';

import { useState, useEffect } from 'react';
import { Shield, Sparkles, AlertTriangle, CheckCircle, Download, Pen, Loader2, AlertOctagon, ChevronDown } from 'lucide-react';

// Types
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

// Mock initial data
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

const INITIAL_ALERTS: Alert[] = [];

const USER_PROFILE: UserProfile = {
  name: 'Alex',
  visaStatus: 'H4 Visa',
  major: 'Statistics',
  location: 'Sunnyvale, California',
};

export default function HomePage() {
  const [grants, setGrants] = useState<Grant[]>(INITIAL_GRANTS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [isSweeping, setIsSweeping] = useState(false);
  const [sweepProgress, setSweepProgress] = useState<string[]>([]);
  const [activeGrant, setActiveGrant] = useState<Grant | null>(null);
  const [applicationStep, setApplicationStep] = useState<'research' | 'eligible' | 'applied' | 'awarded'>('research');

  // Simulate sweep flow with sequential steps
  const runSweep = async () => {
    setIsSweeping(true);
    setSweepProgress([]);

    const steps = [
      'Agents scanning...',
      'Bright Data crawling 3 sources...',
      'TokenRouter reasoning (GPT-4o)...',
      'Evermind comparing deltas...',
      'Generating plain-English alerts...',
      'Updating dashboard...',
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      setSweepProgress((prev) => [...prev, steps[i]]);
    }

    try {
      const res = await fetch('/api/agent/sweep', { method: 'POST' });
      const result = await res.json();

      if (result.alerts?.length) {
        setAlerts((prev) => [...result.alerts, ...prev].slice(0, 10));
      }

      // Update grants: replace old ones, add new ones
      const updated = [...result.updatedGrants];
      const newGrants = result.newGrants || [];
      
      // Simulate flip: CA Dream Fund → ineligible
      const flipped = updated.map(g =>
        g.id === 'ca-dream-fund' && g.status === 'ineligible'
          ? { ...g, status: 'ineligible', requirements: [...g.requirements, 'EAD required'] }
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
          message: 'Failed to connect to Policy Sentinel agents.',
          detectedBy: ['Frontend'],
          timestamp: new Date().toISOString(),
        },
        ...alerts,
      ]);
    } finally {
      setIsSweeping(false);
    }
  };

  // Reset application panel when grant changes
  useEffect(() => {
    if (!activeGrant) setApplicationStep('research');
  }, [activeGrant]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 text-gray-100 p-4 md:p-6">
      {/* Top Bar */}
      <header className="flex items-center justify-between mb-8 pb-4 border-b border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-600 rounded-lg">
            <Shield className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-300">
            GrantForge
          </h1>
        </div>
        <div className="flex items-center space-x-2 px-4 py-2 bg-green-900/30 rounded-full border border-green-700/50 animate-pulse">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-green-300 font-medium">Policy Sentinel: ACTIVE</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left Sidebar — Profile */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-yellow-400" />
              Your Profile
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-gray-400 text-sm">Name</p>
                <p className="font-medium">{USER_PROFILE.name}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Status</p>
                <p className="font-medium text-red-400">{USER_PROFILE.visaStatus}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Major</p>
                <p className="font-medium">{USER_PROFILE.major}</p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Location</p>
                <p className="font-medium">{USER_PROFILE.location}</p>
              </div>
              <button className="w-full mt-4 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors">
                <Pen className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
            </div>
          </div>
        </aside>

        {/* Center — Grants Grid + Sweep Button */}
        <main className="lg:col-span-3 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Active Grants</h2>
            <button
              onClick={runSweep}
              disabled={isSweeping}
              className={`px-6 py-3 rounded-lg font-medium flex items-center transition-all ${
                isSweeping
                  ? 'bg-gray-700 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98]'
              }`}
            >
              {isSweeping ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Sparkles className="h-5 w-5 mr-2" />
                  Run Policy Sentinel Sweep
                </>
              )}
            </button>
          </div>

          {isSweeping && (
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h3 className="font-medium mb-2">Live Sweep Log</h3>
              <ul className="space-y-1 text-sm text-gray-300">
                {sweepProgress.map((step, i) => (
                  <li key={i} className="flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 text-green-400 flex-shrink-0" />
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {grants.map((grant) => (
              <div
                key={grant.id}
                className={`rounded-xl p-5 border transition-all duration-300 cursor-pointer transform hover:scale-[1.01] ${
                  grant.status === 'eligible'
                    ? 'bg-green-900/20 border-green-700/50'
                    : grant.status === 'ineligible'
                    ? 'bg-red-900/20 border-red-700/50'
                    : 'bg-blue-900/20 border-blue-700/50'
                } ${activeGrant?.id === grant.id ? 'ring-2 ring-indigo-500' : ''}`}
                onClick={() => setActiveGrant(grant)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg">{grant.name}</h3>
                  {grant.status === 'ineligible' && (
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                  )}
                </div>
                <p className="text-green-400 font-medium mt-1">{grant.amount}</p>
                <div className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Deadline</span>
                    <span>{grant.deadline}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className={`font-medium ${
                      grant.status === 'eligible' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {grant.status === 'eligible' ? 'Eligible' : 'Ineligible'}
                      {grant.status === 'new' && ' — NEW'}
                    </span>
                  </div>
                  {grant.matchScore && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Match</span>
                      <span className="text-cyan-400 font-medium">{grant.matchScore}%</span>
                    </div>
                  )}
                </div>
                {grant.requirements.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-700/50">
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Requirements</p>
                    <ul className="text-xs space-y-0.5">
                      {grant.requirements.slice(0, 2).map((req, i) => (
                        <li key={i} className="flex items-start">
                          <span className="text-green-400 mr-1">•</span>
                          {req}
                        </li>
                      ))}
                      {grant.requirements.length > 2 && (
                        <li className="text-gray-500 italic">+ {grant.requirements.length - 2} more</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Application Panel */}
          {activeGrant && (
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50 mt-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Apply to {activeGrant.name}</h3>
                <button
                  onClick={() => setActiveGrant(null)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  ✕
                </button>
              </div>

              <div className="mb-6">
                <h4 className="font-medium mb-2">Application Progress</h4>
                <div className="flex items-center space-x-2">
                  {(['research', 'eligible', 'applied', 'awarded'] as const).map((step, i) => (
                    <div key={step} className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                          applicationStep === step
                            ? 'bg-indigo-500 text-white'
                            : i < ['research', 'eligible', 'applied', 'awarded'].indexOf(applicationStep)
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className="text-xs mt-1 text-gray-400 capitalize">{step}</span>
                    </div>
                  ))}
                  <div className="flex-1 h-0.5 bg-gray-700 mx-2"></div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => {
                    setApplicationStep('eligible');
                    alert('Actionbook: navigateToGrantPortal() called');
                  }}
                  className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-lg flex items-center justify-center"
                >
                  <Sparkles className="h-4 w-4 mr-1" />
                  Start Application
                </button>
                <button
                  onClick={() => {
                    setApplicationStep('applied');
                    alert('Actionbook: prefillApplicationForm() called');
                  }}
                  className="py-2 px-4 bg-green-600 hover:bg-green-500 rounded-lg flex items-center justify-center"
                >
                  <Pen className="h-4 w-4 mr-1" />
                  Pre-fill My Info
                </button>
                <button
                  onClick={() => {
                    alert('Actionbook: downloadApplicationPDF() called');
                    alert('PDF saved to /downloads/bay-area-tech-merit.pdf');
                  }}
                  className="py-2 px-4 bg-blue-600 hover:bg-blue-500 rounded-lg flex items-center justify-center"
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download PDF
                </button>
              </div>
            </div>
          )}
        </main>

        {/* Right Sidebar — Alerts */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-5 border border-gray-700/50">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <AlertOctagon className="h-5 w-5 mr-2 text-yellow-400" />
              Policy Alerts
            </h2>

            {alerts.length === 0 ? (
              <p className="text-gray-500 text-sm italic">No alerts yet. Run a sweep to detect changes.</p>
            ) : (
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg text-sm ${
                      alert.type === 'critical'
                        ? 'bg-red-900/20 border border-red-700/50'
                        : alert.type === 'new'
                        ? 'bg-green-900/20 border border-green-700/50'
                        : 'bg-yellow-900/20 border border-yellow-700/50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium">{alert.title}</h3>
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="mt-1 text-gray-300">{alert.message.substring(0, 120)}{alert.message.length > 120 ? '...' : ''}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {alert.detectedBy.map((by, i) => (
                        <span key={i} className="text-xs px-2 py-0.5 bg-gray-700 rounded">
                          {by}
                        </span>
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
