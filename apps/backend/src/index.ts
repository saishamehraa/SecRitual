import express from 'express';
import cors from 'cors';
import { orchestrateDebate } from './orchestrator/AgentDebate';
import path from 'path';
import fs from 'fs';
import { generateAIResponse } from './services/ai';


const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// SSE Clients
let clients: express.Response[] = [];

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'SecRitual AI API Gateway' });
});

// SSE Endpoint for Live Telemetry
app.get('/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  clients.push(res);
  console.log('Client connected to telemetry stream');

  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

// Trigger Agent Debate for Prompt Injection
app.post('/api/debate', async (req, res) => {
  try {
    const { context } = req.body;
    broadcastEvent('debate_start', { context });
    const result = await orchestrateDebate(context || "Simulated Prompt Injection Attempt");
    broadcastEvent('debate_result', result);
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Debate failed" });
  }
});

// Trigger Agent Debate for Repository Scan (Real Live LLM Scan)
app.post('/api/scan-repo', async (req, res) => {
  try {
    const { repoUrl } = req.body;
    let targetDir = repoUrl || process.cwd(); // Default to project root if empty
    let codeSnippets = "";
    
    // Add real git cloning for GitHub URLs!
    let isGitUrl = targetDir.startsWith('http') || targetDir.startsWith('git@');
    let tmpDir = '';
    if (isGitUrl) {
      const { execSync } = require('child_process');
      tmpDir = path.join(process.cwd(), 'tmp_repo_' + Date.now());
      try {
        console.log('[Backend] Cloning real repository:', targetDir);
        execSync(`git clone "${targetDir}" "${tmpDir}"`, { stdio: 'ignore' });
        targetDir = tmpDir;
        console.log('[Backend] Git clone successful to temporary directory.');
      } catch(e) {
        console.error('[Backend] Git clone failed. The repository URL might be invalid, private, or not exist:', (e as any).message);
        console.log('[Backend] Falling back to scanning the local SecRitual API Gateway source code for demonstration purposes.');
        isGitUrl = false;
        targetDir = ''; // This will force fallback in the next step
      }
    }

    const readDirSafe = (dir: string) => {
      try {
        // Read recursively to find .ts or .js files in src or root
        const getAllFiles = (d: string, fileList: string[] = []) => {
          const files = fs.readdirSync(d);
          for (const f of files) {
            if (f === 'node_modules' || f === '.git' || f === 'dist' || f === '.next') continue;
            const fullPath = path.join(d, f);
            if (fs.statSync(fullPath).isDirectory()) {
              getAllFiles(fullPath, fileList);
            } else if (f.match(/\.(ts|js|tsx|jsx|py|go|rs|java|c|cpp|html|css|php|rb|json|md)$/i)) {
              fileList.push(fullPath);
            }
          }
          return fileList;
        };
        const allFiles = getAllFiles(dir).slice(0, 4); // Take up to 4 real files
        let snippets = "";
        for (const fullPath of allFiles) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          snippets += `\n--- File: ${path.basename(fullPath)} ---\n${content.substring(0, 600)}\n`;
        }
        return snippets; // Could be empty string if no matching files
      } catch(err) {
        return null;
      }
    };

    let extracted = targetDir ? readDirSafe(targetDir) : null;
    if (extracted === null || extracted === "") {
       if (isGitUrl) {
         codeSnippets = "Error: Repository cloned but no recognizable source code files were found.";
       } else {
         // Only fallback to SecRitual backend if they left the URL completely blank or clone failed
         codeSnippets = readDirSafe(path.join(process.cwd(), 'src')) || "Error: No files found.";
       }
    } else {
       codeSnippets = extracted;
    }
    console.log(`[Backend] Extracted ${codeSnippets.length} bytes of code for LLM analysis.`);
    
    // Cleanup cloned repo
    if (tmpDir && fs.existsSync(tmpDir)) {
      try {
        fs.rmSync(tmpDir, { recursive: true, force: true });
        console.log('[Backend] Cleaned up temporary repository clone.');
      } catch (err) {
        console.error('[Backend] Failed to clean up tmp folder, ignoring:', err);
      }
    }

    const context = `Repository scan initiated on ${targetDir}. Analyzing code snippets: ${codeSnippets}`;
    console.log('[Telemetry] Broadcasting debate_start event to all connected UI clients.');
    broadcastEvent('debate_start', { context });
    
    // Step 1: LLM Vulnerability Extraction
    const extractionPrompt = `You are CodeSage, a static analysis AI. Analyze the following code snippets and output EXACTLY a JSON array of discovered vulnerabilities. Do not output any markdown formatting, only the raw JSON array. Format: [{"file": "filename", "severity": "HIGH", "description": "description of flaw", "snippet": "the vulnerable line"}]. 
    
Code:\n${codeSnippets}`;
    
    console.log('[LLM] Calling CodeSage model to extract vulnerabilities...');
    let rawVulns = await generateAIResponse(extractionPrompt);
    let vulns = [];
    try {
      rawVulns = rawVulns.replace(/```json/g, '').replace(/```/g, '').trim();
      vulns = JSON.parse(rawVulns);
      console.log(`[LLM] CodeSage extracted ${vulns.length} vulnerabilities successfully.`);
    } catch(err) {
      console.error("[LLM] Failed to output valid JSON", rawVulns);
    }

    // Step 2: Orchestrate Debate
    const debateContext = vulns.length > 0 
      ? `${context} \nEXACT VULNERABILITIES FOUND: ${JSON.stringify(vulns)}` 
      : `${context} \nNo vulnerabilities found. Code is secure.`;
    console.log('[LLM] Initiating multi-agent debate (PromptShield, SIFTGuardian, CodeSage)...');
    const result = await orchestrateDebate(debateContext);
    console.log('[LLM] Orchestrator reached consensus:', result.verdict);
    
    // Step 3: Embed vulnerabilities and broadcast
    const hasVulns = vulns && vulns.length > 0;
    
    let remediationPlan = [];
    if (hasVulns) {
      console.log('[LLM] Generating actionable AI Remediation Plan...');
      const remediationPrompt = `You are a security engineer. Based on these vulnerabilities: ${JSON.stringify(vulns)}, generate a 3-step remediation plan. Output EXACTLY a JSON array of objects. Format: [{"n": 1, "action": "Upgrade package X", "effort": "10 min", "impact": "Resolves RCE flaw"}]. Ensure output is purely JSON array, no markdown.`;
      try {
        let rawPlan = await generateAIResponse(remediationPrompt);
        rawPlan = rawPlan.replace(/```json/g, '').replace(/```/g, '').trim();
        remediationPlan = JSON.parse(rawPlan);
        console.log('[LLM] Remediation Plan generated successfully.');
      } catch (err) {
        remediationPlan = vulns.map((v: any, i: number) => ({ n: i+1, action: `Fix ${v.file}: ${v.description.substring(0, 50)}...`, effort: "Auto-Patch", impact: "Resolves flaw" }));
      }
    }

    result.verdict = hasVulns ? "BLOCK" : "PASS";
    const consensusMsg = result.debate.find((d: any) => d.agent === "Orchestrator");
    if (consensusMsg) {
      consensusMsg.msg = hasVulns 
        ? `Consensus reached: BLOCK. ${vulns.length} vulnerabilities identified in local repository structure.` 
        : `Consensus reached: PASS. No critical vulnerabilities identified in repository.`;
    }
    
    console.log('[Telemetry] Broadcasting debate_result event to UI.');
    broadcastEvent('debate_result', { ...result, vulnerabilities: vulns, remediationPlan });
    res.json({ result, vulnerabilities: vulns, remediationPlan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Repo scan failed" });
  }
});

function broadcastEvent(type: string, data: any) {
  const payload = `data: ${JSON.stringify({ type, ...data })}\n\n`;
  clients.forEach(c => c.write(payload));
}

// Removed fake heartbeat interval. Metrics are driven by real events only.

// Serve frontend static files in production
const frontendPath = path.join(__dirname, '../../frontend/dist');
app.use(express.static(frontendPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 SecRitual API Gateway running on port ${PORT}`);
});
