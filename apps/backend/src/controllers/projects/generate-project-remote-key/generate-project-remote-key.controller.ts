import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import { eq } from 'drizzle-orm';
import sshpk from 'sshpk';
import {
  type ToBackendGenerateProjectRemoteKeyRequestDto,
  ToBackendGenerateProjectRemoteKeyResponseDto
} from '#backend/controllers/projects/generate-project-remote-key/generate-project-remote-key.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import type { NoteTab, UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { orgsTable } from '#backend/drizzle/postgres/schema/orgs';
import {
  createGitKeyPair,
  type GitKeyPair
} from '#backend/functions/create-git-key-pair/create-git-key-pair';
import { checkUserIsOrgOwner } from '#backend/functions/db/orgs/check-user-is-org-owner/check-user-is-org-owner';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { DbService } from '#backend/services/db/db.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { makeId } from '#common/functions/make-id/make-id';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGenerateProjectRemoteKeyOutput } from '#common/types/backend/routes/projects/generate-project-remote-key/generate-project-remote-key-output';

const { parseKey, parsePrivateKey } = sshpk;

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GenerateProjectRemoteKeyController {
  constructor(private db: DbService) {}

  @Post('api/ToBackendGenerateProjectRemoteKey' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GenerateProjectRemoteKey',
    description:
      'Generate an SSH key pair for connecting a remote git repository'
  })
  @ApiOkResponse({
    type: ToBackendGenerateProjectRemoteKeyResponseDto
  })
  async createProject(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGenerateProjectRemoteKeyRequestDto
  ): Promise<BackendResultForOperation<'generateProjectRemoteKey'>> {
    return Result.pipe(
      Result.succeed({
        orgId: body.input.orgId,
        userId: user.userId
      }),
      Result.bind('org', v =>
        this.db.orgs.findFirstCheckExists({
          where: eq(orgsTable.orgId, v.orgId)
        })
      ),
      Result.andThrough(v =>
        checkUserIsOrgOwner({
          org: v.org,
          userId: v.userId
        })
      ),
      Result.bind('note', v => {
        let gitKeyPair: GitKeyPair = createGitKeyPair();

        let publicKey: string = parseKey(gitKeyPair.publicKeyEncrypted, 'pem', {
          passphrase: gitKeyPair.passPhrase
        }).toString('ssh');

        let privateKey: string = parsePrivateKey(
          gitKeyPair.privateKeyEncrypted,
          'pem',
          {
            passphrase: gitKeyPair.passPhrase
          }
        ).toString('ssh');

        let note: NoteTab = {
          noteId: makeId(),
          publicKey: publicKey,
          privateKey: privateKey,
          publicKeyEncrypted: gitKeyPair.publicKeyEncrypted,
          privateKeyEncrypted: gitKeyPair.privateKeyEncrypted,
          passPhrase: gitKeyPair.passPhrase,
          keyTag: undefined,
          serverTs: undefined
        };

        return Result.succeed(note);
      }),
      Result.andThrough(v => this.db.write({ insert: { notes: [v.note] } })),
      Result.map(
        (v): ToBackendGenerateProjectRemoteKeyOutput => ({
          noteId: v.note.noteId,
          publicKey: v.note.publicKey
        })
      )
    );
  }
}
