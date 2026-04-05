import { useState, useEffect } from 'react';
import { generateGradientValues, addDifferentialPrivacyNoise } from '../utils/simulation';
import { Shield, Lock, Zap, Layers, ShieldCheck, Shuffle } from 'lucide-react';

export default function PrivacyTechniques() {
  const [epsilon, setEpsilon] = useState(1.0);
  const [originalGradients, setOriginalGradients] = useState<number[]>([]);
  const [noisyGradients, setNoisyGradients] = useState<number[]>([]);
  const [saStep, setSaStep] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const grads = generateGradientValues();
    setOriginalGradients(grads);
    setNoisyGradients(addDifferentialPrivacyNoise(grads, epsilon));
  }, []);

  useEffect(() => {
    const noisy = addDifferentialPrivacyNoise(originalGradients, epsilon);
    setNoisyGradients(noisy);
  }, [epsilon, originalGradients]);

  const startSecureAggregation = () => {
    setIsAnimating(true);
    setSaStep(0);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setSaStep(step);
      if (step >= 5) {
        clearInterval(interval);
        setTimeout(() => setIsAnimating(false), 1000);
      }
    }, 1500);
  };

  const hospitals = [
    { name: 'Hospital A', city: 'Mumbai', gradient: '[0.023, -0.041, 0.018]', mask: '[0.891, 0.234, -0.567]', encrypted: '[0.914, 0.193, -0.549]' },
    { name: 'Hospital B', city: 'Delhi', gradient: '[-0.018, 0.055, -0.032]', mask: '[-0.891, -0.234, 0.567]', encrypted: '[-0.909, -0.179, 0.535]' },
    { name: 'Hospital C', city: 'Bangalore', gradient: '[0.031, -0.029, 0.045]', mask: '[0.445, -0.112, 0.223]', encrypted: '[0.476, -0.141, 0.268]' },
  ];

  const saSteps = [
    { title: 'Step 1: Local Training', desc: 'Each hospital trains model on local data', icon: <Zap className="w-5 h-5" /> },
    { title: 'Step 2: Generate Masks', desc: 'Random masks generated for each participant using Diffie-Hellman', icon: <Shuffle className="w-5 h-5" /> },
    { title: 'Step 3: Mask Gradients', desc: 'Gradients are masked: encrypted = gradient + mask', icon: <Lock className="w-5 h-5" /> },
    { title: 'Step 4: Send to Server', desc: 'Only masked (encrypted) gradients sent to server', icon: <Shield className="w-5 h-5" /> },
    { title: 'Step 5: Aggregate & Cancel', desc: 'Masks cancel out during aggregation, revealing only the sum', icon: <ShieldCheck className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Privacy-Preserving Techniques</h2>
        <p className="text-gray-400">How Differential Privacy and Secure Aggregation protect patient data</p>
      </div>

      {/* Differential Privacy */}
      <div className="bg-gray-900/80 border border-purple-500/30 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center">
            <Layers className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-purple-400">Differential Privacy (DP)</h3>
            <p className="text-sm text-gray-400">Adding calibrated noise to gradients so individual data cannot be reverse-engineered</p>
          </div>
        </div>

        {/* Epsilon slider */}
        <div className="bg-gray-800/50 rounded-xl p-4 mb-6 border border-gray-700/50">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-gray-300">
              Privacy Budget (ε): <span className="text-purple-400 font-bold text-lg">{epsilon.toFixed(1)}</span>
            </label>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${
              epsilon <= 0.5 ? 'bg-green-500/20 text-green-400' :
              epsilon <= 2 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-red-500/20 text-red-400'
            }`}>
              {epsilon <= 0.5 ? '🔒 Very Private' : epsilon <= 2 ? '⚖️ Balanced' : '⚠️ Less Private'}
            </span>
          </div>
          <input
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={epsilon}
            onChange={e => setEpsilon(parseFloat(e.target.value))}
            className="w-full accent-purple-500"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>ε = 0.1 (Max Privacy)</span>
            <span>ε = 5.0 (Max Utility)</span>
          </div>
        </div>

        {/* Gradients comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full" />
              Original Gradients (Before DP)
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {originalGradients.map((g, i) => (
                <div key={i} className="bg-blue-900/30 rounded-lg p-2 text-center border border-blue-500/20">
                  <div className="text-xs text-blue-300 font-mono">{g.toFixed(4)}</div>
                  <div className="mt-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.abs(g) * 50 + 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
            <h4 className="text-sm font-semibold text-purple-400 mb-3 flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full" />
              Noisy Gradients (After DP, ε={epsilon.toFixed(1)})
            </h4>
            <div className="grid grid-cols-4 gap-2">
              {noisyGradients.map((g, i) => (
                <div key={i} className="bg-purple-900/30 rounded-lg p-2 text-center border border-purple-500/20">
                  <div className="text-xs text-purple-300 font-mono">{g.toFixed(4)}</div>
                  <div className="mt-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: `${Math.abs(g) * 50 + 10}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-purple-950/30 border border-purple-500/20 rounded-xl p-4">
          <p className="text-sm text-purple-200">
            <strong>How it works:</strong> Laplacian noise ~ Lap(0, Δf/ε) is added to each gradient. Lower ε = more noise = more privacy but less accuracy. 
            The noise makes it mathematically impossible to determine any individual's data from the published results.
          </p>
        </div>
      </div>

      {/* Secure Aggregation */}
      <div className="bg-gray-900/80 border border-cyan-500/30 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-cyan-600/20 rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-cyan-400">Secure Aggregation</h3>
            <p className="text-sm text-gray-400">Server can compute the aggregate without seeing individual updates</p>
          </div>
          <button
            onClick={startSecureAggregation}
            disabled={isAnimating}
            className={`px-6 py-2 rounded-xl text-sm font-medium transition ${
              isAnimating ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-cyan-600 text-white hover:bg-cyan-500'
            }`}
          >
            {isAnimating ? 'Running...' : '▶ Animate Process'}
          </button>
        </div>

        {/* Steps */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {saSteps.map((s, i) => (
            <div
              key={i}
              className={`flex-1 min-w-[140px] rounded-xl p-3 border transition-all duration-500 ${
                i < saStep
                  ? 'bg-cyan-600/20 border-cyan-500/40 scale-[1.02]'
                  : i === saStep && isAnimating
                  ? 'bg-cyan-600/30 border-cyan-400/60 scale-105 shadow-lg shadow-cyan-500/20'
                  : 'bg-gray-800/50 border-gray-700/50'
              }`}
            >
              <div className={`mb-2 ${i <= saStep ? 'text-cyan-400' : 'text-gray-500'}`}>{s.icon}</div>
              <div className={`text-xs font-semibold mb-1 ${i <= saStep ? 'text-cyan-300' : 'text-gray-500'}`}>{s.title}</div>
              <div className={`text-[10px] ${i <= saStep ? 'text-gray-400' : 'text-gray-600'}`}>{s.desc}</div>
            </div>
          ))}
        </div>

        {/* Hospital cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {hospitals.map((h, i) => (
            <div key={i} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-cyan-600/20 rounded-lg flex items-center justify-center text-cyan-400 text-sm font-bold">
                  {String.fromCharCode(65 + i)}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{h.name}</div>
                  <div className="text-xs text-gray-500">{h.city}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className={`transition-all duration-500 ${saStep >= 1 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="text-[10px] text-blue-400 font-medium">Local Gradient</div>
                  <div className="text-xs font-mono text-blue-200 bg-blue-900/30 rounded px-2 py-1">{h.gradient}</div>
                </div>
                <div className={`transition-all duration-500 ${saStep >= 2 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="text-[10px] text-yellow-400 font-medium">Random Mask</div>
                  <div className="text-xs font-mono text-yellow-200 bg-yellow-900/30 rounded px-2 py-1">{h.mask}</div>
                </div>
                <div className={`transition-all duration-500 ${saStep >= 3 ? 'opacity-100' : 'opacity-30'}`}>
                  <div className="text-[10px] text-cyan-400 font-medium">Encrypted (Gradient + Mask)</div>
                  <div className="text-xs font-mono text-cyan-200 bg-cyan-900/30 rounded px-2 py-1">{h.encrypted}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {saStep >= 5 && (
          <div className="bg-cyan-950/30 border border-cyan-500/20 rounded-xl p-4 animate-fadeIn">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-cyan-400" />
              <span className="text-sm font-semibold text-cyan-300">Aggregation Result</span>
            </div>
            <p className="text-sm text-gray-300 mb-2">
              The server sums all masked gradients. Since masks are designed to cancel out (sum to zero), 
              the server gets the true aggregate gradient <strong className="text-cyan-400">without ever seeing individual gradients</strong>.
            </p>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50">
              <div className="text-xs text-gray-400 mb-1">Aggregated Result (masks cancelled):</div>
              <div className="text-sm font-mono text-cyan-300">Sum(∇W) = [0.036, -0.015, 0.031] → Global Model Update</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
