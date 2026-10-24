import '@testing-library/jest-dom';
import React from 'react';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Polyfill window.matchMedia for Jest JSDOM
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Polyfill window.scrollTo
window.scrollTo = jest.fn();

// Mock Swiper for Jest JSDOM environment using virtual mocks
jest.mock('swiper/react', () => ({
    Swiper: ({ children }) => <div data-testid="swiper-mock">{children}</div>,
    SwiperSlide: ({ children }) => <div data-testid="swiper-slide-mock">{children}</div>,
}), { virtual: true });

jest.mock('swiper/modules', () => ({
    Autoplay: () => null,
    Navigation: () => null,
    Pagination: () => null,
}), { virtual: true });

jest.mock('swiper/css', () => ({}), { virtual: true });
jest.mock('swiper/css/navigation', () => ({}), { virtual: true });
jest.mock('swiper/css/pagination', () => ({}), { virtual: true });

// Mock react-confetti to prevent canvas animation loops in JSDOM
jest.mock('react-confetti', () => () => null);

// Mock framer-motion to prevent infinite requestAnimationFrame animation loops during tests
jest.mock('framer-motion', () => {
    const actual = jest.requireActual('framer-motion');
    return {
        ...actual,
        AnimatePresence: ({ children }) => <>{children}</>,
        motion: new Proxy(actual.motion, {
            get: (target, prop) => {
                return ({ children, animate, initial, exit, variants, transition, whileHover, whileTap, whileInView, viewport, ...domProps }) => {
                    const Component = prop;
                    return <Component {...domProps}>{children}</Component>;
                };
            }
        })
    };
});

// Mock axios instance to prevent unhandled network timeouts during tests
jest.mock('./api/axios', () => {
    const mockAxiosInstance = {
        get: jest.fn().mockResolvedValue({
            data: {
                success: true,
                products: [],
                orders: [],
                cart: [],
                count: 0,
                total: 0,
                page: 1,
                totalPages: 1
            }
        }),
        post: jest.fn().mockResolvedValue({ data: { success: true } }),
        put: jest.fn().mockResolvedValue({ data: { success: true } }),
        delete: jest.fn().mockResolvedValue({ data: { success: true } }),
        interceptors: {
            request: { use: jest.fn() },
            response: { use: jest.fn() }
        }
    };
    return {
        __esModule: true,
        default: mockAxiosInstance
    };
});
