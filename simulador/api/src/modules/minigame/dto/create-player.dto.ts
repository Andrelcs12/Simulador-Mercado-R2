import { IsEmail, IsNotEmpty, IsString, IsOptional, Length } from 'class-validator';

export class CreatePlayerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  storeName: string;

  @IsString()
  @IsOptional()
  role?: string;

  @IsString()
  @IsNotEmpty()
  @Length(4, 4, { message: 'O código da sala deve ter exatamente 4 caracteres' })
  sessionCode: string;
}