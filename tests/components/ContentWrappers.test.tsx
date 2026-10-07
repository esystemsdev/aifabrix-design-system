import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { Alert, AlertDescription, AlertTitle } from '../../src/components/alert';
import { Card, CardTitle } from '../../src/components/card';
import { Label } from '../../src/components/label';
import { Progress } from '../../src/components/progress';
import { Separator } from '../../src/components/separator';
import { Skeleton } from '../../src/components/skeleton';

(
  globalThis as typeof globalThis & { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

describe('content wrappers', () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  const render = async (node: React.ReactNode) => {
    await act(async () => root.render(node));
  };
  const slot = (name: string) => container.querySelector(`[data-slot="${name}"]`) as HTMLElement;

  it('Alert exposes role alert and keeps className', async () => {
    await render(
      <Alert variant="destructive" className="extra-alert">
        <AlertTitle>Save failed</AlertTitle>
        <AlertDescription>Details</AlertDescription>
      </Alert>,
    );
    const alert = container.querySelector('[role="alert"]') as HTMLElement;
    expect(alert.dataset.slot).toBe('alert');
    expect(alert.className).toContain('extra-alert');
    expect(alert.className).toContain('text-destructive');
  });

  it('[EDGE] Alert title and description wrap long unbroken text', async () => {
    const token = 'x'.repeat(400);
    await render(
      <Alert>
        <AlertTitle>{token}</AlertTitle>
        <AlertDescription>{token}</AlertDescription>
      </Alert>,
    );
    expect(slot('alert-title').classList).toContain('min-w-0');
    const description = slot('alert-description').classList;
    expect(description).toContain('min-w-0');
    expect(description).toContain('break-words');
    expect(description).toContain('[overflow-wrap:anywhere]');
  });

  it('CardTitle renders a level-4 heading by default', async () => {
    await render(
      <Card>
        <CardTitle className="extra-title">Applications</CardTitle>
      </Card>,
    );
    const title = slot('card-title');
    expect(title.tagName).toBe('H4');
    expect(title.className).toContain('leading-none');
    expect(title.className).toContain('extra-title');
  });

  it('[EDGE] CardTitle asChild renders the child element with the title slot and classes', async () => {
    await render(
      <Card>
        <CardTitle asChild className="extra-title">
          <h2>Applications</h2>
        </CardTitle>
      </Card>,
    );
    const title = slot('card-title');
    expect(title.tagName).toBe('H2');
    expect(title.textContent).toBe('Applications');
    expect(title.className).toContain('leading-none');
    expect(title.className).toContain('extra-title');
    expect(container.querySelector('h4')).toBeNull();
  });

  it('Card forwards its ref', async () => {
    const ref = React.createRef<HTMLDivElement>();
    await render(<Card ref={ref} />);
    expect(ref.current).toBe(slot('card'));
  });

  it('Skeleton renders a pulsing block with className', async () => {
    await render(<Skeleton className="h-4 w-20" />);
    const skeleton = slot('skeleton');
    expect(skeleton.className).toContain('animate-pulse');
    expect(skeleton.className).toContain('w-20');
  });

  it('Progress exposes progressbar role and moves the indicator by value', async () => {
    await render(<Progress value={40} aria-label="Upload" className="extra-progress" />);
    const bar = container.querySelector('[role="progressbar"]') as HTMLElement;
    expect(bar.getAttribute('aria-label')).toBe('Upload');
    expect(bar.className).toContain('extra-progress');
    expect(slot('progress-indicator').style.transform).toBe('translateX(-60%)');
  });

  it('[EDGE] Separator is decorative by default and a separator when not decorative', async () => {
    await render(<Separator />);
    expect(slot('separator-root').getAttribute('role')).toBe('none');
    await render(<Separator decorative={false} orientation="vertical" />);
    const separator = container.querySelector('[role="separator"]') as HTMLElement;
    expect(separator.getAttribute('aria-orientation')).toBe('vertical');
  });

  it('Label names its control', async () => {
    await render(
      <>
        <Label htmlFor="tenant-name" className="extra-label">
          Tenant name
        </Label>
        <input id="tenant-name" />
      </>,
    );
    const label = slot('label') as HTMLLabelElement;
    expect(label.htmlFor).toBe('tenant-name');
    expect(label.className).toContain('extra-label');
    expect((container.querySelector('#tenant-name') as HTMLInputElement).labels?.[0]).toBe(label);
  });

  it('forwards refs to the rendered element', async () => {
    const labelRef = React.createRef<HTMLLabelElement>();
    const skeletonRef = React.createRef<HTMLDivElement>();
    const progressRef = React.createRef<HTMLDivElement>();
    const separatorRef = React.createRef<HTMLDivElement>();
    await render(
      <>
        <Label ref={labelRef}>Tenant name</Label>
        <Skeleton ref={skeletonRef} />
        <Progress ref={progressRef} value={40} />
        <Separator ref={separatorRef} />
      </>,
    );
    expect(labelRef.current).toBe(slot('label'));
    expect(skeletonRef.current).toBe(slot('skeleton'));
    expect(progressRef.current).toBe(slot('progress'));
    expect(separatorRef.current).toBe(slot('separator-root'));
  });
});
