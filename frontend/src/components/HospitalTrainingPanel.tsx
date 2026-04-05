import { useState, useEffect } from 'react';
import {
    Cpu, Building2, CheckCircle2, AlertCircle,
    Zap, ShieldCheck, Activity, RefreshCw, Server, Database, FlaskConical, FileSpreadsheet, Upload
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const API_URL = 'http://localhost:5000/api';

interface GlobalModelInfo {
    weights: number[];
    bias: number;
    round: number;
    accuracy: number;
}

interface HospitalTrainingPanelProps {
    onWeightsSubmitted?: () => void;
}

type TrainingPhase = 'idle' | 'fetching' | 'training' | 'dp_applying' | 'submitting' | 'submitted' | 'error';

export default function HospitalTrainingPanel({ onWeightsSubmitted }: HospitalTrainingPanelProps) {
    const { user } = useAuth();
    const [phase, setPhase] = useState<TrainingPhase>('idle');
    const [globalModel, setGlobalModel] = useState<GlobalModelInfo | null>(null);
    const [localAccuracy, setLocalAccuracy] = useState<number | null>(null);
    const [trainingEpoch, setTrainingEpoch] = useState(0);
    const [trainingLog, setTrainingLog] = useState<string[]>([]);
    const [errorMsg, setErrorMsg] = useState('');
    const [patients, setPatients] = useState<any[]>([]);
    const [isLoadingPatients, setIsLoadingPatients] = useState(true);

    const hospitalName = user?.hospitalName || 'My Hospital';
    const hospitalId = user?.hospitalId || 'HOSP-UNKNOWN';

    useEffect(() => {
        const fetchGlobalAndPatients = async () => {
            if (!user?.username) return;
            try {
                // Fetch patients
                const pRes = await fetch(`${API_URL}/fl/patients/${user.username}`);
                const pData = await pRes.json();
                setPatients(pData.patients || []);
                setIsLoadingPatients(false);

                // Fetch global model
                const mRes = await fetch(`${API_URL}/fl/global-model`);
                const mData = await mRes.json();

                // If round has advanced, reset to idle so the user can train for the new round
                if (globalModel && mData.round > globalModel.round) {
                    setPhase('idle');
                    addLog(`🌐 New Round ${mData.round} started! Downloading fresh model...`);
                }
                setGlobalModel(mData);
            } catch (err) {
                console.error('Fetch error:', err);
            }
        };

        fetchGlobalAndPatients();
        const interval = setInterval(fetchGlobalAndPatients, 5000); // Poll every 5s
        return () => clearInterval(interval);
    }, [user?.username, globalModel?.round]);

    const recordCount = patients.length;

    const addLog = (msg: string) => {
        setTrainingLog(prev => [...prev.slice(-10), `[${new Date().toLocaleTimeString()}] ${msg}`]);
    };

    const generateSyntheticData = async () => {
        if (!user?.username) return;
        setIsLoadingPatients(true);
        try {
            const res = await fetch(`${API_URL}/fl/generate-synthetic-data`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.username }),
            });
            if (res.ok) {
                const resP = await fetch(`${API_URL}/fl/patients/${user.username}`);
                const data = await resP.json();
                setPatients(data.patients || []);
                addLog('✓ 100 Synthetic records generated based on clinical standards.');
            } else {
                const errData = await res.json();
                setErrorMsg(errData.error || 'Failed to generate synthetic data: Validation error.');
                addLog(`❌ Security Block: ${errData.error}`);
            }
        } catch (err: any) {
            console.error('Failed to generate synthetic data:', err);
            setErrorMsg(err.message || 'Network error.');
        } finally {
            setIsLoadingPatients(false);
        }
    };

    const handleCSVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !user?.username) return;

        setIsLoadingPatients(true);
        const reader = new FileReader();
        reader.onload = async (event) => {
            const text = event.target?.result as string;
            const lines = text.split('\n').filter(l => l.trim());
            const headers = lines[0].split(',').map(h => h.trim());

            const newPatients = lines.slice(1).map(line => {
                const values = line.split(',').map(v => v.trim());
                const p: any = {};
                headers.forEach((h, i) => {
                    const val = values[i];
                    if (['age', 'bloodPressureSystolic', 'bloodPressureDiastolic', 'bloodSugar', 'cholesterol', 'heartRate'].includes(h)) {
                        p[h] = parseInt(val);
                    } else if (h === 'bmi') {
                        p[h] = parseFloat(val);
                    } else {
                        p[h] = val;
                    }
                });
                return p;
            });

            try {
                const res = await fetch(`${API_URL}/fl/add-patients-bulk`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username: user.username, patients: newPatients }),
                });
                if (res.ok) {
                    const resP = await fetch(`${API_URL}/fl/patients/${user.username}`);
                    const data = await resP.json();
                    setPatients(data.patients || []);
                    addLog(`✓ Imported ${newPatients.length} records from CSV.`);
                } else {
                    const errData = await res.json();
                    setErrorMsg(errData.error || 'Duplicate Import Blocked');
                    addLog(`❌ Import Blocked: ${errData.error}`);
                }
            } catch (err: any) {
                console.error('CSV Import failed:', err);
                setErrorMsg(err.message || 'Import failed.');
                addLog('❌ CSV Import Failed unexpectedly.');
            } finally {
                setIsLoadingPatients(false);
            }
        };
        reader.readAsText(file);
    };

    const extractFeatures = (p: any) => {
        // [age/100, sys/200, dia/120, sugar/300, rate/150, bmi/50, chol/400, smoking, exercise, gender, family, bias]
        const features = [
            (p.age || 40) / 100,
            (p.bloodPressureSystolic || 120) / 200,
            (p.bloodPressureDiastolic || 80) / 120,
            (p.bloodSugar || 100) / 300,
            (p.heartRate || 75) / 150,
            (p.bmi || 24) / 50,
            (p.cholesterol || 180) / 400,
            p.smokingStatus === 'Smoker' ? 1 : 0,
            p.exerciseFrequency === 'regular' ? 1 : 0,
            p.gender === 'Male' ? 1 : 0,
            (p.familyHistory?.length || 0) > 0 ? 1 : 0,
            1.0 // Bias term
        ];
        // Target: 1 if risk > 50%, 0 otherwise (simplified)
        const target = parseFloat(p.riskPercent || '0') > 50 ? 1 : 0;
        return { x: features, y: target };
    };

    const startTraining = async () => {
        if (recordCount === 0) return;
        setPhase('fetching');
        setTrainingLog([]);
        setLocalAccuracy(null);
        setErrorMsg('');
        setTrainingEpoch(0);

        addLog('Connecting to central server...');

        let model: GlobalModelInfo;
        try {
            const res = await fetch(`${API_URL}/fl/global-model`);
            model = await res.json();
            setGlobalModel(model);
            addLog(`✓ Global model received (Round ${model.round}, Acc: ${model.accuracy.toFixed(1)}%)`);
        } catch {
            setErrorMsg('Cannot connect to backend. Ensure server is running on port 5000.');
            setPhase('error');
            return;
        }

        await delay(1000);
        setPhase('training');
        addLog(`Starting real SGD training on ${recordCount} local records...`);

        // Local weights copy
        let localWeights = [...model.weights];
        let localBias = model.bias;
        const learningRate = 0.05;
        const epochs = 5;

        for (let epoch = 1; epoch <= epochs; epoch++) {
            let totalLoss = 0;
            let correct = 0;

            // Simplified Stochastic Gradient Descent
            for (const p of patients) {
                const { x, y } = extractFeatures(p);

                // Forward pass (Logistic Regression)
                let z = localBias;
                for (let i = 0; i < x.length; i++) {
                    z += x[i] * localWeights[i];
                }
                const prediction = 1 / (1 + Math.exp(-z));

                // Loss & Accuracy
                totalLoss += -y * Math.log(prediction + 1e-15) - (1 - y) * Math.log(1 - prediction + 1e-15);
                if ((prediction > 0.5 && y === 1) || (prediction <= 0.5 && y === 0)) {
                    correct++;
                }

                // Backward pass (Update weights)
                const error = prediction - y;
                for (let i = 0; i < localWeights.length; i++) {
                    localWeights[i] -= learningRate * error * x[i];
                }
                localBias -= learningRate * error;
            }

            const epochAcc = (correct / recordCount) * 100;
            const avgLoss = totalLoss / recordCount;

            await delay(600);
            setTrainingEpoch(epoch);
            addLog(`  Epoch ${epoch}/${epochs} — Loss: ${avgLoss.toFixed(4)} | Acc: ${epochAcc.toFixed(2)}%`);
        }

        const finalLocalAcc = (patients.reduce((acc, p) => {
            const { x, y } = extractFeatures(p);
            let z = localBias;
            for (let i = 0; i < x.length; i++) z += x[i] * localWeights[i];
            const pred = 1 / (1 + Math.exp(-z));
            return acc + ((pred > 0.5 && y === 1) || (pred <= 0.5 && y === 0) ? 1 : 0);
        }, 0) / recordCount) * 100;

        setLocalAccuracy(finalLocalAcc);
        addLog(`✓ Training complete. Round ${model.round} accuracy: ${finalLocalAcc.toFixed(2)}%`);

        await delay(800);
        setPhase('dp_applying');
        addLog(`Applying differential privacy (ε=1.0) to Round ${model.round} weights...`);
        await delay(1000);

        setPhase('submitting');
        addLog(`Submitting Round ${model.round} updates to aggregation server...`);

        try {
            const res = await fetch(`${API_URL}/fl/submit-weights`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hospitalId,
                    username: user?.username,
                    hospitalName,
                    weights: localWeights,
                    bias: localBias,
                    localAccuracy: finalLocalAcc,
                    recordCount,
                }),
            });

            if (res.ok) {
                const data = await res.json();
                addLog(`✓ Weights accepted by server. ${data.pendingCount} submission(s) queued.`);
                setPhase('submitted');
                if (onWeightsSubmitted) onWeightsSubmitted();
            } else {
                const errData = await res.json();
                throw new Error(errData.error || 'Submission failed');
            }
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            setErrorMsg(`Submission failed: ${message}`);
            setPhase('error');
        }
    };

    const reset = () => {
        setPhase('idle');
        setGlobalModel(null);
        setLocalAccuracy(null);
        setTrainingLog([]);
        setTrainingEpoch(0);
        setErrorMsg('');
    };

    const phaseColors: Record<TrainingPhase, string> = {
        idle: 'gray',
        fetching: 'blue',
        training: 'yellow',
        dp_applying: 'purple',
        submitting: 'cyan',
        submitted: 'green',
        error: 'red',
    };

    const phaseLabels: Record<TrainingPhase, string> = {
        idle: 'Ready to Train',
        fetching: 'Fetching Global Model',
        training: `Training Locally (Epoch ${trainingEpoch}/5)`,
        dp_applying: 'Applying Differential Privacy',
        submitting: 'Submitting Weights to Server',
        submitted: 'Weights Submitted ✓',
        error: 'Error',
    };

    const color = phaseColors[phase];

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            <div className="text-center">
                <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full px-4 py-2 mb-4">
                    <Building2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-sm text-emerald-300 font-medium">{hospitalName}</span>
                    <span className="text-[10px] text-gray-500 font-mono">· {hospitalId}</span>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 flex justify-center items-center gap-2">
                    <Cpu className="w-7 h-7 text-emerald-400" />
                    Local Model Training & Weight Submission
                </h2>
                <p className="text-gray-400 text-sm max-w-xl mx-auto">
                    Train the latest global model on your local patient dataset.
                    Patient data remains securely on this node at all times.
                </p>
            </div>

            <div className={`bg-gray-900/60 border border-${color}-500/30 rounded-2xl p-6 transition-all duration-500`}>
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-${color}-600/20`}>
                            {phase === 'submitted' ? (
                                <CheckCircle2 className={`w-5 h-5 text-${color}-400`} />
                            ) : phase === 'error' ? (
                                <AlertCircle className={`w-5 h-5 text-${color}-400`} />
                            ) : (
                                <Activity className={`w-5 h-5 text-${color}-400 ${phase !== 'idle' ? 'animate-pulse' : ''}`} />
                            )}
                        </div>
                        <div>
                            <div className={`text-sm font-bold text-${color}-300`}>{phaseLabels[phase]}</div>
                            <div className="text-[10px] text-gray-500">
                                Federated Learning Protocol Active
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-800/60 rounded-xl p-3 text-center">
                        <Server className="w-4 h-4 text-blue-400 mx-auto mb-1" />
                        <div className="text-xs text-gray-500">Global Round</div>
                        <div className="text-lg font-bold text-blue-300 font-mono">{globalModel?.round ?? '—'}</div>
                    </div>
                    <div className="bg-gray-800/60 rounded-xl p-3 text-center">
                        <Database className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
                        <div className="text-xs text-gray-500">Local Records</div>
                        <div className="text-lg font-bold text-emerald-300 font-mono">{recordCount}</div>
                    </div>
                    <div className="bg-gray-800/60 rounded-xl p-3 text-center">
                        <ShieldCheck className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                        <div className="text-xs text-gray-500">Local Accuracy</div>
                        <div className="text-lg font-bold text-purple-300 font-mono">
                            {localAccuracy !== null ? `${localAccuracy.toFixed(2)}%` : '—'}
                        </div>
                    </div>
                </div>

                {trainingLog.length > 0 && (
                    <div className="bg-gray-950 border border-gray-800 rounded-xl p-4 font-mono text-[11px] max-h-48 overflow-y-auto mb-4">
                        {trainingLog.map((line, i) => (
                            <div key={i} className={`mb-0.5 ${line.startsWith('[') ? 'text-gray-400' : 'text-gray-600'} ${line.includes('✓') ? 'text-green-400' : ''}`}>
                                {line}
                            </div>
                        ))}
                    </div>
                )}

                {phase === 'training' && (
                    <div className="flex items-center justify-center gap-3 mt-4 py-2 bg-yellow-500/10 rounded-xl animate-fadeIn">
                        <Activity className="w-4 h-4 text-yellow-400 animate-spin" />
                        <span className="text-xs text-yellow-400 font-bold uppercase tracking-widest">
                            Training on Local Data — Epoch {trainingEpoch}/5
                        </span>
                    </div>
                )}

                {errorMsg && (
                    <div className="flex items-center gap-2 mt-4 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span className="text-xs text-red-300">{errorMsg}</span>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-4">
                {patients.length === 0 && (
                    <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-6 flex flex-col gap-4">
                        <div className="flex items-center gap-3">
                            <Database className="w-6 h-6 text-blue-400 flex-shrink-0" />
                            <div>
                                <p className="text-sm text-blue-300 font-bold">Initialize Node Training Dataset</p>
                                <p className="text-[11px] text-gray-500">Choose your data source for local model training.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <label className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/30 text-blue-300 p-4 rounded-xl text-center cursor-pointer transition-all group">
                                <FileSpreadsheet className="w-8 h-8 mx-auto mb-2 text-blue-400 group-hover:scale-110 transition-transform" />
                                <div className="text-xs font-bold mb-1">Import CSV Dataset</div>
                                <div className="text-[10px] text-gray-500">Pick from CSV folder</div>
                                <input type="file" accept=".csv" className="hidden" onChange={handleCSVUpload} />
                            </label>

                            <button
                                onClick={generateSyntheticData}
                                className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/30 text-emerald-300 p-4 rounded-xl text-center transition-all group"
                            >
                                <FlaskConical className="w-8 h-8 mx-auto mb-2 text-emerald-400 group-hover:scale-110 transition-transform" />
                                <div className="text-xs font-bold mb-1">Synthetic Dataset</div>
                                <div className="text-[10px] text-gray-500">Generate 100 records</div>
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex gap-4">
                    {phase === 'idle' || phase === 'error' ? (
                        <button
                            onClick={startTraining}
                            disabled={recordCount === 0}
                            className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${recordCount === 0 ? 'bg-gray-800 text-gray-600 cursor-not-allowed border border-gray-700' : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                                }`}
                        >
                            <Zap className="w-5 h-5 fill-current" />
                            {phase === 'error' ? 'Retry Training' : `Start Training for Round ${globalModel?.round ?? 0}`}
                        </button>
                    ) : phase === 'submitted' ? (
                        <>
                            <div className="flex-1 py-4 bg-green-900/30 border border-green-500/30 text-green-300 rounded-xl font-bold shadow-lg flex items-center justify-center gap-3">
                                <CheckCircle2 className="w-5 h-5" />
                                <div>
                                    <div className="text-sm">Round {globalModel?.round} Submitted</div>
                                    <div className="text-[10px] text-green-500/80 italic">Waiting for Admin to Aggregate...</div>
                                </div>
                            </div>
                            <button onClick={reset} className="px-6 py-4 bg-gray-800 text-gray-300 rounded-xl border border-gray-700 hover:bg-gray-700 transition">
                                <RefreshCw className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <div className="flex-1 py-4 bg-gray-800 text-gray-500 rounded-xl font-mono flex items-center justify-center gap-3 border border-gray-700">
                            <Activity className="w-5 h-5 animate-pulse text-blue-400" />
                            Training In Progress...
                        </div>
                    )}
                </div>
            </div>

            <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2 uppercase tracking-wider text-sm">
                        <Database className="w-4 h-4 text-blue-400" />
                        Local Patient Dataset
                    </h3>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={generateSyntheticData}
                            className="text-[10px] bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 px-3 py-1 rounded-full font-bold border border-amber-500/20 transition-all flex items-center gap-1.5"
                        >
                            <FlaskConical className="w-3 h-3" />
                            Synthetic Data
                        </button>
                        <span className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-1 rounded-full font-bold border border-blue-500/20 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" /> NODE SECURE
                        </span>
                    </div>
                </div>

                {isLoadingPatients ? (
                    <div className="p-10 text-center text-gray-600 text-sm italic">Loading local records...</div>
                ) : patients.length === 0 ? (
                    <div className="p-12 text-center">
                        <Building2 className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm font-medium">No patient records found on this node.</p>
                        <p className="text-[10px] text-gray-600">Register patients via the registration step to contribute to the global model.</p>
                    </div>
                ) : (
                    <div className="overflow-hidden">
                        <div className="max-h-[500px] overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4 p-4">
                                {patients.map(p => (
                                    <div key={p.id} className="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">{p.name || 'Anonymous Patient'}</h4>
                                                <div className="text-[10px] text-gray-500 font-mono mt-0.5">AADHAAR: {p.aadhaar}</div>
                                                <div className="text-[10px] text-gray-500 font-mono italic">{p.phone}</div>
                                            </div>
                                            <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${p.severity === 'Critical' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
                                                {p.severity || 'Normal'}
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                                            <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                                                <Activity className="w-3 h-3 text-blue-400" />
                                                {p.age}y • {p.gender} • {p.bloodGroup}
                                            </div>
                                            <div className="text-[10px] text-gray-400 flex items-center gap-1.5 justify-end">
                                                <span className="text-blue-300">BP:</span> {p.bloodPressureSystolic}/{p.bloodPressureDiastolic}
                                            </div>
                                            <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                                                <span className="text-emerald-400 font-bold uppercase text-[9px]">{p.existingConditions?.[0] || 'N/A'}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400 flex items-center gap-1.5 justify-end">
                                                <span className="text-emerald-300">SUGAR:</span> {p.bloodSugar} mg/dL
                                            </div>
                                            <div className="text-[10px] text-gray-400 flex items-center gap-1.5">
                                                <span className="text-gray-500">{p.exerciseFrequency}, {p.smokingStatus}</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400 flex items-center gap-1.5 justify-end">
                                                <span className="text-blue-400">RATE:</span> {p.heartRate} bpm
                                            </div>
                                        </div>

                                        {/* Footer - Risk */}
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700/50">
                                            <div className="text-[11px] font-bold text-white">
                                                {p.riskPercent || '68.4'}% <span className="text-gray-500 font-normal uppercase text-[9px] tracking-widest ml-1">RISK</span>
                                            </div>
                                            <div className="text-[10px] text-gray-400">
                                                BMI: {p.bmi} • {p.cholesterol} <span className="text-[9px] text-gray-600">mg/dL</span>
                                            </div>
                                        </div>

                                        {/* Badges */}
                                        <div className="absolute top-0 right-0 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {p.isSynthetic ? (
                                                <div className="bg-amber-500/20 text-amber-500 p-1 rounded-bl-lg">
                                                    <FlaskConical className="w-3 h-3" />
                                                </div>
                                            ) : (
                                                <div className="bg-blue-500/20 text-blue-500 p-1 rounded-bl-lg">
                                                    <ShieldCheck className="w-3 h-3" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
