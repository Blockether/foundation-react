import { render, screen } from '../../../tests/__mocks__/test-utils';
import { CockpitsComposer } from '../../../src/components/foundation/blockether-foundation-cockpit';

describe('CockpitsComposer', () => {
  it('renders children correctly', () => {
    render(
      <CockpitsComposer>
        <p>Test content</p>
      </CockpitsComposer>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <CockpitsComposer className="custom-class">
        <p>Test</p>
      </CockpitsComposer>
    );

    const cockpit = container.firstChild as HTMLElement;
    expect(cockpit).toHaveClass('custom-class');
  });

  it('has w-full class by default for parent width inheritance', () => {
    const { container } = render(
      <CockpitsComposer>
        <p>Test</p>
      </CockpitsComposer>
    );

    const cockpit = container.firstChild as HTMLElement;
    expect(cockpit).toHaveClass('w-full');
  });

  it('supports asChild pattern', () => {
    render(
      <CockpitsComposer asChild>
        <section data-testid="custom-element">
          <p>Custom element content</p>
        </section>
      </CockpitsComposer>
    );

    expect(screen.getByTestId('custom-element')).toBeInTheDocument();
    expect(screen.getByText('Custom element content')).toBeInTheDocument();
  });

  it('forwards HTML div attributes', () => {
    const { container } = render(
      <CockpitsComposer
        role="region"
        aria-label="Test region"
        data-testid="cockpit"
      >
        <p>Test content</p>
      </CockpitsComposer>
    );

    const cockpit = container.firstChild as HTMLElement;
    expect(cockpit).toHaveAttribute('role', 'region');
    expect(cockpit).toHaveAttribute('aria-label', 'Test region');
  });

  it('renders without children gracefully', () => {
    const { container } = render(<CockpitsComposer />);

    expect(container.firstChild).toBeInTheDocument();
  });

  it('merges className with base classes correctly', () => {
    const { container } = render(
      <CockpitsComposer className="bg-red-500 text-white">
        <p>Test</p>
      </CockpitsComposer>
    );

    const cockpit = container.firstChild as HTMLElement;
    expect(cockpit).toHaveClass('w-full', 'bg-red-500', 'text-white');
  });
});