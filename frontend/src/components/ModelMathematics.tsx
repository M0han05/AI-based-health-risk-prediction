import { useMemo } from 'react';
import { ChevronLeft, CheckCircle2, Calendar, Target, ShoppingCart, Dumbbell, ShieldAlert, Pill, TrendingDown, Activity, Ban } from 'lucide-react';
import { PatientData } from '../types';

interface Props {
    patient: PatientData;
    onBack: () => void;
}

export default function RiskReductionPlan({ patient, onBack }: Props) {
    const tasks = useMemo(() => {
        const sections = [];

        // Physical Strategy
        const activityTasks = [];
        if (patient.exerciseFrequency === 'none' || patient.exerciseFrequency === 'light') {
            activityTasks.push({ task: `30 min Brisk Walking`, impact: '-5% Cardiac Risk', icon: <Dumbbell className="w-5 h-5" /> });
        } else {
            activityTasks.push({ task: 'Advanced HIIT Training', impact: 'Maintain Cardiovascular Flow', icon: <Dumbbell className="w-5 h-5" /> });
        }
        
        if (patient.bmi > 25) {
            activityTasks.push({ task: `Weight Management (BMI: ${patient.bmi})`, impact: 'Target: <25 BMI', icon: <Target className="w-5 h-5" /> });
        } else {
            activityTasks.push({ task: 'Muscle Tone Preservation', impact: 'Maintain Peak Efficiency', icon: <CheckCircle2 className="w-5 h-5" /> });
        }
        
        sections.push({ category: 'Physical Strategy', items: activityTasks, color: 'blue' });

        // Nutritional Focus
        const nutritionTasks = [];
        if (patient.bloodPressureSystolic > 130) {
            nutritionTasks.push({ task: `DASH Diet (Current BP: ${patient.bloodPressureSystolic})`, impact: '-8 mmHg Systolic Drop', icon: <ShoppingCart className="w-5 h-5" /> });
        } else {
            nutritionTasks.push({ task: 'Low Sodium Maintenance', impact: 'Pulse Pressure Optimization', icon: <ShoppingCart className="w-5 h-5" /> });
        }

        if (patient.bloodSugar > 110) {
            nutritionTasks.push({ task: `Glucose Control (${patient.bloodSugar} mg/dL)`, impact: 'Lower Glycemic Load', icon: <TrendingDown className="w-5 h-5" /> });
        } else {
            nutritionTasks.push({ task: 'Complex Carbohydrate Focus', impact: 'Cellular Vitality', icon: <Activity className="w-5 h-5" /> });
        }
        
        sections.push({ category: 'Nutritional Focus', items: nutritionTasks, color: 'emerald' });

        // Medical & Lifestyle
        const medicalTasks = [];
        if (patient.smokingStatus === 'current') {
            medicalTasks.push({ task: 'Smoking Cessation Strategy', impact: 'Arterial Repair Phase 1', icon: <Ban className="w-5 h-5" /> });
        } else if (patient.smokingStatus === 'former') {
            medicalTasks.push({ task: 'Pulmonary Recovery Support', impact: 'Endothelial Protection', icon: <ShieldAlert className="w-5 h-5" /> });
        }
        
        if (patient.cholesterol > 200) {
            medicalTasks.push({ task: `Lipid Management (${patient.cholesterol} mg/dL)`, impact: 'Reduce Plaque Risk', icon: <Pill className="w-5 h-5" /> });
        } else {
            medicalTasks.push({ task: 'Routine Lipid Screen', impact: 'Maintain Clear Arteries', icon: <ShieldAlert className="w-5 h-5" /> });
        }
        
        if (medicalTasks.length < 2) {
             medicalTasks.push({ task: 'Hydration Strategy', impact: 'Blood Viscosity Support', icon: <Activity className="w-5 h-5" /> });
        }

        sections.push({ category: 'Medical & Lifestyle', items: medicalTasks.slice(0, 2), color: 'purple' });

        return sections;
    }, [patient]);

    return (
        <div className="animate-fadeIn space-y-8 pb-12">
            <div className="flex items-center justify-between">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-400 hover:text-white transition group"
                >
                    <div className="w-8 h-8 rounded-full bg-gray-900 border border-gray-800 flex items-center justify-center group-hover:border-blue-500/50">
                        <ChevronLeft className="w-4 h-4" />
                    </div>
                    <span>Back to XAI Summary</span>
                </button>
                <div className="bg-emerald-600/10 border border-emerald-500/20 px-4 py-1.5 rounded-full">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <TrendingDown className="w-3 h-3" />
                        AI Personalization Active
                    </span>
                </div>
            </div>

            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-2 underline decoration-blue-500/20 underline-offset-8">Risk Reduction for {patient.name.toUpperCase()}</h2>
                <p className="text-gray-400 max-w-2xl mx-auto flex items-center justify-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-amber-500" />
                    AI dynamically re-calculating tasks based on 10+ health parameters
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {tasks.map((section, i) => (
                    <div key={i} className={`bg-gray-900/40 border border-${section.color}-500/20 rounded-[2.5rem] p-8 hover:bg-gray-900/60 transition-all shadow-xl`}>
                        <div className={`w-14 h-14 rounded-2xl bg-${section.color}-500/10 flex items-center justify-center text-${section.color}-400 mb-6 shadow-inner border border-white/5`}>
                            {i === 0 ? <Dumbbell className="w-7 h-7" /> : i === 1 ? <ShoppingCart className="w-7 h-7" /> : <Pill className="w-7 h-7" />}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-6 underline decoration-emerald-500/30 underline-offset-8 decoration-4">{section.category}</h3>

                        <div className="space-y-4">
                            {section.items.map((item, j) => (
                                <div key={j} className="bg-black/40 border border-gray-800/50 p-4 rounded-2xl flex items-center gap-4 group hover:border-emerald-500/30 transition-all hover:translate-x-1">
                                    <div className={`text-${section.color}-400 group-hover:scale-110 transition-transform`}>
                                        {item.icon}
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-sm font-bold text-white">{item.task}</div>
                                        <div className="text-[10px] text-emerald-400 uppercase font-bold tracking-tighter">{item.impact}</div>
                                    </div>
                                    <CheckCircle2 className="w-4 h-4 text-gray-700 group-hover:text-emerald-500 transition-colors" />
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Weekly Target Timeline */}
            <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Activity className="w-48 h-48 text-purple-500" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-purple-400" />
                    Dynamic Roadmap: 90 Days
                </h3>

                <div className="flex flex-col md:flex-row gap-4">
                    {[
                        { week: 'Week 1-2', goal: 'Direct Intervention', desc: `Immediate target: ${patient.bloodPressureSystolic > 130 ? 'Systolic BP reduction' : 'Health baseline stability'}.` },
                        { week: 'Week 3-6', goal: 'Metabolic Recalibration', desc: `Focus on ${patient.bloodSugar > 110 ? 'Blood Sugar trends' : 'Metabolic efficiency'} and weight control.` },
                        { week: 'Week 7-12', goal: 'Risk score shift', desc: 'Predicted risk reduction of 15-20% through cumulative adherence.' }
                    ].map((w, i) => (
                        <div key={i} className="flex-1 bg-black/40 border border-gray-800 p-6 rounded-3xl relative hover:border-purple-500/30 transition-colors">
                            <div className="absolute top-4 right-4 text-gray-800 font-mono text-2xl font-bold">0{i + 1}</div>
                            <div className="text-purple-400 text-xs font-bold uppercase mb-1">{w.week}</div>
                            <div className="text-lg font-bold text-white mb-2">{w.goal}</div>
                            <p className="text-sm text-gray-500">{w.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-gradient-to-br from-emerald-500/10 to-blue-500/10 border border-emerald-500/20 rounded-3xl p-8 flex items-center gap-6 relative shadow-lg">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/30 shadow-inner">
                    <Target className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="text-white font-bold mb-1">Clinical Reduction Goal</h4>
                    <p className="text-sm text-gray-400">
                        Based on your profile with **BP ${patient.bloodPressureSystolic} / Sugar ${patient.bloodSugar} / BMI ${patient.bmi}**, 
                        strict adherence is expected to shift your risk tier from high/moderate down toward the clinical "A" boundary.
                    </p>
                </div>
            </div>
        </div>
    );
}
