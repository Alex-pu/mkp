import prisma from '../config/database';
import { CreatePollInput, UpdatePollInput, Poll } from '../types';

type PollRecord = Awaited<ReturnType<typeof prisma.poll.findFirst>> & {
  questions: Array<{
    id: string;
    pollId: string;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT';
    order: number;
    createdAt: Date;
    updatedAt: Date;
    options: Array<{
      id: string;
      questionId: string;
      text: string;
      order: number;
      createdAt: Date;
    }>;
  }>;
  _count?: {
    votes: number;
  };
  assignments?: Array<{
    admin: {
      id: string;
      email: string;
      name: string | null;
      role: 'SUPER_ADMIN' | 'ADMIN';
    };
  }>;
};

const pollInclude = {
  questions: {
    include: { options: { orderBy: { order: 'asc' as const } } },
    orderBy: { order: 'asc' as const },
  },
  _count: {
    select: { votes: true },
  },
  assignments: {
    include: {
      admin: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc' as const,
    },
  },
};

const mapPoll = (poll: any): Poll => ({
  id: poll.id,
  title: poll.title,
  description: poll.description,
  isActive: poll.isActive,
  isPublic: poll.isPublic,
  createdById: poll.createdById,
  createdAt: poll.createdAt,
  updatedAt: poll.updatedAt,
  totalVotes: poll._count?.votes ?? 0,
  questions: poll.questions,
  assignedAdmins: poll.assignments?.map((assignment: any) => assignment.admin) ?? [],
});

const getValidatedAssignedAdminIds = async (adminIds: string[]) => {
  const uniqueAdminIds = [...new Set(adminIds)];

  if (uniqueAdminIds.length === 0) {
    return uniqueAdminIds;
  }

  const admins = await prisma.user.findMany({
    where: {
      id: { in: uniqueAdminIds },
      role: 'ADMIN',
      isActive: true,
    },
    select: { id: true },
  });

  if (admins.length !== uniqueAdminIds.length) {
    throw new Error('One or more assigned admins are invalid');
  }

  return uniqueAdminIds;
};

export class PollService {
  static async getAllPolls(userId: string, role: 'SUPER_ADMIN' | 'ADMIN'): Promise<Poll[]> {
    const polls = await prisma.poll.findMany({
      where: role === 'SUPER_ADMIN' ? {} : { createdById: userId },
      include: pollInclude,
      orderBy: { createdAt: 'desc' },
    });

    return polls.map(mapPoll);
  }

  static async getPollById(id: string, userId?: string, role: 'SUPER_ADMIN' | 'ADMIN' = 'ADMIN'): Promise<Poll | null> {
    const where: any = { id };
    if (role !== 'SUPER_ADMIN' && userId) where.createdById = userId;

    const poll = await prisma.poll.findFirst({
      where,
      include: pollInclude,
    });

    return poll ? mapPoll(poll) : null;
  }

  static async getPublicPoll(id: string): Promise<Poll | null> {
    const poll = await prisma.poll.findFirst({
      where: { id, isActive: true, isPublic: true },
      include: pollInclude,
    });

    return poll ? mapPoll(poll) : null;
  }

  static async createPoll(input: CreatePollInput, userId: string, role: 'SUPER_ADMIN' | 'ADMIN'): Promise<Poll> {
    if (role !== 'SUPER_ADMIN' && (input.isPublic === false || (input.assignedAdminIds?.length ?? 0) > 0)) {
      throw new Error('Only super admins can create private assigned polls');
    }

    const isPublic = role === 'SUPER_ADMIN' ? input.isPublic ?? true : true;
    const assignedAdminIds = !isPublic && role === 'SUPER_ADMIN'
      ? await getValidatedAssignedAdminIds(input.assignedAdminIds ?? [])
      : [];

    const poll = await prisma.poll.create({
      data: {
        title: input.title,
        description: input.description,
        isActive: input.isActive ?? true,
        isPublic,
        createdById: userId,
        assignments: assignedAdminIds.length > 0 ? {
          createMany: {
            data: assignedAdminIds.map((adminId) => ({ adminId })),
          },
        } : undefined,
        questions: {
          create: input.questions.map((q) => ({
            text: q.text,
            type: q.type,
            order: q.order,
            options: q.options ? {
              create: q.options.map((o) => ({
                text: o.text,
                order: o.order,
              })),
            } : undefined,
          })),
        },
      },
      include: pollInclude,
    });

    return mapPoll(poll);
  }

