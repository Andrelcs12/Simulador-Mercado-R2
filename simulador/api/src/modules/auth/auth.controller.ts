import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDTO } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/register")
  @HttpCode(201)
  async CreateUser(@Body() dto: RegisterDTO) {
    return this.authService.register(dto)
  }
}
