import type { PromptResponse } from '@agentclientprotocol/sdk';
import type { AgentEvent } from '#backend/services/agent.service';

export async function forTestsWaitForTurnEnded(item: {
  events: AgentEvent[];
  count: number;
  maxRetries: number;
}): Promise<void> {
  for (let i = 0; i < item.maxRetries; i++) {
    let ended = item.events.filter(
      (agentEvent: AgentEvent) =>
        agentEvent.sender === 'agent' &&
        (agentEvent.payload as { result?: PromptResponse }).result?.stopReason
    ).length;
    if (ended >= item.count) {
      return;
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(
    `forTestsWaitForTurnEnded: timed out after ${item.maxRetries}s waiting for ${item.count} turn(s) to complete`
  );
}
