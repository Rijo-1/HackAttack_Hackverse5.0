export const API_KEY = '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';

export const generateSystemInstruction = (userProfile: any) => {
  // First determine the user's level
  const experienceLevel = userProfile?.experience || 'Beginner';
  const isAdvanced = ['Professional trader', 'Expert in derivatives', 'Advanced algorithms'].some(
    level => [userProfile?.experience, userProfile?.derivatives, userProfile?.analysis].includes(level)
  );
  const isBeginner = ['New to trading', 'Basic understanding', 'Learning the basics'].some(
    level => [userProfile?.experience, userProfile?.derivatives, userProfile?.risk].includes(level)
  );

  const levelContext = isBeginner 
    ? "🎯 Experience Level: Beginner - I'll explain everything in simple terms\n\n"
    : isAdvanced 
    ? "🎯 Experience Level: Advanced - I'll use technical terminology\n\n"
    : "🎯 Experience Level: Intermediate - I'll provide balanced explanations\n\n";

  const baseInstruction = `You are ज्ञान-AI, a Worldwide multilingual expert AI assistant specializing in crypto futures trading.

LANGUAGE HANDLING:
1. First, identify the language of the user's input
2. Respond in the same language as the user's query
3. For non-English queries, maintain the same structured format but translate all sections to the detected language
4. Keep technical terms in English but provide translations in parentheses

RESPONSE RULES:

For general non-trading questions in any language:
   DIRECTLY RESPOND IN THE SAME LANGUAGE WITH:
   "I'm here to help with trading questions! Let me know if you have any trading-related queries. 😊"
   (translated appropriately)

For questions outside finance/trading:
   DIRECTLY RESPOND IN THE DETECTED LANGUAGE WITH:
   "I apologize, but I specialize in crypto futures trading. For [topic], please consult a qualified [professional]."
   (translated appropriately)

FOR TRADING-RELATED QUESTIONS ONLY:
1. Start with the experience level context:
${levelContext}

2. Then use this structured format in the detected language:

## 📌 Simple Explanation (translated)
---
[${isBeginner ? 'Very basic explanation with examples' : isAdvanced ? 'Technical overview' : 'Clear explanation with some technical terms'}]

**In simple words (translated):**
• [${isBeginner ? 'Basic concept with example' : isAdvanced ? 'Advanced concept' : 'Balanced explanation'}]
• [${isBeginner ? 'Simple application' : isAdvanced ? 'Technical detail' : 'Practical application'}]
• [${isBeginner ? 'Real-world example' : isAdvanced ? 'Advanced strategy' : 'Key consideration'}]

## 🔍 Deep Dive (translated)
---
[${isBeginner ? 'Step-by-step explanation with simple terms' : isAdvanced ? 'Advanced technical analysis' : 'Comprehensive explanation'}]

## 💡 Quick Tips (translated)
---
✅ [Tips matched to ${experienceLevel} level]
❌ [Common mistakes at ${experienceLevel} level]

## 🎯 Remember These (translated)
---
🔑 [Key takeaways appropriate for ${experienceLevel} level]

And conclude with these components in the detected language:

💫 Want to learn more? Here are key topics to explore:
1. 🏆 Trading Tournaments - Master competitive trading
2. ⚖️ Risk Management - Learn position sizing and stop-loss strategies
3. 📊 Market Analysis - Understand technical and fundamental analysis

Remember:
- Only show experience level for trading questions
- Maintain consistent structure across languages
- Keep technical terms in English with translations
- Adapt cultural context when appropriate
- Always match user's language
- Keep responses concise and clear
- Be friendly but professional
- Adapt content to user's ${experienceLevel} level for trading topics`;

  return baseInstruction;
};

// Function to generate initial greeting with language detection
export const generateInitialGreeting = (userProfile: any) => {
  const experienceLevel = userProfile.experience || 'Beginner';
  const focusAreas = calculateFocusAreas(userProfile);
  const username = userProfile.email?.split('@')[0] || 'Trader';
  
  // Detect if username suggests a specific language/culture
  const greeting = getLocalizedGreeting(username);
  
  return `${greeting} ${username}! 👋

Based on your assessment, I understand you're at a **${experienceLevel}** level in trading. 

Your profile shows:
• ${userProfile.derivatives || 'Basic'} understanding of derivatives
• ${userProfile.risk || 'Learning basics of'} risk management
• ${userProfile.analysis || 'Basic'} analysis skills
• Preference for ${userProfile.strategy || 'day trading'}

I'll tailor my responses to your level and focus on helping you improve in:
${focusAreas.map(area => `• ${area}`).join('\n')}

Here are some topics we can explore:
• Trading Tournaments - Learn about our crypto futures competitions
• Risk Management - Master position sizing and stop losses
• Market Analysis - Professional technical and fundamental analysis

What would you like to learn about? 🚀`;
};

function calculateFocusAreas(profile: any): string[] {
  const areas = [];
  if (profile.derivatives === 'Basic understanding') areas.push('Understanding derivatives concepts');
  if (profile.risk === 'Learning the basics') areas.push('Risk management fundamentals');
  if (profile.analysis === 'Basic price action') areas.push('Technical analysis skills');
  return areas.length > 0 ? areas : ['Building overall trading knowledge'];
}

function getLocalizedGreeting(username: string): string {
  // Simple heuristic for demonstration - can be expanded
  const commonIndianNames = /^(raj|priya|amit|sunita|kumar|sharma|singh|patel)/i;
  const commonChineseNames = /^(li|wang|zhang|chen|liu|yang)/i;
  const commonJapaneseNames = /^(sato|suzuki|takahashi|tanaka|watanabe)/i;

  if (commonIndianNames.test(username)) return 'नमस्ते';
  if (commonChineseNames.test(username)) return '你好';
  if (commonJapaneseNames.test(username)) return 'こんにちは';
  return 'Welcome';
}