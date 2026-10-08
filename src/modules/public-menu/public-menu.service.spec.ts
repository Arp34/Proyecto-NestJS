import { Test, TestingModule } from '@nestjs/testing';
import { PublicMenuService } from './public-menu.service.js';

describe('PublicMenuService', () => {
  let service: PublicMenuService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicMenuService],
    }).compile();

    service = module.get<PublicMenuService>(PublicMenuService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
