import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { clsx } from "clsx";
import { Brain, Activity, Clock, ShieldAlert, Cpu, Network, Database, ChevronRight, ServerCrash, AlertOctagon, AlertTriangle } from "lucide-react";

function GlassCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-xl border border-white/[0.06] bg-white/[0.025] backdrop-blur-sm", className)}>
      {children}
    </div>
  );
}

export function MemorySystemPanel() {
  return (
    <GlassCard className="p-4 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <Brain className="w-24 h-24 text-purple-400" />
      </div>
      <div className="flex items-center gap-2 mb-4 relative z-10">
        <Database className="w-4 h-4 text-purple-400" />
        <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "Orbitron, monospace" }}>Persistent Intelligence</h3>
        <span className="ml-auto text-[9px] font-mono border border-purple-500/30 text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded">ACTIVE MEMORY</span>
      </div>
      <div className="space-y-3 relative z-10">
        {[
          { label: "Repeated Prompt Attacks", val: "User 'dev_admin' attempted 4 jailbreaks today.", color: "text-red-400" },
          { label: "Recent Threat Memory", val: "CVE-2024-3094 correlated with 3 past blocked deploys.", color: "text-amber-400" },
          { label: "Deployment Failures", val: "Auth service failed 2 security gates yesterday.", color: "text-orange-400" },
          { label: "Historical Correlation", val: "Risk patterns match Q4 incident footprint (92% confidence).", color: "text-cyan-400" }
        ].map((item, i) => (
          <div key={i} className="bg-white/[0.02] border border-white/[0.04] p-2 rounded-lg">
            <div className="text-[9px] text-slate-500 font-mono uppercase tracking-wider mb-1">{item.label}</div>
            <div className={clsx("text-[10px] font-mono", item.color)}>{item.val}</div>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}

export function IncidentTimeline({ logs }: { logs?: any[] }) {
  const displayLogs = logs && logs.length > 0
    ? logs
    : [
      { time: "14:01:22", msg: "Prompt injection detected", agent: "PromptShield", color: "#00d4ff" },
      { time: "14:02:15", msg: "Vulnerable dependency correlated", agent: "CodeSage", color: "#10b981" },
      { time: "14:03:40", msg: "Exploit trend discovered (GitHub)", agent: "SIFTGuardian", color: "#f59e0b" },
      { time: "14:04:10", msg: "Composite risk elevated to CRITICAL", agent: "Orchestrator", color: "#7c3aed" },
      { time: "14:05:00", msg: "Deployment automatically blocked", agent: "Deployment", color: "#ef4444" }
    ];

  const [step, setStep] = useState(0);

  useEffect(() => {
    const t = setInterval(() => {
      setStep(s => (s + 1) % (displayLogs.length + 3)); // loop with a pause
    }, 1500);
    return () => clearInterval(t);
  }, [displayLogs.length]);

  return (
    <GlassCard className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-cyan-400 animate-pulse" />
        <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "Orbitron, monospace" }}>Incident Replay</h3>
      </div>
      <div className="relative pl-3 border-l border-white/[0.1] space-y-3 font-mono text-[10px]">
        {displayLogs.map((ev, i) => {
          const active = i <= step;
          const agentColor = ev.color || (ev.agent === 'PromptShield' ? '#00d4ff' : ev.agent === 'SIFTGuardian' ? '#f59e0b' : ev.agent === 'CodeSage' ? '#10b981' : '#7c3aed');
          return (
            <motion.div key={i} className={clsx("relative", !active && "opacity-30")} animate={{ opacity: active ? 1 : 0.3 }}>
              <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full" style={{ background: agentColor, boxShadow: `0 0 5px ${agentColor}80` }} />
              <div className="font-bold" style={{ color: agentColor }}>[{ev.agent}]</div>
              <div className="text-slate-400 mt-0.5">{ev.msg}</div>
            </motion.div>
          );
        })}
      </div>
    </GlassCard>
  );
}

export function FoundryIQPanel({ rationale }: { rationale?: string }) {
  const [pulse, setPulse] = useState(false);
  useEffect(() => {
    const t = setInterval(() => setPulse(p => !p), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <GlassCard className="p-4 border-cyan-500/20 bg-[linear-gradient(45deg,rgba(0,212,255,0.02),rgba(0,0,0,0))]">
      <div className="flex items-center gap-2 mb-3">
        <Network className={clsx("w-4 h-4 text-cyan-400", pulse && "animate-pulse shadow-[0_0_10px_#00d4ff]")} />
        <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "Orbitron, monospace" }}>Microsoft Foundry IQ</h3>
        <span className="ml-auto text-[9px] font-mono border border-cyan-500/30 text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">GROUNDED INTEL</span>
      </div>
      <div className="space-y-2 font-mono text-[10px] text-slate-400">
        <div className="flex items-center gap-2">
          <ChevronRight className="w-3 h-3 text-cyan-500" />
          <span>Querying Foundry IQ knowledge base...</span>
        </div>
        <div className="flex items-center gap-2 text-cyan-300">
          <ChevronRight className="w-3 h-3 text-cyan-500" />
          <span>Retrieving enterprise security telemetry...</span>
        </div>
        <div className="flex items-center gap-2">
          <ChevronRight className="w-3 h-3 text-cyan-500" />
          <span>Grounding deployment reasoning...</span>
        </div>
        <div className="mt-3 p-2 border border-cyan-500/20 bg-cyan-500/5 rounded">
          <strong className="text-cyan-400">IQ Context:</strong> {rationale || `"Current deployment pattern matches 3 previous ransomware lateral movement vectors identified in Q1."`}
        </div>
      </div>
    </GlassCard>
  );
}

