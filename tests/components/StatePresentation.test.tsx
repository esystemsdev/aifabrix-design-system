import React, { act } from 'react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { ErrorState as PortableErrorState } from '../../src/components/state-presentation';

(globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe('portable ErrorState', () => {
  let container: HTMLDivElement;
  let root: Root;
  const shout = (raw: string) => raw.toUpperCase();

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

  const heading = () => container.querySelector('h3')?.textContent;

  it('formats the message of an Error', () => {
    act(() => {
      root.render(<PortableErrorState error={new Error('boom')} formatErrorMessage={shout} />);
    });
    expect(heading()).toBe('BOOM');
  });

  it('formats a string error', () => {
    act(() => {
      root.render(<PortableErrorState error="bad input" formatErrorMessage={shout} />);
    });
    expect(heading()).toBe('BAD INPUT');
  });

  it('[EDGE] falls back to the title when error is null', () => {
    act(() => {
      root.render(<PortableErrorState error={null} title="  Tab failed  " />);
    });
    expect(heading()).toBe('Tab failed');
  });

  it('[EDGE] hides error details unless showErrorDetails is true', () => {
    act(() => {
      root.render(<PortableErrorState error={new Error('stack detail')} title="Failed" />);
    });
    expect(container.querySelector('p')).toBeNull();

    act(() => {
      root.render(<PortableErrorState error={new Error('stack detail')} showErrorDetails />);
    });
    expect(container.querySelector('p')?.textContent).toBe('stack detail');
  });
});
