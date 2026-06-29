import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { Modal } from '../components/ui/Modal';
import { 
  Hammer, 
  Search, 
  AlertTriangle, 
  CheckCircle2, 
  Hourglass, 
  Clock, 
  User, 
  Plus, 
  FileText, 
  ArrowRight,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ProductionJob } from '../utils/seedData';

export const Production: React.FC = () => {
  const { jobs, updateJob, addJobNote, user, bookmarks, toggleBookmark } = useStore();
  const { success, warning, error } = useToast();

  const isBookmarked = bookmarks.includes('/production');

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [craftsmanFilter, setCraftsmanFilter] = useState('');

  // Modals
  const [jobDetail, setJobDetail] = useState<ProductionJob | null>(null);
  const [noteText, setNoteText] = useState('');

  // Unique craftsman list
  const craftsmen = useMemo(() => {
    return Array.from(new Set(jobs.map(j => j.craftsman)));
  }, [jobs]);

  // Statistics calculation
  const stats = useMemo(() => {
    const active = jobs.filter(j => j.stage !== 'Completed').length;
    const delayed = jobs.filter(j => j.status === 'Delayed' && j.stage !== 'Completed').length;
    const completed = jobs.filter(j => j.stage === 'Completed').length;

    return { active, delayed, completed };
  }, [jobs]);

  // Filters list
  const filteredJobs = useMemo(() => {
    return jobs.filter(j => {
      const matchSearch = j.productName.toLowerCase().includes(searchTerm.toLowerCase()) || j.jobId.toLowerCase().includes(searchTerm.toLowerCase()) || (j.orderNumber && j.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchStage = stageFilter ? j.stage === stageFilter : true;
      const matchCraftsman = craftsmanFilter ? j.craftsman === craftsmanFilter : true;
      return matchSearch && matchStage && matchCraftsman;
    });
  }, [jobs, searchTerm, stageFilter, craftsmanFilter]);

  // Update job parameters (craftsman, stage, status)
  const handleUpdateJobDetails = async (job: ProductionJob, updates: Partial<ProductionJob>) => {
    const updated = {
      ...job,
      ...updates
    };
    await updateJob(updated);
    
    // Auto-update the active detail view if open
    if (jobDetail && jobDetail.id === job.id) {
      setJobDetail({ ...jobDetail, ...updated });
    }

    success('Job Status Synchronized', `Successfully adjusted manufacturing parameters.`);
  };

  // Add Comment note
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDetail || !noteText) return;

    await addJobNote(jobDetail.id, noteText, user?.name || 'Production Coordinator');
    
    // Auto refresh local modal state
    const refreshedJob = useStore.getState().jobs.find(j => j.id === jobDetail.id);
    if (refreshedJob) {
      setJobDetail(refreshedJob);
    }

    setNoteText('');
    success('Crafts Note Logged', 'Note saved to job history registry.');
  };

  const isProdManager = user?.role === 'Production Manager' || user?.role === 'Administrator';

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-poppins font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>Manufacturing Workshop Pipeline</span>
            <Hammer className="w-5 h-5 text-gold-400 shrink-0" />
          </h2>
          <p className="text-xs text-neutral-400">Track raw gold casting, polishing, stone setting, and craftsman timelines</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => toggleBookmark('/production')}
            className={`p-2.5 rounded-xl border transition-all ${
              isBookmarked
                ? 'bg-gold-400/10 border-gold-400/35 text-gold-400'
                : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200'
            }`}
          >
            <Bookmark className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Production Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-gold-400/10 text-gold-400">
            <Hourglass className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          </div>
          <div>
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block">Active Castings</span>
            <span className="text-lg font-bold text-neutral-900 dark:text-white font-poppins">{stats.active} batches</span>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-rose-400 font-semibold uppercase tracking-wider block">Delayed Batches</span>
            <span className="text-lg font-bold text-rose-500 font-poppins">{stats.delayed} jobs flagged</span>
          </div>
        </div>

        <div className="glass-panel p-5 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block">Quality Approved</span>
            <span className="text-lg font-bold text-emerald-500 font-poppins">{stats.completed} products</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-panel p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search job SKU, order number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2.5 pl-9 pr-4 text-xs outline-none focus:border-gold-400 transition-all text-neutral-800 dark:text-neutral-200"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto text-xs">
          <select
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 outline-none text-neutral-700 dark:text-neutral-300"
          >
            <option value="">All Stages</option>
            <option value="Casting">Casting</option>
            <option value="Polishing">Polishing</option>
            <option value="Stone Setting">Stone Setting</option>
            <option value="Quality Check">Quality Check</option>
            <option value="Packaging">Packaging</option>
            <option value="Completed">Completed</option>
          </select>

          <select
            value={craftsmanFilter}
            onChange={(e) => setCraftsmanFilter(e.target.value)}
            className="bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl px-3 py-2 outline-none text-neutral-700 dark:text-neutral-300 font-semibold"
          >
            <option value="">All Craftsmen</option>
            {craftsmen.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Kanban/List representation */}
      {filteredJobs.length === 0 ? (
        <div className="glass-panel py-20 text-center text-neutral-400 text-sm flex flex-col items-center justify-center gap-2">
          <Hammer className="w-12 h-12 text-gold-400/50" />
          <h4 className="font-semibold text-neutral-900 dark:text-white">No Workshop Jobs</h4>
          <span>Confirm query or wait for active order booking updates.</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => {
            const isLate = job.status === 'Delayed' && job.stage !== 'Completed';

            return (
              <motion.div
                layout
                key={job.id}
                onClick={() => setJobDetail(job)}
                className={`glass-panel p-5 flex flex-col justify-between hover:border-gold-400/35 transition-all duration-300 group cursor-pointer relative overflow-hidden ${
                  isLate ? 'border-rose-500/20' : ''
                }`}
              >
                {/* Delay overlay indicator */}
                {isLate && (
                  <span className="absolute top-0 right-0 px-3 py-1 bg-rose-950/90 text-[8px] font-bold text-rose-400 tracking-wider uppercase rounded-bl-xl border-l border-b border-rose-500/20 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    <span>LATE</span>
                  </span>
                )}

                <div className="space-y-4">
                  {/* Job ID & Stage */}
                  <div className="flex justify-between items-center">
                    <span className="font-mono font-bold text-neutral-900 dark:text-white text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-800/50 px-2 py-0.5 rounded">
                      {job.jobId}
                    </span>
                    <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider">{job.stage}</span>
                  </div>

                  {/* Product Details */}
                  <div>
                    <h4 className="font-poppins font-bold text-sm text-neutral-900 dark:text-white truncate leading-snug group-hover:text-gold-400 transition-colors">
                      {job.productName}
                    </h4>
                    {job.orderNumber && (
                      <span className="text-[9.5px] text-neutral-500 font-mono uppercase mt-0.5 block">Associated Contract: {job.orderNumber}</span>
                    )}
                  </div>

                  {/* Craftsman details */}
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-gold-400" />
                    </div>
                    <span className="font-medium text-neutral-400">{job.craftsman}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 mt-5">
                  <div className="flex justify-between items-center text-[10px] font-semibold text-neutral-400">
                    <span>Manufacturing stages progress</span>
                    <span className="font-mono text-neutral-800 dark:text-white">{job.progressBar}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLate ? 'bg-rose-500' : 'gold-gradient-bg'
                      }`}
                      style={{ width: `${job.progressBar}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* --------------------- MODAL: Job Detailed view / Stage transitions --------------------- */}
      <Modal
        isOpen={!!jobDetail}
        onClose={() => setJobDetail(null)}
        title={jobDetail ? `${jobDetail.jobId} - Workshop specs` : 'Job Details'}
        size="lg"
      >
        {jobDetail && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-neutral-700 dark:text-neutral-300">
            {/* Left Specs controls */}
            <div className="space-y-5">
              <div className="space-y-1">
                <span className="font-mono font-bold text-neutral-900 dark:text-white text-xs bg-neutral-100 dark:bg-neutral-800 border border-neutral-200/50 dark:border-neutral-800/50 px-2 py-0.5 rounded">
                  {jobDetail.jobId}
                </span>
                <h3 className="text-base font-bold font-poppins text-neutral-900 dark:text-white mt-3 leading-snug">
                  {jobDetail.productName}
                </h3>
                {jobDetail.orderNumber && (
                  <span className="text-[10px] text-neutral-400 font-mono uppercase block">Contract: {jobDetail.orderNumber}</span>
                )}
              </div>

              {/* Progress timeline coordinates */}
              <div className="p-4 bg-neutral-100 dark:bg-neutral-900/60 border border-neutral-200/50 dark:border-neutral-800/50 rounded-2xl grid grid-cols-2 gap-3 text-xs font-semibold">
                <div>
                  <span className="text-neutral-400 uppercase tracking-widest text-[9px] block">Casting Start</span>
                  <span className="font-mono text-neutral-800 dark:text-white">{jobDetail.startedAt}</span>
                </div>
                <div>
                  <span className="text-neutral-400 uppercase tracking-widest text-[9px] block">Target Delivery</span>
                  <span className={`font-mono ${jobDetail.status === 'Delayed' ? 'text-rose-400' : 'text-neutral-800 dark:text-white'}`}>{jobDetail.expectedDate}</span>
                </div>
              </div>

              {/* Craftsman assigner */}
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-400">Assigned Craftsman</label>
                <select
                  disabled={!isProdManager}
                  value={jobDetail.craftsman}
                  onChange={(e) => handleUpdateJobDetails(jobDetail, { craftsman: e.target.value })}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 outline-none text-neutral-900 dark:text-white disabled:opacity-50"
                >
                  <option value="Master Rajesh Soni">Master Rajesh Soni</option>
                  <option value="Vikram Shah">Vikram Shah</option>
                  <option value="Ankit Soni">Ankit Soni</option>
                  <option value="Devendra Dewangan">Devendra Dewangan</option>
                  <option value="Suresh Patwa">Suresh Patwa</option>
                  <option value="Ramesh Choksi">Ramesh Choksi</option>
                </select>
              </div>

              {/* Stage Transition */}
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-400">Active Manufacturing Stage</label>
                <select
                  disabled={!isProdManager}
                  value={jobDetail.stage}
                  onChange={(e) => handleUpdateJobDetails(jobDetail, { stage: e.target.value as any })}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 outline-none text-neutral-900 dark:text-white disabled:opacity-50 font-bold"
                >
                  <option value="Casting">Casting (Smelting)</option>
                  <option value="Polishing">Polishing (Filing)</option>
                  <option value="Stone Setting">Stone Setting (镶嵌)</option>
                  <option value="Quality Check">Quality Check (Hallmark)</option>
                  <option value="Packaging">Packaging (Safety Seal)</option>
                  <option value="Completed">Completed (Dispatch Ready)</option>
                </select>
              </div>

              {/* Status flag */}
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-400">Delay Flag alert</label>
                <select
                  disabled={!isProdManager}
                  value={jobDetail.status}
                  onChange={(e) => handleUpdateJobDetails(jobDetail, { status: e.target.value as any })}
                  className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 outline-none text-neutral-900 dark:text-white disabled:opacity-50"
                >
                  <option value="In Progress">Active (In Progress)</option>
                  <option value="Delayed">Delayed (Raw Material Deficit)</option>
                  <option value="On Hold">On Hold (Design Change)</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>

            {/* Right log comments & Add comment */}
            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <h4 className="text-sm font-poppins font-bold text-neutral-900 dark:text-white uppercase tracking-wider mb-2">
                  Craftsman Comments History
                </h4>

                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1 scrollbar-thin">
                  {jobDetail.notes.map((note) => (
                    <div key={note.id} className="p-3.5 bg-neutral-50 dark:bg-neutral-900/40 rounded-xl border border-neutral-100 dark:border-neutral-800 text-[11px] leading-relaxed">
                      <div className="flex justify-between items-center text-[10px] text-neutral-500 font-semibold mb-1">
                        <span>{note.author}</span>
                        <span className="font-mono">{note.date}</span>
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300 italic">"{note.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Comment Note form */}
              {isProdManager && (
                <form onSubmit={handleAddComment} className="space-y-2 pt-4 border-t border-neutral-100 dark:border-neutral-800">
                  <label className="font-semibold text-neutral-400">Log Craftsman Update</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Type details (e.g., Setting complete, gold slab filed)..."
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-2 px-3 outline-none focus:border-gold-400 text-xs"
                    />
                    <button
                      type="submit"
                      className="px-4 rounded-xl gold-gradient-bg text-neutral-950 font-bold shrink-0 text-xs"
                    >
                      Log Note
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
