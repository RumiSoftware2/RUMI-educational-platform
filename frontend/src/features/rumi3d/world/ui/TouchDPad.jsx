import React, { useEffect, useState, useCallback } from 'react';
import { useKeyboardControls } from '@react-three/drei';

export default function TouchDPad() {
  const [setKeys] = useKeyboardControls();
  const [isTouch, setIsTouch] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const touch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
    setIsTouch(Boolean(touch));
  }, []);

  const start = useCallback(
    (name) => (e) => {
      try {
        e.preventDefault();
        e.stopPropagation();
        if (e.pointerId && e.currentTarget && e.currentTarget.setPointerCapture) {
          e.currentTarget.setPointerCapture(e.pointerId);
        }
      } catch (err) {}
      setKeys((s) => ({ ...s, [name]: true }));
    },
    [setKeys]
  );

  const stop = useCallback(
    (name) => (e) => {
      try {
        e.preventDefault();
        e.stopPropagation();
        if (e.pointerId && e.currentTarget && e.currentTarget.releasePointerCapture) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch (err) {}
      setKeys((s) => ({ ...s, [name]: false }));
    },
    [setKeys]
  );

  if (!isTouch) return null;

  const Arrow = ({ direction }) => (
    <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden>
      <path d="M12 4l-8 8h5v8h6v-8h5z" fill="currentColor" transform={
        direction === 'up' ? 'rotate(0 12 12)' :
        direction === 'right' ? 'rotate(90 12 12)' :
        direction === 'down' ? 'rotate(180 12 12)' :
        'rotate(270 12 12)'
      } />
    </svg>
  );

  return (
    <div className="rumi3d-dpad" aria-hidden>
      <button className="dpad-btn dpad-up" onPointerDown={start('forward')} onPointerUp={stop('forward')} onPointerLeave={stop('forward')} onPointerCancel={stop('forward')} onContextMenu={(e)=>e.preventDefault()} aria-label="arriba">
        <Arrow direction="up" />
      </button>
      <div className="dpad-row">
        <button className="dpad-btn dpad-left" onPointerDown={start('left')} onPointerUp={stop('left')} onPointerLeave={stop('left')} onPointerCancel={stop('left')} onContextMenu={(e)=>e.preventDefault()} aria-label="izquierda">
          <Arrow direction="left" />
        </button>

        <div className="dpad-center" />

        <button className="dpad-btn dpad-right" onPointerDown={start('right')} onPointerUp={stop('right')} onPointerLeave={stop('right')} onPointerCancel={stop('right')} onContextMenu={(e)=>e.preventDefault()} aria-label="derecha">
          <Arrow direction="right" />
        </button>
      </div>
      <button className="dpad-btn dpad-down" onPointerDown={start('back')} onPointerUp={stop('back')} onPointerLeave={stop('back')} onPointerCancel={stop('back')} onContextMenu={(e)=>e.preventDefault()} aria-label="abajo">
        <Arrow direction="down" />
      </button>
    </div>
  );
}
