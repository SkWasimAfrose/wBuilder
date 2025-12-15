import { useEffect, useState } from 'react';
import { assets } from '../assets/assets';
import { Link, useNavigate } from 'react-router-dom'; 
import { useUser } from '../context/UserContext';
import { Menu, X } from 'lucide-react'; 
import API from '../config/api'; 
// import { toast } from 'sonner'; 

const Navbar = () => {
  const navigate = useNavigate(); 
  const [openMenu, setOpenMenu] = useState(false); 
  const [credits, setCredits] = useState(0); 
  
  const { user, logout } = useUser();

  // Function to fetch user credits 
  const getCredits = async () => {
    try {
      // NOTE: This API call might need adjustment if it relies on cookies/headers that have changed.
      const { data } = await API.get('/api/user/credits');
      setCredits(data.credits);
    } catch (error: any) {
      console.log(error);
      // toast.error(error.message || "Failed to load credits");
    }
  };

  const handleSignOut = async () => {
    await logout();
    navigate('/');
  };

  // Fetch credits whenever the user session is active 
  useEffect(() => {
    if (user) {
      void getCredits();
    }
  }, [user]);

  return (
    <nav className="flex items-center justify-between py-3 px-6 md:px-12 lg:px-20 bg-black/20 backdrop-blur-md sticky top-0 z-50 border-b border-white/10"> 
      
      {/* Logo Section */}
      <Link to="/" className="flex items-center gap-2"> 
        <img 
          src={assets.logo} 
          alt="Logo" 
          className="w-8 h-8 md:w-10 md:h-10" 
        />
        <span className="text-xl font-semibold text-white tracking-wide">AI Builder</span>
      </Link>

      {/* Desktop Menu Links */}
      <div className="hidden md:flex items-center gap-8">
        <Link to="/" className="text-gray-300 hover:text-white transition-colors text-sm">Home</Link>
        <Link to="/projects" className="text-gray-300 hover:text-white transition-colors text-sm">My Projects</Link>
        <Link to="/community" className="text-gray-300 hover:text-white transition-colors text-sm">Community</Link>
        <Link to="/pricing" className="text-gray-300 hover:text-white transition-colors text-sm">Pricing</Link>
      </div>

      {/* Right Side Actions (Auth & Credits) */}
      <div className="hidden md:flex items-center gap-4">
        {user ? (
          /* Logged In View */
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 bg-gray-800/50 hover:bg-gray-800 border border-gray-700 rounded-full px-4 py-1.5 text-xs text-gray-300 transition-all">
              Credits: 
              <span className="text-indigo-400 font-semibold text-sm">{credits}</span> 
            </button>
            {/* User Profile Button */}
            <div className="flex items-center gap-2">
                 {user.photoURL && <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />}
                 <button onClick={handleSignOut} className="text-sm text-gray-300 hover:text-white">Sign Out</button>
            </div>
          </div>
        ) : (
          /* Logged Out View */
          <button
            onClick={() => navigate('/auth')} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-full text-sm font-medium transition-colors transform active:scale-95"
          >
            Get Started
          </button>
        )}
      </div>

      {/* Mobile Menu Toggle Button */}
      <button 
        onClick={() => setOpenMenu(!openMenu)} 
        className="md:hidden p-2 text-gray-300 hover:text-white"
      >
        {openMenu ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {/* Mobile Menu Dropdown */}
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
            {user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  Credits: <span className="text-indigo-400">{credits}</span>
                </div>
                <div className="flex items-center gap-2">
                     {user.photoURL && <img src={user.photoURL} alt="User" className="w-8 h-8 rounded-full" />}
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

