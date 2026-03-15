import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns user by id (id, email, createdAt only; no passwordHash).
   * @throws NotFoundException if user not found
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, createdAt: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Permanently deletes the user. Cascades to sessions and user-games.
   * @param id - User id
   */
  async remove(id: string) {
    await this.prisma.user.delete({ where: { id } });
  }
}
