export async function resolve(specifier, context, nextResolve) {
  // Let Node handle builtins and bare npm package specifiers directly
  if (
    specifier.startsWith('node:') ||
    (!specifier.startsWith('.') && !specifier.startsWith('#'))
  ) {
    return nextResolve(specifier, context);
  }

  // Already has a recognized extension -- resolve directly
  if (
    specifier.endsWith('.js') ||
    specifier.endsWith('.mjs') ||
    specifier.endsWith('.cjs') ||
    specifier.endsWith('.json')
  ) {
    return nextResolve(specifier, context);
  }

  // Extensionless specifier: try appending .js first
  try {
    return await nextResolve(specifier + '.js', context);
  } catch {
    return nextResolve(specifier, context);
  }
}
