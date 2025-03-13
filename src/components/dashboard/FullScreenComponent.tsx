
import React from "react";
import { XCircle } from "lucide-react";

interface FullScreenComponentProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title: string;
}

const FullScreenComponent = ({ 
  isOpen, 
  onClose, 
  children, 
  title 
}: FullScreenComponentProps) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-background p-4 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">{title}</h2>
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-muted"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </div>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
};

export default FullScreenComponent;
