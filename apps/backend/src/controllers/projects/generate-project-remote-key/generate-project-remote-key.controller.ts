import {
  Body,
  Controller,
  Inject,
  Logger,
  Post,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Result } from '@praha/byethrow';
import retry from 'async-retry';
import sshpk from 'sshpk';
import type { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendGenerateProjectRemoteKeyRequestDto,
  ToBackendGenerateProjectRemoteKeyResponseDto
} from '#backend/controllers/projects/generate-project-remote-key/generate-project-remote-key.dto';
import { AttachUser } from '#backend/decorators/attach-user/attach-user.decorator';
import { type Db, DRIZZLE } from '#backend/drizzle/drizzle.module';
import type {
  NoteTab,
  OrgTab,
  UserTab
} from '#backend/drizzle/postgres/schema/_tabs';
import { dbErrorToResult } from '#backend/functions/db-error-to-result/db-error-to-result';
import { getRetryOption } from '#backend/functions/top/get-retry-option/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id/throttler-user-id.guard';
import { OrgsService } from '#backend/services/db/orgs/orgs.service';
import { TabService } from '#backend/services/tab/tab.service';
import type { BackendResultForOperation } from '#backend/types/backend-result-for-operation';
import type { GitKeyPair } from '#backend/types/git-key-pair';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { makeId } from '#common/functions/make-id/make-id';
import type { GetOrgCheckExistsResultError } from '#common/types/backend/function-errors/get-org-check-exists-result-error';
import type { ToBackendRoute } from '#common/types/backend/request/to-backend-route';
import type { ToBackendGenerateProjectRemoteKeyOutput } from '#common/types/backend/routes/projects/generate-project-remote-key/generate-project-remote-key-output';

const { parseKey, parsePrivateKey } = sshpk;

@ApiTags('Projects')
@UseGuards(ThrottlerUserIdGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GenerateProjectRemoteKeyController {
  constructor(
    private tabService: TabService,
    private orgsService: OrgsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post('api/ToBackendGenerateProjectRemoteKey' satisfies ToBackendRoute)
  @ApiOperation({
    summary: 'GenerateProjectRemoteKey',
    description:
      'Generate an SSH key pair for connecting a remote git repository'
  })
  @ApiOkResponse({
    type: ToBackendGenerateProjectRemoteKeyResponseDto
  })
  createProject(
    @AttachUser() user: UserTab,
    @Body() body: ToBackendGenerateProjectRemoteKeyRequestDto
  ): Promise<BackendResultForOperation<'generateProjectRemoteKey'>> {
    return Result.pipe(
      Result.succeed({
        orgId: body.input.orgId,
        userId: user.userId,
        orgsService: this.orgsService,
        tabService: this.tabService,
        db: this.db,
        cs: this.cs,
        logger: this.logger
      }),
      Result.bind(
        'org',
        (v): Result.ResultAsync<OrgTab, GetOrgCheckExistsResultError> =>
          v.orgsService.getOrgCheckExistsResult({ orgId: v.orgId })
      ),
      Result.andThrough(v =>
        v.orgsService.checkUserIsOrgOwnerResult({
          org: v.org,
          userId: v.userId
        })
      ),
      Result.bind('note', (v): Result.Result<NoteTab, never> => {
        let gitKeyPair: GitKeyPair = v.tabService.createGitKeyPair();

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
      Result.andThrough(v =>
        dbErrorToResult({
          action: async () => {
            await retry(
              async () =>
                await v.db.drizzle.transaction(
                  async tx =>
                    await v.db.packer.write({
                      tx: tx,
                      insert: { notes: [v.note] }
                    })
                ),
              getRetryOption(v.cs, v.logger)
            );
          }
        })
      ),
      Result.map(
        (v): ToBackendGenerateProjectRemoteKeyOutput => ({
          noteId: v.note.noteId,
          publicKey: v.note.publicKey
        })
      )
    );
  }
}
