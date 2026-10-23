import { useEffect } from 'react';

export function useMobileWakeLock(enabled: boolean) {
    useEffect(() => {
        if (!enabled || !('wakeLock' in navigator)) return;

        const mobile = window.matchMedia('(pointer: coarse) and (max-width: 1024px)');
        let disposed = false;
        let pending = false;
        let lock: WakeLockSentinel | undefined;

        const release = () => {
            const current = lock;
            lock = undefined;
            if (current) void current.release().catch(() => {});
        };
        const update = async () => {
            if (disposed || !mobile.matches || document.hidden) {
                release();
                return;
            }
            if (pending || (lock && !lock.released)) return;
            pending = true;
            try {
                const current = await navigator.wakeLock.request('screen');
                if (disposed || !mobile.matches || document.hidden) {
                    await current.release();
                } else {
                    lock = current;
                }
            } catch {
                // Unsupported devices and power-saving settings can deny the request.
            } finally {
                pending = false;
            }
        };

        void update();
        document.addEventListener('visibilitychange', update);
        mobile.addEventListener('change', update);
        return () => {
            disposed = true;
            document.removeEventListener('visibilitychange', update);
            mobile.removeEventListener('change', update);
            release();
        };
    }, [enabled]);
}
