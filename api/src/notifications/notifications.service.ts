import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  findMine(userId: number) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  markRead(id: number) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  markAllRead(userId: number) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  // útil para crear notificaciones automáticas desde ReservationsService
  create(userId: number, message: string) {
    return this.prisma.notification.create({ data: { userId, message } });
  }
}
