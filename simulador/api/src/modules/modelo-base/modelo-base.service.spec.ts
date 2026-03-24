import { Test, TestingModule } from '@nestjs/testing';
import { ModeloBaseService } from './modelo-base.service';

describe('ModeloBaseService', () => {
  let service: ModeloBaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ModeloBaseService],
    }).compile();

    service = module.get<ModeloBaseService>(ModeloBaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
