import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { Observable, Subject } from 'rxjs';
import type { UniversalEventData, UniversalEventType } from 'sandbox-agent';
import { BackendConfig } from '#backend/config/backend-config';

export interface AgentPubSubEvent {
  eventId: string;
  sequence: number;
  type: UniversalEventType;
  eventData: UniversalEventData;
}

@Injectable()
export class AgentPubSubService implements OnModuleDestroy {
  private client: Redis;

  constructor(private cs: ConfigService<BackendConfig>) {
    let valkeyHost =
      this.cs.get<BackendConfig['backendValkeyHost']>('backendValkeyHost');

    let valkeyPassword = this.cs.get<BackendConfig['backendValkeyPassword']>(
      'backendValkeyPassword'
    );

    this.client = new Redis({
      host: valkeyHost,
      port: 6379,
      password: valkeyPassword
    });
  }

  private channelName(sessionId: string): string {
    return `agent-events:${sessionId}`;
  }

  async publish(sessionId: string, event: AgentPubSubEvent): Promise<void> {
    await this.client.publish(
      this.channelName(sessionId),
      JSON.stringify(event)
    );
  }

  subscribe(sessionId: string): Observable<AgentPubSubEvent> {
    let channel = this.channelName(sessionId);
    let subject = new Subject<AgentPubSubEvent>();

    let sub = this.client.duplicate();

    sub.subscribe(channel).then(() => {
      sub.on('message', (_ch: string, message: string) => {
        subject.next(JSON.parse(message) as AgentPubSubEvent);
      });
    });

    return new Observable<AgentPubSubEvent>(observer => {
      let subscription = subject.subscribe(observer);

      return () => {
        subscription.unsubscribe();
        sub.unsubscribe(channel).then(() => sub.quit());
      };
    });
  }

  onModuleDestroy() {
    this.client.disconnect();
  }
}
