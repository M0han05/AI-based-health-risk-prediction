export interface PatientData {
  aadhaarNumber: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  address: string;
  bloodPressureSystolic: number;
  bloodPressureDiastolic: number;
  bloodSugar: number;
  cholesterol: number;
  bmi: number;
  heartRate: number;
  smokingStatus: string;
  alcoholConsumption: string;
  exerciseFrequency: string;
  familyHistory: string[];
  existingConditions: string[];
}

export interface HealthRisk {
  disease: string;
  risk: number;
  severity: 'low' | 'moderate' | 'high' | 'critical';
  color: string;
}

export interface ModelWeights {
  layer: string;
  values: number[];
  noisy?: number[];
}

export interface AccuracyResult {
  method: string;
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  color: string;
}

export interface DataPacket {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  content: string;
  type: 'raw' | 'gradient' | 'encrypted';
  opacity: number;
}

export interface FeatureImportance {
  feature: string;
  importance: number;
  direction: 'positive' | 'negative';
  value: string;
}

export type AppStep = 'registration' | 'dataflow' | 'privacy' | 'nodetraining' | 'comparison' | 'explainability' | 'fladmin' | 'hospitaltraining';
