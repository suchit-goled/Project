import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from './Button';

describe('UI Button Component Tests', () => {
    test('renders button with children and default primary variant', () => {
        render(<Button>Click Me</Button>);
        const btn = screen.getByRole('button', { name: /click me/i });
        expect(btn).toBeInTheDocument();
        expect(btn).toHaveClass('btn--primary');
        expect(btn).toHaveAttribute('type', 'button');
    });

    test('supports custom variant and button type', () => {
        render(<Button variant="secondary" type="submit">Submit Form</Button>);
        const btn = screen.getByRole('button', { name: /submit form/i });
        expect(btn).toHaveClass('btn--secondary');
        expect(btn).toHaveAttribute('type', 'submit');
    });

    test('invokes onClick handler when clicked', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Action</Button>);
        const btn = screen.getByRole('button', { name: /action/i });
        fireEvent.click(btn);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('disables button when disabled prop is true', () => {
        const handleClick = jest.fn();
        render(<Button disabled onClick={handleClick}>Disabled Action</Button>);
        const btn = screen.getByRole('button', { name: /disabled action/i });
        expect(btn).toBeDisabled();
        fireEvent.click(btn);
        expect(handleClick).not.toHaveBeenCalled();
    });
});
