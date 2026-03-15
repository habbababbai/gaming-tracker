import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { UpdateProfileDto } from './dto/update-profile.dto.js';

const profileSelect = {
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  nick: true,
  dateOfBirth: true,
  avatarUrl: true,
  locale: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Returns user profile by id (no passwordHash).
   * @throws NotFoundException if user not found
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: profileSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /**
   * Updates profile for user. Only provided fields are updated.
   * @throws NotFoundException if user not found
   */
  async updateProfile(id: string, dto: UpdateProfileDto) {
    await this.prisma.user.update({
      where: { id },
      data: {
        ...(dto.firstName !== undefined &&
          dto.firstName.trim() !== '' && { firstName: dto.firstName.trim() }),
        ...(dto.lastName !== undefined &&
          dto.lastName.trim() !== '' && { lastName: dto.lastName.trim() }),
        ...(dto.nick !== undefined &&
          dto.nick.trim() !== '' && { nick: dto.nick.trim() }),
        ...(dto.dateOfBirth !== undefined &&
          dto.dateOfBirth !== '' && {
            dateOfBirth: new Date(dto.dateOfBirth),
          }),
        ...(dto.avatarUrl !== undefined && {
          avatarUrl: dto.avatarUrl || null,
        }),
      },
    });
    return this.findById(id);
  }

  /**
   * Permanently deletes the user. Cascades to sessions and user-games.
   * @param id - User id
   */
  async remove(id: string) {
    await this.prisma.user.delete({ where: { id } });
  }
}
