import { Test, TestingModule } from '@nestjs/testing';
import { CapexService } from './capex.service';

describe('CapexService', () => {
  let service: CapexService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CapexService],
    }).compile();

    service = module.get<CapexService>(CapexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
