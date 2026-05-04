import React from 'react';
import Button from './Button';

interface PaginationControlsProps {
	currentPage: number;
	totalPages: number;
	totalItems: number;
	itemLabel: string;
	onPageChange: (page: number) => void;
	className?: string;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, totalItems, itemLabel, onPageChange, className = '' }) => {
	if (totalItems === 0) {
		return null;
	}

	return (
		<div className={`flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between ${className}`}>
			<p className="text-sm text-slate-500">
				Showing page {currentPage} of {totalPages} · {totalItems} {itemLabel}
			</p>
			{totalPages > 1 ? (
				<div className="flex items-center gap-3">
					<Button type="button" variant="secondary" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
						Previous
					</Button>
					<span className="text-sm font-medium text-slate-600">{currentPage} / {totalPages}</span>
					<Button type="button" variant="secondary" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
						Next
					</Button>
				</div>
			) : null}
		</div>
	);
};

export default PaginationControls;