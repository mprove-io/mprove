import assert from 'node:assert/strict';
import test from 'ava';
import type { Response } from 'supertest';
import { prepareTestAndSeed } from '#backend/functions/top/prepare-test-and-seed/prepare-test-and-seed';
import { sendToMcp } from '#backend/functions/top/send-to-mcp/send-to-mcp';
import type { Prep } from '#backend/interfaces/prep';
import { DocsService } from '#backend/services/docs/docs.service';
import { MCP_TOOL_LIST_DOCS } from '#common/constants/mcp-tools-registry';
import { makeId } from '#common/functions/make-id/make-id';

test('unexpected tool errors return INTERNAL_ERROR without leaking details', async t => {
  let testId = 'backend-mcp__internal-error';

  let userId: string = makeId();

  let email = `${testId}@example.com`;

  let password = '123456';

  let prep: Prep = await prepareTestAndSeed({
    traceId: testId,
    deleteRecordsPayload: { emails: [email] },
    seedRecordsPayload: {
      users: [
        {
          userId: userId,
          email: email,
          password: password,
          isEmailVerified: true
        }
      ]
    },
    loginUserPayload: { email: email, password: password }
  });

  try {
    let docsService: DocsService = prep.moduleRef.get<DocsService>(DocsService);

    let originalListDocs = docsService.listDocs;

    try {
      docsService.listDocs = () => {
        throw new Error('Sensitive internal details must not reach the client');
      };

      let response: Response = await sendToMcp({
        httpServer: prep.httpServer,
        method: 'tools/call',
        params: { name: MCP_TOOL_LIST_DOCS, arguments: {} },
        apiKey: prep.loginToken
      });

      assert.equal(response.status, 200);

      assert.equal(response.body.error, undefined);

      assert.equal(response.body.result.isError, true);

      let errorText: string = response.body.result.content[0].text;

      let errorObject: unknown = JSON.parse(errorText);

      t.deepEqual(errorObject, { error: 'INTERNAL_ERROR' });

      t.false(
        JSON.stringify(response.body).includes('Sensitive internal details')
      );
    } finally {
      docsService.listDocs = originalListDocs;
    }
  } finally {
    await prep.app.close();
  }
});
