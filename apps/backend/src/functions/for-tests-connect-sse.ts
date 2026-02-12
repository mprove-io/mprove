import { SSE_AGENT_EVENTS_PATH } from '#backend/controllers/agent/get-agent-events-sse/get-agent-events-sse.controller';
import type { AgentEvent } from '#backend/services/agent.service';

export async function forTestsConnectSse(item: {
  httpServer: any;
  sessionId: string;
  ticket: string;
}): Promise<{ events: AgentEvent[]; close: () => void }> {
  let events: AgentEvent[] = [];
  let address = item.httpServer.address();
  let port = typeof address === 'string' ? address : address.port;

  let url = `http://localhost:${port}/${SSE_AGENT_EVENTS_PATH}?sessionId=${item.sessionId}&ticket=${item.ticket}`;

  // console.log('forTestsConnectSse url:', url);

  let es = new EventSource(url);

  // Wait for SSE connection to open (ticket consumed + Redis subscribed)
  await new Promise<void>((resolve, reject) => {
    es.onopen = () => resolve();
    es.onerror = (e: any) =>
      reject(new Error(`SSE connection error: ${e?.message}`));
  });

  es.addEventListener('agent-event', (event: MessageEvent) => {
    // console.log('SSE agent-event received:', e.data?.substring(0, 200));
    try {
      events.push(JSON.parse(event.data));
    } catch (e) {
      // ignore parse errors
      console.log('event listener json parse error:');
      console.log(e);
    }
  });

  return {
    events,
    close: () => es.close()
  };
}
