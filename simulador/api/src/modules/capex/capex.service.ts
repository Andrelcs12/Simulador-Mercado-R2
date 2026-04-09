import { PrismaService } from '../../prisma.service';
import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common';
import {
	ApplyCapexFailureDto,
	CapexIncidentType,
} from './dto/apply-capex-failure.dto';
import { UpdateCapexTriggersDto } from './dto/update-capex-triggers.dto';

const CAPEX_MASTERS = {
	seguranca: 'Segurança',
	redes: 'Redes',
	site: 'Site',
} as const;

const INCIDENT_REQUIRED_CAPEX: Record<CapexIncidentType, string> = {
	[CapexIncidentType.SEGURANCA]: CAPEX_MASTERS.seguranca,
	[CapexIncidentType.REDES]: CAPEX_MASTERS.redes,
	[CapexIncidentType.SITE]: CAPEX_MASTERS.site,
};

@Injectable()
export class CapexService {
	constructor(private readonly prisma: PrismaService) {}

	async atualizarGatilhos(dto: UpdateCapexTriggersDto) {
		const alteracoes = [
			{ name: CAPEX_MASTERS.seguranca, isApproved: dto.seguranca },
			{ name: CAPEX_MASTERS.redes, isApproved: dto.redes },
			{ name: CAPEX_MASTERS.site, isApproved: dto.site },
		].filter((item) => item.isApproved !== undefined);

		if (alteracoes.length === 0) {
			throw new BadRequestException(
				'Informe ao menos um gatilho de CAPEX para atualizar.',
			);
		}

		await this.assertConfigurationExists(dto.configId);

		const capexMasters = await this.prisma.capexMaster.findMany({
			where: { name: { in: alteracoes.map((item) => item.name) } },
			select: { id: true, name: true },
		});

		const masterByName = new Map(capexMasters.map((item) => [item.name, item.id]));

		await this.prisma.$transaction(async (tx) => {
			for (const alteracao of alteracoes) {
				const capexId = masterByName.get(alteracao.name);

				if (!capexId) {
					throw new NotFoundException(
						`CAPEX mestre "${alteracao.name}" não encontrado. Execute o seed primeiro.`,
					);
				}

				const existingSelection = await tx.storeCapex.findFirst({
					where: {
						configId: dto.configId,
						capexId,
					},
					select: { id: true },
				});

				if (existingSelection) {
					await tx.storeCapex.update({
						where: { id: existingSelection.id },
						data: { isApproved: Boolean(alteracao.isApproved) },
					});
					continue;
				}

				await tx.storeCapex.create({
					data: {
						configId: dto.configId,
						capexId,
						isApproved: Boolean(alteracao.isApproved),
					},
				});
			}
		});

		return this.buscarGatilhos(dto.configId);
	}

	async buscarGatilhos(configId: string) {
		await this.assertConfigurationExists(configId);

		const selections = await this.prisma.storeCapex.findMany({
			where: { configId },
			include: {
				capexMaster: {
					select: { name: true },
				},
			},
		});

		return {
			configId,
			gatilhos: {
				seguranca: this.isCapexEnabled(selections, CAPEX_MASTERS.seguranca),
				redes: this.isCapexEnabled(selections, CAPEX_MASTERS.redes),
				site: this.isCapexEnabled(selections, CAPEX_MASTERS.site),
			},
		};
	}

	async aplicarConsequenciaFalha(dto: ApplyCapexFailureDto) {
		const config = await this.prisma.configuration.findUnique({
			where: { id: dto.configId },
			include: {
				capexSelections: {
					include: {
						capexMaster: { select: { name: true } },
					},
				},
			},
		});

		if (!config) {
			throw new NotFoundException('Configuração da rodada não encontrada.');
		}

		const capexObrigatorio = INCIDENT_REQUIRED_CAPEX[dto.incidentType];
		const possuiProtecao = this.isCapexEnabled(
			config.capexSelections,
			capexObrigatorio,
		);

		if (possuiProtecao) {
			return {
				falha: dto.incidentType,
				capexObrigatorio,
				protegido: true,
				diasBloqueados: 0,
				vendasDiariasAjustadas: dto.dailySales,
				perdaTotalEstimada: 0,
				mensagem: 'CAPEX aprovado. Falha absorvida sem bloqueio de vendas.',
			};
		}

		const diasSla = Math.max(config.finalSLA ?? 0, 0);
		const impacto = this.calcularImpactoVendas(dto.dailySales, diasSla);

		return {
			falha: dto.incidentType,
			capexObrigatorio,
			protegido: false,
			diasBloqueados: impacto.diasBloqueados,
			vendasDiariasAjustadas: impacto.vendasDiariasAjustadas,
			perdaTotalEstimada: impacto.perdaTotalEstimada,
			mensagem:
				impacto.diasBloqueados > 0
					? `CAPEX ausente. Vendas zeradas por ${impacto.diasBloqueados} dia(s), conforme SLA.`
					: 'CAPEX ausente, mas o SLA atual é 0 dia de parada.',
		};
	}

	private async assertConfigurationExists(configId: string) {
		const config = await this.prisma.configuration.findUnique({
			where: { id: configId },
			select: { id: true },
		});

		if (!config) {
			throw new NotFoundException('Configuração da rodada não encontrada.');
		}
	}

	private isCapexEnabled(
		selections: Array<{ isApproved: boolean; capexMaster: { name: string } }>,
		capexName: string,
	) {
		return selections.some(
			(selection) =>
				selection.capexMaster.name === capexName && selection.isApproved,
		);
	}

	private calcularImpactoVendas(dailySales: number, diasSla: number) {
		if (diasSla <= 0) {
			return {
				diasBloqueados: 0,
				vendasDiariasAjustadas: dailySales,
				perdaTotalEstimada: 0,
			};
		}

		return {
			diasBloqueados: diasSla,
			vendasDiariasAjustadas: 0,
			perdaTotalEstimada: Number((dailySales * diasSla).toFixed(2)),
		};
	}
}
