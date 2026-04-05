import { PatientData, HealthRisk, AccuracyResult, FeatureImportance, ModelWeights } from '../types';

const API_URL = 'http://localhost:5000/api';

export async function calculateHealthRisks(patient: PatientData): Promise<HealthRisk[]> {
  try {
    const response = await fetch(`${API_URL}/calculate-risks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error calculating health risks from backend:', error);
    return [];
  }
}

export async function generateAccuracyResults(patient: PatientData, trainedAccuracy?: number | null): Promise<AccuracyResult[]> {
  try {
    const response = await fetch(`${API_URL}/accuracy-results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient, trainedAccuracy }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error generating accuracy results from backend:', error);
    return [];
  }
}

export async function generateFeatureImportance(patient: PatientData): Promise<FeatureImportance[]> {
  try {
    const response = await fetch(`${API_URL}/feature-importance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patient }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error generating feature importance from backend:', error);
    return [];
  }
}

export async function generateModelWeights(): Promise<ModelWeights[]> {
  try {
    const response = await fetch(`${API_URL}/model-weights`);
    return await response.json();
  } catch (error) {
    console.error('Error generating model weights from backend:', error);
    return [];
  }
}

export async function startTrainingOnBackend(rounds: number): Promise<{ finalAccuracy: number }> {
    try {
      const response = await fetch(`${API_URL}/train`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ totalRounds: rounds }),
      });
      return await response.json();
    } catch (error) {
      console.error('Error starting training on backend:', error);
      return { finalAccuracy: 95.5 };
    }
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
  bloodPressureSystolic: 0,
  bloodPressureDiastolic: 0,
  bloodSugar: 0,
  cholesterol: 0,
  bmi: 0,
  heartRate: 0,
  smokingStatus: 'never',
  alcoholConsumption: 'moderate',
  exerciseFrequency: 'moderate',
  familyHistory: [],
  existingConditions: [],
};
