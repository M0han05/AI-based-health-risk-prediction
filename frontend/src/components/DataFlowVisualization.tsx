import { useState, useEffect, useRef } from 'react';
import { PatientData } from '../types';
import { maskAadhaar } from '../utils/simulation';
import { AlertTriangle, ShieldCheck, Eye, EyeOff, Server, Smartphone, Lock, Unlock } from 'lucide-react';

interface Props {
  patient: PatientData;
}

interface Packet {
  id: number;
  progress: number;
  label: string;
  sensitive: boolean;
}

export default function DataFlowVisualization({ patient }: Props) {
  const [clPackets, setClPackets] = useState<Packet[]>([]);
  const [flPackets, setFlPackets] = useState<Packet[]>([]);
  const [clServerData, setClServerData] = useState<string[]>([]);
  const [flServerData, setFlServerData] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [round, setRound] = useState(0);
  const packetIdRef = useRef(0);

  const clDataItems = [
    { label: `Name: ${patient.name || 'Rahul Sharma'}`, sensitive: true },
    { label: `Aadhaar: ${patient.aadhaarNumber || '987654321012'}`, sensitive: true },
    { label: `Phone: ${patient.phone || '+91 98765 43210'}`, sensitive: true },
    { label: `Age: ${patient.age}`, sensitive: true },
    { label: `Address: ${patient.address || 'Mumbai, MH'}`, sensitive: true },
    { label: `BP: ${patient.bloodPressureSystolic}/${patient.bloodPressureDiastolic}`, sensitive: true },
    { label: `Sugar: ${patient.bloodSugar} mg/dL`, sensitive: true },
    { label: `Cholesterol: ${patient.cholesterol}`, sensitive: true },
    { label: `BMI: ${patient.bmi}`, sensitive: true },
    { label: `Smoking: ${patient.smokingStatus}`, sensitive: true },
  ];

  const flDataItems = [
    { label: 'Gradient ∇W₁: [0.023, -0.041]', sensitive: false },
    { label: 'Gradient ∇W₂: [-0.018, 0.055]', sensitive: false },
    { label: 'Gradient ∇b₁: [0.007]', sensitive: false },
    { label: 'Loss: 0.342', sensitive: false },
    { label: 'Gradient ∇W₃: [0.031, -0.029]', sensitive: false },
    { label: 'Model Update Δθ: 0.0012', sensitive: false },
    { label: 'Encrypted ∇W₄: [enc...]', sensitive: false },
    { label: 'Batch Norm μ: 0.501', sensitive: false },
  ];

  const startSimulation = () => {
    setIsRunning(true);
    setClPackets([]);
    setFlPackets([]);
    setClServerData([]);
    setFlServerData([]);
    setRound(0);
  };

  useEffect(() => {
    if (!isRunning) return;

    let clIndex = 0;
    let flIndex = 0;

    const interval = setInterval(() => {
      if (clIndex < clDataItems.length) {
        const item = clDataItems[clIndex];
        const id = ++packetIdRef.current;
        setClPackets(prev => [...prev, { id, progress: 0, label: item.label, sensitive: item.sensitive }]);
        clIndex++;
      }

      if (flIndex < flDataItems.length) {
        const item = flDataItems[flIndex];
        const id = ++packetIdRef.current;
        setFlPackets(prev => [...prev, { id, progress: 0, label: item.label, sensitive: item.sensitive }]);
        flIndex++;
      }

      setRound(prev => prev + 1);

      if (clIndex >= clDataItems.length && flIndex >= flDataItems.length) {
        setTimeout(() => setIsRunning(false), 2000);
        clearInterval(interval);
      }
    }, 800);

    return () => clearInterval(interval);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning && clPackets.length === 0) return;
    const anim = setInterval(() => {
      setClPackets(prev => {
        const updated = prev.map(p => ({ ...p, progress: Math.min(p.progress + 4, 100) }));
        updated.forEach(p => {
          if (p.progress >= 100) {
            setClServerData(sd => sd.includes(p.label) ? sd : [...sd, p.label]);
          }
        });
        return updated.filter(p => p.progress < 100);
      });
      setFlPackets(prev => {
        const updated = prev.map(p => ({ ...p, progress: Math.min(p.progress + 4, 100) }));
        updated.forEach(p => {
          if (p.progress >= 100) {
            setFlServerData(sd => sd.includes(p.label) ? sd : [...sd, p.label]);
          }
        });
        return updated.filter(p => p.progress < 100);
      });
    }, 50);
    return () => clearInterval(anim);
  }, [isRunning, clPackets.length, flPackets.length]);

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Live Data Flow Comparison</h2>
        <p className="text-gray-400 mb-4">See exactly what data reaches the central server in Centralized vs Federated Learning</p>
        <button
          onClick={startSimulation}
          disabled={isRunning}
          className={`px-8 py-3 rounded-xl font-medium text-white transition shadow-lg ${
            isRunning
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-blue-600/20'
          }`}
        >
          {isRunning ? `⏳ Transmitting Data (Round ${round})...` : '▶ Start Live Simulation'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CENTRALIZED LEARNING */}
        <div className="bg-gray-900/80 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-600/20 rounded-xl flex items-center justify-center">
              <Unlock className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-400">Centralized Learning</h3>
              <div className="flex items-center gap-1 text-xs text-red-300">
                <AlertTriangle className="w-3 h-3" /> ALL raw data sent to server — INSECURE
              </div>
            </div>
          </div>

          {/* Data Flow Animation */}
          <div className="relative h-36 mb-4 bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <Smartphone className="w-8 h-8 text-gray-400" />
              <span className="text-[10px] text-gray-500 mt-1">Patient</span>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <Server className="w-8 h-8 text-red-400" />
              <span className="text-[10px] text-red-400 mt-1">Server</span>
            </div>
            {/* Connection line */}
            <div className="absolute left-14 right-14 top-1/2 h-0.5 bg-gray-700 -translate-y-1/2">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/50 to-red-500/0 animate-pulse" />
            </div>
            {/* Packets */}
            {clPackets.map(p => (
              <div
                key={p.id}
                className="absolute top-1/2 -translate-y-1/2 transition-none"
                style={{ left: `${12 + (p.progress / 100) * 72}%` }}
              >
                <div className="relative">
                  <div className="bg-red-500 text-white text-[8px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg shadow-red-500/30 -translate-x-1/2 font-mono max-w-[140px] truncate flex items-center gap-1">
                    <Eye className="w-2.5 h-2.5 flex-shrink-0" />
                    {p.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Server received data */}
          <div className="bg-red-950/30 border border-red-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Eye className="w-4 h-4 text-red-400" />
              <span className="text-sm font-semibold text-red-300">Data on Central Server (EXPOSED)</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {clServerData.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Waiting for simulation...</p>
              ) : (
                clServerData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-red-900/30 rounded-lg px-3 py-1.5 border border-red-500/20 animate-fadeIn">
                    <AlertTriangle className="w-3 h-3 text-red-400 flex-shrink-0" />
                    <span className="text-xs text-red-200 font-mono">{item}</span>
                  </div>
                ))
              )}
            </div>
            {clServerData.length > 0 && (
              <div className="mt-3 bg-red-600/20 border border-red-500/30 rounded-lg px-3 py-2">
                <p className="text-xs text-red-300">⚠️ <strong>Privacy Violation:</strong> Server has full access to patient's Aadhaar ({patient.aadhaarNumber || '987654321012'}), name, address, and all health records!</p>
              </div>
            )}
          </div>
        </div>

        {/* FEDERATED LEARNING */}
        <div className="bg-gray-900/80 border border-green-500/30 rounded-2xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-600/20 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-green-400">Federated Learning</h3>
              <div className="flex items-center gap-1 text-xs text-green-300">
                <ShieldCheck className="w-3 h-3" /> Only model gradients sent — DATA STAYS LOCAL
              </div>
            </div>
          </div>

          {/* Data Flow Animation */}
          <div className="relative h-36 mb-4 bg-gray-800/50 rounded-xl overflow-hidden border border-gray-700/50">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <div className="relative">
                <Smartphone className="w-8 h-8 text-green-400" />
                <Lock className="w-3 h-3 text-green-400 absolute -top-1 -right-1" />
              </div>
              <span className="text-[10px] text-green-400 mt-1">Patient</span>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col items-center">
              <Server className="w-8 h-8 text-green-400" />
              <span className="text-[10px] text-green-400 mt-1">Server</span>
            </div>
            <div className="absolute left-14 right-14 top-1/2 h-0.5 bg-gray-700 -translate-y-1/2">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/0 via-green-500/50 to-green-500/0 animate-pulse" />
            </div>
            {flPackets.map(p => (
              <div
                key={p.id}
                className="absolute top-1/2 -translate-y-1/2 transition-none"
                style={{ left: `${12 + (p.progress / 100) * 72}%` }}
              >
                <div className="relative">
                  <div className="bg-green-600 text-white text-[8px] px-2 py-1 rounded-md whitespace-nowrap shadow-lg shadow-green-500/30 -translate-x-1/2 font-mono max-w-[150px] truncate flex items-center gap-1">
                    <EyeOff className="w-2.5 h-2.5 flex-shrink-0" />
                    {p.label}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Server received data */}
          <div className="bg-green-950/30 border border-green-500/20 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <EyeOff className="w-4 h-4 text-green-400" />
              <span className="text-sm font-semibold text-green-300">Data on Central Server (SAFE)</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {flServerData.length === 0 ? (
                <p className="text-xs text-gray-500 italic">Waiting for simulation...</p>
              ) : (
                flServerData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 bg-green-900/30 rounded-lg px-3 py-1.5 border border-green-500/20 animate-fadeIn">
                    <ShieldCheck className="w-3 h-3 text-green-400 flex-shrink-0" />
                    <span className="text-xs text-green-200 font-mono">{item}</span>
                  </div>
                ))
              )}
            </div>
            {flServerData.length > 0 && (
              <div className="mt-3 bg-green-600/20 border border-green-500/30 rounded-lg px-3 py-2">
                <p className="text-xs text-green-300">✅ <strong>Privacy Preserved:</strong> Server only receives mathematical gradients. Patient's Aadhaar ({maskAadhaar(patient.aadhaarNumber || '987654321012')}), name, and personal data remain on the local device!</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Local data panel for FL */}
      {flServerData.length > 0 && (
        <div className="mt-6 bg-gray-900/80 border border-blue-500/30 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-blue-400">Data Remaining on Patient's Local Device (FL)</h3>
              <p className="text-xs text-gray-400">This sensitive data NEVER leaves the device in Federated Learning</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {[
              { label: 'Aadhaar', value: patient.aadhaarNumber || '987654321012' },
              { label: 'Name', value: patient.name || 'Rahul Sharma' },
              { label: 'Phone', value: patient.phone || '+91 98765 43210' },
              { label: 'Address', value: patient.address || 'Mumbai, MH' },
              { label: 'Age', value: `${patient.age} years` },
              { label: 'Gender', value: patient.gender },
              { label: 'Blood Pressure', value: `${patient.bloodPressureSystolic}/${patient.bloodPressureDiastolic}` },
              { label: 'Blood Sugar', value: `${patient.bloodSugar} mg/dL` },
              { label: 'Cholesterol', value: `${patient.cholesterol} mg/dL` },
              { label: 'BMI', value: `${patient.bmi}` },
            ].map((item, i) => (
              <div key={i} className="bg-blue-950/30 border border-blue-500/20 rounded-lg px-3 py-2">
                <div className="text-[10px] text-blue-400 font-medium">{item.label}</div>
                <div className="text-sm text-white font-mono truncate flex items-center gap-1">
                  <Lock className="w-3 h-3 text-blue-400 flex-shrink-0" />
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
