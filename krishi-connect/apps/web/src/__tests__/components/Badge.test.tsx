import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Badge } from '../../components/ui/badge';

describe('Badge Component', () => {
  it('should render content correctly', () => {
    render(<Badge>Pending</Badge>);
    expect(screen.getByText('Pending')).toBeInTheDocument();
  });

  it('should apply variant classes correctly', () => {
    const { container } = render(<Badge variant="success">Approved</Badge>);
    expect(container.firstChild).toHaveClass('bg-green-100');
  });
});
