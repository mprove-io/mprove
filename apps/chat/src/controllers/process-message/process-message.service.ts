import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createOpencodeClient,
  type OpencodeClient
} from '@opencode-ai/sdk/client';
import { ChatConfig } from '#chat/config/chat-config';
import { ChatMessageRoleEnum } from '#common/enums/chat-message-role.enum';
import { ErEnum } from '#common/enums/er.enum';
import { ChatMessage } from '#common/interfaces/chat/chat-message';
import { ChatState } from '#common/interfaces/chat/chat-state';
import {
  ToChatProcessMessageRequest,
  ToChatProcessMessageResponsePayload
} from '#common/interfaces/to-chat/to-chat-process-message';
import { ServerError } from '#common/models/server-error';

@Injectable()
export class ProcessMessageService {
  private readonly logger = new Logger(ProcessMessageService.name);

  constructor(private readonly cs: ConfigService<ChatConfig>) {}

  async process(
    request: ToChatProcessMessageRequest
  ): Promise<ToChatProcessMessageResponsePayload> {
    const { message, startState } = request.payload;

    let client: OpencodeClient;
    let sessionId: string | undefined;

    try {
      // 1. Connect to existing OpenCode server (from docker-compose)
      const host =
        this.cs.get<ChatConfig['chatOpencodeHost']>('chatOpencodeHost') ||
        '127.0.0.1';
      const port =
        this.cs.get<ChatConfig['chatOpencodePort']>('chatOpencodePort') || 4096;

      client = createOpencodeClient({
        baseUrl: `http://${host}:${port}`
      });

      // 3. Create isolated session for this request
      const sessionResponse = await client.session.create({
        body: { title: `chat-${Date.now()}` }
      });

      // Extract session from typed response
      if ('error' in sessionResponse && sessionResponse.error) {
        throw new ServerError({
          message: ErEnum.CHAT_CREATE_SESSION_FAILED,
          originalError: sessionResponse.error
        });
      }
      sessionId = sessionResponse.data?.id;

      if (!sessionId) {
        throw new ServerError({
          message: ErEnum.CHAT_SESSION_ID_NOT_RETURNED
        });
      }

      // 4. Build full prompt from history + current message
      let fullPrompt = '';
      if (startState?.messages?.length) {
        fullPrompt = startState.messages
          .map(
            (msg: ChatMessage) =>
              `${msg.role === ChatMessageRoleEnum.User ? 'User' : 'Assistant'}: ${msg.content}`
          )
          .join('\n\n');
        fullPrompt += '\n\n';
      }
      fullPrompt += `User: ${message}`;

      // 5. Send the prompt to the session (blocking - waits for response)
      const promptResponse = await client.session.prompt({
        path: { id: sessionId },
        body: {
          parts: [{ type: 'text', text: fullPrompt }]
        }
      });

      // 6. Extract answer from typed response
      if ('error' in promptResponse && promptResponse.error) {
        throw new ServerError({
          message: ErEnum.CHAT_PROMPT_FAILED,
          originalError: promptResponse.error
        });
      }

      let answer = '';
      const parts = promptResponse.data?.parts;
      if (parts) {
        for (const part of parts) {
          if (part?.type === 'text' && 'text' in part) {
            answer += part.text;
          }
        }
      }

      if (!answer) {
        throw new ServerError({
          message: ErEnum.CHAT_ANSWER_IS_EMPTY
        });
      }

      // 8. Build updated conversation state
      const previousMessages: ChatMessage[] = startState?.messages || [];
      const endState: ChatState = {
        messages: [
          ...previousMessages,
          { role: ChatMessageRoleEnum.User, content: message },
          { role: ChatMessageRoleEnum.Assistant, content: answer.trim() }
        ]
      };

      return { answer: answer.trim(), endState };
    } catch (e: any) {
      this.logger.error('OpenCode processing failed', {
        error: e.message,
        stack: e.stack,
        sessionId
      });

      throw new ServerError({
        message: ErEnum.CHAT_OPENCODE_ERROR,
        originalError: e
      });
    } finally {
      // 7. Always clean up the session
      if (client && sessionId) {
        try {
          await client.session.delete({ path: { id: sessionId } });
        } catch (cleanupErr) {
          /* ignore cleanup errors */
        }
      }
    }
  }
}
