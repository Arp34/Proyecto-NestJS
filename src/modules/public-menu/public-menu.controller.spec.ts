import { Test, TestingModule } from '@nestjs/testing';
import { PublicMenuController } from './public-menu.controller.js';
import { PublicMenuService } from './public-menu.service.js';

describe('PublicMenuController', () => {
  let controller: PublicMenuController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicMenuController],
      providers: [PublicMenuService],
    }).compile();

    controller = module.get<PublicMenuController>(PublicMenuController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
