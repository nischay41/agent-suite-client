// API Integration for Agent Suite Backend
import { getApiUrl } from './utils';

const API_BASE_URL = getApiUrl();

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface UploadSopResponse {
  sop_text: string;
  sop_file: string;
}

export interface GenerateScenariosResponse {
  scenarios_file: string;
  scenarios_count: number;
  scenarios: Array<{
    objective: string;
    profile: string;
    exit_condition: string;
  }>;
}

export interface SimulateResponse {
  simulation_file: string;
  simulations_count: number;
  simulations: Array<{
    objective: string;
    profile: string;
    exit_condition: string;
  }>;
}

export interface AuditResponse {
  audit_file: string;
  evaluation_summary: {
    total_simulations: number;
    average_score: number;
    successes: number;
    failures: number;
    overall_status: string;
  };
  results_count: number;
}

export interface PipelineResponse {
  pipeline_status: string;
  scenarios_file: string;
  simulation_file: string;
  audit_file: string;
  evaluation_summary: {
    total_simulations: number;
    average_score: number;
    successes: number;
    failures: number;
    overall_status: string;
  };
}

// API Functions
export const uploadSop = async (file: File): Promise<ApiResponse<UploadSopResponse>> => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/api/upload-sop`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Upload failed' 
    };
  }
};

export const generateScenarios = async (
  sopFile: string, 
  numScenarios: number = 5
): Promise<ApiResponse<GenerateScenariosResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/generate-scenarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sop_file: sopFile,
        num_scenarios: numScenarios,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Scenario generation failed' 
    };
  }
};

export const simulate = async (
  scenariosFile: string
): Promise<ApiResponse<SimulateResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        scenarios_file: scenariosFile,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Simulation failed' 
    };
  }
};

export const audit = async (
  simulationFile: string
): Promise<ApiResponse<AuditResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/audit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        simulation_file: simulationFile,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Audit failed' 
    };
  }
};

export const runPipeline = async (
  sopFile: string,
  numScenarios: number = 5,
  scenarioSetName: string = 'ui_pipeline'
): Promise<ApiResponse<PipelineResponse>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/pipeline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        sop_file: sopFile,
        num_scenarios: numScenarios,
        scenario_set_name: scenarioSetName,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Pipeline execution failed' 
    };
  }
};

// Health check function
export const checkHealth = async (): Promise<boolean> => {
  try {
    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      signal: controller.signal,
      cache: 'no-store'
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    // Suppress all connection errors - they're expected when backend is not running
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Backend health check timed out');
    } else {
      console.log('Backend not available, using demo mode');
    }
    return false;
  }
}; 