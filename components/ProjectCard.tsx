
import React from 'react';
import { Project } from '../types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick, onDelete }) => {
  const totalSteps = project.phases.reduce((acc, p) => acc + p.steps.length, 0);
  const completedSteps = project.phases.reduce(
    (acc, p) => acc + p.steps.filter(s => s.completed).length, 
    0
  );
  const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  return (
    <div 
      onClick={onClick}
      className="group relative bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer"
    >
      <button 
        onClick={onDelete}
        className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 transition-opacity"
      >
        <i className="fa-solid fa-trash-can"></i>
      </button>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
          <i className="fa-solid fa-diagram-project text-lg"></i>
        </div>
        <h3 className="font-bold text-slate-800 text-lg truncate pr-6">{project.title}</h3>
      </div>
      
      <p className="text-slate-500 text-sm line-clamp-2 mb-6 h-10">
        {project.description}
      </p>

      <div className="space-y-2">
        <div className="flex justify-between text-xs font-medium text-slate-400 uppercase tracking-wider">
          <span>Overall Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-50 flex justify-between items-center text-slate-400 text-xs">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-layer-group"></i>
          <span>{project.phases.length} Phases</span>
        </div>
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-list-check"></i>
          <span>{completedSteps}/{totalSteps} Steps</span>
        </div>
      </div>
    </div>
  );
};
