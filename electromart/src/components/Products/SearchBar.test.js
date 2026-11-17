import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import SearchBar from './SearchBar';

describe('Products SearchBar Component Tests', () => {
    test('renders search input with placeholder', () => {
        render(<SearchBar value="" onChange={jest.fn()} />);
        const input = screen.getByPlaceholderText(/search products\.\.\./i);
        expect(input).toBeInTheDocument();
        expect(input).toHaveValue('');
    });

    test('binds value correctly', () => {
        render(<SearchBar value="MacBook Pro" onChange={jest.fn()} />);
        const input = screen.getByPlaceholderText(/search products\.\.\./i);
        expect(input).toHaveValue('MacBook Pro');
    });

    test('invokes onChange handler when user enters search term', () => {
        const handleChange = jest.fn();
        render(<SearchBar value="" onChange={handleChange} />);
        const input = screen.getByPlaceholderText(/search products\.\.\./i);
        fireEvent.change(input, { target: { value: 'Sony Headphones' } });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });
});
