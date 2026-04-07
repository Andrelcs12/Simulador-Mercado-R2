<<<<<<< HEAD
import { Controller, Post, Body } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateStockInputDto } from './dto/create-stock-input.dto';
=======
import { Controller } from '@nestjs/common';
import { InventoryService } from './inventory.service';
>>>>>>> main

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}
<<<<<<< HEAD

  @Post('buy')
  async buyStock(@Body() dto: CreateStockInputDto) {
    return this.inventoryService.registrarCompra(dto);
  }
} 
=======
}
>>>>>>> main
