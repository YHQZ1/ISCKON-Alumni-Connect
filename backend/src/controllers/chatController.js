import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let FAQ_MAP = {};

try {
  const raw = fs.readFileSync(path.join(process.cwd(), "faq.json"), "utf8");
  FAQ_MAP = JSON.parse(raw);
} catch (e) {
  FAQ_MAP = {};
}

function findFaqSnippet(message) {
  if (!message) return null;
  const lower = message.toLowerCase();
  
  for (const key of Object.keys(FAQ_MAP)) {
    const entry = FAQ_MAP[key];
    if (!entry?.keywords) continue;
    
    for (const kw of entry.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return { key, snippet: entry.snippet, action: entry.action || null };
      }
    }
  }
  
  return null;
}

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
  try {
    const { message, context } = req.body;
    
    if (!message?.trim()) {
      return res.status(400).json({ error: "No message provided" });
    }

    const faqMatch = findFaqSnippet(message);
    
    if (faqMatch) {
      const response = {
        reply: faqMatch.snippet,
        actions: faqMatch.action ? [faqMatch.action] : []
      };
      return res.json(response);
    }

    const simpleResponse = getSimpleResponse(message);
    if (simpleResponse) {
      return res.json({ reply: simpleResponse, actions: [] });
    }

    const fallbackResponse = {
      reply: "I understand you're asking about: '" + message + "'. For detailed assistance with donations, campaigns, school registration, or tax benefits, please check the relevant sections in the app or browse our FAQ.",
      actions: []
    };
    
    return res.json(fallbackResponse);

  } catch (err) {
    return res.status(500).json({ 
      error: "Server error"
    });
  }
};