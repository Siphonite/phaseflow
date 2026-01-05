
import React, { useState, useEffect, useMemo } from 'react';
import { Project, ViewState } from './types';
import { ProjectCard } from './components/ProjectCard';
import { PhaseAccordion } from './components/PhaseAccordion';
import { architectProject } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const App: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('phaseflow_projects');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [isArchitecting, setIsArchitecting] = useState(false);
  const [prompt, setPrompt] = useState('');

  // Persist projects to local storage
  useEffect(() => {
    localStorage.setItem('phaseflow_projects', JSON.stringify(projects));
  }, [projects]);

  const activeProject = useMemo(() => 
    projects.find(p => p.id === activeProjectId), 
    [projects, activeProjectId]
  );

  const handleCreateProject = async () => {
    if (!prompt.trim()) return;
    setIsArchitecting(true);
    try {
      const result = await architectProject(prompt);
      const newProject: Project = {
        id: `proj-${Date.now()}`,
        title: result.title || 'Untitled Project',
        description: result.description || '',
        phases: result.phases || [],
        createdAt: Date.now()
      };
      setProjects([newProject, ...projects]);
      setActiveProjectId(newProject.id);
      setCurrentView('project-detail');
      setPrompt('');
    } catch (err) {
      alert("Failed to create project. Please try again.");
    } finally {
      setIsArchitecting(false);
    }
  };

  const toggleStep = (phaseId: string, stepId: string) => {
    if (!activeProjectId) return;
    setProjects(prev => prev.map(proj => {
      if (proj.id !== activeProjectId) return proj;
      return {
        ...proj,
        phases: proj.phases.map(phase => {
          if (phase.id !== phaseId) return phase;
          return {
            ...phase,
            steps: phase.steps.map(step => 
              step.id === stepId ? { ...step, completed: !step.completed } : step
            )
          };
        })
      };
    }));
  };

  const deleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this project?")) {
      setProjects(prev => prev.filter(p => p.id !== id));
      if (activeProjectId === id) {
        setActiveProjectId(null);
        setCurrentView('dashboard');
      }
    }
  };

  const chartData = useMemo(() => {
    if (!activeProject) return [];
    return activeProject.phases.map(p => {
      const total = p.steps.length;
      const completed = p.steps.filter(s => s.completed).length;
      return {
        name: p.title,
        completion: total > 0 ? Math.round((completed / total) * 100) : 0
      };
    });
  }, [activeProject]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 w-full glass-effect border-b border-slate-200 h-16 flex items-center px-4 md:px-8">
        <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => setCurrentView('dashboard')}
          >
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
              <i className="fa-solid fa-cube text-lg"></i>
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">PhaseFlow <span className="text-blue-600">AI</span></h1>
          </div>
          
          <button 
            onClick={() => setCurrentView('ai-wizard')}
            className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 shadow-md shadow-slate-200 active:scale-95"
          >
            <i className="fa-solid fa-wand-magic-sparkles"></i>
            <span className="hidden sm:inline">New Project</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        
        {/* Dashboard View */}
        {currentView === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Your Projects</h2>
                <p className="text-slate-500 mt-1">Manage and track your complex multi-phase workflows.</p>
              </div>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-500">
                  {projects.length} Total Projects
                </span>
              </div>
            </div>

            {projects.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center max-w-2xl mx-auto mt-12">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300 text-3xl">
                  <i className="fa-solid fa-folder-open"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800">No projects yet</h3>
                <p className="text-slate-500 mt-2 mb-8">Use our AI Project Architect to generate a detailed roadmap for your next big idea.</p>
                <button 
                  onClick={() => setCurrentView('ai-wizard')}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-100"
                >
                  Get Started with AI
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map(project => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onClick={() => {
                      setActiveProjectId(project.id);
                      setCurrentView('project-detail');
                    }}
                    onDelete={(e) => deleteProject(project.id, e)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* AI Wizard View */}
        {currentView === 'ai-wizard' && (
          <div className="max-w-2xl mx-auto animate-fadeIn">
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 mb-4">
                <i className="fa-solid fa-wand-magic-sparkles text-3xl"></i>
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Project Architect</h2>
              <p className="text-slate-500 mt-2">Describe your project and let AI build the phases and steps for you.</p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">What are you building?</label>
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g., 'Build a high-converting landing page for a SaaS' or 'Design a backyard garden with a focus on sustainability'..."
                  className="w-full h-40 p-4 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-lg resize-none"
                  disabled={isArchitecting}
                />
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="flex-1 py-4 px-6 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all"
                  disabled={isArchitecting}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateProject}
                  disabled={isArchitecting || !prompt.trim()}
                  className="flex-[2] py-4 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isArchitecting ? (
                    <>
                      <i className="fa-solid fa-spinner animate-spin"></i>
                      Architecting...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-sparkles"></i>
                      Build Project Plan
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="mt-8 bg-blue-50 border border-blue-100 rounded-2xl p-6">
              <h4 className="font-bold text-blue-800 text-sm flex items-center gap-2 mb-2">
                <i className="fa-solid fa-lightbulb"></i>
                Pro Tip
              </h4>
              <p className="text-blue-700 text-sm leading-relaxed">
                The more specific you are, the better the phases will be. Include desired outcome, constraints, or specific tools you want to use.
              </p>
            </div>
          </div>
        )}

        {/* Project Detail View */}
        {currentView === 'project-detail' && activeProject && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column: Tasks */}
              <div className="flex-1 lg:max-w-2xl space-y-6">
                <button 
                  onClick={() => setCurrentView('dashboard')}
                  className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
                >
                  <i className="fa-solid fa-arrow-left"></i>
                  Back to Dashboard
                </button>

                <div>
                  <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">{activeProject.title}</h2>
                  <p className="text-slate-500 mt-2">{activeProject.description}</p>
                </div>

                <div className="mt-8">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Project Phases</h3>
                  <div className="space-y-2">
                    {activeProject.phases.map(phase => (
                      <PhaseAccordion 
                        key={phase.id} 
                        phase={phase} 
                        onToggleStep={toggleStep}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Analytics & Progress */}
              <div className="lg:w-96 space-y-6">
                <div className="sticky top-24 space-y-6">
                  {/* Progress Stats */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-6">Execution Insights</h3>
                    
                    <div className="space-y-6">
                      <div className="flex flex-col items-center">
                        <div className="relative w-32 h-32 flex items-center justify-center">
                           <svg className="w-full h-full transform -rotate-90">
                            <circle
                              cx="64"
                              cy="64"
                              r="58"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              className="text-slate-100"
                            />
                            <circle
                              cx="64"
                              cy="64"
                              r="58"
                              stroke="currentColor"
                              strokeWidth="8"
                              fill="transparent"
                              strokeDasharray={364}
                              strokeDashoffset={364 - (364 * (activeProject.phases.reduce((acc, p) => acc + p.steps.filter(s => s.completed).length, 0) / activeProject.phases.reduce((acc, p) => acc + p.steps.length, 0)) || 0)}
                              className="text-blue-600 transition-all duration-1000 ease-out"
                              strokeLinecap="round"
                            />
                          </svg>
                          <div className="absolute flex flex-col items-center">
                            <span className="text-2xl font-black text-slate-800">
                              {Math.round((activeProject.phases.reduce((acc, p) => acc + p.steps.filter(s => s.completed).length, 0) / activeProject.phases.reduce((acc, p) => acc + p.steps.length, 0)) * 100) || 0}%
                            </span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Done</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-2xl">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Steps</span>
                          <span className="text-xl font-bold text-slate-800">
                            {activeProject.phases.reduce((acc, p) => acc + p.steps.filter(s => s.completed).length, 0)}<span className="text-slate-300 font-medium">/{activeProject.phases.reduce((acc, p) => acc + p.steps.length, 0)}</span>
                          </span>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl">
                          <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">Phases</span>
                          <span className="text-xl font-bold text-slate-800">
                            {activeProject.phases.filter(p => p.steps.every(s => s.completed) && p.steps.length > 0).length}<span className="text-slate-300 font-medium">/{activeProject.phases.length}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Phase Chart */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
                    <h3 className="font-bold text-slate-800 mb-4">Phase Completion</h3>
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                          <XAxis type="number" hide domain={[0, 100]} />
                          <YAxis 
                            dataKey="name" 
                            type="category" 
                            width={80} 
                            fontSize={10} 
                            fontWeight={600}
                            tick={{ fill: '#64748b' }}
                            axisLine={false}
                            tickLine={false}
                          />
                          <Tooltip 
                            cursor={{ fill: '#f8fafc' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                          />
                          <Bar dataKey="completion" radius={[0, 4, 4, 0]} barSize={20}>
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.completion === 100 ? '#22c55e' : '#3b82f6'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-200 text-center">
        <p className="text-slate-400 text-sm">
          &copy; {new Date().getFullYear()} PhaseFlow AI • Modern Task Management
        </p>
      </footer>
    </div>
  );
};

export default App;
