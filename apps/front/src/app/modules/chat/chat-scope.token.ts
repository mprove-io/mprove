import { InjectionToken } from '@angular/core';
import type { ChatScope } from '#front/app/modules/chat/chat-scope';

export type { ChatScope } from '#front/app/modules/chat/chat-scope';

export const CHAT_SCOPE = new InjectionToken<ChatScope>('CHAT_SCOPE');
