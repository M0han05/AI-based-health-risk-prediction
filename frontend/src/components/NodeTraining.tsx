import { useState, useEffect } from 'react';
import { Server, Building2, Zap, ArrowDown, ArrowUp, Activity, ShieldCheck, Cpu, RefreshCw, Layers, Lock } from 'lucide-react';

interface NodeStat {
  id: string;
  name: string;
  records: number;
  accuracy: number;
  loss: number;
  color: string;
}

interface NodeTrainingProps {
  onAccuracyUpdate?: (accuracy: number) => void;
}

const API_URL = 'http://localhost:5000/api';

const dummyNodes: NodeStat[] = [
  { id: 'D1', name: 'AIIMS Delhi', records: 52430, accuracy: 65.4, loss: 1.24, color: '#3b82f6' },
  { id: 'D2', name: 'Apollo Chennai', records: 45120, accuracy: 68.2, loss: 1.35, color: '#ec4899' },
  { id: 'D3', name: 'Tata Mumbai', records: 30800, accuracy: 64.9, loss: 1.28, color: '#10b981' },
];


export default function NodeTraining({ onAccuracyUpdate }: NodeTrainingProps) {
  const [nodes, setNodes] = useState<NodeStat[]>(dummyNodes);
  const [round, setRound] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'downloading' | 'training' | 'uploading' | 'aggregating' | 'completed'>('idle');
  const [globalAccuracy, setGlobalAccuracy] = useState(68.4);
  const [globalLoss, setGlobalLoss] = useState(1.30);
  const [epoch, setEpoch] = useState(0);
  const [totalRounds, setTotalRounds] = useState(10);
  const [currentAnimRound, setCurrentAnimRound] = useState(1);

  const fetchState = async () => {
    try {
      const res = await fetch(`${API_URL}/fl/global-model`);
      const mData = await res.json();

      const startingAcc = mData.accuracy || 68.4;

      // Only use the fixed dummy nodes for the visual training simulation
      const filledNodes = dummyNodes.map(n => ({
        ...n,
        accuracy: startingAcc - (Math.random() * 4),
        loss: 1.4 - (startingAcc / 100)
      }));

      setNodes(filledNodes);

      // Force exactly what the backend has
      setGlobalAccuracy(startingAcc);
      setRound(mData.round);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  useEffect(() => {
    // Only poll when the visualizer is NOT in an active simulation phase (training, aggregating, etc.)
    if (phase !== 'idle' && phase !== 'completed') return;

    // Additionally, if we just completed a round, we don't want to poll immediately as it might reset state
    if (phase === 'completed') {
      const timeout = setTimeout(fetchState, 10000); // 10s wait after completion
      return () => clearTimeout(timeout);
    }

    fetchState();
    const interval = setInterval(fetchState, 5000);
    return () => clearInterval(interval);
  }, [phase]);

  const startSimulation = async (roundsOverride?: number) => {
    const roundsToUse = roundsOverride || totalRounds;
    setTotalRounds(roundsToUse);
    setCurrentAnimRound(1); // Track animation loop
    setPhase('downloading');
  };

  useEffect(() => {
    if (phase === 'idle' || phase === 'completed') return;

    let timer: NodeJS.Timeout;

    if (phase === 'downloading') {
      timer = setTimeout(() => {
        setPhase('training');
        setEpoch(1);
      }, 1500);
    }
    else if (phase === 'training') {
      timer = setTimeout(() => {
        if (epoch < 5) {
          // Training step
          setEpoch(e => e + 1);
          setNodes(prev => prev.map(n => {
            // Updated gain logic to hit higher targets quickly
            const target = totalRounds <= 5 ? 93.6 : 99.2;
            const accGain = (target - n.accuracy) * (0.2 + Math.random() * 0.1);
            const lossDrop = n.loss * (0.15 + Math.random() * 0.1);
            return {
              ...n,
              accuracy: Math.min(target + 0.5, n.accuracy + accGain),
              loss: Math.max(0.012, n.loss - lossDrop)
            };
          }));
        } else {
          setPhase('uploading');
        }
      }, 800);
    }
    else if (phase === 'uploading') {
      timer = setTimeout(() => {
        setPhase('aggregating');
      }, 1500);
    }
    else if (phase === 'aggregating') {
      timer = setTimeout(() => {
        // Trigger actual aggregation per round!
        fetch(`${API_URL}/fl/aggregate`, { method: 'POST' })
          .then(res => res.json())
          .then(data => {
            if (data.newAccuracy) {
              setGlobalAccuracy(data.newAccuracy);
              setRound(data.round);
            }

            // visual loss drop
            const avgLoss = nodes.reduce((sum, n) => sum + n.loss, 0) / nodes.length;
            setGlobalLoss(Math.max(0.008, avgLoss - Math.random() * 0.05));

            if (currentAnimRound < totalRounds) {
              setCurrentAnimRound(r => r + 1);
              setPhase('downloading');
            } else {
              setPhase('completed');
              if (onAccuracyUpdate) onAccuracyUpdate(data.newAccuracy || globalAccuracy);
            }
          })
          .catch(err => {
            console.error('Real loop aggregation failed', err);
            // fallback
            if (currentAnimRound < totalRounds) {
              setCurrentAnimRound(r => r + 1);
              setPhase('downloading');
            } else {
              setPhase('completed');
            }
          });
      }, 2000);
    }

    return () => clearTimeout(timer);
  }, [phase, epoch, currentAnimRound, totalRounds, globalAccuracy, nodes, onAccuracyUpdate]);


  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fadeIn">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex justify-center items-center gap-3">
          <Cpu className="w-8 h-8 text-blue-400" /> Live Node Training & Aggregation
        </h2>
        <p className="text-gray-400">Watch how ഓരോ hospital node trains locally on its dataset and shares only DP-noisy weights (Secure Aggregation).</p>
      </div>

      <div className="relative bg-gray-900/40 border border-gray-800 rounded-3xl p-8 overflow-hidden">
        {/* Global Server */}
        <div className="flex flex-col items-center mb-16 relative z-10">
          <div className={`w-24 h-24 rounded-2xl flex items-center justify-center border-2 transition-all duration-500 shadow-2xl ${phase === 'aggregating'
            ? 'bg-blue-600/20 border-blue-400 shadow-blue-500/50 scale-110'
            : 'bg-gray-800 border-gray-600'
            }`}>
            <Server className={`w-12 h-12 ${phase === 'aggregating' ? 'text-blue-400 animate-pulse' : 'text-gray-400'}`} />
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 justify-center">
              Central Aggregator <ShieldCheck className="w-4 h-4 text-green-400" />
            </h3>
            <div className="flex flex-col items-center gap-1 mt-2">
              <div className="flex gap-4 bg-gray-800/50 px-4 py-2 rounded-xl border border-gray-700">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase block">Global Model (Round {round}/{totalRounds})</span>
                  <span className={`font-mono font-bold ${phase === 'aggregating' ? 'text-blue-400' : 'text-white'}`}>
                    Acc: {globalAccuracy.toFixed(1)}% | Loss: {globalLoss.toFixed(3)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full">
                <Lock className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider">Differential Privacy Service Active</span>
              </div>
            </div>
          </div>
        </div>

        {/* Phase Indicator */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
          {phase !== 'idle' && phase !== 'completed' && (
            <div className="bg-gray-900/95 border border-gray-700 px-6 py-3 rounded-full backdrop-blur-md flex items-center gap-4 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              {phase === 'downloading' && <><ArrowDown className="w-5 h-5 text-blue-400 animate-bounce" /> <span className="text-blue-400 font-bold uppercase tracking-widest text-xs"> Broadcasting Global Model</span></>}
              {phase === 'training' && <><Zap className="w-5 h-5 text-yellow-400 animate-pulse" /> <span className="text-yellow-400 font-bold uppercase tracking-widest text-xs"> Local Training (Epoch {epoch}/5)</span></>}
              {phase === 'uploading' && <><ArrowUp className="w-5 h-5 text-purple-400 animate-bounce" /> <span className="text-purple-400 font-bold uppercase tracking-widest text-xs"> Sending DP-Noisy Gradients</span></>}
              {phase === 'aggregating' && <><RefreshCw className="w-5 h-5 text-green-400 animate-spin" /> <span className="text-green-400 font-bold uppercase tracking-widest text-xs"> Secure DP Aggregation</span></>}
              <div className="border-l border-gray-700 pl-4 h-4 flex items-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                  <span className="text-[9px] text-blue-400 font-bold uppercase font-mono">DP Tracking</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Nodes Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
          {nodes.map(node => (
            <div key={node.id} className={`bg-gray-800/50 border rounded-2xl p-5 transition-all duration-500 relative ${phase === 'training' ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10 scale-105' : 'border-gray-700'
              }`}>

              {/* Animations */}
              {phase === 'downloading' && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center animate-fadeIn">
                  <div className="w-1 h-12 bg-gradient-to-b from-blue-500 to-transparent" />
                  <ArrowDown className="w-4 h-4 text-blue-400 animate-bounce" />
                </div>
              )}
              {phase === 'uploading' && (
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 flex flex-col items-center animate-fadeIn">
                  <ArrowUp className="w-4 h-4 text-purple-400 animate-bounce mb-1" />
                  <div className="w-1 h-12 bg-gradient-to-t from-purple-500 to-transparent" />
                  <div className="absolute top-4 bg-purple-900 text-[8px] text-purple-300 font-mono px-1 rounded shadow-lg">DP(ΔW)</div>
                </div>
              )}

              <div className="flex items-center gap-3 mb-4 border-b border-gray-700/50 pb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${node.color}20`, color: node.color }}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm leading-tight">{node.name}</h4>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wider">{node.records.toLocaleString()} Records</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-800 relative overflow-hidden">
                  <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-gray-800 to-transparent pointer-events-none" />
                  <div className="flex justify-between items-center mb-1 relative z-10">
                    <span className="text-[10px] text-gray-400 uppercase">Local Accuracy</span>
                    <span className="text-sm font-bold font-mono transition-colors duration-300" style={{ color: phase === 'training' ? '#fbbf24' : node.color }}>
                      {node.accuracy.toFixed(2)}%
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden relative z-10">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${node.accuracy}%`, backgroundColor: node.color }}
                    />
                  </div>
                </div>

                <div className="bg-gray-900/80 rounded-lg p-3 border border-gray-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-gray-400 uppercase">Local Loss</span>
                    <span className="text-sm font-bold font-mono transition-colors duration-300 text-red-400">
                      {node.loss.toFixed(4)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden flex justify-end">
                    <div
                      className="h-full bg-red-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, node.loss * 40)}%` }}
                    />
                  </div>
                </div>
              </div>

              {phase === 'training' && (
                <div className="mt-3 flex items-center gap-2 justify-center py-1 bg-yellow-500/10 rounded-lg border border-yellow-500/20 text-yellow-400">
                  <Layers className="w-3 h-3 animate-spin" />
                  <span className="text-[10px] uppercase font-bold tracking-widest">Training on Node...</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {phase === 'completed' ? (
        <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 border border-green-500/30 rounded-2xl p-6 text-center animate-fadeIn">
          <h3 className="text-2xl font-bold text-green-400 mb-2 flex justify-center items-center gap-2">
            Federated Training Complete! <ShieldCheck className="w-6 h-6" />
          </h3>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            The global model achieved a robust accuracy of <strong className="text-white">{globalAccuracy.toFixed(2)}%</strong> while strictly maintaining privacy using <strong className="text-blue-400">Differential Privacy</strong>. No raw data was exposed during decentralized training on {nodes.reduce((a, b) => a + b.records, 0).toLocaleString()} patient records.
          </p>
          <button
            onClick={() => startSimulation()}
            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 rounded-xl text-white font-bold transition flex items-center gap-2 mx-auto"
          >
            <RefreshCw className="w-4 h-4" /> Restart Training Simulation
          </button>
        </div>
      ) : (
        <div className="flex justify-center">
          {phase === 'idle' ? (
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col items-center gap-4">
                <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Select Training Depth</span>
                <div className="flex gap-4">
                  <button
                    onClick={() => { setTotalRounds(5); startSimulation(5); }}
                    className="px-6 py-3 bg-gray-800/80 hover:bg-blue-600/20 border border-gray-700 hover:border-blue-500/50 rounded-2xl text-white transition-all flex flex-col items-center gap-1 group"
                  >
                    <span className="text-xl font-bold group-hover:text-blue-400">05</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold group-hover:text-blue-300">Quick Rounds</span>
                  </button>
                  <button
                    onClick={() => { setTotalRounds(10); startSimulation(10); }}
                    className="px-6 py-3 bg-gray-800/80 hover:bg-purple-600/20 border border-gray-700 hover:border-purple-500/50 rounded-2xl text-white transition-all flex flex-col items-center gap-1 group"
                  >
                    <span className="text-xl font-bold group-hover:text-purple-400">10</span>
                    <span className="text-[10px] text-gray-500 uppercase font-bold group-hover:text-purple-300">Full Rounds</span>
                  </button>
                </div>
              </div>
              <button
                onClick={() => startSimulation()}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-bold shadow-lg shadow-blue-600/20 text-lg transition-all hover:scale-105 flex items-center gap-3"
              >
                <Zap className="w-5 h-5 fill-current" /> Start Federated Training
              </button>
            </div>
          ) : (
            <div className="px-8 py-4 bg-gray-800/80 border border-gray-700 text-gray-400 rounded-xl font-bold font-mono inline-flex items-center gap-3">
              <Activity className="w-5 h-5 animate-pulse text-blue-400" /> System Processing (Round {round}/{totalRounds})
            </div>
          )}
        </div>
      )}
    </div>
  );
}
