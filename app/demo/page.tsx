'use client';

import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SAMPLE_SOPS } from '@/lib/utils';
import { uploadSop, generateScenarios, simulate, audit, runPipeline } from '@/lib/api';
import { 
  Upload, 
  FileText, 
  Bot, 
  Play, 
  BarChart3, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  ArrowLeft,
  ArrowRight,
  Zap
} from 'lucide-react';
import Link from 'next/link';

interface Scenario {
  objective: string;
  profile: string;
  exit_condition: string;
}

interface SimulationResult {
  objective: string;
  profile: string;
  exit_condition: string;
}

interface AuditSummary {
  total_simulations: number;
  average_score: number;
  successes: number;
  failures: number;
  overall_status: string;
}

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // File upload state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [sopText, setSopText] = useState('');
  const [sopPath, setSopPath] = useState('');
  
  // Scenario generation state
  const [numScenarios, setNumScenarios] = useState(5);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [scenariosFile, setScenariosFile] = useState('');
  
  // Simulation state
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);
  const [simulationFile, setSimulationFile] = useState('');
  
  // Audit state
  const [auditSummary, setAuditSummary] = useState<AuditSummary | null>(null);
  const [auditFile, setAuditFile] = useState('');

  const steps = [
    { title: 'Upload SOP', icon: Upload, description: 'Upload your Standard Operating Procedure' },
    { title: 'Generate Scenarios', icon: Bot, description: 'AI creates test scenarios' },
    { title: 'Run Simulation', icon: Play, description: 'Test your AI agent' },
    { title: 'View Results', icon: BarChart3, description: 'Analyze performance' },
  ];

  const handleFileUpload = useCallback(async (file: File) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await uploadSop(file);
      if (response.success && response.data) {
        setSopText(response.data.sop_text);
        setSopPath(response.data.sop_file);
        setUploadedFile(file);
        setCurrentStep(1);
      } else {
        setError(response.error || 'Failed to upload SOP. Please check if the backend API is running.');
      }
    } catch (err) {
      setError('Failed to connect to backend API. Please ensure the server is running on localhost:8000.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSampleSop = async (sopId: number) => {
    const sop = SAMPLE_SOPS.find(s => s.id === sopId);
    if (!sop) return;

    setLoading(true);
    setError('');
    
    try {
      // Create a file from the sample SOP content and upload it through the API
      const file = new File([sop.content], `${sop.title}.txt`, { type: 'text/plain' });
      const response = await uploadSop(file);
      
      if (response.success && response.data) {
        setSopText(response.data.sop_text);
        setSopPath(response.data.sop_file);
        setUploadedFile(file);
        setCurrentStep(1);
      } else {
        setError(response.error || 'Failed to process sample SOP. Please check if the backend API is running.');
      }
    } catch (err) {
      setError('Failed to connect to backend API. Please ensure the server is running on localhost:8000.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScenarios = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await generateScenarios(sopPath, numScenarios);
      if (response.success && response.data) {
        setScenarios(response.data.scenarios);
        setScenariosFile(response.data.scenarios_file);
        setCurrentStep(2);
      } else {
        setError(response.error || 'Failed to generate scenarios. Please try again.');
      }
    } catch (err) {
      setError('Failed to generate scenarios. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await simulate(scenariosFile);
      if (response.success && response.data) {
        setSimulationResults(response.data.simulations);
        setSimulationFile(response.data.simulation_file);
        setCurrentStep(3);
      } else {
        setError(response.error || 'Failed to run simulation. Please try again.');
      }
    } catch (err) {
      setError('Failed to run simulation. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleAudit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await audit(simulationFile);
      if (response.success && response.data) {
        setAuditSummary(response.data.evaluation_summary);
        setAuditFile(response.data.audit_file);
        setCurrentStep(4);
      } else {
        setError(response.error || 'Failed to run audit. Please try again.');
      }
    } catch (err) {
      setError('Failed to run audit. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleRunFullPipeline = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await runPipeline(sopPath, numScenarios);
      if (response.success && response.data) {
        setAuditSummary(response.data.evaluation_summary);
        setCurrentStep(4);
      } else {
        setError(response.error || 'Failed to run pipeline. Please try again.');
      }
    } catch (err) {
      setError('Failed to run pipeline. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">Agent Suite - Live API</h1>
          </div>
          <div className="text-sm text-gray-500">
            Step {currentStep + 1} of {steps.length}
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between">
            {steps.map((step, index) => (
              <div
                key={index}
                className={`flex items-center ${
                  index < steps.length - 1 ? 'flex-1' : ''
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <step.icon className="w-5 h-5" />
                  </div>
                  <div className="ml-3">
                    <div
                      className={`font-medium ${
                        index <= currentStep ? 'text-blue-600' : 'text-gray-400'
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-sm text-gray-500">{step.description}</div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-8 ${
                      index < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Step 0: Upload SOP */}
        {currentStep === 0 && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="w-6 h-6 mr-2 text-blue-600" />
                  Upload Your SOP
                </CardTitle>
                <CardDescription>
                  Upload a Standard Operating Procedure document to get started
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files[0];
                    if (file && (file.type === 'text/plain' || file.type === 'application/pdf' || file.name.endsWith('.md'))) {
                      handleFileUpload(file);
                    }
                  }}
                >
                  <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <div className="text-lg font-medium text-gray-700 mb-2">
                    Drag and drop your SOP file here
                  </div>
                  <div className="text-sm text-gray-500 mb-4">
                    Supports .txt, .md, .pdf files up to 10MB
                  </div>
                  <div className="text-xs text-blue-600 mb-4">
                    <a href="/test-sop.txt" download className="hover:underline">
                      📥 Download sample SOP file to test upload
                    </a>
                  </div>
                  <input
                    type="file"
                    accept=".txt,.md,.pdf"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        console.log('File selected:', file.name, file.type);
                        handleFileUpload(file);
                      }
                    }}
                    className="hidden"
                    id="file-upload"
                  />
                  <label 
                    htmlFor="file-upload" 
                    className={`inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2 text-sm cursor-pointer ${
                      loading 
                        ? 'bg-gray-400 text-white cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
                    }`}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      'Choose File'
                    )}
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Sample SOPs */}
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Or try with a sample SOP
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {SAMPLE_SOPS.map((sop) => (
                  <Card key={sop.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-lg">{sop.title}</CardTitle>
                      <CardDescription>{sop.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-gray-100 p-3 rounded text-sm text-gray-700 mb-4 line-clamp-3">
                        {sop.content.substring(0, 100)}...
                      </div>
                      <Button
                        onClick={() => handleSampleSop(sop.id)}
                        disabled={loading}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Use This SOP'
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Scenario Generation Step */}
        {currentStep === 1 && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="w-6 h-6 mr-2 text-green-600" />
                  SOP Content
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-100 p-4 rounded-lg max-h-60 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {sopText}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="w-6 h-6 mr-2 text-blue-600" />
                  Generate Test Scenarios
                </CardTitle>
                <CardDescription>
                  AI will create realistic test scenarios based on your SOP
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Scenarios
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={numScenarios}
                      onChange={(e) => setNumScenarios(parseInt(e.target.value))}
                      className="w-32 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex space-x-4">
                    <Button
                      onClick={handleGenerateScenarios}
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Bot className="w-4 h-4 mr-2" />
                          Generate Scenarios
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleRunFullPipeline}
                      variant="outline"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Running Pipeline...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 mr-2" />
                          Run Full Pipeline
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Scenarios Display */}
        {currentStep === 2 && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="w-6 h-6 mr-2 text-green-600" />
                  Generated Scenarios
                </CardTitle>
                <CardDescription>
                  {scenarios.length} scenarios generated for testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {scenarios.map((scenario: Scenario, index: number) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="font-medium text-gray-900 mb-2">
                        Scenario {index + 1}
                      </div>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div><strong>Objective:</strong> {scenario.objective}</div>
                        <div><strong>Profile:</strong> {scenario.profile}</div>
                        <div><strong>Exit Condition:</strong> {scenario.exit_condition}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex space-x-4">
                  <Button onClick={handleSimulate} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Simulating...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Simulation
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back to SOP
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Simulation Results */}
        {currentStep === 3 && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Play className="w-6 h-6 mr-2 text-green-600" />
                  Simulation Results
                </CardTitle>
                <CardDescription>
                  Simulation completed with {simulationResults.length} test runs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {simulationResults.map((result: SimulationResult, index: number) => (
                    <div key={index} className="border rounded-lg p-4 bg-gray-50">
                      <div className="font-medium text-gray-900 mb-2">
                        Test Run {index + 1}
                      </div>
                      <div className="text-sm text-gray-700 space-y-1">
                        <div><strong>Objective:</strong> {result.objective}</div>
                        <div><strong>Profile:</strong> {result.profile}</div>
                        <div><strong>Result:</strong> {result.exit_condition}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex space-x-4">
                  <Button onClick={handleAudit} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Auditing...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Run Audit
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back to Scenarios
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Audit Results */}
        {currentStep === 4 && auditSummary && (
          <div className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-6 h-6 mr-2 text-green-600" />
                  Audit Results
                </CardTitle>
                <CardDescription>
                  Comprehensive analysis of your AI agent's performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {auditSummary.total_simulations}
                    </div>
                    <div className="text-sm text-gray-600">Total Simulations</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {auditSummary.average_score}%
                    </div>
                    <div className="text-sm text-gray-600">Average Score</div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-emerald-600">
                      {auditSummary.successes}
                    </div>
                    <div className="text-sm text-gray-600">Successes</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {auditSummary.failures}
                    </div>
                    <div className="text-sm text-gray-600">Failures</div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center space-x-4 p-6 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    {auditSummary.overall_status === 'PASS' ? (
                      <CheckCircle className="w-8 h-8 text-green-500 mr-2" />
                    ) : (
                      <AlertCircle className="w-8 h-8 text-red-500 mr-2" />
                    )}
                    <div>
                      <div className="font-bold text-lg">
                        Overall Status: {auditSummary.overall_status}
                      </div>
                      <div className="text-sm text-gray-600">
                        {auditSummary.overall_status === 'PASS' 
                          ? 'Your AI agent meets performance requirements'
                          : 'Your AI agent needs improvement'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex space-x-4">
                  <Button onClick={() => setCurrentStep(0)}>
                    Test Another SOP
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep(3)}>
                    Back to Simulation
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
} 