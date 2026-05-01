import { IsEnum, IsNumber, IsUUID, Min } from 'class-validator';

export enum CapexIncidentType {
  SEGURANCA = 'SEGURANCA',
  REDES = 'REDES',
  SITE = 'SITE',
}

export class ApplyCapexFailureDto {
  @IsUUID()
  configId: string;

  @IsEnum(CapexIncidentType)
  incidentType: CapexIncidentType;

  @IsNumber()
  @Min(0)
  dailySales: number;
}
