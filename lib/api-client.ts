import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Base API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Types for API responses
export interface Project {
  id: string;
  name: string;
  sop_content: string;
  sop_file_path?: string;
  mermaid_diagram?: string;
  base_agent_path?: string;
  context_class_path?: string;
  created_at: string;
  updated_at?: string;
}

export interface Scenario {
  id: string;
  project_id: string;
  scenario_set_name?: string;
  objective: string;
  profile: string;
  exit_condition: string;
  evaluation_steps: string[];
  is_edited: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ScenarioGenerationRequest {
  // No parameters needed - LLM decides based on Mermaid diagram
}

export interface ScenarioGenerationResponse {
  project_id: string;
  scenarios_count: number;
  scenarios_file: string;
  scenarios: Scenario[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// API Error handling
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    const status = error.response?.status || 500;
    const message = error.response?.data?.detail || error.message || 'An error occurred';
    throw new ApiError(status, message, error.response?.data);
  }
);

// Project API methods
export const projectsApi = {
  // Upload SOP and create project
  uploadSop: async (file: File): Promise<Project> => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<Project>('/api/v2/projects/upload-sop', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Get all projects
  getAll: async (): Promise<Project[]> => {
    const response = await apiClient.get<Project[]>('/api/v2/projects');
    return response.data;
  },

  // Get specific project
  getById: async (projectId: string): Promise<Project> => {
    const response = await apiClient.get<Project>(`/api/v2/projects/${projectId}`);
    return response.data;
  },

  // Delete project (if implemented in backend)
  delete: async (projectId: string): Promise<void> => {
    await apiClient.delete(`/api/v2/projects/${projectId}`);
  },
};

// Scenarios API methods
export const scenariosApi = {
  // Generate scenarios for a project based on Mermaid diagram
  generate: async (
    projectId: string
  ): Promise<ScenarioGenerationResponse> => {
    const response = await apiClient.post<ScenarioGenerationResponse>(
      `/api/v2/projects/${projectId}/scenarios`,
      {} // Empty body - LLM decides scenario count based on Mermaid diagram
    );
    return response.data;
  },

  // Get scenarios for a project
  getByProject: async (projectId: string): Promise<Scenario[]> => {
    const response = await apiClient.get<Scenario[]>(`/api/v2/projects/${projectId}/scenarios`);
    return response.data;
  },

  // Update scenario
  update: async (scenarioId: string, updates: Partial<Scenario>): Promise<Scenario> => {
    const response = await apiClient.put<Scenario>(`/api/v2/scenarios/${scenarioId}`, updates);
    return response.data;
  },

  // Create scenario
  create: async (scenario: Omit<Scenario, 'id' | 'is_edited' | 'created_at' | 'updated_at'>): Promise<Scenario> => {
    const response = await apiClient.post<Scenario>('/api/v2/scenarios', scenario);
    return response.data;
  },

  // Delete scenario
  delete: async (scenarioId: string): Promise<void> => {
    await apiClient.delete(`/api/v2/scenarios/${scenarioId}`);
  },
};

// Health check
export const healthApi = {
  check: async (): Promise<{ status: string; timestamp: string }> => {
    const response = await apiClient.get('/api/health');
    return response.data;
  },
};

// Export the axios instance for custom requests if needed
export { apiClient };
export default apiClient; 