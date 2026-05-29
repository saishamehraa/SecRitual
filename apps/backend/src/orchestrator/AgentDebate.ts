import { generateAIResponse } from '../services/ai';

export async function orchestrateDebate(threatContext: string) {
  console.log("Starting Agent Debate on context:", threatContext);

  const promptShieldAnalysis = await generateAIResponse(
    `You are PromptShield, an AI firewall. Analyze this context and output a short 1-sentence verdict on prompt safety: ${threatContext}`
  );

  const siftGuardianAnalysis = await generateAIResponse(
    `You are SIFTGuardian, a CVE tracker. Based on PromptShield's verdict (${promptShieldAnalysis}) and context (${threatContext}), give a 1-sentence assessment of active exploit risks.`
  );

  const codeSageAnalysis = await generateAIResponse(
    `You are CodeSage, a static analysis AI. Given the threat context (${threatContext}), output a 1-sentence vulnerability impact.`
  );

  const consensus = await generateAIResponse(
    `You are the Orchestrator. Summarize the following agent debate into a final 1-sentence Deployment Verdict (must start with "Consensus reached: BLOCK" or "Consensus reached: PASS").
    PromptShield: ${promptShieldAnalysis}
    SIFTGuardian: ${siftGuardianAnalysis}
    CodeSage: ${codeSageAnalysis}`
  );

  return {
    debate: [
      { agent: "PromptShield", msg: promptShieldAnalysis },
      { agent: "SIFTGuardian", msg: siftGuardianAnalysis },
      { agent: "CodeSage", msg: codeSageAnalysis },
      { agent: "Orchestrator", msg: consensus }
    ],
    verdict: consensus.includes("BLOCK") ? "BLOCK" : "PASS"
  };
}
