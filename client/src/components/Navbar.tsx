import { useEffect, useState } from 'react';
import { assets } from '../assets/assets'; // [1]
import { Link, useNavigate } from 'react-router-dom'; // [2]
import { useSession, signOut } from '../lib/auth-client'; // [3]
import { Menu, X } from 'lucide-react'; // [4]
import API from '../config/api'; // [5]
import { toast } from 'sonner'; // [6]

const Navbar = () => {
  const navigate = useNavigate(); // [7]
  const [openMenu, setOpenMenu] = useState(false); // [1]
  const [credits, setCredits] = useState(0); // [6]
  
  // Get session data from Better Auth
  const { data: session } = useSession(); // [3]

  // Function to fetch user credits [5]
  const getCredits = async () => {
    try {
      const { data } = await API.get('/api/user/credits');
      setCredits(data.credits);
    } catch (error: any) {
      console.log(error);
      toast.error(error.message || "Failed to load credits"); // [6]
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Fetch credits whenever the user session is active [8]
  useEffect(() => {
    if (session?.user) {
      void getCredits();
    }
  }, [session]);

  return (
    <nav className="flex items-center justify-between py-3 px-6 md:px-12 lg:px-20 bg-black/20 backdrop-blur-md sticky top-0 z-50 border-b border-white/10"> {/* [9] */}
      
      {/* Logo Section */}
      <Link to="/" className="flex items-center gap-2"> {/* [2] */}
        <img 
          src={assets.logo} 
          alt="Logo" 
          className="w-8 h-8 md:w-10 md:h-10" // [2]
        />
        <span className="text-xl font-semibold text-white tracking-wide">AI Builder</span>
      </Link>

      {/* Desktop Menu Links [10] */}
      <div className="hidden md:flex items-center gap-8">
        <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">Home</Link>
        <Link to="/projects" className="text-gray-300 hover:text-white transition-colors text-sm">My Projects</Link>
        <Link to="/community" className="text-gray-300 hover:text-white transition-colors text-sm">Community</Link>
        <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors text-sm">Pricing</Link>
      </div>

      {/* Right Side Actions (Auth & Credits) */}
      <div className="hidden md:flex items-center gap-4">
        {session?.user ? (
          /* Logged In View [11] */
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-full px-4 py-1.5 text-xs text-gray-300 transition-all">
              Credits: 
              <span className="text-indigo-400 font-semibold text-sm">{credits}</span> {/* [11] */}
            </button>
            {/* User Profile Button [12] */}
            <div className="flex items-center gap-2">
                 {session.user.image && <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full" />}
                 <button onClick={handleSignOut} className="text-sm text-gray-300 hover:text-white">Sign Out</button>
            </div>
          </div>
        ) : (
          /* Logged Out View [7] */
          <button
            onClick={() => navigate('/auth')} // Navigates to auth/signin page
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors transform active:scale-95"
          >
            Get Started
          </button>
        )}
      </div>

      {/* Mobile Menu Toggle Button [13] */}
      <button 
        onClick={() => setOpenMenu(!openMenu)} 
        className="md:hidden p-2 text-gray-300 hover:text-white"
      >
        {openMenu ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {/* Mobile Menu Dropdown [14] */}
      {openMenu && (
        <div className="absolute top-full left-0 right-0 bg-[#1a1a1a] border-b border-gray-800 p-4 md:hidden flex flex-col gap-4 animate-fade-in">
          <Link 
            to="/" 
            onClick={() => setOpenMenu(false)}
            className="text-gray-300 hover:text-white py-2"
          >
            Home
          </Link>
          <Link 
            to="/projects" 
            onClick={() => setOpenMenu(false)}
            className="text-gray-300 hover:text-white py-2"
          >
            My Projects
          </Link>
          <Link 
            to="/community" 
            onClick={() => setOpenMenu(false)}
            className="text-gray-300 hover:text-white py-2"
          >
            Community
          </Link>
          <Link 
            to="/pricing" 
            onClick={() => setOpenMenu(false)}
            className="text-gray-300 hover:text-white py-2"
          >
            Pricing
          </Link>
          
          {/* Mobile Auth Actions */}
          <div className="pt-4 border-t border-gray-800">
            {session?.user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  Credits: <span className="text-indigo-400">{credits}</span>
                </div>
                <div className="flex items-center gap-2">
                     {session.user.image && <img src={session.user.image} alt="User" className="w-8 h-8 rounded-full" />}
                     <button onClick={handleSignOut} className="text-sm text-gray-300 hover:text-white">Sign Out</button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => {
                  navigate('/auth');
                  setOpenMenu(false);
                }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;

