let toastEl: HTMLDivElement | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

export const show = (message: string, duration = 2500) => {
    if (!toastEl) {
        toastEl = document.createElement("div");
        toastEl.className = "fy-toast formify-root";
        document.body.appendChild(toastEl);
    }

    toastEl.textContent = message;
    toastEl.classList.add("show");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastEl?.classList.remove("show");
    }, duration);
};
