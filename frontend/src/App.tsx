import { useState, useMemo } from 'react';
import { PatientData, AppStep } from './types';
import { useAuth, UserRole } from './context/AuthContext';
import LoginPage from './components/LoginPage';
import PatientForm from './components/PatientForm';
import DataFlowVisualization from './components/DataFlowVisualization';
import PrivacyTechniques from './components/PrivacyTechniques';
import LearningComparison from './components/LearningComparison';
import ExplainableAI from './components/ExplainableAI';
import { Shield, Database, Lock, BarChart3, Brain, ChevronRight, Cpu, Globe, Users, HeartPulse, Hospital, LogOut, User, Server, Layers } from 'lucide-react';
import HospitalNetwork from './components/HospitalNetwork';
import ModelMathematics from './components/ModelMathematics';
import NodeTraining from './components/NodeTraining';
import FLAdminDashboard from './components/FLAdminDashboard';
import HospitalTrainingPanel from './components/HospitalTrainingPanel';
import { defaultPatient } from './utils/simulation';

const allSteps: { id: AppStep; label: string; icon: React.ReactNode; shortLabel: string; roles: UserRole[] }[] = [
  { id: 'registration', label: 'Patient Registration', icon: <Users className="w-4 h-4" />, shortLabel: '1. Register', roles: ['hospital'] },
  { id: 'fladmin', label: 'FL Admin Center', icon: <Server className="w-4 h-4" />, shortLabel: '2. FL Admin', roles: ['admin'] },
  { id: 'nodetraining', label: 'Node Training', icon: <Cpu className="w-4 h-4" />, shortLabel: '3. Node Training', roles: ['admin'] },
  { id: 'dataflow', label: 'Data Flow Visualization', icon: <Database className="w-4 h-4" />, shortLabel: '4. Data Flow', roles: ['admin'] },
  { id: 'comparison', label: 'Accuracy Comparison', icon: <BarChart3 className="w-4 h-4" />, shortLabel: '5. Accuracy', roles: ['admin'] },
  { id: 'explainability', label: 'Explainable AI', icon: <Brain className="w-4 h-4" />, shortLabel: '6. XAI', roles: ['hospital'] },
  { id: 'hospitaltraining', label: 'Local Training', icon: <Layers className="w-4 h-4" />, shortLabel: '2. Train & Submit', roles: ['hospital'] },
];

export default function App() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <LoginPage />;
  }

  return <AuthenticatedApp userRole={user.role} />;
}

