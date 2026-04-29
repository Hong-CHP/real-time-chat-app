import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PrismaService } from 'src/prisma/prisma.service';

describe('UsersService', () => {
  let service: UsersService;

  const mockPrisma = {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        }
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });
  it('should create user', async () => {
  mockPrisma.user.create.mockResolvedValue({ id: 1 });

  const result = await service.create({ email: 'a', password: 'b' });

  expect(result).toEqual({ id: 1 });
});

it('should find user by id', async () => {
  mockPrisma.user.findUnique.mockResolvedValue({ id: 1 });

  const result = await service.findOne(1);

  expect(result).toEqual({ id: 1 });
});

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
