import type { ComponentType } from 'react';
import { Loader2 } from 'lucide-react';

const Loading: ComponentType = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-950">
      <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
    </div>
  );
};

export default Loading;
