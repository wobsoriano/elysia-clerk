const displayedWarnings = new Set<string>();
export const deprecated = (fnName: string, warning: string, key?: string): void => {
  const hideWarning = process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'production';
  const messageId = key ?? fnName;
  if (displayedWarnings.has(messageId) || hideWarning) {
    return;
  }
  displayedWarnings.add(messageId);

  console.warn(
    `Clerk - DEPRECATION WARNING: "${fnName}" is deprecated and will be removed in the next major release.\n${warning}`,
  );
};
