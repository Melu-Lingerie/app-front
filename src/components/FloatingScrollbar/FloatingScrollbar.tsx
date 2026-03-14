import { useEffect, useRef, useState, useCallback } from 'react';

const TRACK_TOP = 120;
const TRACK_BOTTOM = 80;
const MIN_THUMB = 28;
const HIDE_DELAY = 1200;
const THUMB_COLOR = '#C4A08A';

export function FloatingScrollbar() {
    const [thumbStyle, setThumbStyle] = useState({ height: 0, top: 0 });
    const [visible, setVisible] = useState(false);
    const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const update = useCallback(() => {
        const trackH = window.innerHeight - TRACK_TOP - TRACK_BOTTOM;
        const scrollMax = document.body.scrollHeight - window.innerHeight;
        if (scrollMax <= 0) return;

        const ratio = window.innerHeight / document.body.scrollHeight;
        const thumbH = Math.max(trackH * ratio, MIN_THUMB);
        const thumbTop = TRACK_TOP + (window.scrollY / scrollMax) * (trackH - thumbH);

        setThumbStyle({ height: thumbH, top: thumbTop });
        setVisible(true);

        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setVisible(false), HIDE_DELAY);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);
        update();
        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
            if (hideTimer.current) clearTimeout(hideTimer.current);
        };
    }, [update]);

    return (
        <>
            {/* Track */}
            <div
                style={{
                    position: 'fixed',
                    right: 8,
                    top: TRACK_TOP,
                    bottom: TRACK_BOTTOM,
                    width: 2,
                    background: 'rgba(28, 26, 24, 0.07)',
                    borderRadius: 1,
                    zIndex: 9999,
                    pointerEvents: 'none',
                }}
            />
            {/* Thumb */}
            <div
                style={{
                    position: 'fixed',
                    right: 8,
                    top: thumbStyle.top,
                    width: 2,
                    height: thumbStyle.height,
                    background: THUMB_COLOR,
                    borderRadius: 1,
                    zIndex: 9999,
                    pointerEvents: 'none',
                    opacity: visible ? 0.85 : 0,
                    transition: 'opacity 0.3s ease',
                }}
            />
        </>
    );
}
