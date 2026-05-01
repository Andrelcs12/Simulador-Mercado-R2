import { IsBoolean, IsOptional, IsUUID } from 'class-validator';

export class UpdateCapexTriggersDto {
  @IsUUID()
  configId: string;

  @IsBoolean()
  @IsOptional()
  seguranca?: boolean;

  @IsBoolean()
  @IsOptional()
  redes?: boolean;

  @IsBoolean()
  @IsOptional()
  site?: boolean;
}
