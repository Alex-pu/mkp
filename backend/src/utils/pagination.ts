import { PaginationMeta } from '../types';

export interface PaginationOptions {
	page: number;
	limit: number;
	skip: number;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export const parsePaginationQuery = (query: Record<string, unknown>): PaginationOptions | null => {
	const rawPage = typeof query.page === 'string' ? Number.parseInt(query.page, 10) : undefined;
	const rawLimit = typeof query.limit === 'string' ? Number.parseInt(query.limit, 10) : undefined;

	if (rawPage === undefined && rawLimit === undefined) {
		return null;
	}

	const page = Number.isFinite(rawPage) && (rawPage as number) > 0 ? (rawPage as number) : DEFAULT_PAGE;
	const limit = Number.isFinite(rawLimit) && (rawLimit as number) > 0
		? Math.min(rawLimit as number, MAX_LIMIT)
		: DEFAULT_LIMIT;

	return {
		page,
		limit,
		skip: (page - 1) * limit,
	};
};

export const buildPaginationMeta = (page: number, limit: number, totalItems: number): PaginationMeta => {
	const totalPages = Math.max(1, Math.ceil(totalItems / limit));

	return {
		page,
		limit,
		totalItems,
		totalPages,
		hasNextPage: page < totalPages,
		hasPreviousPage: page > 1,
	};
};

	export const withPaginationSummary = (pagination: PaginationMeta, summary: Record<string, number>): PaginationMeta => ({
		...pagination,
		summary,
	});

export const paginateArray = <T>(items: T[], pagination: PaginationOptions) => {
	const startIndex = pagination.skip;
	const paginatedItems = items.slice(startIndex, startIndex + pagination.limit);

	return {
		items: paginatedItems,
		pagination: buildPaginationMeta(pagination.page, pagination.limit, items.length),
	};
};