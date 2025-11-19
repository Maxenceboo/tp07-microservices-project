import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CocktailService } from './cocktail.service';

@ApiTags('cocktails')
@ApiBearerAuth()
@Controller('cocktails')
export class CocktailController {
    constructor(private readonly cocktailService: CocktailService) { }

    @Get('random')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get a random cocktail' })
    @ApiResponse({ status: 200, description: 'Return a random cocktail.' })
    async getRandom() {
        return this.cocktailService.getRandomCocktail();
    }

    @Get('search')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Search cocktails by name' })
    @ApiQuery({ name: 'q', required: true, description: 'Cocktail name to search' })
    @ApiResponse({ status: 200, description: 'Return a list of cocktails.' })
    async search(@Query('q') query: string) {
        return this.cocktailService.searchCocktails(query);
    }
}
