import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import API from '../config/api';
import ProjectPreview from '../components/ProjectPreview';
import type { Project, Version } from '../types';

const Preview = () => {
  const { projectId, versionId } = useParams(); 
  const [code, setCode] = useState(''); 
  const [loading, setLoading] = useState(true); 
  
  // Use session to ensure user is authorized to preview
  const { user, loading: authLoading } = useUser(); 

  useEffect(() => {
    const fetchCode = async () => {
      // Only fetch if user is logged in
      if (!user && !authLoading) return; 

      try {
        const { data } = await API.get(`/api/project/preview/${projectId}`); 
        
        // Check if we are viewing a specific version or the current project
        const project = data.project;
        let displayCode = project.currentCode; 

        if (versionId) {
           const version = project.versions.find((v: Version) => v.id === versionId); 
           if (version) {
             displayCode = version.code; 
           }
        }

        setCode(displayCode);
        setLoading(false); 
      } catch (error: any) { 
        setLoading(false);
        toast.error(error.message || "Failed to load preview"); 
        console.log(error);
      }
    };

    if (!authLoading) {
       fetchCode();
    }
  }, [projectId, versionId, user, authLoading]); 

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Loader2 className="size-8 text-indigo-500 animate-spin" /> 
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <ProjectPreview
        project={{ currentCode: code } as Project} 
        isGenerating={false}
        showEditorPanel={false} 
      />
    </div>
  );
};

export default Preview;
