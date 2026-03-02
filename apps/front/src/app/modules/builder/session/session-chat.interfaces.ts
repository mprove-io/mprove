import type { ToolPart } from '@opencode-ai/sdk/v2';

export interface FileDiffInfo {
  file: string;
  additions: number;
  deletions: number;
  status?: 'added' | 'deleted' | 'modified';
  before?: string;
  after?: string;
}

export interface ChatMessage {
  role: 'user' | 'agent' | 'tool' | 'thought' | 'error' | 'compaction';
  text: string;
  toolPart?: ToolPart;
  agentName?: string;
  modelId?: string;
  variant?: string;
  summaryDiffs?: FileDiffInfo[];
}

export interface ChatTurn {
  userMessage?: ChatMessage;
  responses: ChatMessage[];
  fileDiffs?: FileDiffInfo[];
}
