import { useState, useEffect, useCallback } from 'react';
import {
    Server, Building2, Zap, CheckCircle2, RefreshCw, Database,
    TrendingUp, Users, ShieldCheck, AlertCircle, BarChart3, Cpu,
    Activity, Lock, ArrowRight, Globe
} from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

interface Hospital {
    hospitalId: string;
    hospitalName: string;
    username: string;
    registeredAt: string;
    hasSubmitted: boolean;
}

interface Submission {
    hospitalId: string;
    hospitalName: string;
    localAccuracy: number;
    recordCount: number;
    submittedAt: string;
}

interface AccuracyHistoryEntry {
    round: number;
    accuracy: number;
    hospitalCount: number;
    timestamp: string;
}

interface AdminDashboardProps {
    onAccuracyUpdate?: (accuracy: number) => void;
    onShowNetwork?: () => void;
}

export default function FLAdminDashboard({ onAccuracyUpdate, onShowNetwork }: AdminDashboardProps) {
    const [hospitals, setHospitals] = useState<Hospital[]>([]);
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [accuracyHistory, setAccuracyHistory] = useState<AccuracyHistoryEntry[]>([]);
    const [currentRound, setCurrentRound] = useState(0);
    const [currentAccuracy, setCurrentAccuracy] = useState(68.4);
    const [isAggregating, setIsAggregating] = useState(false);
    const [aggregateResult, setAggregateResult] = useState<{ newAccuracy: number; round: number; hospitalCount: number } | null>(null);
    const [error, setError] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

    const fetchStatus = useCallback(async () => {
        try {
            const [hosRes, subRes, histRes] = await Promise.all([
                fetch(`${API_URL}/fl/hospitals`),
                fetch(`${API_URL}/fl/submissions`),
                fetch(`${API_URL}/fl/accuracy-history`),
            ]);
            const hosData = await hosRes.json();
            const subData = await subRes.json();
            const histData = await histRes.json();

            setHospitals(hosData.hospitals || []);
            setSubmissions(subData.submissions || []);
            setCurrentRound(subData.currentRound || 0);
            setCurrentAccuracy(subData.globalAccuracy || 68.4);
            setAccuracyHistory(histData.history || []);
            setLastRefresh(new Date());
        } catch {
            setError('Cannot connect to backend. Make sure the server is running on port 5000.');
        }
    }, []);

    useEffect(() => {
        fetchStatus();
        const interval = setInterval(fetchStatus, 5000); // Auto-refresh every 5s
        return () => clearInterval(interval);
    }, [fetchStatus]);

    const handleAggregate = async () => {
        if (submissions.length === 0) {
            setError('No submissions to aggregate. Wait for hospitals to submit their weights.');
            return;
        }
        setError('');
        setIsAggregating(true);
        setAggregateResult(null);

        try {
            const res = await fetch(`${API_URL}/fl/aggregate`, { method: 'POST' });
            const data = await res.json();

            if (res.ok) {
                setAggregateResult({
                    newAccuracy: data.newAccuracy,
                    round: data.round,
                    hospitalCount: data.hospitalCount,
                });
                setCurrentAccuracy(data.newAccuracy);
                setCurrentRound(data.round);
                setAccuracyHistory(data.accuracyHistory || []);
                setSubmissions([]);
                if (onAccuracyUpdate) onAccuracyUpdate(data.newAccuracy);
                await fetchStatus();
            } else {
                setError(data.error || 'Aggregation failed.');
            }
        } catch {
            setError('Backend error during aggregation.');
        }
        setIsAggregating(false);
    };

    const handleReset = async () => {
        setIsResetting(true);
        try {
            await fetch(`${API_URL}/fl/reset`, { method: 'POST' });
            setAggregateResult(null);
            setAccuracyHistory([]);
            setCurrentRound(0);
            setCurrentAccuracy(68.4);
            await fetchStatus();
        } catch {
            setError('Reset failed.');
        }
        setIsResetting(false);
    };

    // Progress bars for accuracy chart
    const maxAccuracy = 100;
    const chartMin = 60;

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="text-center mb-2">
                <h2 className="text-3xl font-bold text-white mb-2 flex justify-center items-center gap-3">
                    <Server className="w-8 h-8 text-blue-400" />
                    Federated Learning — Admin Control Center
                </h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Monitor hospital registrations, review submitted model weights, run FedAvg aggregation,
                    and track global accuracy improvement across rounds.
                </p>
            </div>

            {/* Live Status Bar */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Registered Hospitals',
                        value: hospitals.length,
                        icon: <Building2 className="w-5 h-5" />,
                        color: 'blue',
                        sub: 'Total nodes in network',
                    },
                    {
                        label: 'Pending Submissions',
                        value: submissions.length,
                        icon: <Database className="w-5 h-5" />,
                        color: 'amber',
                        sub: 'Awaiting aggregation',
                    },
                    {
                        label: 'FL Rounds Complete',
                        value: currentRound,
                        icon: <RefreshCw className="w-5 h-5" />,
                        color: 'purple',
                        sub: 'FedAvg rounds run',
                    },
                    {
                        label: 'Global Accuracy',
                        value: `${currentAccuracy.toFixed(1)}%`,
                        icon: <TrendingUp className="w-5 h-5" />,
                        color: 'emerald',
                        sub: 'Current global model',
                    },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className={`bg-gray-900/60 border border-${stat.color}-500/20 rounded-2xl p-5 relative overflow-hidden`}
                    >
                        <div className={`absolute top-0 right-0 w-24 h-24 bg-${stat.color}-600/5 rounded-full -translate-y-4 translate-x-4`} />
                        <div className={`text-${stat.color}-400 mb-3`}>{stat.icon}</div>
                        <div className={`text-3xl font-bold text-${stat.color}-300 font-mono mb-1`}>{stat.value}</div>
                        <div className="text-xs font-semibold text-white mb-0.5">{stat.label}</div>
                        <div className="text-[10px] text-gray-500">{stat.sub}</div>
                    </div>
                ))}
            </div>

            {/* Error Banner */}
            {error && (
                <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-5 py-4">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-sm text-red-300">{error}</span>
                    <button onClick={() => setError('')} className="ml-auto text-gray-500 hover:text-gray-400 text-xs">✕</button>
                </div>
            )}

            {/* FedAvg Result Banner */}
            {aggregateResult && (
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-2xl px-6 py-5 animate-fadeIn">
                    <CheckCircle2 className="w-8 h-8 text-green-400 flex-shrink-0" />
                    <div className="flex-1">
                        <h4 className="font-bold text-green-300 text-lg">
                            Round {aggregateResult.round} Aggregation Complete!
                        </h4>
                        <p className="text-gray-400 text-sm">
                            FedAvg ran on <strong className="text-white">{aggregateResult.hospitalCount} hospital(s)</strong>.
                            New global accuracy:{' '}
                            <strong className="text-green-300 text-lg">{aggregateResult.newAccuracy.toFixed(2)}%</strong>
                        </p>
                    </div>
                    <button onClick={() => setAggregateResult(null)} className="text-gray-600 hover:text-gray-400 text-sm">✕</button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left: Registered Hospitals */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" />
                            Registered Hospital Nodes
                        </h3>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onShowNetwork}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/30 rounded-lg text-xs text-blue-400 font-semibold transition"
                            >
                                <Globe className="w-3.5 h-3.5" />
                                Explore Hospital Network
                            </button>
                            <button
                                onClick={fetchStatus}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-xs text-gray-400 transition"
                            >
                                <RefreshCw className="w-3 h-3" />
                                Refresh
                            </button>
                        </div>
                    </div>

                    {hospitals.length === 0 ? (
                        <div className="text-center py-12">
                            <Globe className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No hospitals registered yet.</p>
                            <p className="text-gray-600 text-xs mt-1">Hospitals register via the login page.</p>
                        </div>
                    ) : (
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                            {hospitals.map(h => (
                                <div
                                    key={h.hospitalId}
                                    className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${h.hasSubmitted
                                        ? 'bg-green-900/20 border-green-500/30'
                                        : 'bg-gray-800/50 border-gray-700/50'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${h.hasSubmitted ? 'bg-green-600/20' : 'bg-blue-600/20'
                                        }`}>
                                        <Building2 className={`w-5 h-5 ${h.hasSubmitted ? 'text-green-400' : 'text-blue-400'}`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-semibold text-white text-sm truncate">{h.hospitalName}</span>
                                            {h.hasSubmitted && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-600/20 border border-green-500/30 rounded-full text-[10px] text-green-400 font-bold">
                                                    <CheckCircle2 className="w-3 h-3" /> Submitted
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <span className="text-[10px] text-gray-500 font-mono">{h.hospitalId}</span>
                                            <span className="text-[10px] text-gray-600">
                                                Registered {new Date(h.registeredAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${h.hasSubmitted ? 'bg-green-400' : 'bg-gray-600'}`} />
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span className="text-[10px] text-gray-500">Submitted weights</span>
                        </div>
                        <div className="flex items-center gap-1.5 ml-3">
                            <div className="w-2 h-2 rounded-full bg-gray-600" />
                            <span className="text-[10px] text-gray-500">Pending training</span>
                        </div>
                        <span className="text-[10px] text-gray-600 ml-auto">
                            Auto-refreshes every 5s · Last: {lastRefresh.toLocaleTimeString()}
                        </span>
                    </div>
                </div>

                {/* Right: Submissions & Aggregate */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6 flex flex-col">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-5">
                        <Database className="w-5 h-5 text-amber-400" />
                        Pending Weight Submissions
                        {submissions.length > 0 && (
                            <span className="ml-auto inline-flex items-center justify-center w-6 h-6 bg-amber-500/20 border border-amber-500/40 rounded-full text-xs text-amber-400 font-bold">
                                {submissions.length}
                            </span>
                        )}
                    </h3>

                    {submissions.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
                            <Lock className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No weight submissions yet.</p>
                            <p className="text-gray-600 text-xs mt-1">
                                Hospitals must log in and train the model on their local data.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 mb-5 flex-1 max-h-52 overflow-y-auto pr-1">
                            {submissions.map(sub => (
                                <div key={sub.hospitalId} className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-green-400" />
                                            <span className="text-sm font-semibold text-white">{sub.hospitalName}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-500">
                                            {new Date(sub.submittedAt).toLocaleTimeString()}
                                        </span>
                                    </div>
                                    <div className="flex gap-4">
                                        <div>
                                            <span className="text-[10px] text-gray-500 block uppercase">Local Accuracy</span>
                                            <span className="text-sm font-bold text-emerald-400 font-mono">{sub.localAccuracy.toFixed(2)}%</span>
                                        </div>
                                        <div>
                                            <span className="text-[10px] text-gray-500 block uppercase">Records Used</span>
                                            <span className="text-sm font-bold text-blue-400 font-mono">{sub.recordCount.toLocaleString()}</span>
                                        </div>
                                        <div className="ml-auto flex items-center">
                                            <span className="text-[10px] bg-purple-500/20 border border-purple-500/30 text-purple-400 px-2 py-0.5 rounded-full font-bold uppercase">
                                                DP Noise Applied
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Aggregate Button */}
                    <div className="pt-4 border-t border-gray-800">
                        <button
                            onClick={handleAggregate}
                            disabled={submissions.length === 0 || isAggregating}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${submissions.length === 0 || isAggregating
                                ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700'
                                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-600/20 hover:scale-[1.02] active:scale-[0.99]'
                                }`}
                        >
                            {isAggregating ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Running FedAvg...
                                </>
                            ) : (
                                <>
                                    <Zap className="w-5 h-5 fill-current" />
                                    Aggregate Weights (FedAvg)
                                    {submissions.length > 0 && (
                                        <span className="ml-1 text-sm opacity-75">· {submissions.length} hospital{submissions.length > 1 ? 's' : ''}</span>
                                    )}
                                </>
                            )}
                        </button>
                        <p className="text-center text-[10px] text-gray-600 mt-2">
                            Runs weighted FedAvg · Applies differential privacy · Updates global model
                        </p>
                    </div>
                </div>
            </div>

            {/* Accuracy History Chart */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-emerald-400" />
                        Accuracy Improvement per FL Round
                    </h3>
                    <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 rounded bg-gradient-to-r from-blue-500 to-purple-500" />
                            <span className="text-xs text-gray-400">FL Accuracy</span>
                        </div>
                        <button
                            onClick={handleReset}
                            disabled={isResetting}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-900/30 hover:bg-red-900/50 border border-red-700/40 rounded-lg text-xs text-red-400 transition ml-4"
                        >
                            <RefreshCw className={`w-3 h-3 ${isResetting ? 'animate-spin' : ''}`} />
                            Reset FL State
                        </button>
                    </div>
                </div>

                {accuracyHistory.length === 0 ? (
                    <div className="text-center py-16">
                        <Activity className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">No rounds completed yet.</p>
                        <p className="text-gray-600 text-xs mt-1">
                            Start by having hospitals train and submit weights, then click Aggregate.
                        </p>
                        {/* Show baseline */}
                        <div className="mt-6 inline-flex items-center gap-2 bg-gray-800/50 border border-gray-700 rounded-xl px-4 py-2">
                            <Cpu className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-400">Baseline: <strong className="text-white">{currentAccuracy.toFixed(1)}%</strong></span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Baseline */}
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] text-gray-500 uppercase w-16 text-right flex-shrink-0">Baseline</span>
                            <div className="flex-1 bg-gray-800 rounded-full h-6 overflow-hidden">
                                <div
                                    className="h-full bg-gray-600 rounded-full flex items-center pl-3 transition-all duration-700"
                                    style={{ width: `${((68.4 - chartMin) / (maxAccuracy - chartMin)) * 100}%` }}
                                >
                                    <span className="text-[10px] text-gray-300 font-mono font-bold whitespace-nowrap">68.40%</span>
                                </div>
                            </div>
                            <span className="text-[10px] text-gray-600 w-8 text-center flex-shrink-0">R0</span>
                        </div>

                        {accuracyHistory.map((entry, i) => {
                            const prevAcc = i === 0 ? 68.4 : accuracyHistory[i - 1].accuracy;
                            const gain = entry.accuracy - prevAcc;
                            const barWidth = ((entry.accuracy - chartMin) / (maxAccuracy - chartMin)) * 100;
                            return (
                                <div key={entry.round} className="flex items-center gap-4">
                                    <span className="text-[10px] text-gray-500 uppercase w-16 text-right flex-shrink-0">
                                        Round {entry.round}
                                    </span>
                                    <div className="flex-1 bg-gray-800 rounded-full h-6 overflow-hidden relative">
                                        <div
                                            className="h-full rounded-full flex items-center pl-3 transition-all duration-700"
                                            style={{
                                                width: `${barWidth}%`,
                                                background: `linear-gradient(to right, #3b82f6, #8b5cf6)`,
                                            }}
                                        >
                                            <span className="text-[10px] text-white font-mono font-bold whitespace-nowrap">
                                                {entry.accuracy.toFixed(2)}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 w-20 flex-shrink-0">
                                        {gain > 0 && (
                                            <span className="text-[10px] text-green-400 font-mono font-bold">
                                                +{gain.toFixed(2)}%
                                            </span>
                                        )}
                                        <span className="text-[10px] text-gray-600">
                                            ({entry.hospitalCount}H)
                                        </span>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Summary */}
                        <div className="mt-4 pt-4 border-t border-gray-800 flex flex-wrap gap-6 text-sm">
                            <div>
                                <span className="text-gray-500 text-xs">Starting Accuracy</span>
                                <div className="text-white font-mono font-bold">68.40%</div>
                            </div>
                            <ArrowRight className="w-4 h-4 text-gray-600 self-center" />
                            <div>
                                <span className="text-gray-500 text-xs">Current Accuracy</span>
                                <div className="text-emerald-400 font-mono font-bold text-lg">{currentAccuracy.toFixed(2)}%</div>
                            </div>
                            <div className="ml-auto text-right">
                                <span className="text-gray-500 text-xs">Total Improvement</span>
                                <div className="text-blue-400 font-mono font-bold text-lg">
                                    +{(currentAccuracy - 68.4).toFixed(2)}%
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* FL Protocol Explainer */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                    { step: '01', icon: <Building2 className="w-5 h-5" />, title: 'Hospital Registers', desc: 'Gets unique ID + global model weights from server', color: 'blue' },
                    { step: '02', icon: <Cpu className="w-5 h-5" />, title: 'Local Training', desc: 'Trains model on local patient data, never shares raw data', color: 'yellow' },
                    { step: '03', icon: <Lock className="w-5 h-5" />, title: 'Submit DP Weights', desc: 'Sends only weight deltas with differential privacy noise', color: 'purple' },
                    { step: '04', icon: <TrendingUp className="w-5 h-5" />, title: 'FedAvg Aggregation', desc: 'Admin aggregates all weights → improved global model', color: 'emerald' },
                ].map((item, i) => (
                    <div key={i} className={`bg-gray-900/40 border border-${item.color}-500/20 rounded-xl p-4 relative`}>
                        <span className={`text-[10px] font-bold text-${item.color}-600 uppercase tracking-widest`}>Step {item.step}</span>
                        <div className={`text-${item.color}-400 my-2`}>{item.icon}</div>
                        <div className="text-sm font-bold text-white mb-1">{item.title}</div>
                        <div className="text-[11px] text-gray-500 leading-relaxed">{item.desc}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}
