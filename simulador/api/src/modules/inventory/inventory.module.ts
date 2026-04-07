import { Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
<<<<<<< HEAD
import { PrismaService } from '../../prisma.service';

@Module({
  controllers: [InventoryController],
  providers: [InventoryService, PrismaService],
  exports: [InventoryService],
})
export class InventoryModule {} 
=======

@Module({
  controllers: [InventoryController],
  providers: [InventoryService],
})
export class InventoryModule {}
>>>>>>> main
