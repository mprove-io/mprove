export type McpApiKeyParsed =
  | {
      apiKeyType: 'PK';
      userId: string;
    }
  | {
      apiKeyType: 'SK';
      projectId: string;
      repoId: string;
      branchId: string;
      envId: string;
    };
