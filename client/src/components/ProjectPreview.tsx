import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';
import type { Project, SelectedElement } from '../types'; // [1]
import { assets } from '../assets/assets'; // [2]
import LoaderSteps from './LoaderSteps'; // [3]
import EditorPanel from './EditorPanel'; // [4]

// Interface for the exposed methods via ref
export interface ProjectPreviewRef {
  getCode: () => string | undefined;
} // [1]

interface ProjectPreviewProps {
  project: Project;
  isGenerating: boolean;
  device?: 'phone' | 'tablet' | 'desktop'; // [5]
  showEditorPanel?: boolean;
}

const ProjectPreview = forwardRef<ProjectPreviewRef, ProjectPreviewProps>(
  ({ project, isGenerating, device = 'desktop', showEditorPanel = true }, ref) => {
    
    const iframeRef = useRef<HTMLIFrameElement>(null); // [6]
    const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null); // [7]

    // Width configurations for device simulation
    const resolutions = {
      phone: '412px',
      tablet: '768px',
      desktop: '100%'
    }; // [8]

    // 1. Function to Inject Scripts into the HTML for Editing Functionality
    const injectPreview = (html: string) => {
      if (!html) return '';
      
      // If editor panel is disabled (e.g., in public view), return raw HTML
      if (!showEditorPanel) return html; // [9]

      // Inject the script that allows element selection (click listener)
      // This script is stored in assets.iframeScript
      if (html.includes('</body>')) {
        return html.replace('</body>', `<script>${assets.iframeScript}</script></body>`); // [2]
      } else {
        return html + `<script>${assets.iframeScript}</script>`;
      }
    };

    // 2. Handle Messages from Iframe (Element Selection)
    useEffect(() => {
      const handleMessage = (event: MessageEvent) => {
        // When user clicks an element inside iframe, it sends 'elementSelected'
        if (event.data.type === 'elementSelected') {
          setSelectedElement(event.data.payload); // [10]
        } else if (event.data.type === 'clearSelection') {
          setSelectedElement(null);
        }
      };

      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage); // [11]
    }, []);

    // 3. Send Updates Back to Iframe (Real-time Editing)
    const handleUpdate = (updates: Record<string, unknown>) => {
      if (iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          {
            type: 'updateElement',
            payload: updates
          },
          '*'
        );
      }
    }; // [12]

    // 4. Expose getCode Method to Parent (Cleaning the code before download/save)
    useImperativeHandle(ref, () => ({
      getCode: () => {
        const doc = iframeRef.current?.contentDocument;
        if (!doc) return undefined;

        // Cleanup: Remove the visual outlines and classes added for editing
        const elements = doc.querySelectorAll('.AI_Selected_Element'); // [13]
        elements.forEach((el) => {
          el.classList.remove('AI_Selected_Element');
          el.removeAttribute('data-ai-selected');
          (el as HTMLElement).style.outline = '';
        });

        // Cleanup: Remove the injected script tag
        const previewScript = doc.getElementById('ai-preview-script'); // [14]
        if (previewScript) previewScript.remove();
        
        // Cleanup: Remove injected styles if any
        const previewStyle = doc.getElementById('ai-preview-style');
        if (previewStyle) previewStyle.remove();

        return doc.documentElement.outerHTML; // [15]
      }
    }));

    return (
      <div className="flex-1 flex flex-col h-full bg-gray-900 relative"> {/* [5] */}
        
        <div className="flex-1 overflow-hidden bg-gray-900 flex items-center justify-center p-8">
           <div 
             className="transition-all duration-300 bg-white h-full shadow-2xl overflow-hidden rounded-lg"
             style={{ width: resolutions[device] }} // [8]
           >
              {project?.currentCode ? (
                <iframe
                  ref={iframeRef}
                  title="Website Preview"
                  srcDoc={injectPreview(project.currentCode)} // [2]
                  className="w-full h-full border-none"
                  sandbox="allow-scripts allow-same-origin allow-forms" // [16]
                />
              ) : isGenerating ? (
                 <LoaderSteps /> // [3]
              ) : (
                <div className="flex items-center justify-center h-full text-gray-400">
                   Generating your website...
                </div>
              )}
           </div>
        </div>

        {/* Editor Panel Overlay */}
        {showEditorPanel && selectedElement && (
          <EditorPanel 
            selectedElement={selectedElement}
            onUpdate={handleUpdate} // [12]
            onClose={() => {
              setSelectedElement(null);
              // Send message to iframe to clear visual selection
              if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.postMessage(
                  { type: 'clearSelectionRequest' }, 
                  '*'
                ); // [12]
              }
            }}
          /> // [7]
        )}
      </div>
    );
  }
);

export default ProjectPreview;