export function VerdictExplanationPanel({ vulnerabilities, verdict }: { vulnerabilities?: any[], verdict?: string }) {
  const isWarn = verdict === "WARN";
  return (
    <GlassCard className={clsx("p-4 border", isWarn ? "border-amber-500/20 bg-amber-500/[0.02]" : "border-red-500/20 bg-red-500/[0.02]")}>
      <div className="flex items-center gap-2 mb-4">
        {isWarn ? <AlertTriangle className="w-5 h-5 text-amber-500" /> : <ServerCrash className="w-5 h-5 text-red-500" />}
        <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "Orbitron, monospace" }}>
          {isWarn ? "Deployment Warning" : "Deployment Blocked"}
        </h3>
        <span className={clsx("ml-auto text-[10px] font-mono text-white px-2 py-0.5 rounded font-bold tracking-widest", isWarn ? "bg-amber-500" : "bg-red-500")}>
          {isWarn ? "REVIEW ADVISED" : "ACTION REQUIRED"}
        </span>
      </div>
      <p className="text-[11px] text-slate-300 mb-3 font-mono">Orchestrator consensus reached. Deployment {isWarn ? "flagged with warnings" : "blocked"} because:</p>
      <ul className={clsx("space-y-2 text-[11px] font-mono pl-2 border-l", isWarn ? "text-slate-400 border-amber-500/30" : "text-slate-400 border-red-500/30")}>
        {vulnerabilities && vulnerabilities.length > 0 ? (
          vulnerabilities.map((vuln, i) => (
            <li key={i} className="flex items-start gap-2">
              <AlertOctagon className={clsx("w-3.5 h-3.5 shrink-0 mt-px", isWarn ? "text-amber-400" : "text-red-400")} />
              <span><strong className={isWarn ? "text-amber-300" : "text-red-300"}>{vuln.file}:</strong> {vuln.description}</span>
            </li>
          ))
        ) : (
          <li className="flex items-start gap-2">
            <AlertOctagon className={clsx("w-3.5 h-3.5 shrink-0 mt-px", isWarn ? "text-amber-400" : "text-red-400")} />
            <span><strong className={isWarn ? "text-amber-300" : "text-red-300"}>Automated Policy:</strong> Historical vulnerability patterns identified.</span>
          </li>
        )}
      </ul>
    </GlassCard>
  );
}

export function BusinessImpactPanel() {
  return (
    <GlassCard className="p-4 mt-4">
      <h3 className="text-xs font-semibold text-slate-300 mb-3 uppercase tracking-widest font-mono">Business Impact Summary</h3>
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-center">
          <div className="text-[9px] text-slate-400 font-mono mb-1 uppercase tracking-wider">Potential Data Exposure</div>
          <div className="text-lg font-black text-red-400 font-mono">HIGH</div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 text-center">
          <div className="text-[9px] text-slate-400 font-mono mb-1 uppercase tracking-wider">Likelihood of Exploit</div>
          <div className="text-lg font-black text-orange-400 font-mono">CRITICAL</div>
        </div>
        <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-3 text-center">
          <div className="text-[9px] text-slate-400 font-mono mb-1 uppercase tracking-wider">Est. Deployment Risk</div>
          <div className="text-lg font-black text-purple-400 font-mono">92%</div>
        </div>
      </div>
      <p className="text-[10px] text-slate-500 font-mono mt-3 text-center">
        Proceeding with deployment carries an estimated financial risk of $2.4M based on historical breach data.
      </p>
    </GlassCard>
  );
}

export function AIScanOverlay({ active }: { active: boolean }) {
  if (!active) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-[#020817]/80 backdrop-blur-md rounded-xl overflow-hidden pointer-events-none">
      {/* Neural Lines Background */}
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "linear-gradient(0deg, transparent 24%, rgba(0, 212, 255, .3) 25%, rgba(0, 212, 255, .3) 26%, transparent 27%, transparent 74%, rgba(0, 212, 255, .3) 75%, rgba(0, 212, 255, .3) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0, 212, 255, .3) 25%, rgba(0, 212, 255, .3) 26%, transparent 27%, transparent 74%, rgba(0, 212, 255, .3) 75%, rgba(0, 212, 255, .3) 76%, transparent 77%, transparent)", backgroundSize: "50px 50px" }} />

      {/* Scan Line */}
      <motion.div
        className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_20px_#00d4ff]"
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
      />

      <div className="relative text-center">
        <Cpu className="w-16 h-16 text-cyan-400 animate-pulse mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white tracking-[0.2em] uppercase mb-2 shadow-cyan" style={{ fontFamily: "Orbitron, monospace", textShadow: "0 0 10px rgba(0,212,255,0.8)" }}>
          Autonomous Scan Active
        </h2>
        <div className="h-24 overflow-hidden w-64 mx-auto text-left font-mono text-[10px] text-cyan-300 opacity-80">
          <motion.div animate={{ y: ["0%", "-50%"] }} transition={{ duration: 10, repeat: Infinity, ease: "linear" }} className="space-y-1">
            <p>Analyzing AST nodes...</p>
            <p>Scanning dependency tree...</p>
            <p className="text-red-400">Checking for known vulnerabilities...</p>
            <p>Evaluating LLM integration points...</p>
            <p>Simulating injection vectors...</p>
            <p>Tracing data flow paths...</p>
            <p>Compiling risk matrix...</p>
            <p>Cross-referencing Foundry IQ...</p>
            <p>Generating remediation patches...</p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
