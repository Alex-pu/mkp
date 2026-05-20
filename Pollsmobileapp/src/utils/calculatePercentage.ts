export const calculatePercentage = (count: number, total: number) => {
  if (!total) {
    return 0;
  }

  return Math.round((count / total) * 100);
};