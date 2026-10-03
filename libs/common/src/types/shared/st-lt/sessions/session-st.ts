export type SessionSt = {
  sandboxId?: string;
  sandboxBaseUrl?: string;
  opencodeSessionId?: string;
  opencodePassword?: string;
  firstMessage?: string;
  apiKeySecretHash?: string;
  apiKeySalt?: string;
  providerConfigHash?: string;
  closedExplorerTabIds?: string[];
};
