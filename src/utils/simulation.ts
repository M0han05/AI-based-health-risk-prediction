import { PatientData, HealthRisk, AccuracyResult, FeatureImportance, ModelWeights } from '../types';

export function calculateHealthRisks(patient: PatientData): HealthRisk[] {
  const risks: HealthRisk[] = [];
  
  // Cardiovascular risk
  let cardioRisk = 0;
  if (patient.bloodPressureSystolic > 140) cardioRisk += 25;
  else if (patient.bloodPressureSystolic > 120) cardioRisk += 12;
  if (patient.cholesterol > 240) cardioRisk += 25;
  else if (patient.cholesterol > 200) cardioRisk += 12;
  if (patient.smokingStatus === 'current') cardioRisk += 20;
  if (patient.age > 55) cardioRisk += 15;
  else if (patient.age > 45) cardioRisk += 8;
  if (patient.familyHistory.includes('heart_disease')) cardioRisk += 15;
  if (patient.exerciseFrequency === 'none') cardioRisk += 10;
  cardioRisk = Math.min(cardioRisk, 98);

  // Diabetes risk
  let diabetesRisk = 0;
  if (patient.bloodSugar > 126) diabetesRisk += 30;
  else if (patient.bloodSugar > 100) diabetesRisk += 15;
  if (patient.bmi > 30) diabetesRisk += 25;
  else if (patient.bmi > 25) diabetesRisk += 12;
  if (patient.familyHistory.includes('diabetes')) diabetesRisk += 20;
  if (patient.age > 45) diabetesRisk += 10;
  if (patient.exerciseFrequency === 'none') diabetesRisk += 10;
  diabetesRisk = Math.min(diabetesRisk, 98);

  // Hypertension risk
  let hyperRisk = 0;
  if (patient.bloodPressureSystolic > 140) hyperRisk += 35;
  else if (patient.bloodPressureSystolic > 130) hyperRisk += 20;
  if (patient.bloodPressureDiastolic > 90) hyperRisk += 25;
  if (patient.smokingStatus === 'current') hyperRisk += 15;
  if (patient.bmi > 30) hyperRisk += 15;
  if (patient.alcoholConsumption === 'heavy') hyperRisk += 15;
  hyperRisk = Math.min(hyperRisk, 98);

  // Stroke risk
  let strokeRisk = 0;
  if (patient.bloodPressureSystolic > 140) strokeRisk += 25;
  if (patient.age > 60) strokeRisk += 20;
  else if (patient.age > 50) strokeRisk += 10;
  if (patient.smokingStatus === 'current') strokeRisk += 20;
  if (patient.cholesterol > 240) strokeRisk += 15;
  if (patient.familyHistory.includes('stroke')) strokeRisk += 20;
  strokeRisk = Math.min(strokeRisk, 98);

  // Kidney disease risk
  let kidneyRisk = 0;
  if (patient.bloodPressureSystolic > 140) kidneyRisk += 20;
  if (patient.bloodSugar > 126) kidneyRisk += 25;
  if (patient.age > 60) kidneyRisk += 15;
  if (patient.familyHistory.includes('kidney_disease')) kidneyRisk += 20;
  if (patient.existingConditions.includes('diabetes')) kidneyRisk += 20;
  kidneyRisk = Math.min(kidneyRisk, 98);

  const getSeverity = (risk: number): 'low' | 'moderate' | 'high' | 'critical' => {
    if (risk < 25) return 'low';
    if (risk < 50) return 'moderate';
    if (risk < 75) return 'high';
    return 'critical';
  };

  const getColor = (severity: string): string => {
    switch (severity) {
      case 'low': return '#22c55e';
      case 'moderate': return '#f59e0b';
      case 'high': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const diseases = [
    { disease: 'Cardiovascular Disease', risk: cardioRisk },
    { disease: 'Type 2 Diabetes', risk: diabetesRisk },
    { disease: 'Hypertension', risk: hyperRisk },
    { disease: 'Stroke', risk: strokeRisk },
    { disease: 'Chronic Kidney Disease', risk: kidneyRisk },
  ];

  diseases.forEach(d => {
    const severity = getSeverity(d.risk);
    risks.push({ ...d, severity, color: getColor(severity) });
  });

  return risks;
}

export function generateAccuracyResults(patient: PatientData): AccuracyResult[] {
  const seed = (patient.age * 7 + patient.bloodSugar * 3 + patient.cholesterol) % 100;
  const noise = (n: number) => n + (seed % 5) * 0.1 - 0.2;
  
  return [
    {
      method: 'Federated Learning (FL)',
      accuracy: Math.min(99, Math.max(88, noise(93.7))),
      precision: Math.min(99, Math.max(86, noise(92.1))),
      recall: Math.min(99, Math.max(87, noise(91.5))),
      f1Score: Math.min(99, Math.max(87, noise(91.8))),
      color: '#3b82f6',
    },
    {
      method: 'Centralized Learning (CL)',
      accuracy: Math.min(99, Math.max(92, noise(96.2))),
      precision: Math.min(99, Math.max(90, noise(95.4))),
      recall: Math.min(99, Math.max(91, noise(94.8))),
      f1Score: Math.min(99, Math.max(91, noise(95.1))),
      color: '#ef4444',
    },
    {
      method: 'Local Learning (LL)',
      accuracy: Math.min(92, Math.max(72, noise(81.3))),
      precision: Math.min(90, Math.max(70, noise(79.8))),
      recall: Math.min(88, Math.max(68, noise(78.2))),
      f1Score: Math.min(89, Math.max(69, noise(79.0))),
      color: '#f59e0b',
    },
  ];
}

export function generateFeatureImportance(patient: PatientData): FeatureImportance[] {
  const features: FeatureImportance[] = [
    { feature: 'Blood Pressure (Systolic)', importance: patient.bloodPressureSystolic > 130 ? 0.89 : 0.35, direction: patient.bloodPressureSystolic > 130 ? 'positive' : 'negative', value: `${patient.bloodPressureSystolic} mmHg` },
    { feature: 'Blood Sugar', importance: patient.bloodSugar > 110 ? 0.82 : 0.28, direction: patient.bloodSugar > 110 ? 'positive' : 'negative', value: `${patient.bloodSugar} mg/dL` },
    { feature: 'Cholesterol', importance: patient.cholesterol > 200 ? 0.76 : 0.31, direction: patient.cholesterol > 200 ? 'positive' : 'negative', value: `${patient.cholesterol} mg/dL` },
    { feature: 'BMI', importance: patient.bmi > 25 ? 0.71 : 0.22, direction: patient.bmi > 25 ? 'positive' : 'negative', value: `${patient.bmi}` },
    { feature: 'Age', importance: patient.age > 50 ? 0.65 : 0.18, direction: patient.age > 50 ? 'positive' : 'negative', value: `${patient.age} years` },
    { feature: 'Heart Rate', importance: patient.heartRate > 90 ? 0.58 : 0.20, direction: patient.heartRate > 90 ? 'positive' : 'negative', value: `${patient.heartRate} bpm` },
    { feature: 'Smoking Status', importance: patient.smokingStatus === 'current' ? 0.72 : 0.08, direction: patient.smokingStatus === 'current' ? 'positive' : 'negative', value: patient.smokingStatus },
    { feature: 'Exercise Frequency', importance: patient.exerciseFrequency === 'none' ? 0.45 : 0.15, direction: patient.exerciseFrequency === 'none' ? 'positive' : 'negative', value: patient.exerciseFrequency },
    { feature: 'Family History', importance: patient.familyHistory.length > 0 ? 0.62 : 0.10, direction: patient.familyHistory.length > 0 ? 'positive' : 'negative', value: patient.familyHistory.length > 0 ? 'Present' : 'None' },
    { feature: 'Alcohol Consumption', importance: patient.alcoholConsumption === 'heavy' ? 0.52 : 0.12, direction: patient.alcoholConsumption === 'heavy' ? 'positive' : 'negative', value: patient.alcoholConsumption },
  ];

  return features.sort((a, b) => b.importance - a.importance);
}

export function generateModelWeights(): ModelWeights[] {
  const layers = ['Input Layer', 'Hidden Layer 1', 'Hidden Layer 2', 'Output Layer'];
  return layers.map(layer => {
    const values = Array.from({ length: 8 }, () => Math.random() * 2 - 1);
    const noisy = values.map(v => v + (Math.random() * 0.3 - 0.15));
    return { layer, values, noisy };
  });
}

export function maskAadhaar(aadhaar: string): string {
  if (aadhaar.length < 4) return '****';
  return 'XXXX-XXXX-' + aadhaar.slice(-4);
}

export function generateGradientValues(): number[] {
  return Array.from({ length: 12 }, () => parseFloat((Math.random() * 2 - 1).toFixed(4)));
}

export function addDifferentialPrivacyNoise(values: number[], epsilon: number): number[] {
  return values.map(v => {
    const noise = (Math.random() - 0.5) * (2 / epsilon);
    return parseFloat((v + noise).toFixed(4));
  });
}

export const defaultPatient: PatientData = {
  aadhaarNumber: '',
  name: '',
  age: 45,
  gender: 'male',
  phone: '',
  address: '',
  bloodPressureSystolic: 130,
  bloodPressureDiastolic: 85,
  bloodSugar: 110,
  cholesterol: 210,
  bmi: 26.5,
  heartRate: 78,
  smokingStatus: 'never',
  alcoholConsumption: 'moderate',
  exerciseFrequency: 'moderate',
  familyHistory: [],
  existingConditions: [],
};
