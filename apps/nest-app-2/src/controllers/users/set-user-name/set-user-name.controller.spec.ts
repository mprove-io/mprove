import { Test, TestingModule } from '@nestjs/testing';
import { SetUserNameController } from './set-user-name.controller';

describe('SetUserNameController', () => {
  let controller: SetUserNameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SetUserNameController]
    }).compile();

    controller = module.get<SetUserNameController>(SetUserNameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
