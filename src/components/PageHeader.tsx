import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  action?: React.ReactNode;
  backTo?: string; // optional explicit path, otherwise goes back
}

export default function PageHeader({ title, action, backTo }: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backTo) {
      navigate(backTo);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={handleBack}
          className="p-2 hover:bg-accent rounded-xl transition-colors shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft size={22} className="text-primary" />
        </button>
        <h2 className="text-2xl font-serif text-primary truncate">{title}</h2>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
