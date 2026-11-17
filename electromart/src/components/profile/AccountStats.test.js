import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import AccountStats from './AccountStats';
import OrderService from '../../services/order.service';
import WishlistService from '../../services/wishlist.service';
import CartService from '../../services/cart.service';

jest.mock('../../services/order.service', () => ({
    getOrders: jest.fn()
}));

jest.mock('../../services/wishlist.service', () => ({
    getWishlist: jest.fn()
}));

jest.mock('../../services/cart.service', () => ({
    getCart: jest.fn()
}));

describe('AccountStats Component Tests', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('renders initial default stat cards when no user is logged in', () => {
        render(<AccountStats />);
        expect(screen.getByText(/orders/i)).toBeInTheDocument();
        expect(screen.getByText(/wishlist/i)).toBeInTheDocument();
        expect(screen.getByText(/cart/i)).toBeInTheDocument();
        expect(screen.getByText(/addresses/i)).toBeInTheDocument();
    });

    test('populates metrics from services when user credentials exist in localStorage', async () => {
        localStorage.setItem('user', JSON.stringify({ id: '60d0fe4f5311236168a109ca', name: 'Suchit' }));

        OrderService.getOrders.mockResolvedValue({ orders: [{ _id: 'o1' }, { _id: 'o2' }] });
        WishlistService.getWishlist.mockResolvedValue({ wishlist: [{ _id: 'w1' }, { _id: 'w2' }, { _id: 'w3' }] });
        CartService.getCart.mockResolvedValue({ cart: [{ _id: 'c1' }] });

        const { container } = render(<AccountStats />);

        await waitFor(() => {
            expect(container.querySelector('.stat-card.orders p')).toHaveTextContent('2');
            expect(container.querySelector('.stat-card.wishlist p')).toHaveTextContent('3');
            expect(container.querySelector('.stat-card.cart p')).toHaveTextContent('1');
            expect(container.querySelector('.stat-card.address p')).toHaveTextContent('1');
        });
    });

    test('handles service errors gracefully without crashing the UI', async () => {
        localStorage.setItem('user', JSON.stringify({ id: '60d0fe4f5311236168a109ca' }));

        OrderService.getOrders.mockRejectedValue(new Error('Network error'));
        WishlistService.getWishlist.mockRejectedValue(new Error('Network error'));
        CartService.getCart.mockRejectedValue(new Error('Network error'));

        render(<AccountStats />);

        await waitFor(() => {
            expect(screen.getByText(/orders/i)).toBeInTheDocument();
        });
        expect(screen.getAllByText('0').length).toBeGreaterThanOrEqual(1);
    });
});
