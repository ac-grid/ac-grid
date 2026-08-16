export const HEADER_SCROLL_HANDLER_KEY = "__headerScrollHandler";
export const BODY_SCROLL_HANDLER_KEY = "__bodyScrollHandler";

export interface ScrollSyncSession {
    isSyncingScroll: boolean;
}

type ScheduleReset = (callback: () => void) => void;

const defaultScheduleReset: ScheduleReset = (callback) => requestAnimationFrame(callback);

/**
 * 将 source 的 scrollLeft 同步到 target，并用 session 防止循环触发。
 */
export function syncTargetScrollLeft(
    sourceScrollLeft: number,
    target: HTMLElement | null,
    session: ScrollSyncSession,
    scheduleReset: ScheduleReset = defaultScheduleReset,
): void {
    if (!target || session.isSyncingScroll) {
        return;
    }

    session.isSyncingScroll = true;
    target.scrollLeft = sourceScrollLeft;
    scheduleReset(() => {
        session.isSyncingScroll = false;
    });
}

/**
 * 移除元素上缓存的 scroll 监听器。
 */
export function removeScrollListener(
    element: HTMLElement | null,
    handlerKey: string,
): void {
    if (!element) {
        return;
    }

    const oldHandler = (element as HTMLElement & Record<string, EventListener | undefined>)[
        handlerKey
    ];
    if (oldHandler) {
        element.removeEventListener("scroll", oldHandler);
    }
}

/**
 * 监听 body 横向滚动并同步 header；可选 onBodyScroll 用于虚拟滚动等纵向逻辑。
 */
export function bindBodyToHeaderScrollSync(
    body: HTMLElement,
    getHeader: () => HTMLElement | null,
    session: ScrollSyncSession,
    onBodyScroll?: (body: HTMLElement) => void,
    scheduleReset: ScheduleReset = defaultScheduleReset,
): EventListener {
    removeScrollListener(body, HEADER_SCROLL_HANDLER_KEY);

    const handler: EventListener = (event) => {
        const target = event.target as HTMLElement;
        syncTargetScrollLeft(target.scrollLeft, getHeader(), session, scheduleReset);
        onBodyScroll?.(target);
    };

    body.addEventListener("scroll", handler);
    (body as HTMLElement & Record<string, EventListener>)[HEADER_SCROLL_HANDLER_KEY] = handler;
    return handler;
}

/**
 * 监听 header 横向滚动并同步 body。
 */
export function bindHeaderToBodyScrollSync(
    header: HTMLElement,
    getBody: () => HTMLElement | null,
    session: ScrollSyncSession,
    scheduleReset: ScheduleReset = defaultScheduleReset,
): EventListener {
    removeScrollListener(header, BODY_SCROLL_HANDLER_KEY);

    const handler: EventListener = () => {
        syncTargetScrollLeft(header.scrollLeft, getBody(), session, scheduleReset);
    };

    header.addEventListener("scroll", handler);
    (header as HTMLElement & Record<string, EventListener>)[BODY_SCROLL_HANDLER_KEY] = handler;
    return handler;
}
