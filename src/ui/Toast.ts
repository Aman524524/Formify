let toastEl: HTMLDivElement | null = null;
let toastTimer: ReturnType<typeof setTimeout> | null = null;

type ToastType = "default" | "error" | "success";

export const show = (message: string, duration = 2500, type: ToastType = "default") => {
    if (!toastEl) {
        toastEl = document.createElement("div");
        toastEl.className = "fy-toast formify-root";
        document.body.appendChild(toastEl);
    }

    toastEl.textContent = message;
    toastEl.classList.remove("show", "error", "success");

    if (type !== "default") toastEl.classList.add(type);

    // Force reflow for re-triggering animation
    void toastEl.offsetWidth;
    toastEl.classList.add("show");

    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        toastEl?.classList.remove("show");
    }, duration);
};
