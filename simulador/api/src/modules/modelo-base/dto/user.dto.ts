

export class CreateUserDto {
  name: string;
  email: string;
  password: string; // Opcional ou obrigatório dependendo do seu teste
}

export class UpdateUserDto {
  name?: string;
  email?: string;
  password?: string;
}
