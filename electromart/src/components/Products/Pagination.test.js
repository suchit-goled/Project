import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Pagination from './Pagination';

describe('Products Pagination Component Tests', () => {
    test('renders nothing when totalPages is 1 or less', () => {
        const { container } = render(<Pagination page={1} totalPages={1} setPage={jest.fn()} />);
        expect(container.firstChild).toBeNull();
    });

    test('renders page buttons correctly when totalPages <= 7', () => {
        render(<Pagination page={2} totalPages={5} setPage={jest.fn()} />);
        expect(screen.getByRole('button', { name: '1' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '2' })).toHaveClass('active');
        expect(screen.getByRole('button', { name: '5' })).toBeInTheDocument();
        expect(screen.getByText('← Previous')).not.toBeDisabled();
        expect(screen.getByText('Next →')).not.toBeDisabled();
    });

    test('disables Previous on page 1 and Next on last page', () => {
        const { rerender } = render(<Pagination page={1} totalPages={4} setPage={jest.fn()} />);
        expect(screen.getByText('← Previous')).toBeDisabled();
        expect(screen.getByText('Next →')).not.toBeDisabled();

        rerender(<Pagination page={4} totalPages={4} setPage={jest.fn()} />);
        expect(screen.getByText('← Previous')).not.toBeDisabled();
        expect(screen.getByText('Next →')).toBeDisabled();
    });

    test('triggers setPage when clicking page numbers and navigation buttons', () => {
        const handleSetPage = jest.fn();
        render(<Pagination page={2} totalPages={5} setPage={handleSetPage} />);

        fireEvent.click(screen.getByRole('button', { name: '3' }));
        expect(handleSetPage).toHaveBeenCalledWith(3);

        fireEvent.click(screen.getByText('← Previous'));
        expect(handleSetPage).toHaveBeenCalledWith(1);

        fireEvent.click(screen.getByText('Next →'));
        expect(handleSetPage).toHaveBeenCalledWith(3);
    });
});
