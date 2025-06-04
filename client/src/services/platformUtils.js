// Helper to detect if we're running as a mobile app via Capacitor
export const isMobileApp = () => {
    return window.Capacitor?.isNative ?? false;
};