function AuthenticatedApp({ userRole }: { userRole: UserRole }) {
  const { user, logout } = useAuth();
  const [currentStep, setCurrentStep] = useState<AppStep>(userRole === 'admin' ? 'fladmin' : 'registration');
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [draftPatient, setDraftPatient] = useState<PatientData>(defaultPatient);
  const [completedSteps, setCompletedSteps] = useState<AppStep[]>([]);
  const [showNetwork, setShowNetwork] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [globalAccuracy, setGlobalAccuracy] = useState<number | null>(null);

  // Filter steps based on user role
  const steps = useMemo(() => {
    return allSteps.filter(s => s.roles.includes(userRole));
  }, [userRole]);

  const handlePatientSubmit = async (data: PatientData) => {
    // If hospital, sync with backend dataset and wait for duplicate check
    if (userRole === 'hospital' && user?.username) {
      try {
        const response = await fetch('http://localhost:5000/api/fl/add-patient', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: user.username, patient: data }),
        });

        if (!response.ok) {
          const errData = await response.json();
          alert(`Registration Blocked:\n\n${errData.error || 'Duplicate patient detected.'}`);
          return; // Strictly halt the UI flow
        }
      } catch (err) {
        console.error('Failed to sync patient to hospital node:', err);
        alert('Network Error connecting to secure backend.');
        return;
      }

      setPatient(data);
      setCompletedSteps(prev => [...prev, 'registration']);
      setCurrentStep('explainability');
    } else {
      setPatient(data);
      setCompletedSteps(prev => [...prev, 'registration']);
      setCurrentStep('fladmin');
    }
  };

  const resetApp = () => {
    setPatient(null);
    setDraftPatient(defaultPatient);
    setCompletedSteps([]);
    setGlobalAccuracy(null);
    setShowNetwork(false);
    setShowMath(false);
    setCurrentStep('registration');
  };

  const goToStep = (step: AppStep) => {
    setShowNetwork(false);
    setShowMath(false);
    setCurrentStep(step);
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
  const isXAIStep = currentStep === 'explainability';

  // Steps that are always accessible
  // For admin: all steps are always accessible; patient-dependent pages show a prompt if no patient
  // For hospital: registration + hospitaltraining + explainability are always accessible
  const alwaysAccessible: AppStep[] = userRole === 'admin'
    ? ['fladmin', 'nodetraining', 'dataflow', 'comparison', 'privacy']
    : ['registration', 'fladmin', 'nodetraining', 'hospitaltraining', 'explainability'];

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
              {steps.map((step, i) => {
                const hasAccess = alwaysAccessible.includes(step.id);
                // Comparison is only unlocked once accuracy is available
                const isDisabled = !hasAccess;

                return (
                  <button
                    key={step.id}
                    onClick={() => goToStep(step.id)}
                    disabled={isDisabled}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${currentStep === step.id
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : completedSteps.includes(step.id)
                        ? 'bg-green-600/15 text-green-400 hover:bg-green-600/25'
                        : !isDisabled
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
                );
              })}
            </nav>

            <div className="flex items-center gap-2">
              {/* Role Badge */}
              <div className={`hidden sm:flex items-center gap-1.5 rounded-full px-3 py-1.5 border ${userRole === 'admin'
                ? 'bg-purple-500/10 border-purple-500/30'
                : 'bg-emerald-500/10 border-emerald-500/30'
                }`}>
                {userRole === 'admin' ? (
                  <User className="w-3 h-3 text-purple-400" />
                ) : (
                  <Hospital className="w-3 h-3 text-emerald-400" />
                )}
                <span className={`text-[10px] font-semibold uppercase tracking-wide ${userRole === 'admin' ? 'text-purple-400' : 'text-emerald-400'
                  }`}>
                  {userRole === 'admin' ? 'Admin' : user?.hospitalName || 'Hospital'}
                </span>
                {userRole === 'hospital' && user?.hospitalId && (
                  <span className="text-[9px] text-gray-600 font-mono ml-1">({user.hospitalId})</span>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-1 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1">
                <Shield className="w-3 h-3 text-green-400" />
                <span className="text-[10px] text-green-400 font-medium">Privacy Protected</span>
              </div>

              {/* Logout Button */}
              <button
                onClick={logout}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/30"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
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
          {steps.map((step) => {
            const hasAccess = alwaysAccessible.includes(step.id);
            const isDisabled = !hasAccess;

            return (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                disabled={isDisabled}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-medium whitespace-nowrap transition ${currentStep === step.id
                  ? 'bg-blue-600 text-white'
                  : completedSteps.includes(step.id)
                    ? 'bg-green-600/15 text-green-400'
                    : !isDisabled
                      ? 'text-gray-400'
                      : 'text-gray-600 cursor-not-allowed'
                  }`}
              >
                {step.icon}
                {step.shortLabel}
              </button>
            );
          })}
        </div>
      </div>

      {/* Hero (only on registration for admin) */}
      {currentStep === 'registration' && !patient && !showNetwork && userRole === 'admin' && (
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

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              <button
                onClick={() => setShowNetwork(true)}
                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold border border-white/10 flex items-center gap-2 transition backdrop-blur-sm"
              >
                <Hospital className="w-5 h-5 text-blue-400" />
                Explore Hospital Network
              </button>
            </div>

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

      {/* Hospital Hero */}
      {currentStep === 'registration' && !patient && !showNetwork && userRole === 'hospital' && (
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/5 via-teal-600/5 to-cyan-600/5" />
          <div className="absolute inset-0">
            <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          </div>
          <div className="relative max-w-5xl mx-auto px-4 py-16 text-center">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-6">
              <Hospital className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-emerald-300">{user?.hospitalName || 'Hospital Portal'} — Patient Risk Assessment</span>
              {user?.hospitalId && (
                <span className="text-[10px] text-gray-500 font-mono">· {user.hospitalId}</span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                Patient Health Risk Assessment
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-8">
              Register a patient, view AI-powered risk predictions with explainable insights,
              and train the federated model on your local data — without sharing patient records.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {[
                { icon: <Users className="w-6 h-6" />, label: 'Patient Registration', desc: 'Enter patient vitals', color: 'emerald' },
                { icon: <Layers className="w-6 h-6" />, label: 'Local Training', desc: 'Train on your data', color: 'blue' },
                { icon: <Brain className="w-6 h-6" />, label: 'Explainable AI', desc: 'Understand predictions', color: 'teal' },
                { icon: <Shield className="w-6 h-6" />, label: 'PDF Report', desc: 'Download report', color: 'cyan' },
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
        {showNetwork && (
          <HospitalNetwork onClose={() => setShowNetwork(false)} />
        )}
        {currentStep === 'registration' && !showNetwork && (
          <PatientForm
            onSubmit={handlePatientSubmit}
            initialData={draftPatient}
            onChange={setDraftPatient}
          />
        )}
        {currentStep === 'fladmin' && userRole === 'admin' && !showNetwork && (
          <FLAdminDashboard onAccuracyUpdate={setGlobalAccuracy} onShowNetwork={() => setShowNetwork(true)} />
        )}
        {currentStep === 'hospitaltraining' && userRole === 'hospital' && !showNetwork && (
          <HospitalTrainingPanel />
        )}
        {currentStep === 'dataflow' && !showNetwork && (
          <DataFlowVisualization patient={patient || defaultPatient} />
        )}
        {currentStep === 'privacy' && !showNetwork && (
          <PrivacyTechniques />
        )}
        {currentStep === 'nodetraining' && !showNetwork && (
          <NodeTraining onAccuracyUpdate={setGlobalAccuracy} />
        )}
        {currentStep === 'comparison' && !showNetwork && (
          <LearningComparison patient={patient || defaultPatient} trainedAccuracy={globalAccuracy} />
        )}
        {isXAIStep && !showNetwork && (
          patient && !showMath
            ? <ExplainableAI patient={patient} onShowMath={() => setShowMath(true)} onReset={resetApp} />
            : !showMath && <NoPatientPrompt stepName="Explainable AI" onRegister={() => setCurrentStep('registration')} />
        )}
        {showMath && patient && !showNetwork && (
          <ModelMathematics patient={patient} onBack={() => setShowMath(false)} />
        )}

        {/* Navigation Footer */}
        {(currentStep !== 'registration' || patient) && (
          <div className="flex justify-between mt-10 pt-6 border-t border-gray-800/50">
            <button
              onClick={goPrev}
              className={`px-6 py-3 rounded-xl font-medium transition ${currentIdx === 0 ? 'invisible' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
            >
              ← Previous Step
            </button>
            {currentIdx < steps.length - 1 && (
              <button
                onClick={goNext}
                disabled={(currentStep === 'registration' && !patient) || (currentStep === 'nodetraining' && !globalAccuracy)}
                className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition shadow-lg shadow-blue-600/20 ${(currentStep === 'registration' && !patient) || (currentStep === 'nodetraining' && !globalAccuracy) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
          AI Health Risk Prediction System — Demonstrating Federated Learning, Differential Privacy, Secure Aggregation &amp; Explainable AI
        </p>
        <p className="text-[10px] text-gray-700 mt-1">
          Logged in as <span className={userRole === 'admin' ? 'text-purple-500' : 'text-emerald-500'}>{user?.username}</span>
          {' '}({userRole === 'admin' ? 'Administrator' : user?.hospitalName})
          {userRole === 'hospital' && user?.hospitalId && (
            <span className="text-gray-700 font-mono"> · {user.hospitalId}</span>
          )}
        </p>
      </footer>
    </div>
  );
}

// ──────────────────────────────────────────────
// Prompt shown when a patient-dependent page is
// visited before registering a patient
// ──────────────────────────────────────────────
function NoPatientPrompt({
  stepName,
  onRegister,
}: {
  stepName: string;
  onRegister: () => void;
}) {
  return (
    <div className="max-w-xl mx-auto text-center py-24 px-6">
      <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
        <Users className="w-10 h-10 text-amber-400" />
      </div>
      <h3 className="text-2xl font-bold text-white mb-3">
        Patient Data Required
      </h3>
      <p className="text-gray-400 mb-2">
        The <strong className="text-white">{stepName}</strong> page needs a registered patient's data to display results.
      </p>
      <p className="text-gray-500 text-sm mb-8">
        Please complete Patient Registration first, then return to this step.
      </p>
      <button
        onClick={onRegister}
        className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all hover:scale-105"
      >
        <Users className="w-4 h-4" />
        Go to Patient Registration
      </button>
    </div>
  );
}
