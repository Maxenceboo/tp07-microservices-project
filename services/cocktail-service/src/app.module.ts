import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CocktailModule } from './cocktail/cocktail.module';
import { HistoryModule } from './history/history.module';

@Module({
  imports: [CocktailModule, HistoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
