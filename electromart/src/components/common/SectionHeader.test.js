import React from 'react';
import { render, screen } from '@testing-library/react';
import SectionHeader from './SectionHeader';

describe('Common SectionHeader Component Tests', () => {
    test('renders badge, title, and subtitle text properly', () => {
        render(
            <SectionHeader
                badge="HOT DEALS"
                title="Weekly Electronics Sale"
                subtitle="Save up to 40% on top tech gear"
            />
        );

        expect(screen.getByText('HOT DEALS')).toBeInTheDocument();
        expect(screen.getByText('Weekly Electronics Sale')).toBeInTheDocument();
        expect(screen.getByText('Save up to 40% on top tech gear')).toBeInTheDocument();
    });

    test('applies proper styling classes', () => {
        const { container } = render(
            <SectionHeader
                badge="FEATURED"
                title="Flagship Audio"
                subtitle="High fidelity sound"
            />
        );

        expect(container.querySelector('.section-header')).toBeInTheDocument();
        expect(container.querySelector('.section-header__badge')).toBeInTheDocument();
        expect(container.querySelector('.section-header__title')).toBeInTheDocument();
        expect(container.querySelector('.section-header__subtitle')).toBeInTheDocument();
    });
});
