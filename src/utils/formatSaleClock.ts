const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

const clockParts = (date: Date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return {
    date: `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`,
    time: `${hours}:${minutes}`,
  };
};

export const formatSaleClock = (date: Date): string => {
  const parts = clockParts(date);
  return `${parts.date} · ${parts.time}`;
};

export const formatHeaderClock = (date: Date): string => {
  const parts = clockParts(date);
  return `${parts.date}  ·  ${parts.time}`;
};
