import prisma from '../config/database';
import { hashPassword, comparePassword } from '../utils/helpers';
import { generateToken } from '../utils/generateToken';
import { LoginInput, RegisterInput, AuthResponse, ManagedUser, UpdateUserPasswordInput, UpdateUserStatusInput } from '../types';

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

  static async getAssignableAdmins() {
    return prisma.user.findMany({
      where: { role: 'ADMIN', isActive: true },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: [{ name: 'asc' }, { email: 'asc' }],
    });
  }

  static async getManagedUsers(): Promise<ManagedUser[]> {
    const users = await prisma.user.findMany({
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
      orderBy: [
        { role: 'desc' },
        { isActive: 'desc' },
        { name: 'asc' },
        { email: 'asc' },
      ],
    });

    return users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      activePollCount: user.createdPolls.length,
      activePolls: user.createdPolls,
    }));
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