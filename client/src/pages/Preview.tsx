import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useSession } from '../lib/auth-client';
import { toast } from 'sonner';
import API from '../config/api';
import ProjectPreview from '../components/ProjectPreview';
import type { Project, Version } from '../types';

const Preview = () => {
  const { projectId, versionId } = useParams(); // [4]
  const [code, setCode] = useState(''); // [4]
  const [loading, setLoading] = useState(true); // [4]
  
  // Use session to ensure user is authorized to preview
  const { data: session, isPending } = useSession(); // [9]

  useEffect(() => {
    const fetchCode = async () => {
      // Only fetch if user is logged in
      if (!session?.user && !isPending) return; // [10]

      try {
        const { data } = await API.get(`/api/project/preview/${projectId}`); // [6]
        
        // Check if we are viewing a specific version or the current project
        const project = data.project;
        let displayCode = project.currentCode; // [7]

        if (versionId) {
           const version = project.versions.find((v: Version) => v.id === versionId); // [7]
           if (version) {
             displayCode = version.code; // [7]
           }
        }

        setCode(displayCode);
        setLoading(false); // [7]
      } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
        setLoading(false);
        toast.error(error.message || "Failed to load preview"); // [9]
        console.log(error);
      }
    };

    if (!isPending) {
       fetchCode();
    }
  }, [projectId, versionId, session, isPending]); // [10]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Loader2 className="size-8 text-indigo-500 animate-spin" /> {/* [8] */}
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
      <ProjectPreview
        project={{ currentCode: code } as Project} // [8]
        isGenerating={false}
        showEditorPanel={false} // [8]
      />
    </div>
  );
};

export default Preview;
