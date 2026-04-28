import { IsUUID, IsNumber, isNumber, IsInt } from "class-validator";

export class CheckBudgetDto {
    @IsUUID()
    configId!: string;

    @IsUUID()
    storeId!: string;

    @IsInt()
    roundNumber!: number;

    @IsNumber()
    totalEstoque!: number;

    @IsNumber()
    totalCapex!: number;

    @IsNumber()
    totalSalarios!: number;
}