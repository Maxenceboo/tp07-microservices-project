import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CocktailService } from './cocktail.service';

@Controller('cocktails')
export class CocktailController {
    constructor(private readonly cocktailService: CocktailService) { }

    @Get('random')
    @UseGuards(JwtAuthGuard)
    async getRandom() {
        return this.cocktailService.getRandomCocktail();
    }

    @Get('search')
    @UseGuards(JwtAuthGuard)
    async search(@Query('q') query: string) {
        return this.cocktailService.searchCocktails(query);
    }
}
