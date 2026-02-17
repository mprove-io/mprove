import type { AgentEvent } from '#backend/services/agent.service';

function isIdleEvent(agentEvent: AgentEvent): boolean {
  // 'session.idle' is deprecated but still emitted by opencode server.
  // 'session.status' with status.type === 'idle' is the new format.
  if (agentEvent.eventType === 'session.idle') {
    return true;
  }
  if (agentEvent.eventType === 'session.status') {
    let status = (agentEvent.ocEvent as any).properties?.status;
    return status?.type === 'idle';
  }
  return false;
}

export async function forTestsWaitForTurnEnded(item: {
  events: AgentEvent[];
  count: number;
  maxRetries: number;
}): Promise<void> {
  let lastEventCount = 0;

  for (let i = 0; i < item.maxRetries; i++) {
    let ended = item.events.filter(isIdleEvent).length;
    if (ended >= item.count) {
      return;
    }

    // Log new events every 5 seconds
    if (i > 0 && i % 5 === 0) {
      let newEvents = item.events.slice(lastEventCount);
      let newTypes = newEvents.map(e => e.eventType);
      console.log(
        `[waitForTurnEnded] ${i}s elapsed, ${ended}/${item.count} idle events, ` +
          `${item.events.length} total events (+${newEvents.length} new: ${JSON.stringify(newTypes)})`
      );
      lastEventCount = item.events.length;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(
    `forTestsWaitForTurnEnded: timed out after ${item.maxRetries}s waiting for ${item.count} turn(s) to complete`
  );
}
