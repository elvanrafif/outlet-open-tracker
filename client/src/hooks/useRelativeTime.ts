import { useMemo } from 'react';

export const useRelativeTime = (targetDate: string | Date) => {
  return useMemo(() => {
    const target = new Date(targetDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDaysTotal = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDaysTotal < 0) return "Sudah terlewati";
    if (diffDaysTotal === 0) return "Hari ini!";

    const years = Math.floor(diffDaysTotal / 365);
    const months = Math.floor((diffDaysTotal % 365) / 30);
    const days = diffDaysTotal % 30;

    let result = "";
    if (years > 0) result += `${years} thn `;
    if (months > 0) result += `${months} bln `;
    if (days > 0 || result === "") result += `${days} hari`;

    return `${result.trim()} lagi`;
  }, [targetDate]);
};
