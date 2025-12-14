
import { useState, useEffect } from 'react';
import { ScanLine, Square, Triangle, Circle } from 'lucide-react'; // [1], [2]

const steps = [
  {
    icon: ScanLine,
    label: "Analyzing your request"
  },
  {
    icon: Square,
    label: "Generating layout structure"
  },
  {
    icon: Triangle,
    label: "Assembling UI components"
  },
  {
    icon: Circle,
    label: "Finalizing your website"
  }
]; // [1], [2]

const LoaderSteps = () => {
  const [current, setCurrent] = useState(0); // [3]
  const stepDuration = 2500; // [2] (Transcript says "45k", usually implies a duration constant around 2-4 seconds for UI steps)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % steps.length);
    }, stepDuration);

    return () => clearInterval(interval);
  }, []); // [3]

  const CurrentIcon = steps[current].icon; // [4]

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6"> {/* [5] */}
      
      {/* Icon Container with Bounce Animation */}
      <div className="relative flex items-center justify-center">
        <div className="w-20 h-20 bg-gray-800/50 rounded-full animate-ping absolute" /> {/* [5] */}
        <div className="relative z-10 bg-gray-900 p-6 rounded-full border border-gray-800 shadow-xl">
           <CurrentIcon className="w-10 h-10 text-indigo-400 animate-bounce" /> {/* [5], [4] */}
        </div>
      </div>

      {/* Text Steps with Fade Animation */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-medium text-white min-w-[280px]">
          {/* Using the key prop forces React to remount the element, triggering the animation */}
          <span key={current} className="animate-fade-in inline-block"> 
            {steps[current].label}... {/* [5] */}
          </span>
        </h3>
        <p className="text-gray-400 text-sm animate-pulse">
          This may take around 2 to 3 minutes {/* [5] */}
        </p>
      </div>
    </div>
  );
};

export default LoaderSteps;
