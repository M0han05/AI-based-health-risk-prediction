import { useState } from 'react';
import { Building2, Database, ShieldCheck, Activity, MapPin, Globe, CheckCircle2, ChevronRight, Lock, Smartphone, Download } from 'lucide-react';

interface Hospital {
    id: string;
    name: string;
    city: string;
    records: string;
    status: 'active' | 'syncing';
    privacy: string;
    lastUpdate: string;
    accuracy: string;
}

interface LocalPatient {
    id: string;
    name: string;
    aadhaar: string;
    phone: string;
    address: string;
    age: number;
    gender: string;
    bloodGroup: string;
    condition: string;
    lastVisit: string;
    riskScore: string;
    vitalStatus: 'Stable' | 'Critical' | 'Monitoring';
    bp: string;
    sugar: string;
    cholesterol: string;
    bmi: string;
    heartRate: string;
    lifestyle: string;
}

const generateMockPatients = (hospitalName: string): LocalPatient[] => {
    const conditions = ['Type 2 Diabetes', 'Hypertension', 'Cardiac Arrhythmia', 'Chronic Kidney Disease', 'Obesity'];
    const names = [
        'Rajesh Kumar', 'Priya Singh', 'Amit Patel', 'Sneha Reddy', 'Vikram Malhotra',
        'Anjali Sharma', 'Suresh Iyer', 'Meera Joshi', 'Rohan Das', 'Kavita Nair',
        'Sanjay Gupta', 'Deepika Rao', 'Arjun Verma', 'Nisha Kapoor', 'Pankaj Sethi',
        'Ritu Parekh', 'Varun Khanna', 'Ishita Bose', 'Karan Mehra', 'Sonia Bhatia',
        'Abhishek Jain', 'Pooja Hegde', 'Manoj Bajpayee', 'Radhika Apte', 'Sunny Deol'
    ];
    const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Hyderabad', 'Pune', 'Kolkata', 'Ahmedabad', 'Jaipur', 'Lucknow'];

    return Array.from({ length: 100 }).map((_, i) => ({
        id: `PAT-${1000 + i}`,
        name: names[i % names.length],
        aadhaar: `${Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0')} ${Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0')} ${Math.floor(1000 + Math.random() * 9000).toString().padStart(4, '0')}`,
        phone: `+91 9${Math.floor(100000000 + Math.random() * 900000000)}`,
        address: `${Math.floor(Math.random() * 999) + 1}, Block ${String.fromCharCode(65 + (i % 26))}, ${cities[i % cities.length]}`,
        age: 18 + Math.floor(Math.random() * 70),
        gender: i % 2 === 0 ? 'Male' : 'Female',
        bloodGroup: ['A+', 'B+', 'O+', 'AB+', 'A-', 'B-', 'O-', 'AB-'][Math.floor(Math.random() * 8)],
        condition: conditions[i % conditions.length],
        lastVisit: `${Math.floor(Math.random() * 28) + 1} Mar 2024`,
        riskScore: `${(Math.random() * 100).toFixed(1)}%`,
        vitalStatus: i % 15 === 0 ? 'Critical' : i % 7 === 0 ? 'Monitoring' : 'Stable',
        bp: `${110 + Math.floor(Math.random() * 50)}/${70 + Math.floor(Math.random() * 25)}`,
        sugar: `${80 + Math.floor(Math.random() * 180)} mg/dL`,
        cholesterol: `${140 + Math.floor(Math.random() * 120)} mg/dL`,
        bmi: (17 + Math.random() * 18).toFixed(1),
        heartRate: `${55 + Math.floor(Math.random() * 55)} bpm`,
        lifestyle: i % 3 === 0 ? 'Sedentary, Smoker' : 'Active, Non-smoker'
    }));
};

