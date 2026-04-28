import { Test, TestingModule } from '@nestjs/testing';
import { CapexController } from './capex.controller';
import { CapexService } from './capex.service';

describe('CapexController', () => {
  let controller: CapexController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CapexController],
      providers: [CapexService],
    }).compile();

    controller = module.get<CapexController>(CapexController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
