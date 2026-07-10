import type { Prisma } from '@prisma/client';
import type { PrismaService } from './prisma.service';

// Repositories accept an optional executor so a caller can run their query
// inside an open transaction (the tx client) or standalone (the base service).
export type PrismaExecutor = PrismaService | Prisma.TransactionClient;
