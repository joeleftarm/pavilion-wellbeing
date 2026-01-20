"use client";
import React, { useState, useEffect } from 'react';
import { 
  Sprout, 
  CheckCircle2, 
  BrainCircuit, 
  BarChart3, 
  Moon, 
  Sun, 
  Droplets, 
  Dumbbell, 
  Dog, 
  Plus, 
  Trash2,
  Save,
  PenLine
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Constants & Config ---
const DEFAULT_TASKS = {
  morning: [
    { id: 'm1', text: 'Morning Meds', completed: false, icon: '💊' },
    { id: 'm2', text: 'Morning Self Care', completed: false, icon: '🪥' },
    { id: 'm3', text: 'Drink Water (Glass 1)', completed: false, icon: '💧' },
  ],
  day: [
    { id: 'd1', text: 'Walk the Dogs', completed: false, icon: '🐕' },
    { id: 'd2', text: 'Exercise / Movement', completed: false, icon: '💪' },
    { id: 'd3', text: 'Drink Water (Glass 2)', completed: false, icon: '💧' },
    { id: 'd4', text: 'Drink Water (Glass 3)', completed: false, icon: '💧' },
  ],
  evening: [
    { id: 'e1', text: 'Evening Meds', completed: false, icon: '💊' },
    { id: 'e2', text: 'Prepare for Tomorrow', completed: false, icon: '🎒' },
  ]
};

// --- Main Component ---
export default function App() {
  const [activeTab, setActiveTab] = useState('garden');
  
  // State
  const [tasks, setTasks] = useState(DEFAULT_TASKS);
  const [brainDump, setBrainDump] = useState([]);
  const [newDumpItem, setNewDumpItem] = useState('');
  const [reflection, setReflection] = useState({ mood: 5, energy: 5, focus: 5, notes: '' });
  const [history, setHistory] = useState([]); // Array of past days' data
  const [gardenLevel, setGardenLevel] = useState(0); // 0-100 progress

  // --- Effects ---

  // Load from LocalStorage on Mount
  useEffect(() => {
    const savedTasks = localStorage.getItem('wb_tasks');
    const savedDump = localStorage.getItem('wb_brainDump');
    const savedHistory = localStorage.getItem('wb_history');
    const lastSavedDate = localStorage.getItem('wb_lastDate');
    const today = new Date().toLocaleDateString();

    if (savedTasks) setTasks(JSON.parse(savedTasks));
    if (savedDump) setBrainDump(JSON.parse(savedDump));
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    // Reset tasks if it's a new day
    if (lastSavedDate !== today) {
      setTasks(DEFAULT_TASKS);
      localStorage.setItem('wb_lastDate', today);
    }
  }, []);

  // Calculate Garden Level (Progress) whenever tasks change
  useEffect(() => {
    const allTasks = [...tasks.morning, ...tasks.day, ...tasks.evening];
    const completedCount = allTasks.filter(t => t.completed).length;
    const totalCount = allTasks.length;
    const percentage = totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
    setGardenLevel(percentage);
    
    // Save to LocalStorage
    localStorage.setItem('wb_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('wb_brainDump', JSON.stringify(brainDump));
  }, [brainDump]);

  useEffect(() => {
    localStorage.setItem('wb_history', JSON.stringify(history));
  }, [history]);


  // --- Handlers ---

  const toggleTask = (section, id) => {
    setTasks(prev => ({
      ...prev,
      [section]: prev[section].map(t => 
        t.id === id ? { ...t, completed: !t.completed } : t
      )
    }));
  };

  const addBrainDump = (e) => {
    e.preventDefault();
    if (!newDumpItem.trim()) return;
    setBrainDump([...brainDump, { id: Date.now(), text: newDumpItem }]);
    setNewDumpItem('');
  };

  const removeBrainDump = (id) => {
    setBrainDump(brainDump.filter(item => item.id !== id));
  };

  const saveReflection = () => {
    const todayEntry = {
      date: new Date().toLocaleDateString(undefined, { weekday: 'short', day: 'numeric' }),
      ...reflection,
      gardenLevel // Save how well you did on tasks that day too
    };
    
    // Add to history (remove entry if already exists for today to allow updates)
    const newHistory = history.filter(h => h.date !== todayEntry.date);
    setHistory([...newHistory, todayEntry]);
    
    alert("Reflection saved! 🌱");
    // Reset reflection form slightly or keep it? Let's keep it visible.
  };

  // --- Sub-Components ---

  const TaskSection = ({ title, sectionKey, items, icon: Icon, color }) => (
    <div className={`mb-6 p-4 rounded-xl border-2 ${color} bg-white shadow-sm`}>
      <div className="flex items-center gap-2 mb-3">
        <Icon size={20} className="text-gray-700" />
        <h3 className="font-bold text-lg text-gray-800">{title}</h3>
      </div>
      <div className="space-y-3">
        {items.map(task => (
          <div 
            key={task.id}
            onClick={() => toggleTask(sectionKey, task.id)}
            className={`
              flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200
              ${task.completed ? 'bg-emerald-100 border-emerald-300' : 'bg-gray-50 hover:bg-gray-100 border-gray-200'}
              border-2
            `}
          >
            <div className={`
              w-6 h-6 rounded-md border-2 flex items-center justify-center
              ${task.completed ? 'bg-emerald-500 border-emerald-500' : 'border-gray-300'}
            `}>
              {task.completed && <CheckCircle2 size={16} className="text-white" />}
            </div>
            <span className={`flex-1 font-medium ${task.completed ? 'text-emerald-700 line-through' : 'text-gray-700'}`}>
              {task.icon} {task.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const GardenView = () => {
    // Determine plant stage based on completion
    let plantStage = "🌱"; 
    let message = "Let's get started!";
    if (gardenLevel > 20) { plantStage = "🌿"; message = "Growing nicely!"; }
    if (gardenLevel > 50) { plantStage = "🪴"; message = "Looking vibrant!"; }
    if (gardenLevel > 80) { plantStage = "🌳"; message = "Full bloom!"; }
    if (gardenLevel === 100) { plantStage = "🌺"; message = "Perfect harmony!"; }

    return (
      <div className="flex flex-col items-center justify-center h-full p-6 animate-in fade-in">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-emerald-800 mb-2">My Wellbeing Garden</h2>
          <p className="text-emerald-600 font-medium">Daily Growth: {gardenLevel}%</p>
        </div>
        
        <div className="relative w-64 h-64 bg-emerald-100 rounded-full flex items-center justify-center border-4 border-emerald-300 shadow-inner mb-8">
          <span className="text-9xl filter drop-shadow-lg transform transition-transform duration-500 hover:scale-110">
            {plantStage}
          </span>
          {/* Progress Ring Overlay could go here */}
        </div>
        
        <div className="p-4 bg-white rounded-xl shadow-md border-l-4 border-emerald-500 max-w-sm w-full">
          <p className="text-gray-700 text-center italic">"{message}"</p>
        </div>
      </div>
    );
  };

  const ReflectionView = () => (
    <div className="p-4 space-y-6 pb-24">
      <h2 className="text-2xl font-bold text-indigo-900 flex items-center gap-2">
        <Moon className="text-indigo-500" /> Evening Reflection
      </h2>

      {/* Sliders */}
      <div className="space-y-6 bg-white p-5 rounded-xl border-2 border-indigo-100 shadow-sm">
        {[
          { label: 'Mood', key: 'mood', min: '😞', max: '🤩', color: 'accent-pink-500' },
          { label: 'Energy', key: 'energy', min: '🔋', max: '⚡', color: 'accent-yellow-500' },
          { label: 'Focus', key: 'focus', min: '☁️', max: '🎯', color: 'accent-blue-500' }
        ].map(metric => (
          <div key={metric.key}>
            <div className="flex justify-between mb-2">
              <span className="font-bold text-gray-700">{metric.label}</span>
              <span className="text-indigo-600 font-mono font-bold">{reflection[metric.key]}/10</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl">{metric.min}</span>
              <input 
                type="range" 
                min="1" 
                max="10" 
                value={reflection[metric.key]} 
                onChange={(e) => setReflection({...reflection, [metric.key]: parseInt(e.target.value)})}
                className={`w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer ${metric.color}`}
              />
              <span className="text-xl">{metric.max}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Journal */}
      <div className="bg-white p-5 rounded-xl border-2 border-indigo-100 shadow-sm">
        <label className="block font-bold text-gray-700 mb-2 flex items-center gap-2">
          <PenLine size={18} /> Notes / Thoughts
        </label>
        <textarea 
          className="w-full h-32 p-3 border-2 border-indigo-100 rounded-lg focus:border-indigo-500 focus:ring-0 resize-none"
          placeholder="How was the wicket today? Any spin balls?"
          value={reflection.notes}
          onChange={(e) => setReflection({...reflection, notes: e.target.value})}
        />
      </div>

      <button 
        onClick={saveReflection}
        className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
      >
        <Save size={20} /> Save Day
      </button>
    </div>
  );

  const StatsView = () => {
    // Mock data if history is empty for preview purposes
    const displayData = history.length > 0 ? history : [
      { date: 'Mon', mood: 4, energy: 6, focus: 3 },
      { date: 'Tue', mood: 6, energy: 5, focus: 7 },
      { date: 'Wed', mood: 8, energy: 9, focus: 8 },
    ];

    return (
      <div className="p-4 h-full pb-24">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
          <BarChart3 className="text-purple-600" /> Analysis
        </h2>

        <div className="bg-white p-4 rounded-xl shadow-md border border-slate-200 h-64 mb-6">
          <h3 className="font-bold text-slate-500 mb-4 text-sm uppercase tracking-wide">Trends (Last 7 Days)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={displayData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="date" tick={{fontSize: 12}} />
              <YAxis domain={[0, 10]} hide />
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              />
              <Legend />
              <Line type="monotone" dataKey="mood" stroke="#ec4899" strokeWidth={3} dot={{r: 4}} />
              <Line type="monotone" dataKey="energy" stroke="#eab308" strokeWidth={3} dot={{r: 4}} />
              <Line type="monotone" dataKey="focus" stroke="#3b82f6" strokeWidth={3} dot={{r: 4}} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Correlations Card (Placeholder logic for now) */}
        <div className="bg-indigo-50 p-5 rounded-xl border border-indigo-100">
          <h3 className="font-bold text-indigo-900 mb-2">💡 Insight</h3>
          <p className="text-indigo-800 text-sm">
            {history.length < 3 
              ? "Keep tracking for a few days to see insights!" 
              : "Your mood seems to track closely with your energy levels. Prioritize sleep to keep the scoreboard ticking over."}
          </p>
        </div>
      </div>
    );
  };

  // --- Main Render ---
  return (
    <div className="bg-slate-50 min-h-screen font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* Dynamic Content Area */}
      <div className="h-screen overflow-y-auto pb-24 scrollbar-hide">
        {activeTab === 'garden' && <GardenView />}
        
        {activeTab === 'routines' && (
          <div className="p-4 space-y-4 pb-24">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Daily Plan</h2>
            <TaskSection 
              title="Morning Routine" 
              sectionKey="morning" 
              items={tasks.morning} 
              icon={Sun} 
              color="border-orange-200 bg-orange-50"
            />
            <TaskSection 
              title="Day Tasks" 
              sectionKey="day" 
              items={tasks.day} 
              icon={Droplets} 
              color="border-blue-200 bg-blue-50"
            />
            <TaskSection 
              title="Evening Wind-down" 
              sectionKey="evening" 
              items={tasks.evening} 
              icon={Moon} 
              color="border-indigo-200 bg-indigo-50"
            />
          </div>
        )}

        {activeTab === 'braindump' && (
          <div className="p-4 h-full pb-24">
             <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2 mb-6">
              <BrainCircuit className="text-pink-500" /> Brain Dump
            </h2>
            
            <form onSubmit={addBrainDump} className="mb-6 flex gap-2">
              <input
                type="text"
                value={newDumpItem}
                onChange={(e) => setNewDumpItem(e.target.value)}
                placeholder="Get it out of your head..."
                className="flex-1 p-3 rounded-xl border-2 border-pink-200 focus:border-pink-500 outline-none shadow-sm"
              />
              <button 
                type="submit"
                className="bg-pink-500 text-white p-3 rounded-xl font-bold hover:bg-pink-600 transition-colors"
              >
                <Plus />
              </button>
            </form>

            <div className="space-y-2">
              {brainDump.length === 0 && (
                <div className="text-center text-gray-400 mt-10 italic">Empty head, happy life? <br/>Add items to clear the noise.</div>
              )}
              {brainDump.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center group">
                  <span className="text-gray-700">{item.text}</span>
                  <button 
                    onClick={() => removeBrainDump(item.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'reflection' && <ReflectionView />}
        {activeTab === 'stats' && <StatsView />}
      </div>

      {/* Bottom Navigation Bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 flex justify-between items-center z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
        {[
          { id: 'garden', icon: Sprout, label: 'Garden', color: 'text-emerald-600' },
          { id: 'routines', icon: CheckCircle2, label: 'Tasks', color: 'text-blue-600' },
          { id: 'braindump', icon: BrainCircuit, label: 'Dump', color: 'text-pink-600' },
          { id: 'reflection', icon: Moon, label: 'Reflect', color: 'text-indigo-600' },
          { id: 'stats', icon: BarChart3, label: 'Data', color: 'text-purple-600' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${activeTab === tab.id ? 'bg-gray-100 scale-105' : 'hover:bg-gray-50'}`}
          >
            <tab.icon 
              size={24} 
              className={activeTab === tab.id ? tab.color : 'text-gray-400'} 
              strokeWidth={activeTab === tab.id ? 2.5 : 2}
            />
            <span className={`text-xs mt-1 font-medium ${activeTab === tab.id ? tab.color : 'text-gray-400'}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
