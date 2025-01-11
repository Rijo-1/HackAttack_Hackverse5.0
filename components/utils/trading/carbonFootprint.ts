// Calculate carbon footprint based on trade amount and type
export const calculateCarbonFootprint = (tradeAmount: number, leverage: number): number => {
  // Base carbon footprint per USD traded (in grams of CO2)
  const baseCarbonPerUSD = 0.0012;
  
  // Higher leverage means more energy consumption due to increased computational needs
  const leverageMultiplier = Math.log(leverage + 1);
  
  return tradeAmount * baseCarbonPerUSD * leverageMultiplier;
};

// Calculate greenness score (0-100)
export const calculateGreennessScore = (carbonFootprint: number): number => {
  // Define thresholds (in grams of CO2)
  const maxAcceptableFootprint = 1000;
  
  const score = Math.max(0, 100 - (carbonFootprint / maxAcceptableFootprint * 100));
  return Math.round(score);
};

// Calculate final points considering both profit and carbon footprint
export const calculateFinalPoints = (
  pnl: number, 
  carbonFootprint: number
): number => {
  const profitScore = Math.max(0, pnl * 100); // Convert profit to base points
  const greennessScore = calculateGreennessScore(carbonFootprint);
  
  // Weight: 30% profit, 70% greenness
  return Math.round((profitScore * 0.3) + (greennessScore * 0.7));
}; 