import type { Prisma } from '@prisma/client';
import type { PrismaService } from '../models';

export type PrismaExecutor = PrismaService | Prisma.TransactionClient;
