import { IsUUID, IsNumber, IsInt } from "class-validator";

export class CheckBudgetDto {
  @IsUUID()
  configId!: string;

  @IsUUID()
  storeId!: string;

  @IsUUID()
  sessionId!: string;

  @IsUUID()
  roundId!: string;

  @IsNumber()
  totalEstoque!: number;

  @IsNumber()
  totalCapex!: number;

  @IsNumber()
  totalSalarios!: number;
}