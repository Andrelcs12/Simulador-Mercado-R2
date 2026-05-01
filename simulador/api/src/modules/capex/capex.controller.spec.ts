import { Test, TestingModule } from '@nestjs/testing';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { CapexController } from './capex.controller';
import { CapexService } from './capex.service';

describe('CapexController', () => {
  let controller: CapexController;
  const capexServiceMock = {
    atualizarGatilhos: jest.fn(),
    buscarGatilhos: jest.fn(),
    aplicarConsequenciaFalha: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CapexController],
      providers: [
        {
          provide: CapexService,
          useValue: capexServiceMock,
        },
      ],
    }).compile();

    controller = module.get<CapexController>(CapexController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
