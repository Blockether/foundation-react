import { render, screen } from '../../../tests/__mocks__/test-utils';
import { CockpitsComposer } from '../../../src/components/foundation/blockether-foundation-cockpit';

describe('CockpitsComposer Accessibility', () => {
  it('supports ARIA attributes', () => {
    render(
      <CockpitsComposer
        role="region"
        aria-labelledby="cockpit-title"
        aria-describedby="cockpit-description"
      >
        <h2 id="cockpit-title">Cockpit Title</h2>
        <p id="cockpit-description">Cockpit description</p>
        <p>Content</p>
      </CockpitsComposer>
    );

    const cockpit = screen.getByRole('region');
    expect(cockpit).toHaveAttribute('aria-labelledby', 'cockpit-title');
    expect(cockpit).toHaveAttribute('aria-describedby', 'cockpit-description');
  });

  it('supports accessibility labels', () => {
    render(
      <CockpitsComposer
        aria-label="Main cockpit area"
        role="main"
      >
        <p>Main content</p>
      </CockpitsComposer>
    );

    const cockpit = screen.getByRole('main');
    expect(cockpit).toHaveAttribute('aria-label', 'Main cockpit area');
  });

  it('supports data attributes for testing', () => {
    render(
      <CockpitsComposer
        data-testid="main-cockpit"
        data-role="container"
      >
        <p>Content</p>
      </CockpitsComposer>
    );

    const cockpit = screen.getByTestId('main-cockpit');
    expect(cockpit).toHaveAttribute('data-role', 'container');
  });

  it('maintains proper tab order', () => {
    render(
      <div>
        <button>Before</button>
        <CockpitsComposer>
          <button>Inside cockpit</button>
        </CockpitsComposer>
        <button>After</button>
      </div>
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
    expect(buttons[0]).toHaveTextContent('Before');
    expect(buttons[1]).toHaveTextContent('Inside cockpit');
    expect(buttons[2]).toHaveTextContent('After');
  });

  it('supports keyboard navigation through children', () => {
    render(
      <CockpitsComposer>
        <input type="text" placeholder="Input 1" />
        <input type="text" placeholder="Input 2" />
        <button>Submit</button>
      </CockpitsComposer>
    );

    const inputs = screen.getAllByRole('textbox');
    const button = screen.getByRole('button', { name: 'Submit' });

    expect(inputs).toHaveLength(2);
    expect(button).toBeInTheDocument();
  });

  it('supports semantic HTML roles', () => {
    const { rerender } = render(
      <CockpitsComposer role="article" data-testid="cockpit-wrapper">
        <div>
          <h2>Article Title</h2>
          <p>Article content</p>
        </div>
      </CockpitsComposer>
    );

    let cockpit = screen.getByTestId('cockpit-wrapper');
    expect(cockpit).toHaveAttribute('role', 'article');

    // Test different roles
    rerender(
      <CockpitsComposer role="complementary" data-testid="cockpit-wrapper">
        <div>
          <h3>Sidebar</h3>
          <p>Sidebar content</p>
        </div>
      </CockpitsComposer>
    );

    cockpit = screen.getByTestId('cockpit-wrapper');
    expect(cockpit).toHaveAttribute('role', 'complementary');
  });

  it('provides accessible content structure', () => {
    render(
      <CockpitsComposer role="region" aria-label="Content area">
        <header>
          <h1>Section Header</h1>
        </header>
        <main>
          <p>Main content goes here.</p>
        </main>
        <footer>
          <p>Footer information</p>
        </footer>
      </CockpitsComposer>
    );

    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(screen.getByText('Main content goes here.')).toBeInTheDocument();
    expect(screen.getByText('Footer information')).toBeInTheDocument();

    const cockpit = screen.getByRole('region');
    expect(cockpit).toHaveAttribute('aria-label', 'Content area');
  });
});