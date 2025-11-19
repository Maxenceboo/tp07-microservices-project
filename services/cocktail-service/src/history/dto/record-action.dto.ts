import { ApiProperty } from '@nestjs/swagger';

export class RecordActionDto {
    @ApiProperty({ example: '11007', description: 'The ID of the cocktail' })
    cocktailId: string;

    @ApiProperty({ enum: ['like', 'dislike'], description: 'The action performed' })
    action: 'like' | 'dislike';

    @ApiProperty({ enum: ['tinder', 'search'], description: 'The source of the action' })
    source: 'tinder' | 'search';
}
