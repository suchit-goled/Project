import React from 'react';
import { render, screen } from '@testing-library/react';
import Loader from './Loader';

describe('UI Loader Component Tests', () => {
    test('renders default loader with loading text', () => {
        const { container } = render(<Loader />);
        const text = screen.getByText(/loading\.\.\./i);
        expect(text).toBeInTheDocument();
        expect(container.firstChild).toHaveClass('loader-container', 'medium');
    });

    test('supports custom text and custom size variant', () => {
        const { container } = render(<Loader size="large" text="Fetching electronics..." />);
        const text = screen.getByText(/fetching electronics\.\.\./i);
        expect(text).toBeInTheDocument();
        expect(container.firstChild).toHaveClass('loader-container', 'large');
    });

    test('does not render text paragraph when text is empty or null', () => {
        const { container } = render(<Loader text="" />);
        const textElement = container.querySelector('.loader-text');
        expect(textElement).toBeNull();
    });
});
