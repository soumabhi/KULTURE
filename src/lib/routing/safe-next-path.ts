export function sanitizeNextPath(input: string | null | undefined): string {
  if (!input || input.trim().length === 0) {
    return "/app";
  }

  if (!input.startsWith("/")) {
    return "/app";
  }

  if (input.startsWith("//")) {
    return "/app";
  }

  return input;
}
