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

    async listCategories() {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.API_URL}/list.php`, {
                    params: { c: 'list' },
                })
            );
            return data.drinks?.map((d: any) => d.strCategory).filter(Boolean) || [];
        } catch {
            throw new HttpException(
                'Failed to fetch categories',
                HttpStatus.BAD_GATEWAY
            );
        }
    }

    async listGlasses() {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.API_URL}/list.php`, {
                    params: { g: 'list' },
                })
            );
            return data.drinks?.map((d: any) => d.strGlass).filter(Boolean) || [];
        } catch {
            throw new HttpException(
                'Failed to fetch glasses',
                HttpStatus.BAD_GATEWAY
            );
        }
    }

    async listAlcoholic() {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.API_URL}/list.php`, {
                    params: { a: 'list' },
                })
            );
            return data.drinks?.map((d: any) => d.strAlcoholic).filter(Boolean) || [];
        } catch {
            throw new HttpException(
                'Failed to fetch alcoholic options',
                HttpStatus.BAD_GATEWAY
            );
        }
    }

    async filterByCategory(category: string) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.API_URL}/filter.php`, {
                    params: { c: category },
                })
            );
            return data.drinks || [];
        } catch {
            throw new HttpException(
                'Failed to filter by category',
                HttpStatus.BAD_GATEWAY
            );
        }
    }

    async filterByGlass(glass: string) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.API_URL}/filter.php`, {
                    params: { g: glass },
                })
            );
            return data.drinks || [];
        } catch {
            throw new HttpException(
                'Failed to filter by glass',
                HttpStatus.BAD_GATEWAY
            );
        }
    }

    async filterByAlcoholic(alcoholic: string) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.API_URL}/filter.php`, {
                    params: { a: alcoholic },
                })
            );
            return data.drinks || [];
        } catch {
            throw new HttpException(
                'Failed to filter by alcoholic flag',
                HttpStatus.BAD_GATEWAY
            );
        }
    }

    async searchByLetter(letter: string) {
        try {
            const { data } = await firstValueFrom(
                this.httpService.get(`${this.API_URL}/search.php`, {
                    params: { f: letter },
                })
            );
            return data.drinks || [];
        } catch {
            throw new HttpException(
                'Failed to search by letter',
                HttpStatus.BAD_GATEWAY
            );
        }
    }
}
