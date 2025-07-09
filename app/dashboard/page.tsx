'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileUpload } from '@/components/ui/file-upload';
import { MermaidDiagram } from '@/components/ui/mermaid-diagram';
import { projectsApi, Project, ApiError } from '@/lib/api-client';
import { FileText, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';

export default function ProjectsPage() {
  const [currentProject, setCurrentProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const project = await projectsApi.uploadSop(file);
      setCurrentProject(project);
      setSuccess(`Successfully processed "${file.name}" and generated project!`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Upload failed: ${err.message}`);
      } else {
        setError('Failed to upload file. Please ensure the backend server is running.');
      }
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatAgentPath = (path?: string) => {
    if (!path) return 'Unknown Agent';
    
    // Convert paths like "finance_processing.invoice_agent" to "Finance Processing - Invoice Agent"
    const parts = path.split('.');
    if (parts.length >= 2) {
      const module = parts[0].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const agent = parts[1].replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      return `${module} - ${agent}`;
    }
    
    return path.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <p className="text-gray-600">
          Upload your Standard Operating Procedures to analyze and generate test scenarios
        </p>
      </div>

      {/* Status Messages */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <span className="text-sm">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm">{success}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span>Upload SOP</span>
          </CardTitle>
          <CardDescription>
            Upload your Standard Operating Procedure to automatically generate process diagrams and detect the appropriate AI agent
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FileUpload
            onFileSelect={handleFileUpload}
            loading={loading}
          />
        </CardContent>
      </Card>

      {/* Project Display */}
      {currentProject && (
        <div className="space-y-6">
          {/* Project Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-green-600" />
                <span>Project Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">File Name</label>
                  <p className="text-gray-900">{currentProject.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Detected Agent</label>
                  <p className="text-gray-900">{formatAgentPath(currentProject.base_agent_path)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-gray-900">{formatDate(currentProject.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Split View: Mermaid Diagram + SOP Content */}
          <div className="flex flex-row gap-6 min-h-[600px] max-h-[80vh] h-full">
            {/* Mermaid Diagram */}
            <Card className="flex flex-col flex-1 h-full min-h-[600px] max-h-[80vh]">
              <CardHeader className="flex-shrink-0">
                <CardTitle>Process Diagram</CardTitle>
                <CardDescription>
                  Auto-generated flowchart showing the process flow from your SOP
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                <div className="border rounded-lg p-4 bg-white flex-1 overflow-auto items-start justify-start">
                  {loading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-sm text-gray-600">Generating diagram...</p>
                      </div>
                    </div>
                  ) : (
                    <MermaidDiagram 
                      diagram={currentProject.mermaid_diagram || ''} 
                      className="h-full min-h-[400px] max-h-[70vh] w-full"
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* SOP Content */}
            <Card className="flex flex-col flex-1 h-full min-h-[600px] max-h-[80vh]">
              <CardHeader className="flex-shrink-0">
                <CardTitle>SOP Content</CardTitle>
                <CardDescription>
                  The content of your uploaded Standard Operating Procedure
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col overflow-hidden">
                <div className="border rounded-lg p-4 bg-gray-50 flex-1 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans leading-relaxed">
                    {currentProject.sop_content}
                  </pre>
                </div>
                {/* Fixed button at bottom */}
                <div className="mt-auto pt-4 flex justify-end">
                  <a 
                    href="/dashboard/scenarios" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    tabIndex={0}
                    aria-label="Generate Scenarios"
                  >
                    Generate Scenarios →
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Next Steps */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Ready for the next step?
                </h3>
                <p className="text-gray-600 mb-4">
                  Your SOP has been processed and the agent has been detected. 
                  You can now generate test scenarios for this project.
                </p>
                <div className="flex justify-center space-x-4">
                  <a 
                    href="/dashboard/scenarios" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Generate Scenarios →
                  </a>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!currentProject && !loading && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No project loaded</h3>
              <p className="text-gray-500 mb-6">
                Upload an SOP file to get started with AI agent testing
              </p>
              <div className="text-sm text-gray-400">
                Supported formats: .txt, .pdf, .doc, .docx
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 