export interface PaginationParams {
	page?: number;
	limit?: number;
	search?: string;
	last24HoursOnly?: boolean;
}

export interface PaginationMeta {
	page: number;
	limit: number;
	totalItems: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	summary?: Record<string, number>;
}

export interface PaginatedResult<T> {
	items: T[];
	meta: PaginationMeta;
}