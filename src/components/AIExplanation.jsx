import React, { useState, useEffect, useRef } from 'react';

const buildPrompt = (score, tier, reasons, timePeriod, userType, routeType) => `
You are SafeRoute AI's safety narrator. Generate exactly ONE sentence
explaining why this ${routeType} route is ${tier} for a ${userType} 
traveler ${timePeriod === "night" ? "late at night" : (timePeriod === "evening" ? "this evening" : "right now")}.

Safety data:
- Score: ${score}/100 (${tier})
- Key factors: ${reasons.join(", ")}

Rules:
- Maximum 28 words
- Sound like a trusted local friend, not a robot
- Reference the time of day naturally
- Only mention userType if it's not "default"
- Never use the words "safety score", "algorithm", or numbers
- Start with "This route" or "Your route"
- No punctuation at end

Output: the sentence only. Nothing else.
`;

const AIExplanation = ({ route, routeType }) => {
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const cache = useRef(new Map());

  useEffect(() => {
    if (!route) return;
    const { score, tier, reasons, timePeriod, userType } = route;
    const cacheKey = `${userType}-${tier}-${timePeriod}-${routeType}`;
    
    if (cache.current.has(cacheKey)) {
      setExplanation(cache.current.get(cacheKey));
      return;
    }

    const fetchExplanation = async () => {
      setLoading(true);
      try {
        const apiKey = import.meta.env.VITE_GEMINI_KEY;
        if (!apiKey) throw new Error("No Gemini key");

        const prompt = buildPrompt(score, tier, reasons, timePeriod, userType, routeType);
        
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             contents: [{ parts: [{ text: prompt }] }],
             generationConfig: { maxOutputTokens: 60, temperature: 0.7 }
          })
        });
        
        const data = await res.json();
        const text = data.candidates[0].content.parts[0].text.trim();
        cache.current.set(cacheKey, text);
        setExplanation(text);
      } catch (err) {
        const fallback = reasons && reasons.length > 0 ? reasons[0] : "This route balances safety parameters for your trip.";
        cache.current.set(cacheKey, fallback);
        setExplanation(fallback);
      } finally {
        setLoading(false);
      }
    };

    fetchExplanation();
  }, [route, routeType]);

  const style = {
    fontSize: '13px',
    lineHeight: 1.4,
    color: 'var(--text-primary)',
    background: 'rgba(255, 255, 255, 0.03)',
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
    borderLeft: `2px solid var(--${route.tier?.toLowerCase() || 'safe'})`,
    marginTop: '12px'
  };

  return (
    <div style={style}>
      <span style={{ color: `var(--${route.tier?.toLowerCase() || 'safe'})`, marginTop: '2px' }}>✨</span>
      {loading ? (
        <span className="ai-loading">Analyzing context<span>.</span><span>.</span><span>.</span></span>
      ) : (
        <span>{explanation}</span>
      )}
      <style>{`
        .ai-loading span { animation: blink 1.4s infinite both; }
        .ai-loading span:nth-child(2) { animation-delay: 0.2s; }
        .ai-loading span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes blink { 0% { opacity: .2; } 20% { opacity: 1; } 100% { opacity: .2; } }
      `}</style>
    </div>
  );
};

export default AIExplanation;
