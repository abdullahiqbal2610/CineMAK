// src/utils/dateUtils.js
export const formatDate = (isoString) => {
  if (!isoString) return "";
  return new Date(isoString).toISOString().split("T")[0];
};

export const formatDateTime = (isoString) => {
  if (!isoString) return "";
  const date = new Date(isoString);
  const datePart = date.toISOString().split("T")[0];
  const timePart = date.toTimeString().split(" ")[0].substring(0, 5);
  return `${datePart} ${timePart}`;
};
 