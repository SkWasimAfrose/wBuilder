import React, { useEffect, useRef, useState } from 'react';
import { Bot, Loader2, Send, User, Eye } from 'lucide-react'; // [1], [2], [3], [4]
import type { Project, Message, Version } from '../types'; // [5], [6]
import { Link } from 'react-router-dom'; // [3]
import { toast } from 'sonner'; // [7]
import API from '../config/api'; // [8]

interface SidebarProps {
  project: Project;
  setProject: (project: Project) => void;
  isGenerating: boolean;
  setIsGenerating: (isGenerating: boolean) => void;
  isMenuOpen: boolean;
}

const Sidebar = ({ project, setProject, isGenerating, setIsGenerating, isMenuOpen }: SidebarProps) => {
  const [input, setInput] = useState(''); // [9]
  const messageRef = useRef<HTMLDivElement>(null); // [10]

  // Auto-scroll to the bottom when messages/versions change [11]
  useEffect(() => {
    if (messageRef.current) {
      messageRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [project.conversation.length, isGenerating]);

  // Function to fetch project updates during polling [12]
  const fetchProject = async () => {
    try {
      const { data } = await API.get(`/api/user/project/${project.id}`);
      setProject(data.project);
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      console.log(error);
      toast.error("Failed to refresh project");
    }
  };

  // Handler for submitting a new revision prompt [8], [7]
  const handleRevision = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isGenerating) return;

    setIsGenerating(true);
    let interval: number | undefined;

    try {
      // Optimistic update or wait for polling
      const { data } = await API.post(`/api/project/revision/${project.id}`, {
        message: input
      });
      
      toast.success(data.message);
      setInput('');

      // Poll for updates every 10 seconds until the generation is complete
      interval = window.setInterval(fetchProject, 10000);

      // In a real scenario, you might want a condition to clear this interval based on backend status
      // For this demo context, we usually clear it when the component unmounts or manually
      
      // Note: The transcript simplifies this by just calling fetchProject in an interval.
      // Logic for clearing interval would typically depend on specific backend flags (e.g., isGenerating false).
      
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setIsGenerating(false);
      toast.error(error.response?.data?.message || "Something went wrong");
      if (interval) clearInterval(interval);
    }
  };

  // Handler to rollback to a previous version [13], [14]
  const handleRollback = async (versionId: string) => {
    const confirm = window.confirm("Are you sure you want to rollback to this version?");
    if (!confirm) return;

    setIsGenerating(true);
    try {
      const { data } = await API.get(`/api/project/rollback/${project.id}/${versionId}`);
      toast.success(data.message);
      
      // Refresh project data immediately after rollback
      const { data: projectData } = await API.get(`/api/user/project/${project.id}`);
      setProject(projectData.project);
      
      setIsGenerating(false);
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      setIsGenerating(false);
      toast.error(error.response?.data?.message || "Failed to rollback");
    }
  };

  // Sort messages and versions by timestamp to display them in order [15], [16]
  const sortedData = [...project.conversation, ...project.versions].sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  );

  return (
    <div className={`fixed left-0 top-16 bottom-0 border-r border-gray-800 bg-[#1a1a1a] transition-all duration-300 z-40 
      ${isMenuOpen ? 'w-full md:w-80' : 'w-0 md:w-80'} overflow-hidden flex flex-col`}> {/* [17], [18] */}

      {/* Message Container [15] */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 no-scrollbar">
        {sortedData.map((item) => {
          // Check if item is a Message
          const isMessage = 'content' in item; // [16]

          if (isMessage) {
            const msg = item as Message;
            const isUser = msg.role === 'user'; // [6]

            return (
              <div key={msg.id} className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}> {/* [6] */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 
                  ${isUser ? 'bg-indigo-600' : 'bg-gray-700'}`}> {/* [2] */}
                  {isUser ? <User className="size-5 text-white" /> : <Bot className="size-5 text-white" />}
                </div>
                
                <div className={`max-w-[80%] rounded-lg p-3 text-sm 
                  ${isUser ? 'bg-indigo-600/20 text-indigo-100 rounded-tr-none' : 'bg-gray-800 text-gray-100 rounded-tl-none'}`}> {/* [19], [2] */}
                  {msg.content}
                </div>
              </div>
            );
          } else {
            // It is a Version [20]
            const version = item as Version;
            return (
              <div key={version.id} className="flex flex-col items-center gap-2 my-4">
                <div className="bg-gray-800 rounded-full px-3 py-1 text-xs text-gray-400 border border-gray-700">
                   Code Updated <br/> 
                   <span className="text-[10px] text-gray-500">{new Date(version.timestamp).toLocaleString()}</span> {/* [21] */}
                </div>
                
                <div className="flex items-center gap-2">
                   {/* Check if this is the current active version [21] */}
                   {project.currentVersionId === version.id ? (
                      <button disabled className="px-3 py-1.5 bg-green-500/10 text-green-400 text-xs rounded-md border border-green-500/20 cursor-default">
                        Current Version
                      </button>
                   ) : (
                      <button 
                        onClick={() => handleRollback(version.id)} // [22]
                        className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs rounded-md border border-gray-700 transition-colors"
                      >
                        Rollback to this version
                      </button>
                   )}
                   
                   {/* Link to Preview that specific version [3], [23] */}
                   <Link 
                     to={`/preview/${project.id}/${version.id}`} 
                     target="_blank"
                     className="p-1.5 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-md border border-gray-700 transition-colors"
                   >
                     <Eye className="size-4" />
                   </Link>
                </div>
              </div>
            );
          }
        })}

        {/* Loading Indicator [23], [24] */}
        {isGenerating && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0 animate-pulse">
                <Bot className="size-5 text-white" />
             </div>
             <div className="bg-gray-800 rounded-lg rounded-tl-none p-4 space-y-2">
                <div className="flex gap-1">
                   <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                   <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                   <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                </div>
             </div>
          </div>
        )}
        <div ref={messageRef} /> {/* [10] */}
      </div>

      {/* Input Area [22], [9] */}
      <div className="p-4 bg-[#1a1a1a] border-t border-gray-800">
         <form onSubmit={handleRevision} className="relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe changes you want to make..."
              rows={3}
              disabled={isGenerating}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg p-3 pr-12 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-indigo-500 resize-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isGenerating} // [25]
              className="absolute right-3 bottom-3 p-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-700 rounded-md transition-colors text-white"
            >
              {isGenerating ? (
                <Loader2 className="size-4 animate-spin" /> // [4]
              ) : (
                <Send className="size-4" />
              )}
            </button>
         </form>
      </div>
    </div>
  );
};

export default Sidebar;
