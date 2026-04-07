import { IsInt, Min, IsUUID } from 'class-validator';

export class CreateStockInputDto {
  @IsUUID()
  configId: string;

  @IsUUID()
  categoryId: string;

  @IsInt()
  @Min(1)
  buyQty: number;
}