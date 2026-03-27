import { IsUUID, IsInt, IsNumber, Min, Max } from 'class-validator';
export class UpdatePerformanceDto {
    @IsUUID()
    configId: string;
    
    @IsInt()
    @Min(0)
    operatorsQty: number; // Operadores de Caixa (Ideal: 10)
    
    @IsInt()
    @Min(0)
    serviceOperatorsQty: number; // Técnicos de Serviço (Gera o SLA)
    
    @IsNumber()
    @Min(0)
    @Max(100)
    quizScore: number; // Nota do Quiz em % (Ex: 85 para 85%)
}