  static async updatePoll(id: string, input: UpdatePollInput, userId: string, role: 'SUPER_ADMIN' | 'ADMIN'): Promise<Poll> {
    const existingPoll = await prisma.poll.findFirst({
      where: role === 'SUPER_ADMIN' ? { id } : { id, createdById: userId },
      select: { id: true, _count: { select: { votes: true } } },
    });

    if (!existingPoll) {
      throw new Error('Poll not found');
    }

    const hasVotes = (existingPoll._count?.votes ?? 0) > 0;

    if (hasVotes) {
      const isStatusOnlyUpdate = input.isActive !== undefined
        && input.title === undefined
        && input.description === undefined
        && input.isPublic === undefined
        && input.assignedAdminIds === undefined;

      if (!isStatusOnlyUpdate) {
        throw new Error('This poll is locked after voting starts. Only active or inactive status can still be changed');
      }
    }

    if (role !== 'SUPER_ADMIN' && (input.isPublic === false || (input.assignedAdminIds?.length ?? 0) > 0)) {
      throw new Error('Only super admins can manage private assigned polls');
    }

    const isPublic = role === 'SUPER_ADMIN' ? input.isPublic : undefined;
    const assignedAdminIds = role === 'SUPER_ADMIN' && isPublic === false
      ? await getValidatedAssignedAdminIds(input.assignedAdminIds ?? [])
      : [];

    const poll = await prisma.poll.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        isActive: input.isActive,
        ...(role === 'SUPER_ADMIN' ? { isPublic: isPublic ?? undefined } : {}),
        ...(role === 'SUPER_ADMIN' && (input.isPublic !== undefined || input.assignedAdminIds !== undefined)
          ? {
              assignments: {
                deleteMany: {},
                ...(isPublic === false && assignedAdminIds.length > 0
                  ? {
                      createMany: {
                        data: assignedAdminIds.map((adminId) => ({ adminId })),
                      },
                    }
                  : {}),
              },
            }
          : {}),
      },
      include: pollInclude,
    });

    return mapPoll(poll);
  }

  static async deletePoll(id: string, userId: string, role: 'SUPER_ADMIN' | 'ADMIN'): Promise<void> {
    const existingPoll = await prisma.poll.findFirst({
      where: role === 'SUPER_ADMIN' ? { id } : { id, createdById: userId },
      select: { id: true, _count: { select: { votes: true } } },
    });

    if (!existingPoll) {
      throw new Error('Poll not found');
    }

    if ((existingPoll._count?.votes ?? 0) > 0) {
      throw new Error('This poll can no longer be deleted because it already has recorded votes');
    }

    await prisma.poll.delete({
      where: { id },
    });
  }

  static async getPublicPolls(): Promise<Poll[]> {
    const polls = await prisma.poll.findMany({
      where: { isActive: true, isPublic: true },
      include: pollInclude,
      orderBy: { createdAt: 'desc' },
    });

    return polls.map(mapPoll);
  }

  static async getAssignedPrivatePolls(userId: string): Promise<Poll[]> {
    const polls = await prisma.poll.findMany({
      where: {
        isPublic: false,
        assignments: {
          some: { adminId: userId },
        },
      },
      include: pollInclude,
      orderBy: { createdAt: 'desc' },
    });

    return polls.map(mapPoll);
  }

  static async getAssignedPrivatePollById(id: string, userId: string, role: 'SUPER_ADMIN' | 'ADMIN'): Promise<Poll | null> {
    const poll = await prisma.poll.findFirst({
      where: role === 'SUPER_ADMIN'
        ? { id, isPublic: false }
        : {
            id,
            isPublic: false,
            assignments: {
              some: { adminId: userId },
            },
          },
      include: pollInclude,
    });

    return poll ? mapPoll(poll) : null;
  }
}