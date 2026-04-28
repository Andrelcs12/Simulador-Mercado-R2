import { Module } from '@nestjs/common';
import { UserController } from './modelo-base.controller';
import { UserService } from './modelo-base.service';
import { PrismaService } from '@/prisma.service';


@Module({
  controllers: [UserController],
  providers: [UserService, PrismaService],
})
export class ModeloBaseModule {}
