import { PrismaService } from '@/prisma.service';
import { Injectable } from '@nestjs/common';
import { RegisterDTO } from './dto/auth.dto';

@Injectable()
export class AuthService {

    constructor(private readonly prisma: PrismaService) {}

    async register(dto: RegisterDTO) {

        const userExist = await this.prisma.user.findUnique({
            where: {
                email: dto.email
            }
        })

        if (userExist) {
            throw new Error("Usuário já existe")
        }


        return this.prisma.user.create({
            data: {
                name: dto.name,
                email: dto.email,
                password: dto.password
            }
        })

    

}
}
