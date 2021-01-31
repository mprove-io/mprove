import { Test, TestingModule } from '@nestjs/testing';
import { GetProfileController } from './get-profile.controller';

describe('GetProfileController', () => {
  let controller: GetProfileController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GetProfileController]
    }).compile();

    controller = module.get<GetProfileController>(GetProfileController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
