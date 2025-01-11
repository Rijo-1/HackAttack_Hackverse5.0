export const validateTeamCode = (code: string): boolean => {
  const pattern = /^[A-Z0-9]{8}$/;
  return pattern.test(code);
};

export const validateTeamSize = (currentSize: number): boolean => {
  return currentSize < 10;
};

export const generateTeamCode = (): string => {
  const generateSegment = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    return Array.from({ length: 8 }, () => 
      chars.charAt(Math.floor(Math.random() * chars.length))
    ).join('');
  };

  return `${generateSegment()}`;
};