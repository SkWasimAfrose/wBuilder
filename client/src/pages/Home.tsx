import React from 'react'
import { Loader2Icon } from 'lucide-react'
import { useNavigate } from 'react-router-dom';
import { useUser } from '../context/UserContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
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
    setLoading(true);
    
    try {
      const initialCode = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${input}</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen flex items-center justify-center">
    <div class="p-8 bg-white rounded-lg shadow-xl">
        <h1 class="text-3xl font-bold text-gray-800 mb-4">Hello World</h1>
        <p class="text-gray-600">This is a starter template for: ${input}</p>
    </div>
</body>
</html>`;

      const docRef = await addDoc(collection(db, "projects"), {
        userId: user.uid,
        name: input.split(' ').slice(0, 4).join(' ') || "Untitled Project",
        initialPrompt: input,
        currentCode: initialCode,
        isPublished: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        versions: [],
        conversation: []
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
