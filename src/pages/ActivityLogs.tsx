import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { 
  History, 
  Search, 
  User, 
  Database,
  ArrowRight,
  ShieldCheck,
  Terminal,
  Bookmark
} from 'lucide-react';

export const ActivityLogs: React.FC = () => {
  const { activityLogs } = useStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [entityFilter, setEntityFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');

  // Filtering logs
  const filteredLogs = useMemo(() => {
    return activityLogs.filter(log => {
      const matchesSearch = log.description.toLowerCase().includes(searchTerm.toLowerCase()) || log.performedBy.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEntity = entityFilter ? log.entity === entityFilter : true;
      const matchesAction = actionFilter ? log.action === actionFilter : true;
      return matchesSearch && matchesEntity && matchesAction;
    });
  }, [activityLogs, searchTerm, entityFilter, actionFilter]);

  const getLogColor = (action: string) => {
    if (action === 'CREATE') return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20';
    if (action === 'DELETE') return 'bg-rose-500/15 text-rose-400 border-rose-500/20';
    if (action === 'UPDATE') return 'bg-sky-500/15 text-sky-400 border-sky-500/20';
    if (action === 'VERIFY') return 'bg-amber-500/15 text-amber-400 border-amber-500/20';
    return 'bg-neutral-500/15 text-neutral-400 border-neutral-500/20';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Panel */}
      <div>
        <h2 className="text-xl font-poppins font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
          <span>Activity Audit History Logs</span>
          <History className="w-5 h-5 text-gold-400" />
        </h2>
        <p className="text-xs text-neutral-400">Strict regulatory compliance records. Automatic immutable ledger of all operations.</p>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search logs description or operator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none focus:border-gold-400 transition-all text-neutral-800 dark:text-neutral-200"
          />
        </div>

        <div className="flex gap-2 w-full md:w-auto text-xs">
          <select
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 outline-none text-neutral-700 dark:text-neutral-300"
          >
            <option value="">All Operations</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="VERIFY">VERIFY</option>
          </select>

          <select
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 outline-none text-neutral-700 dark:text-neutral-300"
          >
            <option value="">All Abstractions</option>
            <option value="product">Products</option>
            <option value="order">Orders</option>
            <option value="customer">Customers</option>
            <option value="inventory">Inventory</option>
            <option value="purchase_order">POs</option>
            <option value="supplier">Suppliers</option>
            <option value="production">Manufacturing</option>
          </select>
        </div>
      </div>

      {/* Log Feed */}
      <div className="glass-panel overflow-hidden border border-neutral-200/50 dark:border-neutral-800/50 shadow-lg text-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-900/60 border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 font-semibold">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Operation</th>
                <th className="p-4">Entity</th>
                <th className="p-4">Details</th>
                <th className="p-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/80 font-sans">
              {filteredLogs.slice(0, 100).map((log) => (
                <tr key={log.id} className="hover:bg-neutral-100/50 dark:hover:bg-neutral-900/20 transition-colors">
                  <td className="p-4 font-mono text-[10px] text-neutral-400">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="p-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-bold tracking-wider ${getLogColor(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-semibold text-neutral-700 dark:text-neutral-300 capitalize">{log.entity.replace('_', ' ')}</span>
                  </td>
                  <td className="p-4 text-neutral-700 dark:text-neutral-300 font-medium leading-relaxed">{log.description}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-neutral-800 flex items-center justify-center text-[10px] font-bold text-neutral-300 border border-neutral-700">
                        {log.performedBy.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-semibold block">{log.performedBy}</span>
                        <span className="text-[9px] text-gold-400 uppercase font-semibold">{log.performedByRole}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
