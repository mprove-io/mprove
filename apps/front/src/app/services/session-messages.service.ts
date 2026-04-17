import { Injectable } from '@angular/core';
import type { ToolPart } from '@opencode-ai/sdk/v2';
import type { SessionApi } from '#common/zod/backend/session-api';
import type { SessionMessageApi } from '#common/zod/backend/session-message-api';
import type { SessionPartApi } from '#common/zod/backend/session-part-api';
import { unwrapErrorMessage } from '#front/app/functions/unwrap-error-message';
import {
  ChatMessage,
  ChatTurn,
  FileDiffInfo
} from '../modules/builder/session/session-chat.interfaces';

@Injectable({ providedIn: 'root' })
export class SessionMessagesService {
  buildTurns(item: { messages: ChatMessage[] }): ChatTurn[] {
    let { messages } = item;

    let turns: ChatTurn[] = [];
    let currentTurn: ChatTurn | undefined;

    messages.forEach(msg => {
      if (msg.role === 'user') {
        currentTurn = {
          userMessage: msg,
          responses: [],
          fileDiffs: msg.summaryDiffs?.length > 0 ? msg.summaryDiffs : undefined
        };
        turns.push(currentTurn);
      } else {
        if (!currentTurn) {
          currentTurn = { responses: [] };
          turns.push(currentTurn);
        }
        currentTurn.responses.push(msg);
      }
    });

    return turns;
  }

  buildMessagesFromStores(item: {
    storeMessages: SessionMessageApi[];
    storeParts: { [messageId: string]: SessionPartApi[] };
    session: SessionApi;
    model: string;
    agent: string;
    variant: string;
  }): ChatMessage[] {
    let { storeMessages, storeParts, session, model, agent, variant } = item;

    let chatMessages: ChatMessage[] = [];

    storeMessages.forEach(msg => {
      let messageId = msg.messageId;
      let role = msg.role;
      let parts = storeParts[messageId] || [];

      if (role === 'user') {
        let found = parts.find(p => p.ocPart?.type === 'text')?.ocPart;
        let text = found?.type === 'text' ? found.text || '' : '';

        // Fallback to session.firstMessage for first user message
        if (!text && session?.firstMessage) {
          let isFirst =
            storeMessages.indexOf(msg) === 0 ||
            storeMessages.filter(m => m.role === 'user').indexOf(msg) === 0;
          if (isFirst) {
            text = session.firstMessage;
          }
        }

        // Extract metadata from ocMessage (UserMessage type)
        let userOcMsg = msg.ocMessage as any;
        let agentName = userOcMsg?.agent || '';
        let modelId = userOcMsg?.model?.modelID || '';
        let rawVariant = userOcMsg?.variant || '';
        let msgVariant = rawVariant !== 'default' ? rawVariant : '';

        // Extract summary diffs
        let summaryDiffs: FileDiffInfo[] | undefined;

        let rawDiffs = userOcMsg?.summary?.diffs;

        if (Array.isArray(rawDiffs) && rawDiffs.length > 0) {
          let seenFiles: string[] = [];
          let diffs: FileDiffInfo[] = [];

          rawDiffs.forEach(d => {
            let idx = seenFiles.indexOf(d.file);
            let diff: FileDiffInfo = {
              file: d.file,
              additions: d.additions,
              deletions: d.deletions,
              status: d.status,
              before: d.before ?? '',
              after: d.after ?? ''
            };
            if (idx < 0) {
              seenFiles.push(d.file);
              diffs.push(diff);
            } else {
              diffs[idx] = diff;
            }
          });

          summaryDiffs = diffs;
        }

        chatMessages.push({
          role: 'user',
          text: text,
          agentName: agentName,
          modelId: modelId,
          variant: msgVariant,
          summaryDiffs: summaryDiffs
        });
      } else {
        // Assistant message - process each part
        let partCount = 0;

        parts.forEach(partApi => {
          let part = partApi.ocPart;
          if (!part) return;

          if (part.type === 'text') {
            if (part.text) {
              chatMessages.push({
                role: 'agent',
                text: part.text
              });
              partCount++;
            }
          } else if (part.type === 'tool') {
            chatMessages.push({
              role: 'tool',
              text: part.tool || 'tool',
              toolPart: part as ToolPart
            });
            partCount++;
          } else if (part.type === 'reasoning') {
            if (part.text) {
              chatMessages.push({
                role: 'thought',
                text: part.text
              });
              partCount++;
            }
          } else if (part.type === 'compaction') {
            chatMessages.push({
              role: 'compaction',
              text: part.auto ? 'Auto-compacted' : 'Compacted'
            });
            partCount++;
          }
        });

        let error = (msg.ocMessage as any)?.error;
        if (error?.name === 'MessageAbortedError') {
          chatMessages.push({ role: 'interrupted', text: 'Interrupted' });
        } else if (partCount === 0 && error) {
          let errorText = unwrapErrorMessage(error.data?.message ?? '');
          chatMessages.push({ role: 'error', text: errorText });
        }
      }
    });

    // If no messages yet but session has firstMessage, show it
    if (chatMessages.length === 0 && session?.firstMessage) {
      let firstModelId =
        model !== 'default' && model.includes('/')
          ? model.substring(model.indexOf('/') + 1)
          : model;
      chatMessages.push({
        role: 'user',
        text: session.firstMessage,
        agentName: agent,
        modelId: firstModelId,
        variant: variant !== 'default' ? variant : ''
      });
    }

    return chatMessages;
  }
}
