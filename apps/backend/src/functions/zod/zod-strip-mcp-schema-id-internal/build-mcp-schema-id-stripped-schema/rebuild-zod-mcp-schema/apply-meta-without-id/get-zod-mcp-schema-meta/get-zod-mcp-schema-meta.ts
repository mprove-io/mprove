export function getZodMcpSchemaMeta(
  schema: unknown
): Record<string, unknown> | undefined {
  return (
    schema as {
      meta?: () => Record<string, unknown> | undefined;
    }
  ).meta?.();
}
