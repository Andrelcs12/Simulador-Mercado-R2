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

  // Mudamos aqui: O player envia o código de 4 dígitos que viu na tela do Admin
  @IsString()
  @IsNotEmpty()
  @Length(4, 4, { message: 'O código da sala deve ter exatamente 4 caracteres' })
  sessionCode: string; 
}