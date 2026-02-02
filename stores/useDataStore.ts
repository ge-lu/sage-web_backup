
import { create } from 'zustand';
import { HistoryItem, TaskCard } from '../types';

interface DataState {
  historyItems: HistoryItem[];
  tasks: TaskCard[];

  // Actions
  setHistoryItems: (items: HistoryItem[]) => void;
  addHistoryItem: (item: HistoryItem) => void;
  deleteHistoryItem: (id: string) => void;
  toggleHistoryImportance: (id: string) => void;

  setTasks: (tasks: TaskCard[]) => void;
  updateTask: (taskId: string, updates: Partial<TaskCard>) => void;
}

export const useDataStore = create<DataState>((set) => ({
  historyItems: [
    { id: '1', title: 'Blocked suspicious call', subtitle: 'Potential spam risk', time: '10:15 AM', type: 'scam', status: 'blocked' },
    { id: '2', title: 'Ordered Milk', subtitle: 'Whole milk, 1 gallon from Kroger', time: '9:00 AM', type: 'order', status: 'completed' },
    { id: '3', title: 'Read prescription', subtitle: 'Identified "Lisinopril" 10mg', time: '8:30 AM', type: 'scan', status: 'completed' },
    { id: '6', title: 'Utility Bill (Electric)', subtitle: 'Due on Oct 28th', time: 'Yesterday', type: 'scan' },
  ],

  tasks: [
    {
      id: '1',
      type: 'SMART_MEDS',
      title: 'Morning Meds',
      subtitle: 'Check the bottle',
      detail: '1 Red Pill, 1 White Pill',
      time: '8:00 AM',
      completed: false,
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=200'
    },
    {
      id: '2',
      type: 'BILL_SAFE',
      title: 'Electric Bill',
      subtitle: 'Verified Safe',
      detail: '$45.20 due Oct 28',
      completed: false,
      verifiedBy: 'John'
    },
    {
      id: '3',
      type: 'BILL_RISK',
      title: 'Urgent IRS Notice',
      subtitle: 'Scam Alert!',
      detail: 'Do not pay. Discard.',
      completed: false,
    },
    {
      id: '4',
      type: 'ROUTINE',
      title: 'Hydration',
      subtitle: 'Drink Water',
      detail: 'Glass 1 of 3',
      completed: false,
    }
  ],

  setHistoryItems: (items) => set({ historyItems: items }),

  addHistoryItem: (item) => set((state) => ({
    historyItems: [item, ...state.historyItems]
  })),

  deleteHistoryItem: (id) => set((state) => ({
    historyItems: state.historyItems.filter(item => item.id !== id)
  })),

  toggleHistoryImportance: (id) => set((state) => ({
    historyItems: state.historyItems.map(item =>
      item.id === id ? { ...item, isImportant: !item.isImportant } : item
    )
  })),

  setTasks: (tasks) => set({ tasks }),

  updateTask: (taskId, updates) => set((state) => ({
    tasks: state.tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    )
  })),
}));
