import { Injectable } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class HistoryService {
    private prisma = new PrismaClient();

    async recordAction(
        userId: string,
        cocktailId: string,
        action: 'like' | 'dislike',
        source: 'tinder' | 'search'
    ) {
        return this.prisma.cocktailHistory.create({
            data: {
                userId,
                cocktailId,
                action,
                source,
            },
        });
    }

    async getUserHistory(userId: string, filter?: string, source?: string) {
        const where: any = { userId };

        if (filter) {
            where.action = filter;
        }
        if (source) {
            where.source = source;
        }

        return this.prisma.cocktailHistory.findMany({
            where,
            orderBy: {
                createdAt: 'desc',
            },
        });
    }
}
