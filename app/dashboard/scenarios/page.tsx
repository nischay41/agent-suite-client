'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { projectsApi, scenariosApi, Project, Scenario, ApiError } from '@/lib/api-client';
import { 
  FileText, 
  Bot, 
  Plus, 
  Trash2, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  ChevronDown 
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  createColumnHelper,
  flexRender,
  type ColumnDef,
} from '@tanstack/react-table';

export default function ScenariosPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [editingCell, setEditingCell] = useState<{ rowId: string; columnId: string } | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');

  // Load projects on mount
  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await projectsApi.getAll();
        setProjects(projectsData);
        // Auto-select the most recent project
        if (projectsData.length > 0) {
          setSelectedProject(projectsData[0]);
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(`Failed to load projects: ${err.message}`);
        } else {
          setError('Failed to load projects. Please ensure the backend server is running.');
        }
      }
    };
    loadProjects();
  }, []);

  // Load scenarios when project changes
  useEffect(() => {
    if (selectedProject) {
      loadScenarios();
    }
  }, [selectedProject]);

  const loadScenarios = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    setError('');
    
    try {
      const scenariosData = await scenariosApi.getByProject(selectedProject.id);
      setScenarios(scenariosData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to load scenarios: ${err.message}`);
      } else {
        setError('Failed to load scenarios.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateScenarios = async () => {
    if (!selectedProject) return;
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await scenariosApi.generate(selectedProject.id);
      setScenarios(response.scenarios);
      setSuccess(`Generated ${response.scenarios_count} scenarios based on process diagram analysis!`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to generate scenarios: ${err.message}`);
      } else {
        setError('Failed to generate scenarios.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCellEdit = async (rowId: string, columnId: string, value: string) => {
    const scenario = scenarios.find(s => s.id === rowId);
    if (!scenario) return;

    try {
      let updateData: Partial<Scenario> = {};
      
      if (columnId === 'evaluation_steps') {
        // Convert comma-separated string to array
        updateData.evaluation_steps = value.split(',').map(step => step.trim()).filter(step => step);
      } else {
        updateData[columnId as keyof Scenario] = value as any;
      }

      const updatedScenario = await scenariosApi.update(rowId, updateData);
      
      // Update local state
      setScenarios(prev => prev.map(s => s.id === rowId ? updatedScenario : s));
      setSuccess('Scenario updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to update scenario: ${err.message}`);
      } else {
        setError('Failed to update scenario.');
      }
    }
  };

  const handleDeleteScenario = async (scenarioId: string) => {
    try {
      await scenariosApi.delete(scenarioId);
      setScenarios(prev => prev.filter(s => s.id !== scenarioId));
      setSuccess('Scenario deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to delete scenario: ${err.message}`);
      } else {
        setError('Failed to delete scenario.');
      }
    }
  };

  const handleAddScenario = async () => {
    if (!selectedProject) return;

    try {
      const newScenario = {
        project_id: selectedProject.id,
        scenario_set_name: 'manual',
        objective: 'New scenario objective',
        profile: 'New user profile',
        exit_condition: 'New exit condition',
        evaluation_steps: ['Step 1', 'Step 2']
      };

      const createdScenario = await scenariosApi.create(newScenario);
      setScenarios(prev => [...prev, createdScenario]);
      setSuccess('New scenario added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(`Failed to add scenario: ${err.message}`);
      } else {
        setError('Failed to add scenario.');
      }
    }
  };

  const startEditing = (rowId: string, columnId: string, currentValue: string) => {
    setEditingCell({ rowId, columnId });
    setEditingValue(currentValue);
  };

  const saveEdit = () => {
    if (editingCell) {
      handleCellEdit(editingCell.rowId, editingCell.columnId, editingValue);
      setEditingCell(null);
      setEditingValue('');
    }
  };

  const cancelEdit = () => {
    setEditingCell(null);
    setEditingValue('');
  };

  // Table column definitions
  const columnHelper = createColumnHelper<Scenario>();
  
  const columns = [
    columnHelper.accessor('objective', {
      header: 'Objective',
      cell: ({ row, getValue }) => {
        const isEditing = editingCell?.rowId === row.original.id && editingCell?.columnId === 'objective';
        const value = getValue();
        
        if (isEditing) {
          return (
            <textarea
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  saveEdit();
                } else if (e.key === 'Escape') {
                  cancelEdit();
                }
              }}
              className="w-full p-2 border rounded resize-none min-h-[60px] text-gray-900 bg-white"
              autoFocus
            />
          );
        }
        
        return (
          <div 
            className="cursor-pointer hover:bg-gray-50 p-2 rounded min-h-[60px] whitespace-pre-wrap text-gray-900"
            onClick={() => startEditing(row.original.id, 'objective', value)}
          >
            {value}
          </div>
        );
      },
    }),
    columnHelper.accessor('profile', {
      header: 'Profile',
      cell: ({ row, getValue }) => {
        const isEditing = editingCell?.rowId === row.original.id && editingCell?.columnId === 'profile';
        const value = getValue();
        
        if (isEditing) {
          return (
            <textarea
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  saveEdit();
                } else if (e.key === 'Escape') {
                  cancelEdit();
                }
              }}
              className="w-full p-2 border rounded resize-none min-h-[60px] text-gray-900 bg-white"
              autoFocus
            />
          );
        }
        
        return (
          <div 
            className="cursor-pointer hover:bg-gray-50 p-2 rounded min-h-[60px] whitespace-pre-wrap text-gray-900"
            onClick={() => startEditing(row.original.id, 'profile', value)}
          >
            {value}
          </div>
        );
      },
    }),
    columnHelper.accessor('exit_condition', {
      header: 'Exit Condition',
      cell: ({ row, getValue }) => {
        const isEditing = editingCell?.rowId === row.original.id && editingCell?.columnId === 'exit_condition';
        const value = getValue();
        
        if (isEditing) {
          return (
            <textarea
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  saveEdit();
                } else if (e.key === 'Escape') {
                  cancelEdit();
                }
              }}
              className="w-full p-2 border rounded resize-none min-h-[60px] text-gray-900 bg-white"
              autoFocus
            />
          );
        }
        
        return (
          <div 
            className="cursor-pointer hover:bg-gray-50 p-2 rounded min-h-[60px] whitespace-pre-wrap text-gray-900"
            onClick={() => startEditing(row.original.id, 'exit_condition', value)}
          >
            {value}
          </div>
        );
      },
    }),
    columnHelper.accessor('evaluation_steps', {
      header: 'Evaluation Steps',
      cell: ({ row, getValue }) => {
        const isEditing = editingCell?.rowId === row.original.id && editingCell?.columnId === 'evaluation_steps';
        const value = getValue();
        const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
        
        if (isEditing) {
          return (
            <textarea
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              onBlur={saveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  saveEdit();
                } else if (e.key === 'Escape') {
                  cancelEdit();
                }
              }}
              className="w-full p-2 border rounded resize-none min-h-[60px] text-gray-900 bg-white"
              placeholder="Enter steps separated by commas"
              autoFocus
            />
          );
        }
        
        return (
          <div 
            className="cursor-pointer hover:bg-gray-50 p-2 rounded min-h-[60px] whitespace-pre-wrap text-gray-900"
            onClick={() => startEditing(row.original.id, 'evaluation_steps', displayValue)}
          >
            {displayValue}
          </div>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleDeleteScenario(row.original.id)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ),
    }),
  ];

  const table = useReactTable({
    data: scenarios,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const formatAgentPath = (path?: string) => {
    if (!path) return 'Unknown Agent';
    
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
        <h1 className="text-3xl font-bold text-gray-900">Scenarios</h1>
        <p className="text-gray-600">
          Generate and edit test scenarios for your AI agent testing
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

      {/* Project Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-blue-600" />
            <span>Select Project</span>
          </CardTitle>
          <CardDescription>
            Choose a project to generate and manage scenarios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Project Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <div className="flex-1 text-left">
                  {selectedProject ? (
                    <div>
                      <div className="font-medium">{selectedProject.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatAgentPath(selectedProject.base_agent_path)} • {formatDate(selectedProject.created_at)}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">Select a project...</div>
                  )}
                </div>
                <ChevronDown className="w-5 h-5 text-gray-400" />
              </button>
              
              {dropdownOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() => {
                        setSelectedProject(project);
                        setDropdownOpen(false);
                      }}
                      className="w-full p-3 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50"
                    >
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-gray-500">
                        {formatAgentPath(project.base_agent_path)} • {formatDate(project.created_at)}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            {selectedProject && (
              <div className="flex space-x-4">
                {scenarios.length === 0 ? (
                  <Button
                    onClick={handleGenerateScenarios}
                    disabled={loading}
                    className="flex items-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4" />
                        <span>Generate Scenarios</span>
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleAddScenario}
                    variant="outline"
                    className="flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Scenario</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Scenarios Table */}
      {selectedProject && scenarios.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5 text-green-600" />
              <span>Test Scenarios</span>
            </CardTitle>
            <CardDescription>
              {scenarios.length} scenarios for {selectedProject.name}. Click on any cell to edit.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="bg-gray-50">
                      {headerGroup.headers.map(header => (
                        <th
                          key={header.id}
                          className="border border-gray-300 p-3 text-left font-medium text-gray-900"
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(header.column.columnDef.header, header.getContext())
                          }
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map(cell => (
                        <td
                          key={cell.id}
                          className="border border-gray-300 p-0 align-top"
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                {scenarios.length} scenario{scenarios.length !== 1 ? 's' : ''} total
              </div>
              <Button
                onClick={handleAddScenario}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Scenario</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {selectedProject && scenarios.length === 0 && !loading && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No scenarios yet</h3>
              <p className="text-gray-500 mb-6">
                Generate AI-powered test scenarios for your selected project
              </p>
              <Button
                onClick={handleGenerateScenarios}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Bot className="w-4 h-4" />
                    <span>Generate Scenarios</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Project Selected */}
      {!selectedProject && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="pt-12 pb-12">
            <div className="text-center">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a project</h3>
              <p className="text-gray-500 mb-6">
                Choose a project from the dropdown above to start managing scenarios
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 