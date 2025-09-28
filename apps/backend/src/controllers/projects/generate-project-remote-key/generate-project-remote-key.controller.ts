import * as crypto from 'crypto';
import {
  Controller,
  Inject,
  Logger,
  Post,
  Req,
  UseGuards
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { parseKey, parsePrivateKey } from 'sshpk';
import { BackendConfig } from '~backend/config/backend-config';
import { AttachUser } from '~backend/decorators/attach-user.decorator';
import { DRIZZLE, Db } from '~backend/drizzle/drizzle.module';
import { NoteEnt } from '~backend/drizzle/postgres/schema/notes';
import { UserEnt } from '~backend/drizzle/postgres/schema/users';
import { getRetryOption } from '~backend/functions/get-retry-option';
import { ThrottlerUserIdGuard } from '~backend/guards/throttler-user-id.guard';
import { ValidateRequestGuard } from '~backend/guards/validate-request.guard';
import { OrgsService } from '~backend/services/orgs.service';
import { PASS_PHRASE } from '~common/constants/top';
import { THROTTLE_CUSTOM } from '~common/constants/top-backend';
import { ToBackendRequestInfoNameEnum } from '~common/enums/to/to-backend-request-info-name.enum';
import { makeId } from '~common/functions/make-id';
import {
  ToBackendGenerateProjectRemoteKeyRequest,
  ToBackendGenerateProjectRemoteKeyResponsePayload
} from '~common/interfaces/to-backend/projects/to-backend-generate-project-remote-key';

let retry = require('async-retry');

@UseGuards(ThrottlerUserIdGuard, ValidateRequestGuard)
@Throttle(THROTTLE_CUSTOM)
@Controller()
export class GenerateProjectRemoteKeyController {
  constructor(
    private orgsService: OrgsService,
    private cs: ConfigService<BackendConfig>,
    private logger: Logger,
    @Inject(DRIZZLE) private db: Db
  ) {}

  @Post(ToBackendRequestInfoNameEnum.ToBackendGenerateProjectRemoteKey)
  async createProject(@AttachUser() user: UserEnt, @Req() request: any) {
    let reqValid: ToBackendGenerateProjectRemoteKeyRequest = request.body;

    let { traceId } = reqValid.info;
    let { orgId } = reqValid.payload;

    let org = await this.orgsService.getOrgCheckExists({ orgId: orgId });

    await this.orgsService.checkUserIsOrgOwner({
      org: org,
      userId: user.userId
    });

    let { publicKey, privateKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 4096,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
        cipher: 'aes-256-cbc',
        passphrase: PASS_PHRASE
      }
    });

    let sshPublicKey = parseKey(publicKey, 'pem', {
      passphrase: PASS_PHRASE
    }).toString('ssh');

    let sshPrivateKey = parsePrivateKey(privateKey, 'pem', {
      passphrase: PASS_PHRASE
    }).toString('ssh');

    let note: NoteEnt = {
      noteId: makeId(),
      publicKey: sshPublicKey,
      privateKey: sshPrivateKey,
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
