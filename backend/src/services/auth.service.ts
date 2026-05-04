import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/helpers';
import { generateToken } from '../utils/generateToken';
import { LoginInput, RegisterInput, AuthResponse, ManagedUser, PaginatedResult, UpdateUserPasswordInput, UpdateUserStatusInput } from '../types';
import { buildPaginationMeta, PaginationOptions, withPaginationSummary } from '../utils/pagination';

export class AuthService {
  static async login(input: LoginInput): Promise<AuthResponse> {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user || !user.isActive) {
      throw new Error('Invalid credentials');
    }

    const isValidPassword = await comparePassword(input.password, user.password);
    if (!isValidPassword) {
      throw new Error('Invalid credentials');
    }

    const token = generateToken(user);
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  static async register(input: RegisterInput, createdById?: string): Promise<AuthResponse> {
    if (!createdById) {
      throw new Error('Super admin access required');
    }

    const creator = await prisma.user.findUnique({
      where: { id: createdById },
      select: { id: true, role: true, isActive: true },
    });

    if (!creator || !creator.isActive || creator.role !== 'SUPER_ADMIN') {
      throw new Error('Super admin access required');
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        password: hashedPassword,
        name: input.name,
        role: input.role,
      },
    });

    const token = generateToken(user);
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  }

  static async getAssignableAdmins(pagination?: PaginationOptions) {
    const where = { role: 'ADMIN' as const, isActive: true };
    const select = {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
    };
    const orderBy = [{ name: 'asc' as const }, { email: 'asc' as const }];

    if (!pagination) {
      return prisma.user.findMany({ where, select, orderBy });
    }

    const [totalItems, admins] = await prisma.$transaction([
      prisma.user.count({ where }),
      prisma.user.findMany({ where, select, orderBy, skip: pagination.skip, take: pagination.limit }),
    ]);

    return {
      items: admins,
      pagination: buildPaginationMeta(pagination.page, pagination.limit, totalItems),
    };
  }

  static async getManagedUsers(pagination?: PaginationOptions): Promise<ManagedUser[] | PaginatedResult<ManagedUser>> {
    const select = {
      id: true,
      email: true,
      name: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      createdPolls: {
        where: { isActive: true },
        select: {
          id: true,
          title: true,
        },
        orderBy: { createdAt: 'desc' as const },
      },
    };
    const orderBy = [
      { role: 'desc' as const },
      { isActive: 'desc' as const },
      { name: 'asc' as const },
      { email: 'asc' as const },
    ];
    const mapManagedUser = (user: any): ManagedUser => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      activePollCount: user.createdPolls.length,
      activePolls: user.createdPolls,
    });

    if (!pagination) {
      const users = await prisma.user.findMany({ select, orderBy });
      return users.map(mapManagedUser);
    }

    const [totalItems, activeUsers, superAdmins, users] = await prisma.$transaction([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { role: 'SUPER_ADMIN' } }),
      prisma.user.findMany({ select, orderBy, skip: pagination.skip, take: pagination.limit }),
    ]);

    return {
      items: users.map(mapManagedUser),
      pagination: withPaginationSummary(buildPaginationMeta(pagination.page, pagination.limit, totalItems), {
        activeUsers,
        superAdmins,
      }),
    };
  }

  static async updateUserStatus(userId: string, input: UpdateUserStatusInput, actingUserId: string): Promise<ManagedUser> {
    if (userId === actingUserId && input.isActive === false) {
      throw new Error('You cannot suspend your own account');
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { isActive: input.isActive },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdPolls: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      activePollCount: user.createdPolls.length,
      activePolls: user.createdPolls,
    };
  }

  static async updateUserPassword(userId: string, input: UpdateUserPasswordInput): Promise<ManagedUser> {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!existingUser) {
      throw new Error('User not found');
    }

    const hashedPassword = await hashPassword(input.password);

    const user = await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        createdPolls: {
          where: { isActive: true },
          select: {
            id: true,
            title: true,
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      activePollCount: user.createdPolls.length,
      activePolls: user.createdPolls,
    };
  }
}