/**
 * types/farm.ts
 * TypeScript type definitions for AgriOptima AI Mobile
 * Canonical contract mapping to backend API, deterministic LP decision engine, and UI components.
 */

export interface FarmDecisionRequest {
  state_name: string;
  district_name: string;
  land_size_acres: number;
  budget_inr: number;
  irrigation_type: 'Borewell' | 'Rainfed' | 'Canal' | 'Drip' | 'Sprinkler';
  irrigation_reliability: 'High' | 'Medium' | 'Low';
  season: 'Kharif' | 'Rabi' | 'Zaid';
  risk_tolerance: 'Balanced' | 'Conservative' | 'Aggressive';
  custom_lat?: number | null;
  custom_lon?: number | null;
  weather_override?: string | null;
  force_refresh?: boolean;
  simulate_primary_failure?: boolean;
  simulate_all_failure?: boolean;
  primary_crop_id?: string;
}

export interface LocationInfo {
  district_id: string;
  state_name: string;
  district_name: string;
  latitude: number;
  longitude: number;
  agro_climatic_zone: string;
  major_soil_type: string;
  is_custom_gps?: boolean;
  gps_fallback_occurred?: boolean;
  provenance_warnings?: string[];
}

export interface DailyForecastItem {
  date: string;
  t_max: number;
  t_min: number;
  rain_mm: number;
  rain_prob: number;
}

export interface WeatherInfo {
  data_provider: string;
  confidence_score: 'High' | 'Medium' | 'Low' | string;
  data_freshness: string;
  weather_timestamp: string;
  cache_hit: boolean;
  fallback_used: boolean;
  current_temperature_c: number | null;
  current_apparent_temp_c: number | null;
  current_humidity_pct: number | null;
  current_wind_kmh: number | null;
  current_precipitation_mm: number | null;
  surface_soil_moisture_m3m3: number | null;
  root_zone_soil_moisture_m3m3: number | null;
  fao_et0_mm_hr: number | null;
  vapour_pressure_deficit_kpa: number | null;
  rainfall_anomaly_pct: number | null;
  forecast_rain_7d_total_mm: number | null;
  max_rain_probability_7d_pct: number | null;
  forecast_temp_max_c: number | null;
  forecast_temp_min_c: number | null;
  daily_series: DailyForecastItem[];
  missing_variables: string[];
}

export interface RiskInfo {
  overall_risk_score: number;
  overall_risk_label: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string;
  drought_risk_score: number;
  drought_risk_label: string;
  waterlogging_risk_score: number;
  waterlogging_risk_label: string;
  heat_risk_score: number;
  heat_risk_label: string;
  atmospheric_water_stress_score: number;
  atmospheric_water_stress_label: string;
  effective_drought_mitigation: number;
  irrigation_buffer_pct: number;
  soil_moisture_status: string;
  waterlogging_alert?: string | null;
  heat_alert?: string | null;
}

export interface CropEvaluationItem {
  crop_name: string;
  hist_yield_qtl_acre: number;
  weather_multiplier: number;
  expected_yield_qtl_acre: number;
  total_risk_penalty_pct: number;
  drought_penalty_pct: number;
  waterlogging_penalty_pct: number;
  heat_penalty_pct: number;
  modal_price_per_qtl: number;
  cost_c2_per_acre: number;
  expected_revenue_per_acre: number;
  expected_profit_per_acre: number;
  risk_adjusted_profit_per_acre: number;
  risk_score: number;
  is_allocated: boolean;
  allocated_acres: number;
  acre_share_pct: number;
  reasons: string[];
}

export interface AllocatedCropItem {
  crop_name: string;
  allocated_acres: number;
  acre_share_pct: number;
  expected_yield_qtl_acre: number;
  modal_price_per_qtl: number;
  total_cost_inr: number;
  total_revenue_inr: number;
  net_profit_inr: number;
  roi_pct: number;
  risk_score: number;
  reasons: string[];
}

export interface OptimizationTotals {
  status: 'success' | 'warning' | 'error' | string;
  total_land_acres: number;
  total_allocated_acres: number;
  fallow_acres: number;
  budget_capital_inr: number;
  total_investment_inr: number;
  budget_utilization_pct: number;
  total_expected_revenue_inr: number;
  total_expected_net_profit_inr: number;
  expected_farm_roi_pct: number;
  weighted_risk_score: number;
  weighted_risk_label: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' | string;
  budget_constrained: boolean;
  all_negative_profits: boolean;
  solver_method: string;
}

export interface CausalStep {
  step_number: number;
  title: string;
  detail: string;
}

export interface ExplanationInfo {
  headline: string;
  environmental_summary: string;
  irrigation_impact: string;
  allocated_crop_breakdown: string[];
  special_alerts: string[];
  unselected_crop_insights: string[];
  causal_chain: CausalStep[];
  data_trust_summary: string;
}

export interface ScenarioItem {
  scenario_id: string;
  scenario_name: string;
  description: string;
  total_profit_inr: number;
  profit_delta_from_live_inr: number;
  roi_pct: number;
  total_allocated_acres: number;
  fallow_acres: number;
  allocations: Record<string, number>;
  primary_risk_factor: string;
  key_allocation_shift: string;
}

export interface DailyActionInput {
  name: string;
  quantity_per_acre: number;
  unit: string;
}

export interface DailyAction {
  day_number: number;
  week_number: number;
  title: string;
  description: string;
  category: string;
  critical?: boolean;
  inputs?: DailyActionInput[];
  desc?: string;
}

export interface CropAllocation {
  crop_id: string;
  crop_name: string;
  allocated_acres: number;
  expected_yield_kg: number;
  expected_revenue_inr: number;
  expected_net_profit_inr: number;
  expected_roi_percent: number;
}

export interface FarmCalendar {
  total_weeks: number;
  actions: DailyAction[];
}

export interface FarmDecisionResponse {
  request: FarmDecisionRequest;
  location: LocationInfo;
  weather: WeatherInfo;
  risk: RiskInfo;
  crop_evaluations: CropEvaluationItem[];
  allocated_crops: AllocatedCropItem[];
  farm_totals: OptimizationTotals;
  explanation: ExplanationInfo;
  alerts: string[];
  scenarios: Record<string, ScenarioItem>;
  calendar?: FarmCalendar;
  allocations?: CropAllocation[];
}

export interface DistrictLocationItem {
  district_id: string;
  state_name: string;
  district_name: string;
  latitude: number;
  longitude: number;
  agro_climatic_zone: string;
  major_soil_type: string;
}

export interface PlanProgress {
  currentDay: number;
  currentWeek: number;
  totalWeeks: number;
  completedDays: number[];
  delayedTasks: Array<{
    day_number: number;
    task_title: string;
    delay_days: number;
    reason: string;
    delayed_at: string;
  }>;
  todayTask: DailyAction | null;
}

export interface ActionableAdvisory {
  severity: 'low' | 'moderate' | 'high' | 'critical';
  headline: string;
  recommendation: string;
  impacted_day?: number;
}

export interface SentinelAnalysisResult {
  timestamp: string;
  actionable_advisories: ActionableAdvisory[];
  telemetry: {
    soil_moisture: {
      current_m3m3: number;
      status: 'optimal' | 'low' | 'waterlogged';
    };
    weather_condition: {
      rainfall_7d_mm: number;
      max_temp_c: number;
      risk_level: 'low' | 'moderate' | 'high' | 'extreme';
    };
    drought_risk: {
      level: 'none' | 'moderate' | 'severe';
      spei_index: number;
    };
  };
}
