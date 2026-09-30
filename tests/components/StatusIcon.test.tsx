import React, { act } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { StatusIcon } from '../../src/components/StatusIcon';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

function CustomIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return <svg data-icon="custom" {...props} />;
}

describe('StatusIcon', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  async function render(ui: React.ReactElement): Promise<SVGElement> {
    await act(async () => {
      root.render(ui);
    });
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    return svg as SVGElement;
  }

  it('is decorative without a label', async () => {
    const svg = await render(<StatusIcon tone="success" />);

    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.getAttribute('role')).toBeNull();
    expect(svg.getAttribute('aria-label')).toBeNull();
  });

  it('exposes an accessible name when a label is given', async () => {
    const svg = await render(<StatusIcon tone="success" label="Success" />);

    expect(svg.getAttribute('role')).toBe('img');
    expect(svg.getAttribute('aria-label')).toBe('Success');
    expect(svg.getAttribute('aria-hidden')).toBeNull();
  });

  it('applies the tone class for danger', async () => {
    const svg = await render(<StatusIcon tone="danger" label="Failed" />);

    expect(svg.getAttribute('class')).toContain('text-red-600');
  });

  it('spins when processing', async () => {
    const svg = await render(<StatusIcon tone="neutral" label="In Progress" processing />);

    expect(svg.getAttribute('class')).toContain('animate-spin');
    expect(svg.getAttribute('class')).toContain('text-muted-foreground');
  });

  it('[EDGE] prefers an explicit icon over the tone default', async () => {
    const svg = await render(<StatusIcon tone="success" icon={CustomIcon} />);

    expect(svg.getAttribute('data-icon')).toBe('custom');
    expect(svg.getAttribute('class')).toContain('text-green-600');
  });

  it('[EDGE] renders data-testid only when provided', async () => {
    const withoutId = await render(<StatusIcon tone="info" />);
    expect(withoutId.hasAttribute('data-testid')).toBe(false);

    const withId = await render(<StatusIcon tone="info" data-testid="status-icon" />);
    expect(withId.getAttribute('data-testid')).toBe('status-icon');
  });
});
