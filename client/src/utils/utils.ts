export function truncate(s: string, n = 80) {
    if (!s) return '';
    return s.length > n ? s.slice(0, n - 1) + '…' : s;
}

export function marqueeAnimation(count: number) {
    const baseSeconds = 20;
    const seconds = Math.max(10, Math.min(40, baseSeconds + Math.floor(count / 3)));
    injectMarqueeKeyframes();
    return `marquee-vertical ${seconds}s linear infinite`;
}

let marqueeInjected = false;
function injectMarqueeKeyframes() {
    if (marqueeInjected) return;
    marqueeInjected = true;
    const style = document.createElement('style');
    style.innerHTML = `
    @keyframes marquee-vertical {
      0% { transform: translateY(100%); }
      100% { transform: translateY(-100%); }
    }
  `;
    document.head.appendChild(style);
}