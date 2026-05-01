import { Test, TestingModule } from '@nestjs/testing';
import { CapexService } from './capex.service';
import { PrismaService } from '../../prisma.service';
import { CapexIncidentType } from './dto/apply-capex-failure.dto';

describe('CapexService', () => {
  let service: CapexService;
  const prismaMock = {
    configuration: {
      findUnique: jest.fn(),
    },
    capexMaster: {
      findMany: jest.fn(),
    },
    storeCapex: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      create: jest.fn(),
    },
    $transaction: jest.fn(),
  } as unknown as PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CapexService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = module.get<CapexService>(CapexService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should zero daily sales when REDES fails and capex is not approved', async () => {
    (prismaMock.configuration.findUnique as jest.Mock).mockResolvedValue({
      id: 'cfg-1',
      finalSLA: 2,
      capexSelections: [],
    });

    const result = await service.aplicarConsequenciaFalha({
      configId: 'cfg-1',
      incidentType: CapexIncidentType.REDES,
      dailySales: 1000,
    });

    expect(result.protegido).toBe(false);
    expect(result.diasBloqueados).toBe(2);
    expect(result.vendasDiariasAjustadas).toBe(0);
    expect(result.perdaTotalEstimada).toBe(2000);
  });
});
