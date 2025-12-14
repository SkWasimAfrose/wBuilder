
import { Route, Routes, useLocation } from 'react-router-dom'; // [1], [2], [3]
import { Toaster } from 'sonner'; // [4]

// Component Imports
import Navbar from './components/Navbar'; // [5]

// Page Imports
import Home from './pages/Home'; // [6]
import AuthPage from './pages/auth/AuthPage'; // [7], [8]
import Projects from './pages/Projects'; // [9]
import MyProjects from './pages/MyProjects'; // [9]
import Pricing from './pages/Pricing'; // [9]
import Community from './pages/Community'; // [9]
import View from './pages/View'; // [9]
import Preview from './pages/Preview'; // [9]
import Settings from './pages/account/Settings'; // [10], [11]
import Loading from './pages/Loading'; // [12]

const App = () => {
  const location = useLocation(); // [3]

  // Logic to hide the main Navbar on specific pages (Builder, View, Preview)
  // Source [3]: Checks if path starts with certain prefixes but excludes the main list page
  const hideNavbar = 
    (location.pathname.startsWith('/projects/') && location.pathname !== '/projects') ||
    location.pathname.startsWith('/view') ||
    location.pathname.startsWith('/preview');

  return (
    <>
      {/* Global Toast Notification Component */}
      <Toaster position="bottom-right" richColors /> {/* [4] */}
      
      {/* Conditionally Render Navbar */}
      {!hideNavbar && <Navbar />} {/* [13] */}

      <Routes> {/* [2] */}
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/community" element={<Community />} />
        
        {/* Authentication Routes */}
        <Route path="/auth/*" element={<AuthPage />} /> {/* [8] */}
        
        {/* User Account Routes */}
        <Route path="/account/settings" element={<Settings />} /> {/* [11] */}
        
        {/* Project Management */}
        <Route path="/projects" element={<MyProjects />} /> {/* [14] */}
        
        {/* The Main Builder Page (Hidden Navbar) */}
        <Route path="/projects/:projectId" element={<Projects />} /> {/* [14] */}
        
        {/* Public Project View (Hidden Navbar) */}
        <Route path="/view/:projectId" element={<View />} /> {/* [15] */}
        
        {/* Private Project Preview (Hidden Navbar) */}
        {/* Handles regular preview and specific version preview */}
        <Route path="/preview/:projectId/:versionId?" element={<Preview />} /> {/* [14] */}
        
        {/* Stripe Payment Success Loading Page */}
        <Route path="/loading" element={<Loading />} /> {/* [12] */}
      </Routes>
    </>
  );
};

export default App;