const downloadCSV = (patients: LocalPatient[], hospitalName: string) => {
    const headers = ['Patient ID', 'Full Name', 'Aadhaar Number', 'Phone', 'Address', 'Age', 'Gender', 'Blood Group', 'Condition', 'Risk Score', 'Vital Status', 'Blood Pressure', 'Blood Sugar', 'Cholesterol', 'BMI', 'Heart Rate', 'Lifestyle'];
    const csvContent = [
        headers.join(','),
        ...patients.map(p => [
            p.id,
            `"${p.name}"`,
            `"${p.aadhaar}"`,
            `"${p.phone}"`,
            `"${p.address}"`,
            p.age,
            p.gender,
            p.bloodGroup,
            `"${p.condition}"`,
            p.riskScore,
            p.vitalStatus,
            p.bp,
            p.sugar,
            p.cholesterol,
            p.bmi,
            p.heartRate,
            `"${p.lifestyle}"`
        ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${hospitalName.replace(/\s+/g, '_')}_Patient_Database.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

const hospitals: Hospital[] = [
    {
        id: '1',
        name: 'AIIMS - All India Institute of Medical Sciences',
        city: 'New Delhi',
        records: '52,430',
        status: 'active',
        privacy: 'DP + Secure Aggregation',
        lastUpdate: '2 mins ago',
        accuracy: '98.2%',
    },
    {
        id: '2',
        name: 'Apollo Hospitals',
        city: 'Chennai',
        records: '45,120',
        status: 'active',
        privacy: 'DP + Secure Aggregation',
        lastUpdate: '5 mins ago',
        accuracy: '97.5%',
    },
    {
        id: '3',
        name: 'Tata Memorial Hospital',
        city: 'Mumbai',
        records: '30,800',
        status: 'syncing',
        privacy: 'DP + Secure Aggregation',
        lastUpdate: 'Just now',
        accuracy: '96.8%',
    },
    {
        id: '4',
        name: 'Fortis Healthcare',
        city: 'Bangalore',
        records: '28,500',
        status: 'active',
        privacy: 'DP + Secure Aggregation',
        lastUpdate: '12 mins ago',
        accuracy: '97.2%',
    },
    {
        id: '5',
        name: 'Medanta The Medicity',
        city: 'Gurugram',
        records: '22,100',
        status: 'active',
        privacy: 'DP + Secure Aggregation',
        lastUpdate: '8 mins ago',
        accuracy: '96.5%',
    },
    {
        id: '6',
        name: 'Manipal Hospitals',
        city: 'Hyderabad',
        records: '19,450',
        status: 'active',
        privacy: 'DP + Secure Aggregation',
        lastUpdate: '15 mins ago',
        accuracy: '95.9%',
    },
];

export default function HospitalNetwork({ onClose }: { onClose: () => void }) {
    const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);

    if (selectedHospital) {
        const localPatients = generateMockPatients(selectedHospital.name);

        return (
            <div className="animate-fadeIn">
                <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-blue-400 text-sm font-bold uppercase tracking-widest mb-2">
                            <ShieldCheck className="w-4 h-4" />
                            Local Node Access: {selectedHospital.name}
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-1">Patient Database (Local)</h2>
                        <p className="text-gray-400">Personal Health Information (PHI) stored securely on this hospital node.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => downloadCSV(localPatients, selectedHospital.name)}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition font-bold shadow-lg shadow-blue-600/20"
                        >
                            <Download className="w-4 h-4" />
                            Download Dataset (CSV)
                        </button>
                        <button
                            onClick={() => setSelectedHospital(null)}
                            className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition border border-gray-700 font-medium"
                        >
                            Back to Network
                        </button>
                    </div>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-8 flex items-start gap-4">
                    <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 text-red-400">
                        <Lock className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-red-400 font-bold text-sm mb-1 uppercase tracking-tight">Privacy Isolation Active</h4>
                        <p className="text-xs text-red-200/70 leading-relaxed">
                            Under <strong>Federated Learning</strong>, this sensitive information NEVER leaves the hospital's private intranet.
                            The portal view below is only possible because we are simulates an authorized local administrator login.
                            The central model only "learns" from this data without ever "seeing" it.
                        </p>
                    </div>
                </div>

                <div className="bg-gray-900/50 border border-gray-800 rounded-3xl overflow-hidden backdrop-blur-xl mb-8">
                    <div className="overflow-x-auto max-h-[600px] custom-scrollbar">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-800 bg-gray-800/30">
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Patient & Aadhaar</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Contact & Demographics</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Vital Signs (BP/Sugar/Rate)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Clinical (BMI/Chol/Life)</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">AI Prediction</th>
                                    <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-widest whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {localPatients.map((patient) => (
                                    <tr key={patient.id} className="hover:bg-blue-600/5 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors mb-1">{patient.name}</div>
                                            <div className="text-[10px] text-amber-400 font-mono bg-amber-400/5 border border-amber-400/10 px-2 py-0.5 rounded inline-flex items-center gap-1">
                                                <ShieldCheck className="w-2.5 h-2.5" />
                                                AADHAAR: {patient.aadhaar}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs text-gray-300 font-medium mb-1">{patient.phone}</div>
                                            <div className="text-[10px] text-gray-500 uppercase">{patient.age}y • {patient.gender} • {patient.bloodGroup}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[10px] text-blue-300 font-mono">BP: {patient.bp}</div>
                                                <div className="text-[10px] text-green-300 font-mono">SUGAR: {patient.sugar}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">RATE: {patient.heartRate}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col gap-1">
                                                <div className="text-[10px] text-purple-300 font-semibold uppercase">{patient.condition}</div>
                                                <div className="text-[10px] text-gray-400">BMI: {patient.bmi} • {patient.cholesterol}</div>
                                                <div className="text-[9px] text-gray-600 italic">{patient.lifestyle}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-xs font-bold text-amber-400 mb-1">{patient.riskScore} RISK</div>
                                            <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-500 to-red-500 rounded-full"
                                                    style={{ width: patient.riskScore }}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter border ${patient.vitalStatus === 'Stable' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                patient.vitalStatus === 'Critical' ? 'bg-red-500/10 text-red-500 border-red-500/20' :
                                                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                }`}>
                                                {patient.vitalStatus}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <Smartphone className="w-4 h-4 text-blue-400" />
                            Local Node Statistics
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/30">
                                <div className="text-[10px] text-gray-500 uppercase mb-1">Total PHI Records</div>
                                <div className="text-xl font-bold text-white">{selectedHospital.records}</div>
                            </div>
                            <div className="bg-gray-800/50 p-3 rounded-xl border border-gray-700/30">
                                <div className="text-[10px] text-gray-500 uppercase mb-1">Local Accuracy</div>
                                <div className="text-xl font-bold text-green-400">{selectedHospital.accuracy}</div>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gray-900/40 border border-gray-800 rounded-2xl p-6">
                        <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-purple-400" />
                            Encryption Details
                        </h4>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">Encryption Standard</span>
                                <span className="text-gray-300 font-mono">AES-256-GCM</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">Access Logging</span>
                                <span className="text-green-400">ENABLED (Immutable)</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-gray-500">Data Sharing Status</span>
                                <span className="text-red-400 font-bold uppercase">Blocked by Protocol</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        );
    }

    return (
        <div className="animate-fadeIn">
            <div className="relative w-full h-64 md:h-80 rounded-3xl overflow-hidden mb-8 group">
               <img
                    src="./hospital_network_map.png"
                    alt="Hospital Network Map"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-950/40 to-transparent" />
                <div className="absolute bottom-6 left-8">
                    <div className="flex items-center gap-2 bg-blue-500/20 backdrop-blur-md border border-blue-500/30 px-3 py-1 rounded-full mb-3">
                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-ping" />
                        <span className="text-[10px] font-bold text-blue-300 uppercase tracking-widest">Real-time Network Status</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-1">Global Research Network</h2>
                    <p className="text-gray-300 text-sm max-w-lg">
                        Decentralized node synchronization active across 124+ partner institutions.
                    </p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
                <div className="text-left">
                    <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                        <Globe className="w-6 h-6 text-blue-400" />
                        Node Infrastructure
                    </h2>
                </div>
                <button
                    onClick={onClose}
                    className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl transition border border-gray-700 font-medium"
                >
                    Back to Home
                </button>
            </div>

            {/* Network Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Records', value: '198,400+', icon: <Database className="w-4 h-4" color="#60a5fa" /> },
                    { label: 'Active Nodes', value: '124 Sites', icon: <Building2 className="w-4 h-4" color="#a78bfa" /> },
                    { label: 'Privacy Protocol', value: 'Hybrid DP+SA', icon: <ShieldCheck className="w-4 h-4" color="#34d399" /> },
                    { label: 'Model Accuracy', value: '97.4%', icon: <Activity className="w-4 h-4" color="#f87171" /> },
                ].map((stat, i) => (
                    <div key={i} className="bg-gray-900/50 border border-gray-800 p-4 rounded-2xl backdrop-blur-sm">
                        <div className="flex items-center gap-2 mb-1">
                            {stat.icon}
                            <span className="text-xs text-gray-500 font-medium">{stat.label}</span>
                        </div>
                        <div className="text-xl font-bold text-white tracking-tight">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Hospital Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hospitals.map((hospital) => (
                    <div
                        key={hospital.id}
                        onClick={() => setSelectedHospital(hospital)}
                        className="group bg-gray-900/40 border border-gray-800 hover:border-blue-500/50 rounded-2xl p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10 relative overflow-hidden cursor-pointer"
                    >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-600/10 transition-colors" />

                        <div className="flex items-start justify-between mb-4 relative z-10">
                            <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                <Building2 className="w-6 h-6" />
                            </div>
                            <div className="flex flex-col items-end">
                                <span className={`flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${hospital.status === 'active' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20 animate-pulse'
                                    }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${hospital.status === 'active' ? 'bg-green-400' : 'bg-blue-400'}`} />
                                    {hospital.status === 'active' ? 'Active' : 'Syncing'}
                                </span>
                                <span className="text-[10px] text-gray-500 mt-1 font-mono">{hospital.lastUpdate}</span>
                            </div>
                        </div>

                        <div className="relative z-10">
                            <h3 className="text-white font-bold mb-1 group-hover:text-blue-400 transition-colors">{hospital.name}</h3>
                            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-4">
                                <MapPin className="w-3 h-3" />
                                {hospital.city}, India
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-500">Contributing Dataset</span>
                                    <span className="text-gray-300 font-medium">{hospital.records} Patients</span>
                                </div>
                                <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-1000"
                                        style={{ width: `${Math.random() * 40 + 60}%` }}
                                    />
                                </div>
                                <div className="flex items-center justify-between text-[10px] pt-1">
                                    <div className="flex items-center gap-1 text-green-400 font-medium uppercase tracking-tighter">
                                        <ShieldCheck className="w-3 h-3" />
                                        {hospital.privacy}
                                    </div>
                                    <div className="text-blue-400 font-bold">ACCURACY: {hospital.accuracy}</div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-gray-800/50 flex justify-end relative z-10">
                            <button className="text-[10px] font-bold text-gray-500 hover:text-white transition uppercase tracking-widest flex items-center gap-1">
                                Access Local Database <ChevronRight className="w-3 h-3 text-blue-400" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-12 bg-blue-600/5 border border-blue-500/20 rounded-2xl p-6 text-center">
                <h4 className="text-white font-bold mb-2 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-400" />
                    Zero Data Sharing Guaranteed
                </h4>
                <p className="text-sm text-gray-400 max-w-2xl mx-auto">
                    These hospitals never send patient records to our central server.
                    Instead, they use Federated Learning to train the model locally and only send encrypted mathematical weights
                    back for global aggregation.
                </p>
            </div>
        </div >
    );
}
