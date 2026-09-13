import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ProjectSettings {
  duration: 15 | 30 | 60;
  aspectRatio: '9:16' | '16:9' | '1:1';
  style: 'luxury' | 'cinematic' | 'minimal' | 'viral' | 'studio' | 'nature' | 'technology';
  voiceStyle: 'professional' | 'casual' | 'enthusiastic';
  includeMusic: boolean;
}

interface Scene {
  id: string;
  type: string;
  description: string;
  duration: number;
  videoUrl?: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
}

interface Project {
  id: string;
  productImageUrl: string;
  productAnalysis?: any;
  scenes: Scene[];
  settings: ProjectSettings;
  videoUrl?: string;
  status: 'analyzing' | 'scripting' | 'generating' | 'rendering' | 'completed' | 'failed';
  createdAt: Date;
}

interface ProjectStore {
  projects: Project[];
  currentProjectId: string | null;
  
  // Project actions
  createProject: (imageUrl: string) => string;
  setCurrentProject: (id: string) => void;
  updateProjectSettings: (id: string, settings: Partial<ProjectSettings>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Scene actions
  addScenes: (projectId: string, scenes: Scene[]) => void;
  updateScene: (projectId: string, sceneId: string, updates: Partial<Scene>) => void;
  removeScene: (projectId: string, sceneId: string) => void;
  
  // Getters
  getCurrentProject: () => Project | undefined;
  getProjectById: (id: string) => Project | undefined;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],
      currentProjectId: null,
      
      createProject: (imageUrl: string) => {
        const id = `project_${Date.now()}`;
        const newProject: Project = {
          id,
          productImageUrl: imageUrl,
          scenes: [],
          settings: {
            duration: 30,
            aspectRatio: '9:16',
            style: 'cinematic',
            voiceStyle: 'professional',
            includeMusic: true,
          },
          status: 'analyzing',
          createdAt: new Date(),
        };
        
        set((state) => ({
          projects: [...state.projects, newProject],
          currentProjectId: id,
        }));
        
        return id;
      },
      
      setCurrentProject: (id: string) => {
        set({ currentProjectId: id });
      },
      
      updateProjectSettings: (id: string, settings: Partial<ProjectSettings>) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, settings: { ...p.settings, ...settings } } : p
          ),
        }));
      },
      
      updateProject: (id: string, updates: Partial<Project>) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        }));
      },
      
      deleteProject: (id: string) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProjectId: state.currentProjectId === id ? null : state.currentProjectId,
        }));
      },
      
      addScenes: (projectId: string, scenes: Scene[]) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, scenes } : p
          ),
        }));
      },
      
      updateScene: (projectId: string, sceneId: string, updates: Partial<Scene>) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  scenes: p.scenes.map((s) =>
                    s.id === sceneId ? { ...s, ...updates } : s
                  ),
                }
              : p
          ),
        }));
      },
      
      removeScene: (projectId: string, sceneId: string) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, scenes: p.scenes.filter((s) => s.id !== sceneId) }
              : p
          ),
        }));
      },
      
      getCurrentProject: () => {
        const { projects, currentProjectId } = get();
        return projects.find((p) => p.id === currentProjectId);
      },
      
      getProjectById: (id: string) => {
        const { projects } = get();
        return projects.find((p) => p.id === id);
      },
    }),
    {
      name: 'onepic-projects',
    }
  )
);
