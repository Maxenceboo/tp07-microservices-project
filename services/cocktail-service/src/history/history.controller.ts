import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';
import { HistoryService } from './history.service';

@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
    constructor(private readonly historyService: HistoryService) { }

    @Post()
    async recordAction(
        @User() user: any,
        @Body() body: { cocktailId: string; action: 'like' | 'dislike'; source: 'tinder' | 'search' }
    ) {
        return this.historyService.recordAction(
            user.sub, // Assuming 'sub' is the user ID in the JWT payload
            body.cocktailId,
            body.action,
            body.source
        );
    }

    @Get()
    async getHistory(
        @User() user: any,
        @Query('filter') filter?: string,
        @Query('source') source?: string
    ) {
        return this.historyService.getUserHistory(user.sub, filter, source);
    }
}
