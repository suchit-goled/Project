import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Input from './Input';

describe('UI Input Component Tests', () => {
    test('renders input with label and id association', () => {
        render(<Input id="email-field" label="Email Address" placeholder="Enter email" />);
        const label = screen.getByText(/email address/i);
        const input = screen.getByPlaceholderText(/enter email/i);
        expect(label).toBeInTheDocument();
        expect(input).toBeInTheDocument();
        expect(input).toHaveAttribute('id', 'email-field');
    });

    test('renders error message when error prop is passed', () => {
        render(<Input id="pwd" label="Password" error="Password must be at least 6 characters" />);
        const errorText = screen.getByText(/password must be at least 6 characters/i);
        expect(errorText).toBeInTheDocument();
        expect(errorText).toHaveClass('ui-input-error-text');
    });

    test('invokes onChange handler when user inputs text', () => {
        const handleChange = jest.fn();
        render(<Input id="username" placeholder="Username" onChange={handleChange} />);
        const input = screen.getByPlaceholderText(/username/i);
        fireEvent.change(input, { target: { value: 'suchit' } });
        expect(handleChange).toHaveBeenCalledTimes(1);
    });

    test('supports custom input types and custom classNames', () => {
        const { container } = render(<Input id="age" type="number" className="custom-wrapper" />);
        const input = screen.getByRole('spinbutton');
        expect(input).toHaveAttribute('type', 'number');
        expect(container.firstChild).toHaveClass('custom-wrapper');
    });
});
