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
            warningOverlay?.remove();
        }, { once: true });
    }
};

const setupMobileLandscapeGuard = (): void => {
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
    StartGame('game-container');
    showMobileRecommendationWarning();
    setupMobileLandscapeGuard();
});