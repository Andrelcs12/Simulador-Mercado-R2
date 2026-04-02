import { IsNumber, IsUUID, Min, Max } from 'class-validator';

export class UpdateMarginDto {
  
  @IsUUID()
  stockInputId: string; // ID do estoque

  @IsNumber()
  @Min(0)
  @Max(100)
  appliedMargin: number; // Margem em %
}