import prisma from '../config/database';
import { CreateQuestionInput, UpdateQuestionInput } from '../types';

export class QuestionService {
  static async createQuestion(pollId: string, input: CreateQuestionInput, userId: string, role: 'SUPER_ADMIN' | 'ADMIN') {
    const poll = await prisma.poll.findFirst({
      where: role === 'SUPER_ADMIN' ? { id: pollId } : { id: pollId, createdById: userId },
      select: { id: true, _count: { select: { votes: true } } },
    });

    if (!poll) {
      throw new Error('Poll not found');
    }

    if ((poll._count?.votes ?? 0) > 0) {
      throw new Error('You cannot add questions after votes have been submitted');
    }

    return prisma.question.create({
      data: {
        pollId,
        text: input.text,
        type: input.type,
        order: input.order,
        options: input.options ? {
          create: input.options.map((o) => ({
            text: o.text,
            order: o.order,
          })),
        } : undefined,
      },
      include: { options: true },
    });
  }

  static async updateQuestion(id: string, input: UpdateQuestionInput, userId: string, role: 'SUPER_ADMIN' | 'ADMIN') {
    const question = await prisma.question.findFirst({
      where: role === 'SUPER_ADMIN' ? { id } : { id, poll: { createdById: userId } },
      include: {
        options: { orderBy: { order: 'asc' } },
        responses: { select: { id: true } },
        poll: { select: { _count: { select: { votes: true } } } },
      },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    if ((question.poll?._count?.votes ?? 0) > 0) {
      throw new Error('You cannot edit questions after votes have been submitted');
    }

    const updateData: any = {};
    if (input.text) updateData.text = input.text;
    if (input.type) updateData.type = input.type;
    if (input.order !== undefined) updateData.order = input.order;

    const hasResponses = question.responses.length > 0;
    const existingOptions = [...question.options].sort((left, right) => left.order - right.order);
    const nextOptions = (input.options ?? []).map((option) => ({
      id: option.id,
      text: option.text,
      order: option.order,
    }));
    const normalizedExistingOptions = existingOptions.map((option) => option.text.trim().toLowerCase());
    const normalizedNextOptions = nextOptions
      .sort((left, right) => left.order - right.order)
      .map((option) => option.text.trim().toLowerCase());
    const optionStructureChanged = input.options !== undefined && (
      normalizedExistingOptions.length !== normalizedNextOptions.length
      || normalizedExistingOptions.some((option, index) => option !== normalizedNextOptions[index])
    );
    const questionTypeChanged = input.type !== undefined && input.type !== question.type;

    if (hasResponses && (optionStructureChanged || questionTypeChanged)) {
      throw new Error('You cannot change question type or answer options after votes have been submitted');
    }

    const optionOperations = input.options
      ? hasResponses
        ? {
            updateMany: nextOptions
              .filter((option) => option.id && existingOptions.some((existingOption) => existingOption.id === option.id))
              .map((option) => ({
                where: { id: option.id! },
                data: {
                  text: option.text,
                  order: option.order,
                },
              })),
          }
        : {
            deleteMany: { questionId: id },
            ...(nextOptions.length > 0
              ? {
                  createMany: {
                    data: nextOptions.map((option) => ({
                      text: option.text,
                      order: option.order,
                    })),
                  },
                }
              : {}),
          }
      : undefined;

    return prisma.question.update({
      where: { id },
      data: {
        ...updateData,
        ...(optionOperations ? { options: optionOperations } : {}),
      },
      include: { options: { orderBy: { order: 'asc' } } },
    });
  }

  static async deleteQuestion(id: string, userId: string, role: 'SUPER_ADMIN' | 'ADMIN') {
    const question = await prisma.question.findFirst({
      where: role === 'SUPER_ADMIN' ? { id } : { id, poll: { createdById: userId } },
      select: { id: true, poll: { select: { _count: { select: { votes: true } } } } },
    });

    if (!question) {
      throw new Error('Question not found');
    }

    if ((question.poll?._count?.votes ?? 0) > 0) {
      throw new Error('You cannot delete questions after votes have been submitted');
    }

    await prisma.question.delete({ where: { id } });
  }
}