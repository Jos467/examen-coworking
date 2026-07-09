import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  findBySpace(spaceId: number) {
    return this.prisma.review.findMany({
      where: { spaceId },
      include: { user: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  create(userId: number, dto: CreateReviewDto) {
    return this.prisma.review.create({
      data: {
        rating: dto.rating,
        comment: dto.comment,
        userId,
        spaceId: dto.spaceId,
      },
    });
  }

  remove(id: number) {
    return this.prisma.review.delete({ where: { id } });
  }
}
