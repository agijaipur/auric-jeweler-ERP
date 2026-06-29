import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useToast } from '../components/ui/Toast';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Coins, 
  TrendingUp, 
  HelpCircle, 
  Layers, 
  Boxes,
  User,
  ArrowRight,
  Bookmark
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
}

export const AiAssistant: React.FC = () => {
  const { products, orders, jobs, customers, bookmarks, toggleBookmark } = useStore();
  const { success, warning } = useToast();

  const isBookmarked = bookmarks.includes('/ai-assistant');

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: 'Greetings. I am Auric AI, your local luxury operations assistant. Select a quick action command below, or query the catalog using natural language (e.g. "What is our current vault value?").',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [loading, setLoading] = useState(false);

  // NLP simulated queries logic
  const handleQuery = (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const q = text.toLowerCase();

    setTimeout(() => {
      let aiResponseText = '';

      if (q.includes('value') || q.includes('worth') || q.includes('wealth') || q.includes('valuation')) {
        const totalVal = products.reduce((sum, p) => sum + (p.stock * p.sellingPrice), 0);
        aiResponseText = `Our current vault asset valuation is estimated at **$${totalVal.toLocaleString()}**. This comprises gold alloys, platinum units, and certified gemstones. Rings hold the highest wealth share, followed by Necklaces.`;
      } else if (q.includes('stock') || q.includes('low') || q.includes('restock')) {
        const lowStock = products.filter(p => p.stock < 5);
        if (lowStock.length === 0) {
          aiResponseText = `All vault categories are optimally stocked. No restock alerts flagged.`;
        } else {
          aiResponseText = `We currently have **${lowStock.length} items** running below safety thresholds. Key items include:\n` + 
            lowStock.slice(0, 4).map(p => `• **${p.name}** (SKU: ${p.sku}) - ${p.stock} units remaining in ${p.location}`).join('\n') + 
            `\nI recommend placing a smelter procurement order immediately.`;
        }
      } else if (q.includes('customer') || q.includes('client') || q.includes('vip')) {
        const vip = [...customers].sort((a, b) => b.lifetimeValue - a.lifetimeValue)[0];
        aiResponseText = `Our highest-valued client registered in the CRM is **${vip.name}** with a Lifetime Value (LTV) of **$${vip.lifetimeValue.toLocaleString()}**. Their anniversary date is listed as ${vip.anniversary}. They prefer custom white gold bands.`;
      } else if (q.includes('recommend') || q.includes('insights') || q.includes('suggest')) {
        aiResponseText = `**Auric Smart Recommendations:**\n1. **Procurement**: Acquire additional 18ct Raw Diamonds for setting chokers; demand is projected to spike 12% next month.\n2. **Workshop**: Allocate Vikram Shah to assist Master Rajesh Soni with casting; 3 chokers are flagged late.\n3. **CRM Campaign**: Pitch the newly cataloged marquise rings to customer list segment with LTV > $10,000.`;
      } else if (q.includes('rings') || q.includes('ring')) {
        const ringsCount = products.filter(p => p.category === 'Rings').length;
        aiResponseText = `I found **${ringsCount} distinct Ring designs** registered in our catalog. The most premium Ring is the *24K Gold Solitaire Ring*, valued at over $12,000. Let me know if you would like me to compile a printable list.`;
      } else {
        aiResponseText = `I have analyzed the database for "${text}". I recommend exploring:
        • **Inventory Insights**: Ask about low stock alerts or total vault assets.
        • **CRM Audits**: Ask who our highest LTV customer is.
        • **Recommendations**: Query: "Give me active business recommendations".`;
      }

      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
      setLoading(false);
    }, 1200);
  };

  const handleShortcutClick = (queryText: string) => {
    handleQuery(queryText);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col justify-between">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h2 className="text-xl font-poppins font-extrabold text-neutral-900 dark:text-white flex items-center gap-2">
            <span>AI Operations Copilot</span>
            <Bot className="w-5 h-5 text-gold-400 shrink-0" />
          </h2>
          <p className="text-xs text-neutral-400">Ask operations questions in natural language and receive business intelligence</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => toggleBookmark('/ai-assistant')}
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

      {/* Main chat window */}
      <div className="flex-1 glass-panel p-5 overflow-hidden flex flex-col justify-between border border-neutral-200/50 dark:border-neutral-800/50 relative">
        {/* Messages list */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div 
                key={msg.id} 
                className={`flex gap-3 max-w-[80%] ${
                  isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                {/* Icon avatar */}
                <div className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${
                  isUser ? 'bg-neutral-800 border-neutral-700 text-neutral-200' : 'bg-gold-400/10 border-gold-400/20 text-gold-400'
                }`}>
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 animate-pulse" />}
                </div>

                <div className="space-y-1">
                  <div className={`p-4 rounded-2xl text-xs leading-relaxed ${
                    isUser 
                      ? 'bg-neutral-900 text-neutral-100 border border-neutral-800/85' 
                      : 'bg-white/80 dark:bg-neutral-900/60 text-neutral-800 dark:text-neutral-200 border border-neutral-200/50 dark:border-neutral-800/40 shadow-sm'
                  }`}>
                    {/* Preserve line breaks for AI answers */}
                    <div className="whitespace-pre-line">{msg.text}</div>
                  </div>
                  <span className="text-[9px] text-neutral-400 block px-1 text-right font-mono">{msg.timestamp}</span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[80%] mr-auto items-center">
              <div className="w-8 h-8 rounded-xl bg-gold-400/10 border border-gold-400/20 text-gold-400 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 bg-neutral-900/30 rounded-2xl text-xs text-neutral-400 border border-neutral-800/30 animate-pulse italic">
                Analyzing ERP ledger values...
              </div>
            </div>
          )}
        </div>

        {/* Input prompt area */}
        <div className="mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800 space-y-3 shrink-0 bg-white/50 dark:bg-luxury-black/30 p-2 rounded-2xl">
          {/* Quick recommendations */}
          <div className="flex flex-wrap gap-2 text-[10px] font-semibold">
            <button
              onClick={() => handleShortcutClick('What is our total vault asset value?')}
              className="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-gold-400/20 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all flex items-center gap-1"
            >
              <Coins className="w-3.5 h-3.5 text-gold-400" />
              <span>Valuation Insights</span>
            </button>
            <button
              onClick={() => handleShortcutClick('List low stock alerts')}
              className="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-gold-400/20 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all flex items-center gap-1"
            >
              <Boxes className="w-3.5 h-3.5 text-gold-400" />
              <span>Low Stock Audit</span>
            </button>
            <button
              onClick={() => handleShortcutClick('Who is our highest VIP customer?')}
              className="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-gold-400/20 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all flex items-center gap-1"
            >
              <User className="w-3.5 h-3.5 text-gold-400" />
              <span>Highest VIP LTV</span>
            </button>
            <button
              onClick={() => handleShortcutClick('Give me smart business recommendations')}
              className="px-2.5 py-1.5 rounded-xl border border-neutral-200 dark:border-neutral-800 hover:border-gold-400/20 text-neutral-500 hover:text-neutral-900 dark:hover:text-white transition-all flex items-center gap-1 font-poppins text-gold-400"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Recommendations</span>
            </button>
          </div>

          {/* Form input */}
          <form 
            onSubmit={(e) => { e.preventDefault(); handleQuery(input); }} 
            className="flex gap-2"
          >
            <input
              type="text"
              placeholder="Ask Auric AI about CRM, products, or stock alerts..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl py-3 px-4 text-xs outline-none focus:border-gold-400 transition-all text-neutral-800 dark:text-neutral-200"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="px-5 rounded-xl gold-gradient-bg text-neutral-950 font-bold hover:shadow-gold-500/10 transition-all flex items-center justify-center shrink-0 disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
