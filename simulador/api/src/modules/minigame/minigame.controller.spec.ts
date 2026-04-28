import { Test, TestingModule } from '@nestjs/testing';
import { MinigameController } from './minigame.controller';
import { MinigameService } from './minigame.service';

describe('MinigameController', () => {
  let controller: MinigameController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MinigameController],
      providers: [MinigameService],
    }).compile();

    controller = module.get<MinigameController>(MinigameController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
