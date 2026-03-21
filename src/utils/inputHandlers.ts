export const allowOnlyNumbers = (e: React.KeyboardEvent<HTMLInputElement>) => {
  const key = e.key;

  // Allow control keys
  if (
    key === "Backspace" ||
    key === "Delete" ||
    key === "ArrowLeft" ||
    key === "ArrowRight" ||
    key === "Tab"
  ) {
    return;
  }

  // Block everything except digits 0–9
  if (!/^[0-9]$/.test(key)) {
    e.preventDefault();
  }
};

export const blockNumbersInText = (
  e: React.KeyboardEvent<HTMLInputElement>,
) => {
  const key = e.key;

  // Allow control keys
  if (
    key === "Backspace" ||
    key === "Delete" ||
    key === "ArrowLeft" ||
    key === "ArrowRight" ||
    key === "Tab"
  ) {
    return;
  }

  // Block digits 0–9
  if (/^[0-9]$/.test(key)) {
    e.preventDefault();
  }
};
