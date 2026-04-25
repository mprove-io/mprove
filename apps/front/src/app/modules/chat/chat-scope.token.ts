import { InjectionToken } from '@angular/core';

export type ChatScope = 'builder' | 'explorer';

export const CHAT_SCOPE = new InjectionToken<ChatScope>('CHAT_SCOPE');
