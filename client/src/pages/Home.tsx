import React from 'react'
import { Loader2Icon } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { addDoc, collection, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
// @ts-ignore
import { db } from '../firebase';
import { toast } from 'sonner';

export const Home = () => {
  const [input, setInput] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  const onSubmitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to create a project");
      navigate('/auth');
      return;
    }

    // Step 1: Credit Check
    if ((user.credits || 0) < 5) {
      toast.error("Insufficient credits. You need 5 credits to generate a website.");
      return;
    }

    setLoading(true);
    let generatedCode = "";
    
    try {
      // Step 2: AI Generation (Edge Function)
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: input }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate code");
      }

      if (!response.body) {
        throw new Error("No response body");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        generatedCode += chunk;
      }

      // Step 3: Save & Deduct (Post-Generation)
      // Save Project
      const docRef = await addDoc(collection(db, "projects"), {
        userId: user.uid,
        name: input.split(' ').slice(0, 4).join(' ') || "Untitled Project",
        prompt: input, // Spec calls it 'prompt'
        code: generatedCode,
        isPublished: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        versions: [],
        conversation: []
      });

      // Deduct Credits
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        credits: increment(-5)
      });

      navigate(`/projects/${docRef.id}`);
    } catch (error: any) {
      console.error(error);
      toast.error("Failed to create project");
    } finally {
      setLoading(false);
    }
  }

  return (
      <section className="flex flex-col items-center text-white text-sm pb-20 px-4 font-poppins">
    
        <a href="https://prebuiltui.com" className="flex items-center gap-2 border border-slate-700 rounded-full p-1 pr-3 text-sm mt-20">
          <span className="bg-indigo-600 text-xs px-3 py-1 rounded-full">NEW</span>
          <p className="flex items-center gap-2">
            <span>Try 30 days free trial option</span>
            <svg className="mt-px" width="6" height="9" viewBox="0 0 6 9" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="m1 1 4 3.5L1 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </p>
        </a>

        <h1 className="text-center text-[40px] leading-[48px] md:text-6xl md:leading-[70px] mt-4 font-semibold max-w-3xl">
          Turn thoughts into websites instantly, with AI.
        </h1>

        <p className="text-center text-base max-w-md mt-2">
          Create, customize and publish websites faster than ever with intelligent design powered by AI.
        </p>

        <form onSubmit={onSubmitHandler} className="bg-white/10 max-w-2xl w-full rounded-xl p-4 mt-10 border border-indigo-600/70 focus-within:ring-2 ring-indigo-500 transition-all">
          <textarea onChange={e => setInput(e.target.value)} className="bg-transparent outline-none text-gray-300 resize-none w-full" rows={4} placeholder="Describe your presentation in details" required />
          <button className="ml-auto flex items-center gap-2 bg-gradient-to-r from-[#CB52D4] to-indigo-600 rounded-md px-4 py-2" disabled={loading}>
            {!loading ? 'Create with AI' : (
              <>
              Creating... <Loader2Icon className="animate-spin size-4 text-white" />
              </>
            ) 
            }
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-16 md:gap-20 mx-auto mt-16">
          <img className="max-w-28 md:max-w-32" src="https://saasly.prebuiltui.com/assets/companies-logo/framer.svg" alt="" />
          <img className="max-w-28 md:max-w-32" src="https://saasly.prebuiltui.com/assets/companies-logo/huawei.svg" alt="" />
          <img className="max-w-28 md:max-w-32" src="https://saasly.prebuiltui.com/assets/companies-logo/instagram.svg" alt="" />
          <img className="max-w-28 md:max-w-32" src="https://saasly.prebuiltui.com/assets/companies-logo/microsoft.svg" alt="" />
          <img className="max-w-28 md:max-w-32" src="https://saasly.prebuiltui.com/assets/companies-logo/walmart.svg" alt="" />
        </div>
      </section>
  )
}

export default Home
