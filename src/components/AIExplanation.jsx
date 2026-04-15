import React from 'react';
import { Sparkles } from 'lucide-react';

const AIExplanation = ({ text }) => {
  if (!text) return null;

  return (
    <div className="ai-explanation" style={{ marginTop: '8px' }}>
      <Sparkles className="ai-icon" size={16} />
      <span>{text}</span>
    </div>
  );
};

export default AIExplanation;
