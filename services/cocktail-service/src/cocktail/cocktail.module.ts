import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { CocktailController } from './cocktail.controller';
import { CocktailService } from './cocktail.service';

@Module({
    imports: [HttpModule],
    controllers: [CocktailController],
    providers: [CocktailService],
})
export class CocktailModule { }
