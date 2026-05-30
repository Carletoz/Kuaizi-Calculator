/** Round a USD value to 2 decimal places. Apply ONLY at output boundary. */
export function roundUSD(value: number): number {
  return Math.round(value * 100) / 100;
}

/** Round a COP value to 0 decimal places. Apply ONLY at output boundary. */
export function roundCOP(value: number): number {
  return Math.round(value);
}
