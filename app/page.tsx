'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  Shield, 
  ChevronRight, 
  Play, 
  Pause, 
  Volume2, 
  Activity, 
  Cpu, 
  Clock,
  CheckCircle2,
  XCircle,
  Loader2
} from 'lucide-react';

type RoastData = {
  output: string;
  roast_text: string;
  audio_available: boolean;
};

type AppView = 'landing' | 'app';

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Home() {
  const [view, setView] = useState<AppView>('landing');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [roastData, setRoastData] = useState<RoastData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioDuration, setAudioDuration] = useState<string>('--');
  const [fakeMetrics] = useState({
    neuralLoad: 73,
    tokenEff: 91,
    latency: 18,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setRoastData(null);

    try {
      const response = await fetch('/api/roast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process request');
      }

      setRoastData(data);

      if (data.audio_available) {
        const audioResponse = await fetch('/api/roast-audio', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: data.roast_text }),
        });

        if (audioResponse.ok) {
          const blob = await audioResponse.blob();
          const url = URL.createObjectURL(blob);
          setAudioUrl(url);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  if (view === 'landing') {
    return (
      <LandingPage onGetStarted={() => setView('app')} />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <audio 
        ref={audioRef} 
        src={audioUrl || undefined} 
        onEnded={() => setIsPlaying(false)}
        onLoadedMetadata={() => {
          if (audioRef.current) {
            setAudioDuration(String(Math.floor(audioRef.current.duration)));
          }
        }}
        onTimeUpdate={() => {
          if (audioRef.current) {
            setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
          }
        }}
      />
      
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">OMNIVERSAL</span>
        </div>
        <div className="flex items-center gap-6 text-sm text-neutral-400">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            <span>System Online</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Edge Network</span>
          </div>
        </div>
      </header>

      <main className="flex">
        <aside className="w-72 border-r border-white/5 p-6 hidden lg:block">
          <div className="space-y-6">
            <div>
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-4">
                Neural Metrics
              </h3>
              <div className="space-y-4">
                <MetricCard 
                  label="Neural Load"
                  value={`${fakeMetrics.neuralLoad}%`}
                  icon={Cpu}
                  color="indigo"
                />
                <MetricCard 
                  label="Token Efficiency"
                  value={`${fakeMetrics.tokenEff}%`}
                  icon={Zap}
                  color="amber"
                />
                <MetricCard 
                  label="Edge Latency"
                  value={`${fakeMetrics.latency}ms`}
                  icon={Clock}
                  color="emerald"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <h3 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-4">
                Active Persona
              </h3>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                    <span className="text-xl">🎭</span>
                  </div>
                  <div>
                    <div className="font-medium text-sm">Shakespeare</div>
                    <div className="text-xs text-neutral-500">v1.0.0 • Active</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/5">
              <button 
                onClick={() => setView('landing')}
                className="text-sm text-neutral-400 hover:text-white transition-colors"
              >
                ← Return to Dashboard
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 p-8">
          <form onSubmit={handleSubmit} className="max-w-3xl">
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-400 mb-2">
                Describe what you need
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Write a Python script to merge two sorted arrays, or explain quantum entanglement to a five-year-old..."
                className="w-full h-40 px-4 py-3 rounded-xl bg-white/5 border border-white/10 
                         text-white placeholder-neutral-500 resize-none
                         focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-indigo-500/20
                         transition-all"
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={isLoading || !prompt.trim()}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 
                           font-medium text-white
                           hover:from-indigo-500 hover:to-purple-500
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-all flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      Execute
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3"
              >
                <XCircle className="w-5 h-5 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {roastData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 space-y-6"
              >
                {audioUrl && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/10">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={togglePlayback}
                        className="w-14 h-14 rounded-xl bg-indigo-600 hover:bg-indigo-500 
                                 flex items-center justify-center transition-colors"
                      >
                        {isPlaying ? (
                          <Pause className="w-6 h-6" />
                        ) : (
                          <Play className="w-6 h-6 ml-1" />
                        )}
                      </button>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Neural Audio Response</span>
                          <span className="text-xs text-neutral-500">
                            {audioDuration}s
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                          <motion.div 
                            className="h-full bg-indigo-500"
                            style={{ width: `${audioProgress}%` }}
                          />
                        </div>
                      </div>
                      <Volume2 className="w-5 h-5 text-neutral-400" />
                    </div>
                  </div>
                )}

                <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-5 h-5 text-amber-400" />
                    <span className="text-sm font-medium">The Verdict</span>
                  </div>
                  <p className="text-sm text-neutral-300 leading-relaxed">
                    {roastData.output}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <header className="border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">OMNIVERSAL</span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <a href="#" className="text-neutral-400 hover:text-white transition-colors">Features</a>
          <a href="#" className="text-neutral-400 hover:text-white transition-colors">Documentation</a>
          <a href="#" className="text-neutral-400 hover:text-white transition-colors">Pricing</a>
        </nav>
      </header>

      <main>
        <section className="px-6 py-32 text-center max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full 
                          bg-indigo-500/10 border border-indigo-500/20 text-sm text-indigo-400 mb-8">
              <Zap className="w-4 h-4" />
              <span>Enterprise-Grade Neural Workflows</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
              The Future of
              <span className="block bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                Intelligent Automation
              </span>
            </h1>

            <p className="text-xl text-neutral-400 max-w-2xl mx-auto mb-12">
              Leveraging advanced neural architectures to deliver unparalleled productivity solutions. 
              Real-time processing at the edge.
            </p>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={onGetStarted}
                className="px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 
                         font-medium text-lg
                         hover:from-indigo-500 hover:to-purple-500
                         transition-all flex items-center gap-2"
              >
                Get Started
                <ChevronRight className="w-5 h-5" />
              </button>
              <button className="px-8 py-4 rounded-xl border border-white/20 font-medium text-lg hover:bg-white/5 transition-all">
                View Documentation
              </button>
            </div>
          </motion.div>
        </section>

        <section className="px-6 py-24 border-t border-white/5">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={Brain}
                title="Advanced Reasoning"
                description="State-of-the-art neural processing for complex problem solving with context-aware analysis."
              />
              <FeatureCard 
                icon={Zap}
                title="Edge-Native Speed"
                description="Deployed globally at the edge for sub-millisecond latency. Your workflows, accelerated."
              />
              <FeatureCard 
                icon={Shield}
                title="Enterprise Security"
                description="SOC 2 compliant architecture with end-to-end encryption and comprehensive audit logging."
              />
            </div>
          </div>
        </section>

        <section className="px-6 py-24 border-t border-white/5">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Trusted by Industry Leaders</h2>
            <div className="flex items-center justify-center gap-12 opacity-50 grayscale">
              <div className="text-2xl font-bold">GOOGLE</div>
              <div className="text-2xl font-bold">MICROSOFT</div>
              <div className="text-2xl font-bold">AMAZON</div>
              <div className="text-2xl font-bold">META</div>
            </div>
          </div>
        </section>
      </main>

      <footer className="px-6 py-8 border-t border-white/5 text-center text-neutral-500 text-sm">
        <p>© 2026 Omniversal AI. All rights reserved.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
      <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center mb-6">
        <Icon className="w-6 h-6 text-indigo-400" />
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-neutral-400">{description}</p>
    </div>
  );
}

function MetricCard({ 
  label, 
  value, 
  icon: Icon,
  color 
}: { 
  label: string;
  value: string;
  icon: React.ElementType;
  color: 'indigo' | 'amber' | 'emerald';
}) {
  const colorClasses = {
    indigo: 'text-indigo-400 bg-indigo-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
  };

  return (
    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-neutral-500">{label}</span>
        <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', colorClasses[color])}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-semibold">{value}</div>
    </div>
  );
}