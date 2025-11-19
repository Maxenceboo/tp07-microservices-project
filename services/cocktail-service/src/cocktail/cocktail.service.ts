import { HttpService } from '@nestjs/axios';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class CocktailService {
    private readonly API_URL = 'https://www.thecocktaildb.com/api/json/v1/1';

    constructor(private readonly httpService: HttpService) { }

    async getRandomCocktail() {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.API_URL}/random.php`)
            );
            return data.drinks ? data.drinks[0] : null;
        } catch (error) {
            throw new HttpException(
                'Failed to fetch random cocktail',
                HttpStatus.BAD_GATEWAY
            );
        }
    }

    async searchCocktails(query: string) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.API_URL}/search.php`, {
                    params: { s: query },
                })
            );
            return data.drinks || [];
        } catch (error) {
            throw new HttpException(
                'Failed to search cocktails',
                HttpStatus.BAD_GATEWAY
            );
        }
    }

    async getCocktailById(id: string) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.API_URL}/lookup.php`, {
                    params: { i: id },
                })
            );
            return data.drinks ? data.drinks[0] : null;
        } catch (error) {
            throw new HttpException(
                'Failed to fetch cocktail details',
                HttpStatus.BAD_GATEWAY
            );
        }
    }
}
