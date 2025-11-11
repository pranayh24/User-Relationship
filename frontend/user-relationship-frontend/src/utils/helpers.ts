export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const generateGraphLayout = (
  userCount: number,
  canvasWidth: number = 1200,
  canvasHeight: number = 800
) => {
  const positions: Record<number, { x: number; y: number }> = {};
  const centerX = canvasWidth / 2;
  const centerY = canvasHeight / 2;
  const radius = Math.min(canvasWidth, canvasHeight) / 3;

  for (let i = 0; i < userCount; i++) {
    const angle = (i / userCount) * 2 * Math.PI;
    positions[i] = {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  }

  return positions;
};

export const getAllUniqueSuggestions = (users: any[]): string[] => {
  const hobbiesSet = new Set<string>();
  users.forEach((user) => {
    user.hobbies?.forEach((hobby: string) => {
      hobbiesSet.add(hobby);
    });
  });
  return Array.from(hobbiesSet).sort();
};

