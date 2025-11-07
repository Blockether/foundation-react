import { render, screen } from '../../../tests/__mocks__/test-utils';
import { CockpitsComposer } from '../../../src/components/foundation/blockether-foundation-cockpit';

describe('CockpitsComposer Responsive Behavior', () => {
  // Mock window.innerWidth and resize events
  const originalInnerWidth = window.innerWidth;

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    // Clean up any resize event listeners
    window.dispatchEvent(new Event('resize'));
  });

  it('inherits parent container width', () => {
    const { container } = render(
      <div style={{ width: '500px' }}>
        <CockpitsComposer>
          <p>Test content</p>
        </CockpitsComposer>
      </div>
    );

    const parent = container.firstChild as HTMLElement;
    const cockpit = parent?.firstChild as HTMLElement;

    expect(parent).toHaveStyle({ width: '500px' });
    expect(cockpit).toBeInTheDocument();
  });

  it('adapts to different parent container sizes', () => {
    const { container, rerender } = render(
      <div style={{ width: '300px' }}>
        <CockpitsComposer>
          <p>Test content</p>
        </CockpitsComposer>
      </div>
    );

    let parent = container.firstChild as HTMLElement;
    let cockpit = parent?.firstChild as HTMLElement;

    expect(parent).toHaveStyle({ width: '300px' });
    expect(cockpit).toBeInTheDocument();

    // Rerender with different parent width
    rerender(
      <div style={{ width: '800px' }}>
        <CockpitsComposer>
          <p>Test content</p>
        </CockpitsComposer>
      </div>
    );

    parent = container.firstChild as HTMLElement;
    cockpit = parent?.firstChild as HTMLElement;

    expect(parent).toHaveStyle({ width: '800px' });
    expect(cockpit).toBeInTheDocument();
  });

  it('handles percentage-based parent widths', () => {
    const { container } = render(
      <div style={{ width: '100%' }}>
        <CockpitsComposer>
          <p>Test content</p>
        </CockpitsComposer>
      </div>
    );

    const parent = container.firstChild as HTMLElement;
    const cockpit = parent?.firstChild as HTMLElement;

    expect(parent).toHaveStyle({ width: '100%' });
    expect(cockpit).toBeInTheDocument();
  });

  it('maintains responsive behavior with viewport changes', () => {
    // Mock different viewport sizes
    window.innerWidth = 320; // Mobile

    const { container } = render(
      <div style={{ width: '100%' }}>
        <CockpitsComposer>
          <p>Mobile content</p>
        </CockpitsComposer>
      </div>
    );

    const parent = container.firstChild as HTMLElement;
    const cockpit = parent?.firstChild as HTMLElement;

    expect(cockpit).toBeInTheDocument();
    expect(screen.getByText('Mobile content')).toBeInTheDocument();

    // Simulate desktop viewport
    window.innerWidth = 1200;
    window.dispatchEvent(new Event('resize'));

    expect(cockpit).toBeInTheDocument();
    expect(screen.getByText('Mobile content')).toBeInTheDocument();
  });

  it('respects max-width constraints from parent', () => {
    const { container } = render(
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <CockpitsComposer>
          <p>Constrained content</p>
        </CockpitsComposer>
      </div>
    );

    const parent = container.firstChild as HTMLElement;
    const cockpit = parent?.firstChild as HTMLElement;

    expect(parent).toHaveStyle({ maxWidth: '600px' });
    expect(cockpit).toBeInTheDocument();
  });

  it('handles flex container parent', () => {
    const { container } = render(
      <div style={{ display: 'flex', width: '100%' }}>
        <CockpitsComposer style={{ flex: 1 }}>
          <p>Flex content</p>
        </CockpitsComposer>
      </div>
    );

    const parent = container.firstChild as HTMLElement;
    const cockpit = parent?.firstChild as HTMLElement;

    expect(parent).toHaveStyle({ display: 'flex' });
    expect(cockpit).toBeInTheDocument();
    expect(screen.getByText('Flex content')).toBeInTheDocument();
  });
});