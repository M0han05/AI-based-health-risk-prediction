import { ChevronLeft, CheckCircle2, Calendar, Target, ShoppingCart, Dumbbell, ShieldAlert, Pill, TrendingDown, Activity } from 'lucide-react';

interface Props {
    onBack: () => void;
}

export default function RiskReductionPlan({ onBack }: Props) {
    const tasks = [
        {
            category: 'Daily Activity',
            items: [
                { task: '30 min Brisk Walking', impact: '-5% Cardiac Risk', icon: <Dumbbell className="w-5 h-5" /> },
                { task: 'Zero Sedentary Hour', impact: 'Improves Metabolism', icon: <Target className="w-5 h-5" /> }
            ],
            color: 'blue'
        },
        {
            category: 'Nutritional Intake',
            items: [
                { task: 'Reduce Salt (<2g)', impact: 'Lower Systolic BP', icon: <ShoppingCart className="w-5 h-5" /> },
                { task: 'High Fiber Meals', impact: 'Stable Blood Sugar', icon: <TrendingDown className="w-5 h-5" /> }
            ],
            color: 'emerald'
        },
        {
            category: 'Medical Monitoring',
            items: [
                { task: 'Morning BP Check', impact: 'Early Detection', icon: <Activity className="w-4 h-4" /> },
                { task: 'Bi-Weekly Weight', impact: 'BMI Management', icon: <ShieldAlert className="w-5 h-5" /> }
            ],
            color: 'purple'
        }
    ];

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
                        Active Risk Reduction Plan
                    </span>
                </div>
            </div>

            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-white mb-2">Personalized Risk Reduction Plan</h2>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Specific "work" and tasks designed to lower your AI-predicted risk scores over the next 90 days.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {tasks.map((section, i) => (
                    <div key={i} className={`bg-gray-900/40 border border-${section.color}-500/20 rounded-[2.5rem] p-8 hover:bg-gray-900/60 transition-all`}>
                        <div className={`w-14 h-14 rounded-2xl bg-${section.color}-500/10 flex items-center justify-center text-${section.color}-400 mb-6`}>
                            {i === 0 ? <Dumbbell className="w-7 h-7" /> : i === 1 ? <ShoppingCart className="w-7 h-7" /> : <Pill className="w-7 h-7" />}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-6 underline decoration-emerald-500/30 underline-offset-8 decoration-4">{section.category}</h3>

                        <div className="space-y-4">
                            {section.items.map((item, j) => (
                                <div key={j} className="bg-black/40 border border-gray-800 p-4 rounded-2xl flex items-center gap-4 group hover:border-emerald-500/30 transition-colors">
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
            <div className="bg-gray-900/40 border border-gray-800 rounded-[2.5rem] p-8 lg:p-12 relative overflow-hidden">
                <h3 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    <Calendar className="w-6 h-6 text-purple-400" />
                    90-Day Improvement Roadmap
                </h3>

                <div className="flex flex-col md:flex-row gap-4">
                    {[
                        { week: 'Week 1-2', goal: 'Baseline Control', desc: 'Focus on sodium reduction and daily 20min walks.' },
                        { week: 'Week 3-6', goal: 'Weight Stabilization', desc: 'Consistent tracking of BMI and increased fiber.' },
                        { week: 'Week 7-12', goal: 'Risk Re-evaluation', desc: 'Check BP trends to see the 5-10% risk drop.' }
                    ].map((w, i) => (
                        <div key={i} className="flex-1 bg-black/40 border border-gray-800 p-6 rounded-3xl relative">
                            <div className="absolute top-4 right-4 text-gray-700 font-mono text-2xl font-bold">0{i + 1}</div>
                            <div className="text-purple-400 text-xs font-bold uppercase mb-1">{w.week}</div>
                            <div className="text-lg font-bold text-white mb-2">{w.goal}</div>
                            <p className="text-sm text-gray-500">{w.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-8 flex items-center gap-6">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 shrink-0">
                    <Target className="w-8 h-8" />
                </div>
                <div>
                    <h4 className="text-white font-bold mb-1">Your Reduction Goal</h4>
                    <p className="text-sm text-gray-400">
                        Based on your profile, completing these tasks could reduce your **Cardiovascular Risk**
                        from its current level down to a "Normal" boundary within 3-4 months.
                    </p>
                </div>
            </div>
        </div>
    );
}
