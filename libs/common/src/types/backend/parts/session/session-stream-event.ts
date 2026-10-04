import type { Event } from '@opencode-ai/sdk/v2';
import {
  RELOAD_SESSION_EVENT_TYPE,
  SESSION_TITLE_UPDATED_EVENT_TYPE
} from '#common/constants/top';
import type { SessionTabCreatedEvent } from './session-tab-created-event';

export type MproveReloadSessionEvent = {
  id: string;
  type: typeof RELOAD_SESSION_EVENT_TYPE;
  properties: Record<string, never>;
};

export type MproveSessionTitleUpdatedEvent = {
  id: string;
  type: typeof SESSION_TITLE_UPDATED_EVENT_TYPE;
  properties: {
    sessionID: string;
    title: string;
  };
};

export type OpenCodeServerHeartbeatEvent = {
  id: string;
  type: 'server.heartbeat';
  properties: Record<string, never>;
};

export type SessionStreamEvent =
  | Event
  | SessionTabCreatedEvent
  | MproveReloadSessionEvent
  | MproveSessionTitleUpdatedEvent
  | OpenCodeServerHeartbeatEvent;
