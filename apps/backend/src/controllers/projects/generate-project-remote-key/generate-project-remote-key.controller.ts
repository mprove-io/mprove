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
import retry from 'async-retry';
import sshpk from 'sshpk';

const { parseKey, parsePrivateKey } = sshpk;

import { BackendConfig } from '#backend/config/backend-config';
import {
  ToBackendGenerateProjectRemoteKeyRequestDto,
  ToBackendGenerateProjectRemoteKeyResponseDto
} from '#backend/controllers/projects/generate-project-remote-key/generate-project-remote-key.dto';
import { AttachUser } from '#backend/decorators/attach-user.decorator';
import type { Db } from '#backend/drizzle/drizzle.module';
import { DRIZZLE } from '#backend/drizzle/drizzle.module';
import type { NoteTab, UserTab } from '#backend/drizzle/postgres/schema/_tabs';
import { getRetryOption } from '#backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '#backend/guards/throttler-user-id.guard';
import { OrgsService } from '#backend/services/db/orgs.service';
import { TabService } from '#backend/services/tab.service';
import { THROTTLE_CUSTOM } from '#common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '#common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '#common/functions/make-id';
import type { ToBackendGenerateProjectRemoteKeyResponsePayload } from '#common/zod/to-backend/projects/to-backend-generate-project-remote-key';

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

  @Post(ToBackendRequestInfoNameEnum.ToBackendGenerateProjectRemoteKey)
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
  ) {
    let { traceId } = body.info;
    let { orgId } = body.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.userId
    });

    let { publicKeyEncrypted, privateKeyEncrypted, passPhrase } =
      this.tabService.createGitKeyPair();

    let publicKey = parseKey(publicKeyEncrypted, 'pem', {
      passphrase: passPhrase
    }).toString('ssh');

    let privateKey = parsePrivateKey(privateKeyEncrypted, 'pem', {
      passphrase: passPhrase
    }).toString('ssh');

    let note: NoteTab = {
      noteId: makeId(),
      publicKey: publicKey,
      privateKey: privateKey,
      publicKeyEncrypted: publicKeyEncrypted,
      privateKeyEncrypted: privateKeyEncrypted,
      passPhrase: passPhrase,
      keyTag: undefined,
      serverTs: undefined
    };

    await retry(
      async () =>
        await this.db.drizzle.transaction(
          async tx =>
            await this.db.packer.write({
              tx: tx,
              insert: {
                notes: [note]
              }
            })
        ),
      getRetryOption(this.cs, this.logger)
    );

    let payload: ToBackendGenerateProjectRemoteKeyResponsePayload = {
      noteId: note.noteId,
      publicKey: note.publicKey
    };

    return payload;
  }
}
