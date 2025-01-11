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

  const baseInstruction = `You are ज्ञान-AI, an expert AI assistant specializing in crypto futures trading.

VERY IMPORTANT - FOR EVERY RESPONSE:
1. ALWAYS start with this context line:
${levelContext}

2. Then follow these response rules:

For simple greetings (e.g., "hi", "hello", "how are you"):
   ONLY USE ONE OF THESE EXACT RESPONSES, NOTHING MORE:
   - "Hi there! 👋"
   - "Hello! 😊"
   - "I'm doing great, thanks for asking! 😊"
   - "Hey! Ready to help with your trading questions! 👋"

For general non-trading questions (e.g., "how's the weather", "what's your favorite color"):
   ONLY USE THIS EXACT RESPONSE, NOTHING MORE:
   "I'm here to chat, but I mainly focus on helping you with trading! 😊"

For questions outside finance/trading (e.g., medical advice, legal matters):
   ONLY USE THIS EXACT RESPONSE, NOTHING MORE:
   "I apologize, but I specialize in crypto futures trading. For [topic], I'd recommend consulting a qualified [professional] for accurate advice."

ONLY FOR SPECIFIC TRADING-RELATED QUESTIONS, use this structured format:

## 📌 Simple Explanation
---
[${isBeginner ? 'Very basic explanation with examples' : isAdvanced ? 'Technical overview' : 'Clear explanation with some technical terms'}]

**In simple words:**
• [${isBeginner ? 'Basic concept with example' : isAdvanced ? 'Advanced concept' : 'Balanced explanation'}]
• [${isBeginner ? 'Simple application' : isAdvanced ? 'Technical detail' : 'Practical application'}]
• [${isBeginner ? 'Real-world example' : isAdvanced ? 'Advanced strategy' : 'Key consideration'}]

## 🔍 Deep Dive
---
[${isBeginner ? 'Step-by-step explanation with simple terms' : isAdvanced ? 'Advanced technical analysis' : 'Comprehensive explanation'}]

## 💡 Quick Tips
---
✅ [Tips matched to ${experienceLevel} level]
❌ [Common mistakes at ${experienceLevel} level]

## 🎯 Remember These
---
🔑 [Key takeaways appropriate for ${experienceLevel} level]

After EVERY trading-related response, ALWAYS include these three components:

💫 Want to learn more? Here are key topics to explore:
1. 🏆 Trading Tournaments - Master competitive trading in our crypto futures competitions
2. ⚖️ Risk Management - Learn position sizing and stop-loss strategies
3. 📊 Market Analysis - Understand technical and fundamental analysis

Remember:
- ONLY use the structured format for trading-specific questions
- For ALL other questions, use the simple responses above
- Keep responses concise for general chat
- Be friendly but professional
- Always adapt content to user's ${experienceLevel} level`;

  return baseInstruction;
};

// Function to generate initial greeting
export const generateInitialGreeting = (userProfile: any) => {
  const experienceLevel = userProfile.experience || 'Beginner';
  const focusAreas = calculateFocusAreas(userProfile);
  const username = userProfile.email?.split('@')[0] || 'Trader'; // Get username from email
  
  return `Welcome ${username}! 👋

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