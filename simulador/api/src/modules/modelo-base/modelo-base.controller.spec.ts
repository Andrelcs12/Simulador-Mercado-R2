import { Test, TestingModule } from '@nestjs/testing';
import { ModeloBaseController } from './modelo-base.controller';
import { ModeloBaseService } from './modelo-base.service';

describe('ModeloBaseController', () => {
  let controller: ModeloBaseController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ModeloBaseController],
      providers: [ModeloBaseService],
    }).compile();

    controller = module.get<ModeloBaseController>(ModeloBaseController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
