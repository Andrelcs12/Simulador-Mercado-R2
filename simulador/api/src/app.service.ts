import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {

    return 'Hello World!';

  }
  async oi (){
    return "oi teste1 do grba";
  }

  async teste() {
    return 'sla'
  }


}
