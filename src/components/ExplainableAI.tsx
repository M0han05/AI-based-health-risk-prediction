import { useState, useEffect } from 'react';
import { PatientData, FeatureImportance, HealthRisk } from '../types';
import { generateFeatureImportance, calculateHealthRisks } from '../utils/simulation';
import { Brain, ArrowUp, ArrowDown, Info, Lightbulb, ChevronRight } from 'lucide-react';

interface Props {
  patient: PatientData;
}

export default function ExplainableAI({ patient }: Props) {
  const [features, setFeatures] = useState<FeatureImportance[]>([]);
  const [risks, setRisks] = useState<HealthRisk[]>([]);
  const [selectedDisease, setSelectedDisease] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setFeatures(generateFeatureImportance(patient));
    setRisks(calculateHealthRisks(patient));
    setTimeout(() => setShowExplanation(true), 500);
  }, [patient]);

  const selectedRisk = risks[selectedDisease];

  const getExplanationText = (risk: HealthRisk | undefined): string => {
    if (!risk) return '';
    const topFeatures = features.slice(0, 3);
    const posFeatures = topFeatures.filter(f => f.direction === 'positive');
    const negFeatures = topFeatures.filter(f => f.direction === 'negative');
    
    let text = `The model predicts a ${risk.risk}% risk of ${risk.disease} (${risk.severity} severity). `;
    if (posFeatures.length > 0) {
      text += `Key risk factors include: ${posFeatures.map(f => `${f.feature} (${f.value})`).join(', ')}. `;
    }
    if (negFeatures.length > 0) {
      text += `Protective factors include: ${negFeatures.map(f => `${f.feature} (${f.value})`).join(', ')}. `;
    }
    return text;
  };

  const decisionPath = [
    { node: 'Input Features', desc: '10 health parameters', level: 0 },
    { node: 'Feature Extraction', desc: 'Normalize & encode', level: 1 },
    { node: 'Hidden Layer 1', desc: '64 neurons, ReLU', level: 2 },
    { node: 'Attention Module', desc: 'Feature weighting', level: 3 },
    { node: 'Hidden Layer 2', desc: '32 neurons, ReLU', level: 4 },
    { node: 'Risk Classification', desc: 'Softmax output', level: 5 },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-white mb-2">Explainable AI (XAI)</h2>
        <p className="text-gray-400">Understanding <em>why</em> the model makes specific health risk predictions</p>
      </div>

      {/* Disease selector */}
      <div className="flex flex-wrap gap-2 justify-center">
        {risks.map((risk, i) => (
          <button
            key={i}
            onClick={() => setSelectedDisease(i)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedDisease === i
                ? 'text-white shadow-lg scale-105'
                : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
            }`}
            style={selectedDisease === i ? { backgroundColor: risk.color, boxShadow: `0 8px 20px ${risk.color}30` } : {}}
          >
            {risk.disease} ({risk.risk}%)
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Feature Importance (SHAP-like) */}
        <div className="lg:col-span-2 bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-6">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold text-white">SHAP Feature Importance</h3>
          </div>

          <div className="space-y-3">
            {features.map((f, i) => (
              <div
                key={i}
                className={`transition-all duration-500 ${showExplanation ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-36 text-right">
                    <span className="text-xs text-gray-400">{f.feature}</span>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                    f.direction === 'positive' ? 'bg-red-500/20' : 'bg-green-500/20'
                  }`}>
                    {f.direction === 'positive' 
                      ? <ArrowUp className="w-3 h-3 text-red-400" />
                      : <ArrowDown className="w-3 h-3 text-green-400" />
                    }
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 h-7 bg-gray-800 rounded-lg overflow-hidden relative">
                      <div
                        className={`h-full rounded-lg transition-all duration-1000 flex items-center px-2 ${
                          f.direction === 'positive' ? 'bg-red-500/30' : 'bg-green-500/30'
                        }`}
                        style={{ width: `${f.importance * 100}%`, transitionDelay: `${i * 80}ms` }}
                      >
                        <span className="text-[10px] font-mono text-white whitespace-nowrap">
                          {f.direction === 'positive' ? '+' : '-'}{(f.importance * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 w-20 text-right font-mono">{f.value}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 bg-gray-800/50 rounded-xl p-3 border border-gray-700/50">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-gray-400">
                <strong className="text-gray-300">SHAP (SHapley Additive exPlanations)</strong> values show each feature's contribution to the prediction.
                <span className="text-red-400"> Red bars (↑)</span> indicate features increasing risk. 
                <span className="text-green-400"> Green bars (↓)</span> indicate protective factors.
              </p>
            </div>
          </div>
        </div>

        {/* Decision Path & Summary */}
        <div className="space-y-6">
          {/* Model decision path */}
          <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <ChevronRight className="w-5 h-5 text-cyan-400" />
              Model Decision Path
            </h3>
            <div className="space-y-0">
              {decisionPath.map((step, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      i === decisionPath.length - 1
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}>
                      {i + 1}
                    </div>
                    {i < decisionPath.length - 1 && (
                      <div className="w-0.5 h-6 bg-gray-700 my-1" />
                    )}
                  </div>
                  <div className="pb-2">
                    <div className="text-sm font-medium text-white">{step.node}</div>
                    <div className="text-xs text-gray-500">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Natural Language Explanation */}
          <div className="bg-gray-900/80 border border-amber-500/30 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-semibold text-amber-300">AI Explanation</h3>
            </div>
            <div className="bg-amber-950/30 rounded-xl p-4 border border-amber-500/20">
              <p className="text-sm text-amber-100 leading-relaxed">
                {getExplanationText(selectedRisk)}
              </p>
            </div>
            {selectedRisk && (
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Prediction Confidence</div>
                  <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(95, 70 + selectedRisk.risk * 0.25)}%`,
                        backgroundColor: selectedRisk.color,
                      }}
                    />
                  </div>
                </div>
                <span className="text-sm font-bold" style={{ color: selectedRisk.color }}>
                  {Math.min(95, 70 + selectedRisk.risk * 0.25).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {selectedRisk && selectedRisk.risk > 30 && (
        <div className="bg-gray-900/80 border border-green-500/30 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-green-400 mb-4">🏥 AI-Powered Recommendations</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Lifestyle Changes', items: ['Increase physical activity to 30 min/day', 'Adopt DASH or Mediterranean diet', 'Reduce sodium intake to <2300mg/day'] },
              { title: 'Medical Monitoring', items: ['Schedule comprehensive health checkup', 'Monitor blood pressure weekly', 'Get HbA1c test every 3 months'] },
              { title: 'Preventive Care', items: ['Consult cardiologist if risk >50%', 'Consider statin therapy evaluation', 'Regular stress management'] },
            ].map((cat, i) => (
              <div key={i} className="bg-green-950/20 border border-green-500/20 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-green-300 mb-3">{cat.title}</h4>
                <ul className="space-y-2">
                  {cat.items.map((item, j) => (
                    <li key={j} className="flex items-start gap-2 text-xs text-gray-300">
                      <span className="text-green-400 mt-0.5">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
