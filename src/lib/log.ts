/**
 * Simple logging utility
 */
export function log(message: string): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
}

export function logError(message: string, error?: unknown): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] ERROR: ${message}`);
  if (error) {
    console.error(error);
  }
}

export function logSuccess(message: string): void {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ✓ ${message}`);
}

export function logWarning(message: string): void {
  const timestamp = new Date().toISOString();
  console.warn(`[${timestamp}] ⚠ ${message}`);
}