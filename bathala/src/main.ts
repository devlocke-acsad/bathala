import StartGame from './game/main';

const isMobileDevice = (): boolean => {
    const mobileUserAgentPattern = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Windows Phone/i;
    const userAgent = navigator.userAgent || "";
    const isMobileByUA = mobileUserAgentPattern.test(userAgent);
    const userAgentData = (navigator as Navigator & { userAgentData?: { mobile?: boolean } }).userAgentData;
    const isMobileByUserAgentData = userAgentData?.mobile === true;
    const hasTouchPoints = (navigator as Navigator & { maxTouchPoints?: number }).maxTouchPoints ?? 0;

    return isMobileByUA || isMobileByUserAgentData || hasTouchPoints > 0;
};

const isAndroidDevice = (): boolean => /Android/i.test(navigator.userAgent || "");

const isCurrentlyFullscreen = (): boolean => {
    const doc = document as Document & { webkitFullscreenElement?: Element | null };
    return !!(document.fullscreenElement || doc.webkitFullscreenElement);
};

const setupMobileViewportSizing = (): void => {
    const applyViewportHeight = () => {
        const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
        document.documentElement.style.setProperty('--app-height', `${viewportHeight}px`);
    };

    applyViewportHeight();
    window.addEventListener('resize', applyViewportHeight);
    window.addEventListener('orientationchange', applyViewportHeight);
    window.visualViewport?.addEventListener('resize', applyViewportHeight);
    window.visualViewport?.addEventListener('scroll', applyViewportHeight);
};

const requestBrowserFullscreen = async (): Promise<void> => {
    const doc = document as Document & {
        webkitFullscreenElement?: Element | null;
        webkitExitFullscreen?: () => Promise<void>;
    };
    const root = document.documentElement as HTMLElement & {
        webkitRequestFullscreen?: () => Promise<void>;
    };

    const hasFullscreen = !!(document.fullscreenElement || doc.webkitFullscreenElement);
    if (hasFullscreen) {
        return;
    }

    try {
        if (root.requestFullscreen) {
            await root.requestFullscreen();
            return;
        }
        if (root.webkitRequestFullscreen) {
            await root.webkitRequestFullscreen();
        }
    } catch (_error) {
        // Some browsers (especially iOS Safari tabs) block this; continue with viewport sizing fallback.
    }
};

const exitBrowserFullscreen = async (): Promise<void> => {
    const doc = document as Document & {
        webkitExitFullscreen?: () => Promise<void>;
    };

    try {
        if (document.exitFullscreen) {
            await document.exitFullscreen();
            return;
        }
        if (doc.webkitExitFullscreen) {
            await doc.webkitExitFullscreen();
        }
    } catch (_error) {
        // Ignore exit failures.
    }
};

const setupAndroidFullscreenButton = (): void => {
    if (!isAndroidDevice()) {
        return;
    }

    const appRoot = document.getElementById('app');
    if (!appRoot) {
        return;
    }

    let button = document.getElementById('android-fullscreen-btn') as HTMLButtonElement | null;
    if (!button) {
        button = document.createElement('button');
        button.id = 'android-fullscreen-btn';
        button.type = 'button';
        button.setAttribute('style', `
            position: fixed;
            right: max(12px, env(safe-area-inset-right));
            bottom: max(12px, env(safe-area-inset-bottom));
            z-index: 9500;
            min-width: 128px;
            padding: 10px 14px;
            border: 2px solid #77888C;
            background: rgba(21, 14, 16, 0.78);
            color: #f1f1f0;
            font-family: 'dungeon-mode', Chivo, Arial, sans-serif;
            font-size: 14px;
            letter-spacing: 0.03em;
            cursor: pointer;
            user-select: none;
            touch-action: manipulation;
        `);
        appRoot.appendChild(button);
    }

    const syncLabel = () => {
        if (!button) {
            return;
        }
        button.textContent = isCurrentlyFullscreen() ? 'Exit Fullscreen' : 'Fullscreen';
    };

    button.onclick = async () => {
        if (isCurrentlyFullscreen()) {
            await exitBrowserFullscreen();
        } else {
            await requestBrowserFullscreen();
        }
        syncLabel();
    };

    document.addEventListener('fullscreenchange', syncLabel);
    document.addEventListener('webkitfullscreenchange', syncLabel as EventListener);
    syncLabel();
};

const setupMobileFullscreenGesture = (): void => {
    if (!isMobileDevice()) {
        return;
    }

    const tryEnterFullscreen = () => {
        requestBrowserFullscreen().catch(() => undefined);
    };

    document.addEventListener('pointerdown', tryEnterFullscreen, { once: true });
    document.addEventListener('touchstart', tryEnterFullscreen, { once: true });
};

const setupGameScaleRefresh = (game: ReturnType<typeof StartGame>): (() => void) => {
    const refreshGameScale = () => {
        if (!game?.scale) {
            return;
        }

        // Recompute FIT scaling after mobile browser UI / orientation changes.
        game.scale.updateBounds();
        game.scale.refresh();
    };

    const refreshGameScaleSoon = () => {
        refreshGameScale();
        window.setTimeout(refreshGameScale, 120);
        window.setTimeout(refreshGameScale, 300);
    };

    window.addEventListener('resize', refreshGameScaleSoon);
    window.addEventListener('orientationchange', refreshGameScaleSoon);
    window.visualViewport?.addEventListener('resize', refreshGameScaleSoon);
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
            refreshGameScaleSoon();
        }
    });

    refreshGameScaleSoon();
    return refreshGameScaleSoon;
};

