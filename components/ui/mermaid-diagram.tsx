'use client';

import { useEffect, useRef, useState } from 'react';

interface MermaidDiagramProps {
  diagram: string;
  className?: string;
}

export function MermaidDiagram({ diagram, className = '' }: MermaidDiagramProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const idRef = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`);
  const [mermaidLoaded, setMermaidLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const fallbackDiagram = `flowchart TD
    A((Start)) --> B[Verify Auth]
    B[Verify Auth] --> C[Check Permissions]
    C[Check Permissions] --> D[Execute Test]
    D[Execute Test] --> E[Document Results]
    E[Document Results] --> F {Outcomes OK?}
    F {Outcomes OK?} -->|Yes| G((End))
    F {Outcomes OK?} -->|No| H[Review Steps]
    H[Review Steps] --> B[Verify Auth]`;

  // Load Mermaid dynamically
  useEffect(() => {
    const loadMermaid = async () => {
      try {
        const mermaid = await import('mermaid');
        
        // Initialize with clean configuration
        mermaid.default.initialize({
          startOnLoad: false,
          theme: 'default',
          securityLevel: 'loose',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontSize: 14,
          flowchart: {
            curve: 'basis',
            padding: 20,
            nodeSpacing: 50,
            rankSpacing: 50,
            useMaxWidth: true,
          },
          themeVariables: {
            primaryColor: '#3B82F6',
            primaryTextColor: '#1F2937',
            primaryBorderColor: '#1D4ED8',
            lineColor: '#6B7280',
            secondaryColor: '#F3F4F6',
            tertiaryColor: '#F9FAFB',
          },
        });
        
        setMermaidLoaded(true);
      } catch (error) {
        console.error('Failed to load mermaid:', error);
        setError('Failed to load diagram library');
      }
    };

    loadMermaid();
  }, []);

  // Render diagram when loaded
  useEffect(() => {
    const renderDiagram = async () => {
      if (!elementRef.current || !diagram || !mermaidLoaded) return;

      try {
        setError(null);
        setShowFallback(false);
        
        // Clear previous content
        elementRef.current.innerHTML = '';
        
        // Basic validation - the backend should provide clean diagrams
        if (!diagram.trim().startsWith('flowchart')) {
          throw new Error('Invalid diagram format');
        }
        
        // Import mermaid for rendering
        const mermaid = await import('mermaid');
        
        // Render the diagram
        const { svg } = await mermaid.default.render(idRef.current, diagram.trim());
        
        // Insert the SVG
        elementRef.current.innerHTML = svg;
        
        // Style the SVG for responsive display
        const svgElement = elementRef.current.querySelector('svg');
        if (svgElement) {
          svgElement.style.width = '100%';
          svgElement.style.height = 'auto';
          svgElement.style.maxWidth = '100%';
          svgElement.style.display = 'block';
        }
        
      } catch (error) {
        console.error('Error rendering Mermaid diagram:', error);
        setError('Failed to render diagram');
        setShowFallback(true);
        
        // Show fallback diagram
        if (elementRef.current) {
          // Try to render fallback diagram
          import('mermaid').then(mermaid => {
            mermaid.default.render(idRef.current + '-fallback', fallbackDiagram).then(({ svg }) => {
              elementRef.current!.innerHTML = svg;
            }).catch(() => {
              // If fallback also fails, show static fallback UI
              elementRef.current!.innerHTML = `
                <div class="flex items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg">
                  <div class="text-center">
                    <svg class="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <p class="text-sm">Unable to render diagram</p>
                    <p class="text-xs text-gray-400 mt-1">Please check the diagram syntax</p>
                  </div>
                </div>
              `;
            });
          });
        }
      }
    };

    renderDiagram();
  }, [diagram, mermaidLoaded]);

  // Loading state
  if (!mermaidLoaded) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600">Loading diagram...</p>
        </div>
      </div>
    );
  }

  // No diagram state
  if (!diagram) {
    return (
      <div className={`flex items-center justify-center h-64 text-gray-500 border-2 border-dashed border-gray-300 rounded-lg ${className}`}>
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-sm">No diagram available</p>
          <p className="text-xs text-gray-400 mt-1">Upload an SOP to generate a diagram</p>
        </div>
      </div>
    );
  }

  // Main render
  return (
    <div className={`mermaid-container ${className}`}>
      <div
        ref={elementRef}
        className="mermaid-diagram w-full h-full overflow-auto"
        style={{ minHeight: '200px' }}
      />
      {/* Console/log area */}
      <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700">
        <div className="font-bold mb-1">Mermaid Source:</div>
        <pre className="whitespace-pre-wrap break-all">{showFallback ? fallbackDiagram : diagram}</pre>
        {error && (
          <div className="mt-2 text-red-600">Error: {error}</div>
        )}
      </div>
    </div>
  );
} 