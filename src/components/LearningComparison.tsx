import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Cell } from 'recharts';
import { PatientData, AccuracyResult, HealthRisk } from '../types';
import { generateAccuracyResults, calculateHealthRisks } from '../utils/simulation';
import { Award, Target, Zap, BarChart3, Activity } from 'lucide-react';

interface Props {
  patient: PatientData;
}

export default function LearningComparison({ patient }: Props) {
  const [results, setResults] = useState<AccuracyResult[]>([]);
  const [risks, setRisks] = useState<HealthRisk[]>([]);
  const [animatedValues, setAnimatedValues] = useState<number[]>([0, 0, 0]);
  const [showResults, setShowResults] = useState(false);
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [currentTraining, setCurrentTraining] = useState('');

  useEffect(() => {
    const r = generateAccuracyResults(patient);
    setResults(r);
    setRisks(calculateHealthRisks(patient));
    startTraining(r);
  }, [patient]);

  const startTraining = (r: AccuracyResult[]) => {
    setShowResults(false);
    setTrainingProgress(0);
    
    const phases = [
      { name: 'Centralized Learning — Training on server...', duration: 30 },
      { name: 'Federated Learning — Distributed training...', duration: 65 },
      { name: 'Local Learning — Training on device...', duration: 100 },
    ];

    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      setTrainingProgress(progress);
      
      if (progress <= 30) setCurrentTraining(phases[0].name);
      else if (progress <= 65) setCurrentTraining(phases[1].name);
      else setCurrentTraining(phases[2].name);

      if (progress >= 100) {
        clearInterval(interval);
        setShowResults(true);
        // Animate values
        const target = r.map(a => a.accuracy);
        let frame = 0;
        const animInterval = setInterval(() => {
          frame += 2;
          setAnimatedValues(target.map(t => Math.min(t, (t * frame) / 100)));
          if (frame >= 100) clearInterval(animInterval);
        }, 20);
      }
    }, 40);
  };

  const barData = results.map(r => ({
    name: r.method.split(' (')[0],
    short: r.method.match(/\((\w+)\)/)?.[1] || '',
    Accuracy: parseFloat(r.accuracy.toFixed(1)),
    Precision: parseFloat(r.precision.toFixed(1)),
    Recall: parseFloat(r.recall.toFixed(1)),
    'F1 Score': parseFloat(r.f1Score.toFixed(1)),
    color: r.color,
  }));

  const radarData = [
    { metric: 'Accuracy', FL: results[0]?.accuracy || 0, CL: results[1]?.accuracy || 0, LL: results[2]?.accuracy || 0 },
    { metric: 'Precision', FL: results[0]?.precision || 0, CL: results[1]?.precision || 0, LL: results[2]?.precision || 0 },
    { metric: 'Recall', FL: results[0]?.recall || 0, CL: results[1]?.recall || 0, LL: results[2]?.recall || 0 },
    { metric: 'F1 Score', FL: results[0]?.f1Score || 0, CL: results[1]?.f1Score || 0, LL: results[2]?.f1Score || 0 },
    { metric: 'Privacy', FL: 95, CL: 20, LL: 98 },
    { metric: 'Scalability', FL: 90, CL: 95, LL: 30 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Model Accuracy Comparison</h2>
        <p className="text-gray-400">Comparing FL, CL, and LL predictions for the same patient</p>
      </div>

      {/* Training Progress */}
      {!showResults && (
        <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
            <span className="text-lg font-semibold text-white">Training Models...</span>
          </div>
          <div className="mb-2 text-sm text-gray-400">{currentTraining}</div>
          <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-green-600 rounded-full transition-all duration-300"
              style={{ width: `${trainingProgress}%` }}
            />
          </div>
          <div className="text-right text-xs text-gray-500 mt-1">{trainingProgress}%</div>
        </div>
      )}

      {showResults && (
        <>
          {/* Accuracy Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {results.map((r, i) => (
              <div
                key={r.method}
                className="bg-gray-900/80 border rounded-2xl p-6 backdrop-blur-sm transition-all hover:scale-[1.02]"
                style={{ borderColor: `${r.color}40` }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: r.color }} />
                    <span className="text-sm font-medium text-gray-400">{r.method.match(/\((\w+)\)/)?.[1]}</span>
                  </div>
                  {i === 0 && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">🛡️ Private</span>}
                  {i === 1 && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">⚠️ Exposed</span>}
                  {i === 2 && <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded-full">📱 Local Only</span>}
                </div>
                <div className="text-4xl font-bold text-white mb-1" style={{ color: r.color }}>
                  {animatedValues[i]?.toFixed(1)}%
                </div>
                <div className="text-sm text-gray-400 mb-4">{r.method.split(' (')[0]}</div>
                <div className="space-y-2">
                  {[
                    { label: 'Precision', value: r.precision },
                    { label: 'Recall', value: r.recall },
                    { label: 'F1 Score', value: r.f1Score },
                  ].map(m => (
                    <div key={m.label} className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{m.label}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${m.value}%`, backgroundColor: r.color }} />
                        </div>
                        <span className="text-xs text-gray-400 w-12 text-right">{m.value.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Key Insight */}
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Award className="w-6 h-6 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-lg font-semibold text-white mb-1">Key Insight</h4>
                <p className="text-sm text-gray-300">
                  <strong className="text-blue-400">Federated Learning achieves {results[0]?.accuracy.toFixed(1)}% accuracy</strong> — only ~{(results[1]?.accuracy - results[0]?.accuracy).toFixed(1)}% less than Centralized Learning ({results[1]?.accuracy.toFixed(1)}%), 
                  while <strong className="text-green-400">keeping all patient data completely private</strong>. Local Learning ({results[2]?.accuracy.toFixed(1)}%) suffers from limited data diversity.
                  FL provides the best trade-off between <strong className="text-purple-400">privacy and performance</strong>.
                </p>
              </div>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-semibold text-white">Performance Metrics</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barData} barGap={2}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="short" stroke="#9ca3af" fontSize={12} />
                  <YAxis domain={[60, 100]} stroke="#9ca3af" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="Accuracy" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                  <Bar dataKey="Precision" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.7} />
                    ))}
                  </Bar>
                  <Bar dataKey="Recall" radius={[4, 4, 0, 0]}>
                    {barData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.5} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-purple-400" />
                <h3 className="text-lg font-semibold text-white">Multi-dimensional Comparison</h3>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis dataKey="metric" stroke="#9ca3af" fontSize={11} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#4b5563" fontSize={10} />
                  <Radar name="FL" dataKey="FL" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                  <Radar name="CL" dataKey="CL" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={2} />
                  <Radar name="LL" dataKey="LL" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} strokeWidth={2} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Health Risk Predictions */}
          <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-5 h-5 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Health Risk Predictions for Patient</h3>
              <span className="text-sm text-gray-400">(Using FL Model — {results[0]?.accuracy.toFixed(1)}% accuracy)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {risks.map((risk, i) => (
                <div key={i} className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
                  <div className="text-sm font-medium text-white mb-2">{risk.disease}</div>
                  <div className="text-3xl font-bold mb-1" style={{ color: risk.color }}>{risk.risk}%</div>
                  <div className="flex items-center gap-2">
                    <span
                      className="text-xs font-medium px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${risk.color}20`, color: risk.color }}
                    >
                      {risk.severity.toUpperCase()}
                    </span>
                  </div>
                  <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${risk.risk}%`, backgroundColor: risk.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
