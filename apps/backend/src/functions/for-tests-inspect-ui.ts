import type { ExecutionContext } from 'ava';
import { Prep } from '#backend/interfaces/prep';
import { SessionsService } from '#backend/services/db/sessions.service';
import { SandboxService } from '#backend/services/sandbox.service';
import { ToBackendCreateAgentSessionResponse } from '#common/interfaces/to-backend/agent/to-backend-create-agent-session';

export async function forTestsInspectUi(item: {
  t: ExecutionContext;
  prep: Prep;
  sessionId: string;
  testError: unknown;
  createSessionResp: ToBackendCreateAgentSessionResponse;
}): Promise<void> {
  if (item.testError) {
    console.log('Test error (non-fatal for inspection):', item.testError);
  }

  if (item.createSessionResp) {
    console.log('sessionId:', item.createSessionResp.payload.sessionId);
  }

  item.t.pass('Session created for inspection');

  // Periodic health check
  let sandboxService = item.prep.app.get(SandboxService);
  let sessionsService = item.prep.app.get(SessionsService);
  let session = await sessionsService.getSessionByIdCheckExists({
    sessionId: item.sessionId
  });
  let client = sandboxService.getSandboxAgent(item.sessionId);

  console.log(`\n=== INSPECTOR UI ===`);
  console.log(
    `${session.sandboxBaseUrl}/ui/?token=${session.sandboxAgentToken}`
  );
  console.log(`===================\n`);
  console.log('Sandbox kept alive for inspection. Waiting 30 minutes...');
  console.log('Press Ctrl+C to stop.');
  console.log('Health checking every 10s...\n');

  for (let i = 0; i < 180; i++) {
    await new Promise(resolve => setTimeout(resolve, 10_000));

    try {
      let sessions = await client.listSessions();
      console.log(
        `[${(i + 1) * 10}s] sandbox-agent OK, sessions: ${sessions.items.length}`
      );
    } catch (err: any) {
      console.log(`[${(i + 1) * 10}s] sandbox-agent FAILED: ${err?.message}`);
    }
  }
}
