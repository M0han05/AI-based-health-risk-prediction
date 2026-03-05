import { useState } from 'react';
import { PatientData, AppStep } from './types';
import PatientForm from './components/PatientForm';
import DataFlowVisualization from './components/DataFlowVisualization';
import PrivacyTechniques from './components/PrivacyTechniques';
import LearningComparison from './components/LearningComparison';
import ExplainableAI from './components/ExplainableAI';
import { Shield, Database, Lock, BarChart3, Brain, ChevronRight, Cpu, Globe, Users, HeartPulse } from 'lucide-react';

const steps: { id: AppStep; label: string; icon: React.ReactNode; shortLabel: string }[] = [
  { id: 'registration', label: 'Patient Registration', icon: <Users className="w-4 h-4" />, shortLabel: '1. Register' },
  { id: 'dataflow', label: 'Data Flow Visualization', icon: <Database className="w-4 h-4" />, shortLabel: '2. Data Flow' },
  { id: 'privacy', label: 'Privacy Techniques', icon: <Lock className="w-4 h-4" />, shortLabel: '3. Privacy' },
  { id: 'comparison', label: 'Accuracy Comparison', icon: <BarChart3 className="w-4 h-4" />, shortLabel: '4. Accuracy' },
  { id: 'explainability', label: 'Explainable AI', icon: <Brain className="w-4 h-4" />, shortLabel: '5. XAI' },
];

export default function App() {
  const [currentStep, setCurrentStep] = useState<AppStep>('registration');
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [completedSteps, setCompletedSteps] = useState<AppStep[]>([]);

  const handlePatientSubmit = (data: PatientData) => {
    setPatient(data);
    setCompletedSteps(prev => [...prev, 'registration']);
    setCurrentStep('dataflow');
  };

  const goToStep = (step: AppStep) => {
    if (step === 'registration' || patient) {
      setCurrentStep(step);
    }
  };

  const goNext = () => {
    const idx = steps.findIndex(s => s.id === currentStep);
    if (idx < steps.length - 1) {
      setCompletedSteps(prev => prev.includes(currentStep) ? prev : [...prev, currentStep]);
      setCurrentStep(steps[idx + 1].id);
    }
  };

  const goPrev = () => {
    const idx = steps.findIndex(s => s.id === currentStep);
    if (idx > 0) setCurrentStep(steps[idx - 1].id);
  };

  const currentIdx = steps.findIndex(s => s.id === currentStep);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <HeartPulse className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI Health Risk Prediction
                </h1>
                <p className="text-[10px] text-gray-500 -mt-0.5">Powered by Federated Learning</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {steps.map((step, i) => (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  disabled={step.id !== 'registration' && !patient}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    currentStep === step.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : completedSteps.includes(step.id)
                      ? 'bg-green-600/15 text-green-400 hover:bg-green-600/25'
                      : patient || step.id === 'registration'
                      ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {completedSteps.includes(step.id) && currentStep !== step.id ? (
                    <span className="text-green-400">✓</span>
                  ) : (
                    step.icon
                  )}
                  <span className="hidden lg:inline">{step.shortLabel}</span>
                  {i < steps.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-gray-600 ml-1" />
                  )}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-1 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1">
                <Shield className="w-3 h-3 text-green-400" />
                <span className="text-[10px] text-green-400 font-medium">Privacy Protected</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-0.5 bg-gray-900">
          <div
            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
            style={{ width: `${((currentIdx + 1) / steps.length) * 100}%` }}
          />
        </div>
      </header>

      {/* Mobile Navigation */}
      <div className="md:hidden sticky top-[65px] z-40 bg-gray-950/90 backdrop-blur-xl border-b border-gray-800/50 px-2 py-2">
        <div className="flex gap-1 overflow-x-auto">
          {steps.map((step) => (
            <button
              key={step.id}
              onClick={() => goToStep(step.id)}
              disabled={step.id !== 'registration' && !patient}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition ${
                currentStep === step.id
                  ? 'bg-blue-600 text-white'
                  : completedSteps.includes(step.id)
                  ? 'bg-green-600/15 text-green-400'
                  : 'text-gray-500'
              }`}
            >
              {step.icon}
              {step.shortLabel}
            </button>
          ))}
        </div>
      </div>

      {/* Hero (only on registration) */}
      {currentStep === 'registration' && !patient && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-cyan-600/5" />
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
            <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
              <Cpu className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-blue-300">Federated Learning + Differential Privacy + Secure Aggregation</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                AI-Based Health Risk Prediction
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              Experience how Federated Learning enables accurate health predictions 
              while keeping your Aadhaar, personal details, and medical records completely private.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { icon: <Shield className="w-6 h-6" />, label: 'Federated Learning', desc: 'Data stays local', color: 'blue' },
                { icon: <Lock className="w-6 h-6" />, label: 'Differential Privacy', desc: 'Noise-based protection', color: 'purple' },
                { icon: <Globe className="w-6 h-6" />, label: 'Secure Aggregation', desc: 'Encrypted gradients', color: 'cyan' },
                { icon: <Brain className="w-6 h-6" />, label: 'Explainable AI', desc: 'Transparent predictions', color: 'amber' },
              ].map((item, i) => (
                <div
                  key={i}
                  className={`bg-gray-900/80 border border-${item.color}-500/20 rounded-xl p-4 backdrop-blur-sm`}
                >
                  <div className={`text-${item.color}-400 mb-2`}>{item.icon}</div>
                  <div className="text-sm font-semibold text-white">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentStep === 'registration' && (
          <PatientForm onSubmit={handlePatientSubmit} />
        )}
        {currentStep === 'dataflow' && patient && (
          <DataFlowVisualization patient={patient} />
        )}
        {currentStep === 'privacy' && (
          <PrivacyTechniques />
        )}
        {currentStep === 'comparison' && patient && (
          <LearningComparison patient={patient} />
        )}
        {currentStep === 'explainability' && patient && (
          <ExplainableAI patient={patient} />
        )}

        {/* Navigation Footer */}
        {(currentStep !== 'registration' || patient) && (
          <div className="flex justify-between mt-10 pt-6 border-t border-gray-800/50">
            <button
              onClick={goPrev}
              className={`px-6 py-3 rounded-xl font-medium transition ${
                currentIdx === 0 ? 'invisible' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              ← Previous Step
            </button>
            {currentIdx < steps.length - 1 && (
              <button
                onClick={goNext}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition shadow-lg shadow-blue-600/20"
              >
                Next Step →
              </button>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-800/50 mt-12 py-6 text-center">
        <p className="text-xs text-gray-600">
          AI Health Risk Prediction System — Demonstrating Federated Learning, Differential Privacy, Secure Aggregation & Explainable AI
        </p>
        <p className="text-[10px] text-gray-700 mt-1">
          This is a simulation for educational purposes. No real medical predictions are made.
        </p>
      </footer>
    </div>
  );
}
