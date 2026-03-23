import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Landing from '../pages/Landing';
import { describe, it, expect, vi } from 'vitest';

// Mock framer-motion to avoid issues with animations in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h1: ({ children, ...props }: any) => <h1 {...props}>{children}</h1>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

describe('Landing Page', () => {
  it('renders the landing page title', () => {
    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );
    
    expect(screen.getByText(/Student Clearance,/i)).toBeInTheDocument();
    expect(screen.getByText(/Redefined./i)).toBeInTheDocument();
  });

  it('renders the get started button', () => {
    render(
      <BrowserRouter>
        <Landing />
      </BrowserRouter>
    );
    
    const buttons = screen.getAllByText(/Get Started/i);
    expect(buttons.length).toBeGreaterThan(0);
  });
});
