import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES6 equivalent for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load FAQ map
let FAQ_MAP = {};
try {
  const raw = fs.readFileSync(path.join(process.cwd(), "faq.json"), "utf8");
  FAQ_MAP = JSON.parse(raw);
  console.log("[chat] FAQ map loaded, entries:", Object.keys(FAQ_MAP).length);
} catch (e) {
  console.warn("[chat] Could not load faq.json — continuing without FAQ map", e.message);
}

function findFaqSnippet(message) {
  if (!message) return null;
  const lower = message.toLowerCase();
  console.log("[chat] Searching for keyword in:", lower);
  
  // Check each FAQ entry
  for (const key of Object.keys(FAQ_MAP)) {
    const entry = FAQ_MAP[key];
    if (!entry || !entry.keywords) continue;
    
    console.log(`[chat] Checking FAQ key: ${key} with keywords:`, entry.keywords);
    
    for (const kw of entry.keywords) {
      // More flexible matching - check if any keyword appears in the message
      if (lower.includes(kw.toLowerCase())) {
        console.log(`[chat] ✅ MATCH FOUND: '${kw}' in '${lower}'`);
        return { key, snippet: entry.snippet, action: entry.action || null };
      }
    }
  }
  
  console.log("[chat] ❌ No FAQ match found");
  return null;
}

// Simple responses for common non-FAQ questions
const getSimpleResponse = (message) => {
  const lower = message.toLowerCase();
  
  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
    return "Hello! I'm your education support assistant. How can I help you with donations, campaigns, or school information?";
  }
  
  if (lower.includes('thank')) {
    return "You're welcome! Is there anything else I can help you with?";
  }
  
  if (lower.includes('help')) {
    return "I can help you with donations, campaigns, school registration, tax benefits, and impact reports. What would you like to know?";
  }
  
  if (lower.includes('bye') || lower.includes('goodbye')) {
    return "Goodbye! Feel free to ask if you need any help with education support.";
  }
  
  return null;
};

export const handleChat = async (req, res) => {
  console.log("🎯 [chat] POST /api/chat route HIT successfully!");
  console.log("[chat] Request body:", req.body);
  
  try {
    const { message, context } = req.body;
    
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "No message provided" });
    }

    console.log(`[chat] Processing message: "${message}"`);

    // Try FAQ first
    const faqMatch = findFaqSnippet(message);
    
    if (faqMatch) {
      console.log(`[chat] ✅ Using FAQ response for: ${faqMatch.key}`);
      const response = {
        reply: faqMatch.snippet,
        actions: faqMatch.action ? [faqMatch.action] : []
      };
      console.log("[chat] Response:", response);
      return res.json(response);
    }

    // Try simple responses
    const simpleResponse = getSimpleResponse(message);
    if (simpleResponse) {
      console.log("[chat] ✅ Using simple response");
      return res.json({ reply: simpleResponse, actions: [] });
    }

    // Fallback response
    console.log("[chat] ⚠️ Using fallback response");
    const fallbackResponse = {
      reply: "I understand you're asking about: '" + message + "'. For detailed assistance with donations, campaigns, school registration, or tax benefits, please check the relevant sections in the app or browse our FAQ.",
      actions: []
    };
    
    return res.json(fallbackResponse);

  } catch (err) {
    console.error("[chat] ❌ Server error:", err?.message || err);
    return res.status(500).json({ 
      error: "Server error", 
      details: err.message 
    });
  }
};