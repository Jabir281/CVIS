'use client';

import { useEffect, useRef, useState } from 'react';
import type { SceneKind, Stage } from './geometry';
import type { SceneController } from './renderer';
import { ScenePoster } from './ScenePoster';

const labels = { hero: 'Volumetric point cloud', goal: 'Observe, understand, apply', brain: 'Illustrative brain' };
const descriptions = [
  'Observe: sample the visual world as a two-dimensional sensor plane.',
  'Understand: organize the same samples into a three-dimensional volume.',
  'Apply: transform the samples into a structured spatial helix.',
];

export function SceneFigure({ kind, stages }: { kind: SceneKind; stages?: string[] }) {
  const host = useRef<HTMLDivElement>(null);
  const controller = useRef<SceneController | null>(null);
  const [status, setStatus] = useState<'static' | 'loading' | 'ready' | 'failed'>('static');
  const [paused, setPaused] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [stage, setStage] = useState<Stage>(0);
  const selectedStage = useRef<Stage>(0);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let cancelled = false;
    let started = false;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || started) return;
      started = true;
      observer.disconnect();
      setStatus('loading');
      try {
        const { mountScene } = await import('./renderer');
        if (cancelled) return;
        controller.current = mountScene(element, kind, (state) => {
          if (!cancelled) { setPaused(state.paused); setReduced(state.reduced); }
        }, () => {
          if (cancelled) return;
          controller.current?.dispose();
          controller.current = null;
          setStatus('failed');
        });
        controller.current.stage(selectedStage.current);
        setStatus('ready');
      } catch {
        controller.current?.dispose();
        controller.current = null;
        if (!cancelled) setStatus('failed');
      }
    }, { rootMargin: '100px' });
    observer.observe(element);
    return () => { cancelled = true; observer.disconnect(); controller.current?.dispose(); controller.current = null; };
  }, [kind, attempt]);

  const changeStage = (next: Stage) => {
    selectedStage.current = next;
    setStage(next);
    controller.current?.stage(next);
  };
  return (
    <figure className={`scene-figure scene-${kind}`} aria-label={labels[kind]}>
      <div className="scene-viewport" data-state={status}>
        <div className="scene-poster" aria-hidden={status === 'ready'}><ScenePoster kind={kind} stage={stage} /></div>
        <div className="scene-host" ref={host} />
      </div>
      {stages && <fieldset className="stage-controls" disabled={status === 'static'}><legend>Explore the perception pipeline</legend>
        {stages.map((label, index) => <label key={label}><input type="radio" name={`goal-stage-${attempt}`} checked={stage === index} onChange={() => changeStage(index as Stage)} /><span>{String(index + 1).padStart(2, '0')} {label}</span></label>)}
      </fieldset>}
      {kind === 'goal' && <p className="scene-description" aria-live="polite">{descriptions[stage]}</p>}
      <div className="scene-controls">
        {status === 'ready' && <>
          {!reduced && <button type="button" onClick={() => controller.current?.toggle()}>{paused ? 'Resume' : 'Pause'}</button>}
          <button type="button" onClick={() => controller.current?.reset()}>Reset view</button>
          <button type="button" aria-label={`Rotate ${labels[kind]} left`} onClick={() => controller.current?.rotate(-1)}>Rotate left</button>
          <button type="button" aria-label={`Rotate ${labels[kind]} right`} onClick={() => controller.current?.rotate(1)}>Rotate right</button>
        </>}
        {status === 'failed' && <button type="button" onClick={() => setAttempt((value) => value + 1)}>Retry 3D</button>}
      </div>
      <p className="scene-status" role="status">{status === 'loading' ? 'Loading interactive view. The illustration remains available.' : status === 'failed' ? '3D is unavailable. Showing the static illustration.' : status === 'ready' ? reduced ? 'Reduced motion: automatic rotation is off. Drag horizontally or use the rotation buttons.' : 'Drag to rotate. Touch: drag horizontally; swipe vertically to scroll.' : 'Static illustration. Interactive 3D loads when available.'}</p>
      <figcaption>{kind === 'brain' ? 'Illustrative 3D brain model. Not diagnostic imagery or validated research output.' : 'Procedural illustration of visual intelligence. Not experimental data.'}</figcaption>
    </figure>
  );
}
