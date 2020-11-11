import { Test, TestingModule } from '@nestjs/testing';
import * as fse from 'fs-extra';
import { constants } from '../barrels/constants';
import { MessageService } from '../services/message.service';

export async function prepareTest(organizationId: string) {
  let orgDir = `${constants.ORGANIZATIONS_PATH}/${organizationId}`;

  let isOrgExist = fse.pathExistsSync(orgDir);
  if (isOrgExist === true) {
    fse.removeSync(orgDir);
  }

  let moduleRef: TestingModule = await Test.createTestingModule({
    controllers: [],
    providers: [MessageService]
  }).compile();

  let messageService = moduleRef.get<MessageService>(MessageService);

  return {
    messageService: messageService
  };
}
