import type { AnalysisResult } from '@/types/analysis';

export const generateMockResults = (count: number = 100): AnalysisResult[] => {
  const classifications = ['Resilient', 'Susceptible', 'Reference', 'Other'];
  const ethnicities = ['Caucasian', 'African American', 'Asian', 'Hispanic', 'Other'];

  return Array.from({ length: count }, (_, i) => {
    const age = Math.floor(Math.random() * 40) + 40; // 40-80
    const hasEthnicity = Math.random() > 0.3; // 70% have ethnicity

    // Generate risk scores (some may be undefined)
    const riskScores = {
      frs: Math.random() > 0.1 ? Math.random() * 30 + 5 : undefined,
      ascvd: hasEthnicity && Math.random() > 0.1 ? Math.random() * 35 + 5 : undefined,
      mesa: hasEthnicity && Math.random() > 0.2 ? Math.random() * 25 + 3 : undefined,
      score2: Math.random() > 0.1 ? Math.random() * 20 + 2 : undefined,
    };
    // Calculate average normalized score (simulated)
    const validScores = Object.values(riskScores).filter(s => s !== undefined);
    const avgNormalizedScore = validScores.length > 0
      ? (Math.random() * 4) - 2 // -2 to 2
      : undefined;

    // CACS based on classification tendency
    const classificationIndex = Math.floor(Math.random() * classifications.length);
    const classification = classifications[classificationIndex];
    let cacs: number;

    switch (classification) {
      case 'Resilient':
        cacs = Math.floor(Math.random() * 50); // Low CACS
        break;
      case 'Susceptible':
        cacs = Math.floor(Math.random() * 500) + 300; // High CACS
        break;
      case 'Reference':
        cacs = Math.floor(Math.random() * 200) + 50; // Medium CACS
        break;
      default:
        cacs = Math.floor(Math.random() * 1000); // Any CACS
    }

    return {
      subject_id: `SUBJ${String(i + 1).padStart(3, '0')}`,
      original_data: {
        age,
        gender: Math.random() > 0.5 ? 'male' : 'female',
        total_cholesterol: Math.random() * 100 + 150,
        hdl_cholesterol: Math.random() * 40 + 30,
        systolic_bp: Math.random() * 40 + 110,
        smoking: Math.random() > 0.7 ? 1 : 0,
        diabetes: Math.random() > 0.8 ? 1 : 0,
        bp_medication: Math.random() > 0.6 ? 1 : 0,
        lipid_medication: Math.random() > 0.5 ? 1 : 0,
        family_history_ihd: Math.random() > 0.7 ? 1 : 0,
        ethnicity: hasEthnicity ? ethnicities[Math.floor(Math.random() * ethnicities.length)] : undefined,
      },
      risk_scores: riskScores,
      average_normalized_score: avgNormalizedScore || 0,
      cacs,
      cacs_percentile: Math.floor(Math.random() * 100),
      classification: classification as 'Resilient' | 'Susceptible' | 'Reference' | 'Other',
    };
  });
};

// Create a default mock dataset
export const mockResultsData = generateMockResults(485);
