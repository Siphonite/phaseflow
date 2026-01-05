
import React, { useState } from 'react';
import { Phase, Step } from '../types';

interface PhaseAccordionProps {
  phase: Phase;
  onToggleStep: (phaseId: string, stepId: string) => void;
}

export const PhaseAccordion: React.FC<PhaseAccordionProps> = ({ phase, onToggleStep }) => {
  const [isOpen, setIsOpen] = useState(true);
  
  const completedSteps = phase.steps.filter(s => s.completed).length;
  const progress = phase.steps.length > 0 ? (completedSteps / phase.steps.length) * 100 : 0;
  const isAllComplete = phase.steps.length > 0 && completedSteps === phase.steps.length;

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden mb-4 shadow-sm">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-4 flex-1">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors ${
            isAllComplete ? 'bg-green-100 border-green-500 text-green-600' : 'bg-slate-50 border-slate-200 text-slate-400'
          }`}>
            {isAllComplete ? (
              <i className="fa-solid fa-check text-sm"></i>
            ) : (
              <span className="text-xs font-bold">{completedSteps}</span>
            )}
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-slate-800">{phase.title}</h4>
            <div className="flex items-center gap-3 mt-1">
               <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 ${isAllComplete ? 'bg-green-500' : 'bg-blue-500'}`}
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap uppercase tracking-tighter">
                {completedSteps} / {phase.steps.length} steps
              </span>
            </div>
          </div>
        </div>
        <i className={`fa-solid fa-chevron-down transition-transform duration-300 ml-4 text-slate-300 ${isOpen ? 'rotate-180' : ''}`}></i>
      </div>

      {isOpen && (
        <div className="p-4 pt-0 space-y-2 border-t border-slate-50 bg-slate-50/30">
          {phase.steps.map((step) => (
            <div 
              key={step.id}
              onClick={() => onToggleStep(phase.id, step.id)}
              className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-100 cursor-pointer hover:border-blue-300 hover:shadow-sm transition-all group"
            >
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                step.completed 
                  ? 'bg-blue-600 border-blue-600' 
                  : 'bg-white border-slate-200 group-hover:border-blue-400'
              }`}>
                {step.completed && <i className="fa-solid fa-check text-white text-[10px]"></i>}
              </div>
              <span className={`text-sm transition-colors ${
                step.completed ? 'text-slate-400 line-through' : 'text-slate-700'
              }`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
