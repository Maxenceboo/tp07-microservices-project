import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../auth/user.decorator';
import { RecordActionDto } from './dto/record-action.dto';
import { HistoryService } from './history.service';

@ApiTags('history')
@ApiBearerAuth()
@Controller('history')
@UseGuards(JwtAuthGuard)
export class HistoryController {
    constructor(private readonly historyService: HistoryService) { }

    @Post()
    @ApiOperation({ summary: 'Record a user action (like/dislike)' })
    @ApiResponse({ status: 201, description: 'The action has been successfully recorded.' })
    @ApiBody({ type: RecordActionDto })
    async recordAction(
        @User() user: any,
        @Body() body: RecordActionDto
    ) {
        return this.historyService.recordAction(
            user.sub, // Assuming 'sub' is the user ID in the JWT payload
            body.cocktailId,
            body.action,
            body.source
        );
    }

    @Get()
    @ApiOperation({ summary: 'Get user history' })
    @ApiQuery({ name: 'filter', required: false, enum: ['like', 'dislike'] })
    @ApiQuery({ name: 'source', required: false, enum: ['tinder', 'search'] })
    @ApiResponse({ status: 200, description: 'Return user history.' })
    async getHistory(
        @User() user: any,
        @Query('filter') filter?: string,
        @Query('source') source?: string
    ) {
        return this.historyService.getUserHistory(user.sub, filter, source);
    }
}
