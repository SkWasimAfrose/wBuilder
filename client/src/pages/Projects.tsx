import React, { useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import type { Project } from '../types'
import { Loader2Icon, MessagesSquareIcon, SmartphoneIcon, TabletIcon, XIcon, LaptopIcon, SaveIcon, FullscreenIcon, ArrowBigDownDashIcon, EyeOffIcon, EyeIcon } from 'lucide-react'
import Sidebar from '../components/Sidebar'
import ProjectPreview, { type ProjectPreviewRef } from '../components/ProjectPreview'
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
// @ts-ignore
import { db } from '../firebase'
import { toast } from 'sonner'
// import { useUser } from '../context/UserContext'

const Projects = () => {
  const {projectId} = useParams()
  const navigate = useNavigate()
  // const { user } = useUser()

  const [project, setProject] = React.useState<Project | null>(null)
  const [loading, setLoading] = React.useState(true)

  const [isGenerating, setIsGenerating] = React.useState(true)
  const [device, setDevice] = React.useState<'phone' | 'tablet' | 'desktop'>('desktop')

  const [ismenuOpen, setMenuOpen] = React.useState(false)
  const [isSaving, _setIsSaving] = React.useState(false)

  const previewRef = useRef<ProjectPreviewRef>(null)

  const fetchProject = async () => {
    if (!projectId) return;
    try {
      const docRef = doc(db, "projects", projectId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        const fetchedProject = {
            id: docSnap.id,
            ...data,
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : new Date().toISOString(),
            updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : new Date().toISOString(),
        } as Project;

        setProject(fetchedProject);
        setLoading(false)
        setIsGenerating(fetchedProject.currentCode ? false : true)
      } else {
        toast.error("Project not found")
        navigate('/projects')
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load project")
      setLoading(false)
    }
  }

  const saveProject = async () => {
    if (!project || !projectId) return;
    _setIsSaving(true);
    try {
        await updateDoc(doc(db, "projects", projectId), {
            // Note: In a real app we'd capture the code from the editor/previewRef
            // For now assuming project.currentCode is kept in sync or we just update existing fields
            // The Ref might supply the current code if we impl that.
            updatedAt: serverTimestamp()
        });
        toast.success("Project saved");
    } catch (error) {
        toast.error("Failed to save");
    } finally {
        _setIsSaving(false);
    }
  }

  const downloadCode = () => {
    // Implement download logic if needed
  }

  const togglePublish = async () => {
    if (!project || !projectId) return;
    try {
        const newStatus = !project.isPublished;
        await updateDoc(doc(db, "projects", projectId), {
            isPublished: newStatus,
            updatedAt: serverTimestamp()
        });
        setProject(prev => prev ? {...prev, isPublished: newStatus} : null);
        toast.success(newStatus ? "Project published" : "Project unpublished");
    } catch (error) {
        toast.error("Failed to update publish status");
    }
  }

  React.useEffect(() => {
    fetchProject()
  },[projectId])

  if (loading) {
    return <>
    <div className='flex items-center justify-center h-screen'> <Loader2Icon className='size-7 animate-spin text-violet-200' /></div>
    </>
  }


  return project ?(
    <div className='flex flex-col h-screen w-full bg-gray-900 text-white'>
        {/* Builder Navbar */}
      <div className='flex max-sm:flex-col sm:items-center gap-4 px-4 py-2 no-scrollbar'>
        {/* Left */}
        <div className='flex items-center gap-2 sm:min-w-90 text-nowrap'>
          <img src= "/favicon.svg" alt="logo" className='h-6 cursor-pointer' onClick={() => navigate("/")} />
          <div className='max-w-64 sm:max-w-xs'>
            <p className='text-sm text-medium capitalize truncate'>{project.name}</p>
            <p className='text-xs text-gray-400 -mt-0.5'>Previewing last save version</p>
          </div>
          <div className='sm:hidden flex-1 flex justify-end'>
            {ismenuOpen ? 
            <MessagesSquareIcon onClick={()=>setMenuOpen(false)} className='size-6 cursor-pointer'/> 
            : <XIcon onClick={()=>setMenuOpen(true)} className='size-6 cursor-pointer'/> }
          </div>
        </div>

        {/* Middle */}
        <div>
          <SmartphoneIcon onClick={()=>setDevice("phone")} className={'size-6 p-1 rounded cursor-pointer ${device === "phone" ? "bg-gray-700" : ""} '}/>
          <TabletIcon onClick={()=>setDevice("tablet")} className={'size-6 p-1 rounded cursor-pointer ${device === "tablet" ? "bg-gray-700" : ""} '}/>
          <LaptopIcon onClick={()=>setDevice("desktop")} className={'size-6 p-1 rounded cursor-pointer ${device === "desktop" ? "bg-gray-700" : ""} '}/>
        </div>

        {/* Right */}
        <div className='flex items-center justify-end gap-3 flex-1 text-xs sm:text-sm'>
          <button onClick={saveProject} disabled={isSaving} className='max-sm:hidden bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-1 flex items-center gap-2 rounded sm:rounded-sm transition-colors border border-gray-700'>
            {isSaving ? <Loader2Icon className='animate-spin' size={16}/> :
            <SaveIcon size={16} />}
            Save</button>
          <Link target="_blank" to={`/preview/${projectId}`} className="flex items-center gap-2 px-4 py-1 rounded sm: rounded-sm border border-gray-700 hover: border-gray-500 transition-colors">
            <FullscreenIcon size={16}/>Preview</Link>
          <button onClick={downloadCode} className='bg-linear-to-br from-blue-700 to-blue-600 hover: from-blue-600 hover: to-blue-500 text-white px-3.5 py-1 flex items-center gap-2 rounded sm: rounded-sm transition-colors'>
            <ArrowBigDownDashIcon size={16}/>Download</button>
          <button onClick={togglePublish} className='bg-linear-to-br from-indigo-700 to-indigo-600 hover:from-indigo-600 hover: to-indigo-500 text-white px-3.5 py-1 flex items-center gap-2 rounded sm: rounded-sm transition-colors'>
            {project.isPublished ? <EyeOffIcon size={16}/> : <EyeIcon size={16}/>}{project.isPublished ? "Unpublish" : "Publish"}</button>
        </div>
      </div>

      <div className='flex-1 flex overflow-auto'>
        {/* Sidebar */}
        <Sidebar isMenuOpen={ismenuOpen} project={project} setProject={(p)=>setProject(p)} isGenerating={isGenerating} setIsGenerating={setIsGenerating}/>
        {/* Project Preview */}
        <div className='flex-1 p-2 pl-0'>
          <ProjectPreview ref={previewRef} project={project} isGenerating={isGenerating} device={device} />
        </div>
      </div>

    </div>
  ) : (
    <div className='flex items-center justify-center h-screen'>
        <p className='text-2xl font-medium text-gray-200'>Unable to load project!</p>
    </div>
  )
}

export default Projects
