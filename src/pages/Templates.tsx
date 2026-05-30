import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, Play, Star, Filter, Search } from 'lucide-react';
import { useStore } from '../stores/useStore';

export default function Templates() {
  const { templates, loadTemplates } = useStore();

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const categories = [
    { id: 'all', name: 'All', count: templates.length },
    { id: 'trending', name: 'Trending', count: templates.filter(t => t.category === 'trending').length },
    { id: 'demo', name: 'Product Demo', count: templates.filter(t => t.category === 'demo').length },
    { id: 'unboxing', name: 'Unboxing', count: templates.filter(t => t.category === 'unboxing').length },
    { id: 'transformation', name: 'Transformation', count: templates.filter(t => t.category === 'transformation').length },
    { id: 'lifestyle', name: 'Lifestyle', count: templates.filter(t => t.category === 'lifestyle').length },
  ];

  return (
    <div className="min-h-screen bg-[#0F172A]">
      <div className="fixed inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-pink-900/10 pointer-events-none" />

      <nav className="relative z-10 border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/dashboard" className="flex items-center gap-3 text-white/70 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-semibold">Back to Dashboard</span>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">Template Gallery</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Choose Your <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Template</span>
            </h1>
            <p className="text-xl text-white/60">
              Pre-designed video templates optimized for TikTok engagement
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col md:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                placeholder="Search templates..."
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-purple-500 transition-colors"
              />
            </div>
            <button className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-colors flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filter
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex gap-2 overflow-x-auto pb-4 mb-8 scrollbar-hide"
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`px-4 py-2 rounded-xl whitespace-nowrap transition-all ${
                  cat.id === 'all'
                    ? 'bg-purple-500 text-white'
                    : 'bg-white/5 text-white/70 hover:bg-white/10'
                }`}
              >
                {cat.name} ({cat.count})
              </button>
            ))}
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template, i) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="group"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-white/5 rounded-2xl border border-white/10 overflow-hidden hover:border-purple-500/50 transition-all">
                    <div className="aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                      </div>
                      {template.isPremium && (
                        <div className="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full text-xs font-bold text-white flex items-center gap-1">
                          <Star className="w-3 h-3" />
                          PRO
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-xs text-white font-semibold">
                        {template.config.defaultDuration}s
                      </div>
                      <div className="absolute bottom-3 right-3 px-3 py-1 bg-purple-500/80 backdrop-blur-sm rounded-lg text-xs text-white font-semibold capitalize">
                        {template.category}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className="font-bold text-white mb-2">{template.name}</h3>
                      <p className="text-sm text-white/60 mb-4">{template.description}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-yellow-400 text-sm">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-white/80">
                            {template.popularity.toLocaleString()} uses
                          </span>
                        </div>
                        <Link
                          to={`/studio?template=${template.id}`}
                          className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white text-sm font-semibold transition-colors"
                        >
                          Use Template
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {templates.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-10 h-10 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Loading Templates</h3>
              <p className="text-white/60">Please wait while we load the latest templates...</p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-16 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-3xl border border-white/10 p-8 text-center"
          >
            <h3 className="text-2xl font-bold text-white mb-4">
              Can't find the perfect template?
            </h3>
            <p className="text-white/60 mb-6 max-w-2xl mx-auto">
              We're constantly adding new templates based on trending formats. 
              Or create a custom video from scratch with your own style!
            </p>
            <Link
              to="/studio"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold hover:shadow-lg hover:shadow-purple-500/25 transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Create Custom Video
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
