import { Controller, Post, UseGuards } from '@nestjs/common';
import asyncPool from 'tiny-async-pool';
import { Connection } from 'typeorm';
import { apiToBackend } from '~backend/barrels/api-to-backend';
import { apiToDisk } from '~backend/barrels/api-to-disk';
import { common } from '~backend/barrels/common';
import { constants } from '~backend/barrels/constants';
import { db } from '~backend/barrels/db';
import { entities } from '~backend/barrels/entities';
import { gen } from '~backend/barrels/gen';
import { helper } from '~backend/barrels/helper';
import { SkipJwtCheck, ValidateRequest } from '~backend/decorators/_index';
import { TestRoutesGuard } from '~backend/guards/test-routes.guard';
import { RabbitService } from '~backend/services/rabbit.service';
import { UsersService } from '~backend/services/users.service';

@UseGuards(TestRoutesGuard)
@SkipJwtCheck()
@Controller()
export class SeedRecordsController {
  constructor(
    private rabbitService: RabbitService,
    private usersService: UsersService,
    private connection: Connection
  ) {}

  @Post(apiToBackend.ToBackendRequestInfoNameEnum.ToBackendSeedRecords)
  async seedRecords(
    @ValidateRequest(apiToBackend.ToBackendSeedRecordsRequest)
    reqValid: apiToBackend.ToBackendSeedRecordsRequest
  ) {
    let payloadUsers = reqValid.payload.users;
    let payloadOrgs = reqValid.payload.orgs;

    //

    let users: entities.UserEntity[] = [];
    let orgs: entities.OrgEntity[] = [];

    if (common.isDefined(payloadUsers)) {
      await asyncPool(
        1,
        payloadUsers,
        async (x: apiToBackend.ToBackendSeedRecordsRequestPayloadUsers) => {
          let alias = await this.usersService.makeAlias(x.email);
          let { salt, hash } = common.isDefined(x.password)
            ? await this.usersService.makeSaltAndHash(x.password)
            : { salt: undefined, hash: undefined };

          let newUser = gen.makeUser({
            userId: x.userId,
            email: x.email,
            isEmailVerified: x.isEmailVerified,
            emailVerificationToken: x.emailVerificationToken,
            passwordResetToken: x.passwordResetToken,
            hash: hash,
            salt: salt,
            alias: alias,
            passwordResetExpiresTs: common.isDefined(x.passwordResetExpiresTs)
              ? x.passwordResetExpiresTs
              : common.isDefined(x.passwordResetToken)
              ? helper.makeTsUsingOffsetFromNow(
                  constants.PASSWORD_EXPIRES_OFFSET
                )
              : undefined
          });

          users.push(newUser);
        }
      );
    }

    if (common.isDefined(payloadOrgs)) {
      await asyncPool(
        1,
        payloadOrgs,
        async (x: apiToBackend.ToBackendSeedRecordsRequestPayloadOrgs) => {
          let newOrg = gen.makeOrg({
            orgId: x.orgId,
            name: x.name,
            ownerEmail: x.ownerEmail,
            ownerId: x.ownerId
          });

          let createOrgRequest: apiToDisk.ToDiskCreateOrgRequest = {
            info: {
              name: apiToDisk.ToDiskRequestInfoNameEnum.ToDiskCreateOrg,
              traceId: reqValid.info.traceId
            },
            payload: {
              orgId: newOrg.org_id
            }
          };

          await this.rabbitService.sendToDisk<apiToDisk.ToDiskCreateOrgResponse>(
            {
              routingKey: helper.makeRoutingKeyToDisk({
                orgId: newOrg.org_id,
                projectId: null
              }),
              message: createOrgRequest,
              checkIsOk: true
            }
          );

          orgs.push(newOrg);
        }
      );
    }

    await this.connection.transaction(async manager => {
      await db.addRecords({
        manager: manager,
        records: {
          users: users,
          orgs: orgs
        }
      });
    });

    let payload: apiToBackend.ToBackendSeedRecordsResponse['payload'] = {};

    return payload;
  }
}