const showMobileRecommendationWarning = (): void => {
    if (!isMobileDevice()) {
        return;
    }

    const appRoot = document.getElementById('app');
    if (!appRoot) {
        return;
    }

    let warningOverlay = document.getElementById('mobile-recommendation-warning');
    if (!warningOverlay) {
        warningOverlay = document.createElement('div');
        warningOverlay.id = 'mobile-recommendation-warning';
        warningOverlay.innerHTML = `
            <div style="
                width: min(720px, 92vw);
                border: 2px solid rgba(119, 136, 140, 0.85);
                background: rgba(21, 14, 16, 0.92);
                padding: 18px 20px;
                text-align: center;
                box-shadow: 0 12px 30px rgba(0,0,0,0.45);
            ">
                <div style="
                    margin-bottom: 6px;
                    font-family: 'Pixeled English Font', Arial, sans-serif;
                    font-size: clamp(2rem, 10vw, 4.2rem);
                    color: #77888C;
                    text-transform: lowercase;
                    line-height: 1;
                ">bathala</div>
                <div style="
                    font-family: 'dungeon-mode', Chivo, Arial, sans-serif;
                    font-size: clamp(1rem, 4.4vw, 1.25rem);
                    color: #dfe6ea;
                    line-height: 1.4;
                    margin-bottom: 14px;
                ">
                    Bathala works best on PC or Mac, but you can continue on mobile.
                </div>
                <button
                    id="mobile-warning-continue"
                    type="button"
                    style="
                        padding: 10px 18px;
                        border: 2px solid #77888C;
                        background: rgba(119, 136, 140, 0.16);
                        color: #f1f1f0;
                        font-family: 'dungeon-mode', Chivo, Arial, sans-serif;
                        font-size: 16px;
                        cursor: pointer;
                    "
                >
                    Continue Anyway
                </button>
            </div>
        `;
        warningOverlay.setAttribute('style', `
            position: fixed;
            inset: 0;
            z-index: 10000;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: linear-gradient(rgba(21, 14, 16, 0.86), rgba(21, 14, 16, 0.86)), url('/assets/background/chap1_no_leaves_boss.png');
            background-size: cover;
            background-position: center;
        `);

        appRoot.appendChild(warningOverlay);
    }

    const continueButton = document.getElementById('mobile-warning-continue');
    if (continueButton) {
        continueButton.addEventListener('click', () => {
            requestBrowserFullscreen().catch(() => undefined);
            warningOverlay?.remove();
        }, { once: true });
    }
};

const setupMobileLandscapeGuard = (onViewportChange?: () => void): void => {
    if (!isMobileDevice()) {
        return;
    }

    const appRoot = document.getElementById('app');
    if (!appRoot) {
        return;
    }

    let overlay = document.getElementById('mobile-landscape-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'mobile-landscape-overlay';
        overlay.innerHTML = `
            <div style="
                width: min(720px, 92vw);
                border: 2px solid rgba(119, 136, 140, 0.85);
                background: rgba(21, 14, 16, 0.92);
                padding: 18px 20px;
                text-align: center;
                box-shadow: 0 12px 30px rgba(0,0,0,0.4);
            ">
                <div style="
                    margin-bottom: 6px;
                    font-family: 'Pixeled English Font', Arial, sans-serif;
                    font-size: clamp(2rem, 10vw, 4.2rem);
                    color: #77888C;
                    text-transform: lowercase;
                    line-height: 1;
                ">bathala</div>
                <div style="
                    font-family: 'dungeon-mode', Chivo, Arial, sans-serif;
                    font-size: clamp(1rem, 4.4vw, 1.25rem);
                    color: #dfe6ea;
                    line-height: 1.4;
                ">
                    Rotate your phone to landscape to play.
                </div>
            </div>
        `;
        overlay.setAttribute('style', `
            position: fixed;
            inset: 0;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background: linear-gradient(rgba(21, 14, 16, 0.86), rgba(21, 14, 16, 0.86)), url('/assets/background/chap1_no_leaves_boss.png');
            background-size: cover;
            background-position: center;
        `);
        appRoot.appendChild(overlay);
    }

    const updateOverlayVisibility = () => {
        if (!overlay) {
            return;
        }
        const isLandscape = window.innerWidth >= window.innerHeight;
        overlay.style.display = isLandscape ? 'none' : 'flex';
        onViewportChange?.();
    };

    // Try browser orientation lock when possible (requires gesture and may be ignored by some browsers).
    const requestLandscapeLock = async () => {
        const screenWithOrientation = screen as Screen & {
            orientation?: { lock?: (orientation: string) => Promise<void> };
        };

        if (!screenWithOrientation.orientation?.lock) {
            return;
        }

        try {
            await screenWithOrientation.orientation.lock('landscape');
        } catch (_error) {
            // No-op fallback: overlay still guides the user to rotate manually.
        }
    };

    window.addEventListener('resize', updateOverlayVisibility);
    window.addEventListener('orientationchange', updateOverlayVisibility);
    document.addEventListener('touchstart', requestLandscapeLock, { once: true });
    document.addEventListener('pointerdown', requestLandscapeLock, { once: true });

    updateOverlayVisibility();
};

document.addEventListener('DOMContentLoaded', () => {
    setupMobileViewportSizing();
    setupMobileFullscreenGesture();
    setupAndroidFullscreenButton();
    const game = StartGame('game-container');
    const refreshGameScaleSoon = setupGameScaleRefresh(game);
    showMobileRecommendationWarning();
    setupMobileLandscapeGuard(refreshGameScaleSoon);
});