import { Controller } from '@nestjs/common';
import { HumanResourcesService } from './human-resources.service';

@Controller('human-resources')
export class HumanResourcesController {
  constructor(private readonly humanResourcesService: HumanResourcesService) {}
}
