import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react'; // [3]
import { toast } from 'sonner'; // [1]
import { doc, getDoc } from 'firebase/firestore';
// @ts-ignore
import { db } from '../firebase';
import ProjectPreview from '../components/ProjectPreview'; // [3]
import type { Project } from '../types'; // [4]

const View = () => {
  const { projectId } = useParams(); // [5]
  const [code, setCode] = useState(''); // [5]
  const [loading, setLoading] = useState(true); // [5]

  useEffect(() => {
    const fetchCode = async () => {
      try {
        if (!projectId) return;
        const docRef = doc(db, "projects", projectId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            if (data.isPublished) {
                setCode(data.currentCode);
            } else {
                toast.error("Project is not published");
            }
        } else {
            toast.error("Project not found");
        }
        setLoading(false);
      } catch (error) {
        setLoading(false);
        if (error instanceof Error) {
             toast.error(error.message);
        } else {
             toast.error("Failed to load project");
        }
        console.log(error);
      }
    };

    fetchCode();
  }, [projectId]); // [3]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <Loader2 className="size-8 text-indigo-500 animate-spin" /> {/* [3] */}
      </div>
    );
  }

  return (
    <div className="h-screen overflow-hidden">
       {/* Convert code string to partial Project type for compatibility */}
       {code && (
         <ProjectPreview
           project={{ currentCode: code } as Project} // [4]
           isGenerating={false} // [4]
           showEditorPanel={false} // [4]
         />
       )}
    </div>
  );
};

export default View;
