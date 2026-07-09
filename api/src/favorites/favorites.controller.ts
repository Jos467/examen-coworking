import { Controller, Get, Post, Body, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
@UseGuards(JwtAuthGuard)
export class FavoritesController {
  constructor(private favoritesService: FavoritesService) {}

  @Get('me')
  findMine(@Req() req: any) {
    return this.favoritesService.findMine(req.user.userId);
  }

  @Post('toggle')
  toggle(@Req() req: any, @Body('spaceId') spaceId: number) {
    return this.favoritesService.toggle(req.user.userId, Number(spaceId));
  }
}