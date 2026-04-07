import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {

  constructor(private readonly prisma: PrismaService) {}
  
  getHello(): string {
    return 'Helrrrrrr';
  }

  async oi (){
    return "oi teste1 do grbaaa";
  }



}
