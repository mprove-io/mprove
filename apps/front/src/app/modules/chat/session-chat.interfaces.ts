import type { ToolPart } from '@opencode-ai/sdk/v2';
import type { ChatMessageRole } from '#front/app/modules/chat/chat-message-role';
import type { FileDiffStatus } from '#front/app/modules/chat/file-diff-status';

export interface FileDiffInfo {
  file: string;
  additions: number;
  deletions: number;
  status?: FileDiffStatus;
  patch?: string;
}

export interface ChatMessage {
  role: ChatMessageRole;
  text: string;
  toolPart?: ToolPart;
  agentName?: string;
  modelId?: string;
  variant?: string;
  summaryDiffs?: FileDiffInfo[];
  systemPrompt?: string;
}

export interface ChatTurn {
  userMessage?: ChatMessage;
  responses: ChatMessage[];
  fileDiffs?: FileDiffInfo[];
}
