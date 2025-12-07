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

    @Get('categories')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'List cocktail categories' })
    @ApiResponse({ status: 200, description: 'Return list of categories.' })
    async getCategories() {
        return this.cocktailService.listCategories();
    }

    @Get('glasses')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'List cocktail glasses' })
    @ApiResponse({ status: 200, description: 'Return list of glasses.' })
    async getGlasses() {
        return this.cocktailService.listGlasses();
    }

    @Get('alcoholic')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'List alcoholic / non-alcoholic options' })
    @ApiResponse({ status: 200, description: 'Return alcoholic flags.' })
    async getAlcoholic() {
        return this.cocktailService.listAlcoholic();
    }

    @Get('by-category')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Filter cocktails by category' })
    @ApiQuery({ name: 'category', required: true })
    @ApiResponse({ status: 200, description: 'Return cocktails for the category.' })
    async byCategory(@Query('category') category: string) {
        return this.cocktailService.filterByCategory(category);
    }

    @Get('by-glass')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Filter cocktails by glass' })
    @ApiQuery({ name: 'glass', required: true })
    @ApiResponse({ status: 200, description: 'Return cocktails for the glass.' })
    async byGlass(@Query('glass') glass: string) {
        return this.cocktailService.filterByGlass(glass);
    }

    @Get('by-alcoholic')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Filter cocktails by alcoholic flag' })
    @ApiQuery({ name: 'alcoholic', required: true })
    @ApiResponse({ status: 200, description: 'Return cocktails for the alcoholic filter.' })
    async byAlcoholic(@Query('alcoholic') alcoholic: string) {
        return this.cocktailService.filterByAlcoholic(alcoholic);
    }

    @Get('by-letter')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Search cocktails by first letter' })
    @ApiQuery({ name: 'letter', required: true })
    @ApiResponse({ status: 200, description: 'Return cocktails starting with letter.' })
    async byLetter(@Query('letter') letter: string) {
        return this.cocktailService.searchByLetter(letter);
    }

    @Get('by-id')
    @UseGuards(JwtAuthGuard)
    @ApiOperation({ summary: 'Get cocktail by id' })
    @ApiQuery({ name: 'id', required: true })
    @ApiResponse({ status: 200, description: 'Return cocktail details by id.' })
    async byId(@Query('id') id: string) {
        return this.cocktailService.getCocktailById(id);
    }
}
