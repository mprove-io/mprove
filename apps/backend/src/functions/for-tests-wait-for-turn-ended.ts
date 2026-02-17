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
  // Snapshot current event count — only count idle events from NEW events
  let startIndex = item.events.length;
  let lastLoggedCount = startIndex;

  for (let i = 0; i < item.maxRetries; i++) {
    let newEvents = item.events.slice(startIndex);
    let ended = newEvents.filter(isIdleEvent).length;
    if (ended >= item.count) {
      return;
    }

    // Log new events every 5 seconds
    if (i > 0 && i % 5 === 0) {
      let recentEvents = item.events.slice(lastLoggedCount);
      let recentTypes = recentEvents.map(e => e.eventType);
      console.log(
        `[waitForTurnEnded] ${i}s elapsed, ${ended}/${item.count} idle events since index ${startIndex}, ` +
          `${item.events.length} total events (+${recentEvents.length} new: ${JSON.stringify(recentTypes)})`
      );
      lastLoggedCount = item.events.length;
    }

    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  throw new Error(
    `forTestsWaitForTurnEnded: timed out after ${item.maxRetries}s waiting for ${item.count} turn(s) to complete`
  );
}
