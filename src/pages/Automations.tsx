import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { 
  Zap, 
  Play, 
  Settings, 
  CheckCircle,
  ToggleLeft,
  ToggleRight,
  Clock,
  User,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const Automations: React.FC = () => {
  const { workflowRules, updateWorkflowRule } = useStore();
  const { success } = useToast();

  const handleToggle = async (ruleId: string) => {
    const rule = workflowRules.find(r => r.id === ruleId);
    if (!rule) return;
    
    const updated = {
      ...rule,
      isEnabled: !rule.isEnabled
    };
    await updateWorkflowRule(updated);
    success(
      updated.isEnabled ? 'Automation Activated' : 'Automation Suspended',
      `Workflow "${rule.name}" has been ${updated.isEnabled ? 'activated' : 'paused'}.`
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Panel */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-poppins font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Workflow Automations</span>
            <Cpu className="w-5 h-5 text-gold-400" />
          </h2>
          <p className="text-xs text-neutral-400">Streamline operational steps. Configure triggers to auto-generate alerts, logs, and purchase drafts.</p>
        </div>
      </div>

      {/* Automations Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {workflowRules.map((rule) => (
          <div 
            key={rule.id} 
            className={`glass-panel p-5 flex flex-col justify-between h-56 transition-all border ${
              rule.isEnabled ? 'border-gold-400/20' : 'border-neutral-200/50 dark:border-neutral-800/40 opacity-70'
            }`}
          >
            <div>
              <div className="flex justify-between items-start">
                <h3 className="font-poppins font-bold text-sm text-neutral-900 dark:text-white">{rule.name}</h3>
                
                <button 
                  onClick={() => handleToggle(rule.id)}
                  className="focus:outline-none"
                >
                  {rule.isEnabled ? (
                    <ToggleRight className="w-8 h-8 text-gold-400" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-neutral-500" />
                  )}
                </button>
              </div>

              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">{rule.description}</p>
            </div>

            <div className="border-t border-neutral-100 dark:border-neutral-800/80 pt-3 flex justify-between items-center text-[10px] text-neutral-500">
              <div className="flex gap-4">
                <span className="flex items-center gap-1 font-mono">
                  <Play className="w-3 h-3 text-neutral-400" />
                  <span>Triggers: {rule.triggerCount}</span>
                </span>
                {rule.lastTriggered && (
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-neutral-400" />
                    <span>Last run: {rule.lastTriggered}</span>
                  </span>
                )}
              </div>

              <span className="bg-neutral-100 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 text-neutral-600 dark:text-neutral-400 px-2 py-0.5 rounded font-mono text-[9px]">
                {rule.trigger}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
