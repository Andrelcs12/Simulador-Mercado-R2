import { Test, TestingModule } from '@nestjs/testing';
import { HumanResourcesController } from './human-resources.controller';
import { HumanResourcesService } from './human-resources.service';

describe('HumanResourcesController', () => {
  let controller: HumanResourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HumanResourcesController],
      providers: [HumanResourcesService],
    }).compile();

    controller = module.get<HumanResourcesController>(HumanResourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
