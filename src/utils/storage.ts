import { SurveyRecord, FgdRecord } from '../types';
import { getInitialSurveyRecords, getInitialFgdRecords } from './sampleData';

const SURVEY_STORAGE_KEY = 'makassar_ducting_survey_v4_data';
const FGD_STORAGE_KEY = 'makassar_ducting_fgd_v4_data';

export function loadSurveyRecords(): SurveyRecord[] {
  try {
    const data = localStorage.getItem(SURVEY_STORAGE_KEY);
    if (!data) {
      const initial = getInitialSurveyRecords();
      saveSurveyRecords(initial);
      return initial;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initial = getInitialSurveyRecords();
    saveSurveyRecords(initial);
    return initial;
  } catch (err) {
    console.error('Error loading survey records from localStorage:', err);
    return getInitialSurveyRecords();
  }
}

export function saveSurveyRecords(records: SurveyRecord[]): void {
  try {
    localStorage.setItem(SURVEY_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving survey records:', err);
  }
}

export function loadFgdRecords(): FgdRecord[] {
  try {
    const data = localStorage.getItem(FGD_STORAGE_KEY);
    if (!data) {
      const initial = getInitialFgdRecords();
      saveFgdRecords(initial);
      return initial;
    }
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    const initial = getInitialFgdRecords();
    saveFgdRecords(initial);
    return initial;
  } catch (err) {
    console.error('Error loading FGD records from localStorage:', err);
    return getInitialFgdRecords();
  }
}

export function saveFgdRecords(records: FgdRecord[]): void {
  try {
    localStorage.setItem(FGD_STORAGE_KEY, JSON.stringify(records));
  } catch (err) {
    console.error('Error saving FGD records:', err);
  }
}

export function resetToSampleData(): { surveys: SurveyRecord[]; fgds: FgdRecord[] } {
  const surveys = getInitialSurveyRecords();
  const fgds = getInitialFgdRecords();
  saveSurveyRecords(surveys);
  saveFgdRecords(fgds);
  return { surveys, fgds };
}

export function clearAllData(): void {
  saveSurveyRecords([]);
  saveFgdRecords([]);
}
