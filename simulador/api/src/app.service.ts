import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  
  getHello(): string {
    return 'Hello World!';
  }

  async oi (){
    return "oi teste1 do grba";
  }


}
