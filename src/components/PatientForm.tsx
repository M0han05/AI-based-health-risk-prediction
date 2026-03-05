import React, { useState } from 'react';
import { PatientData } from '../types';
import { defaultPatient } from '../utils/simulation';
import { Shield, User, Heart, Activity } from 'lucide-react';

interface Props {
  onSubmit: (patient: PatientData) => void;
}

export default function PatientForm({ onSubmit }: Props) {
  const [patient, setPatient] = useState<PatientData>(defaultPatient);
  const [step, setStep] = useState(0);

  const update = (field: keyof PatientData, value: any) => {
    setPatient(prev => ({ ...prev, [field]: value }));
  };

  const toggleArray = (field: 'familyHistory' | 'existingConditions', value: string) => {
    setPatient(prev => {
      const arr = prev[field];
      return { ...prev, [field]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value] };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(patient);
  };

  const sections = [
    {
      title: 'Personal & Aadhaar Details',
      icon: <User className="w-5 h-5" />,
      description: 'Enter your identification details securely',
    },
    {
      title: 'Health Parameters',
      icon: <Heart className="w-5 h-5" />,
      description: 'Enter your vital health measurements',
    },
    {
      title: 'Lifestyle & History',
      icon: <Activity className="w-5 h-5" />,
      description: 'Your lifestyle and medical history',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 mb-4">
          <Shield className="w-4 h-4 text-blue-400" />
          <span className="text-blue-300 text-sm font-medium">Secure Data Entry — Your data never leaves your device in FL</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Patient Registration</h2>
        <p className="text-gray-400">Enter patient details to demonstrate federated learning health risk prediction</p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center gap-2 mb-8">
        {sections.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
              step === i
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : i < step
                ? 'bg-green-600/20 text-green-400 border border-green-500/30'
                : 'bg-gray-800 text-gray-400 border border-gray-700'
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
              step === i ? 'bg-white/20' : i < step ? 'bg-green-500/30' : 'bg-gray-700'
            }`}>
              {i < step ? '✓' : i + 1}
            </span>
            {s.title}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="bg-gray-900/80 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-400">
              {sections[step].icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">{sections[step].title}</h3>
              <p className="text-sm text-gray-400">{sections[step].description}</p>
            </div>
          </div>

          {step === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Aadhaar Number <span className="text-red-400">*</span>
                  <span className="ml-2 text-xs text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded">🔒 Sensitive</span>
                </label>
                <input
                  type="text"
                  maxLength={12}
                  placeholder="XXXX XXXX XXXX"
                  value={patient.aadhaarNumber}
                  onChange={e => update('aadhaarNumber', e.target.value.replace(/\D/g, ''))}
                  className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition font-mono text-lg tracking-widest"
                />
                <p className="text-xs text-gray-500 mt-1">In FL, this data stays on your local device and is NEVER sent to the server</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Full Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  placeholder="Enter full name"
                  value={patient.name}
                  onChange={e => update('name', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Age</label>
                <input
                  type="number"
                  value={patient.age}
                  onChange={e => update('age', parseInt(e.target.value) || 0)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Gender</label>
                <select
                  value={patient.gender}
                  onChange={e => update('gender', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Phone Number</label>
                <input
                  type="text"
                  placeholder="+91 XXXXX XXXXX"
                  value={patient.phone}
                  onChange={e => update('phone', e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                <textarea
                  placeholder="Full address"
                  value={patient.address}
                  onChange={e => update('address', e.target.value)}
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition resize-none"
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Systolic BP (mmHg)</label>
                <input type="number" value={patient.bloodPressureSystolic} onChange={e => update('bloodPressureSystolic', parseInt(e.target.value) || 0)} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
                <div className="mt-2"><input type="range" min={80} max={200} value={patient.bloodPressureSystolic} onChange={e => update('bloodPressureSystolic', parseInt(e.target.value))} className="w-full accent-blue-500" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Diastolic BP (mmHg)</label>
                <input type="number" value={patient.bloodPressureDiastolic} onChange={e => update('bloodPressureDiastolic', parseInt(e.target.value) || 0)} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
                <div className="mt-2"><input type="range" min={50} max={120} value={patient.bloodPressureDiastolic} onChange={e => update('bloodPressureDiastolic', parseInt(e.target.value))} className="w-full accent-blue-500" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Blood Sugar (mg/dL)</label>
                <input type="number" value={patient.bloodSugar} onChange={e => update('bloodSugar', parseInt(e.target.value) || 0)} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
                <div className="mt-2"><input type="range" min={60} max={300} value={patient.bloodSugar} onChange={e => update('bloodSugar', parseInt(e.target.value))} className="w-full accent-blue-500" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Cholesterol (mg/dL)</label>
                <input type="number" value={patient.cholesterol} onChange={e => update('cholesterol', parseInt(e.target.value) || 0)} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
                <div className="mt-2"><input type="range" min={100} max={350} value={patient.cholesterol} onChange={e => update('cholesterol', parseInt(e.target.value))} className="w-full accent-blue-500" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">BMI</label>
                <input type="number" step="0.1" value={patient.bmi} onChange={e => update('bmi', parseFloat(e.target.value) || 0)} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
                <div className="mt-2"><input type="range" min={15} max={45} step={0.1} value={patient.bmi} onChange={e => update('bmi', parseFloat(e.target.value))} className="w-full accent-blue-500" /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Heart Rate (bpm)</label>
                <input type="number" value={patient.heartRate} onChange={e => update('heartRate', parseInt(e.target.value) || 0)} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition" />
                <div className="mt-2"><input type="range" min={40} max={160} value={patient.heartRate} onChange={e => update('heartRate', parseInt(e.target.value))} className="w-full accent-blue-500" /></div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Smoking Status</label>
                  <select value={patient.smokingStatus} onChange={e => update('smokingStatus', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition">
                    <option value="never">Never</option>
                    <option value="former">Former</option>
                    <option value="current">Current</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Alcohol Consumption</label>
                  <select value={patient.alcoholConsumption} onChange={e => update('alcoholConsumption', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition">
                    <option value="none">None</option>
                    <option value="moderate">Moderate</option>
                    <option value="heavy">Heavy</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Exercise Frequency</label>
                  <select value={patient.exerciseFrequency} onChange={e => update('exerciseFrequency', e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition">
                    <option value="none">None</option>
                    <option value="light">Light (1-2/week)</option>
                    <option value="moderate">Moderate (3-4/week)</option>
                    <option value="heavy">Heavy (5+/week)</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Family History</label>
                <div className="flex flex-wrap gap-2">
                  {['heart_disease', 'diabetes', 'stroke', 'cancer', 'kidney_disease', 'hypertension'].map(condition => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => toggleArray('familyHistory', condition)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        patient.familyHistory.includes(condition)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800 text-gray-400 border border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {condition.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-3">Existing Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {['diabetes', 'hypertension', 'asthma', 'arthritis', 'thyroid', 'obesity'].map(condition => (
                    <button
                      key={condition}
                      type="button"
                      onClick={() => toggleArray('existingConditions', condition)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                        patient.existingConditions.includes(condition)
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-800 text-gray-400 border border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {condition.charAt(0).toUpperCase() + condition.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-700/50">
            <button
              type="button"
              onClick={() => setStep(Math.max(0, step - 1))}
              className={`px-6 py-3 rounded-xl font-medium transition ${
                step === 0 ? 'invisible' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              ← Previous
            </button>
            {step < 2 ? (
              <button
                type="button"
                onClick={() => setStep(step + 1)}
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-500 transition shadow-lg shadow-blue-600/20"
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-medium hover:from-blue-500 hover:to-purple-500 transition shadow-lg shadow-blue-600/20"
              >
                🚀 Run Health Risk Prediction
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
