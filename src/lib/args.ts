export function getArg(args: string[], name: string): string | undefined {
  // Supports --key=value and --key value
  const idx = args.findIndex((a) => a === name || a.startsWith(name + '='));
  if (idx === -1) return undefined;
  const token = args[idx];
  if (token.includes('=')) return token.split('=')[1];
  return args[idx + 1];
}

