import type {
    LanguagePack,
    I18nManagerOptions,
} from "../types/i18n";
import { enUS, zhCN } from "./locales";

// RTL 常见语言前缀/代码集合
const RTL_LOCALES = new Set([
    "ar",
    "ar-ae",
    "ar-bh",
    "ar-dz",
    "ar-eg",
    "ar-iq",
    "ar-jo",
    "ar-kw",
    "ar-lb",
    "ar-ly",
    "ar-ma",
    "ar-om",
    "ar-qa",
    "ar-sa",
    "ar-sy",
    "ar-tn",
    "ar-ye",
    "fa",
    "fa-ir",
    "he",
    "he-il",
    "ur",
    "ur-pk",
    "yi",
]);

/**
 * 判断语言代码是否为 RTL 语言
 */
export function isRtlLocale(locale: string): boolean {
    if (!locale) return false;
    const lower = locale.toLowerCase();
    if (RTL_LOCALES.has(lower)) return true;
    const lang = lower.split("-")[0];
    return RTL_LOCALES.has(lang);
}

/**
 * I18nManager - 国际化管理器 (RFC-0015)
 */
export class I18nManager {
    private currentLocale: string = "en-US";
    private languagePacks: Map<string, LanguagePack> = new Map();
    private customMessages: Map<string, Record<string, string>> = new Map();
    private explicitDir?: "ltr" | "rtl";
    private customDateFormat?: string | Intl.DateTimeFormatOptions;
    private customNumberFormat?: Intl.NumberFormatOptions;
    private listeners: Set<(locale: string) => void> = new Set();

    constructor(options?: I18nManagerOptions) {
        // 注册内置语言包
        this.registerLanguagePack(enUS);
        this.registerLanguagePack(zhCN);

        if (options?.locale) {
            this.currentLocale = options.locale;
        }
        if (options?.messages) {
            this.setMessages(options.messages, this.currentLocale);
        }
        if (options?.dir) {
            this.explicitDir = options.dir;
        }
        if (options?.dateFormat) {
            this.customDateFormat = options.dateFormat;
        }
        if (options?.numberFormat) {
            this.customNumberFormat = options.numberFormat;
        }
    }

    /**
     * 注册/更新语言包
     */
    public registerLanguagePack(pack: LanguagePack): void {
        this.languagePacks.set(pack.locale, pack);
        // 同时支持语言短代码映射（如 zh 匹配 zh-CN）
        const shortLang = pack.locale.split("-")[0];
        if (!this.languagePacks.has(shortLang)) {
            this.languagePacks.set(shortLang, pack);
        }
    }

    /**
     * 设置自定义文本消息（合并到当前或指定语言）
     */
    public setMessages(messages: Record<string, string>, locale?: string): void {
        const targetLocale = locale || this.currentLocale;
        const existing = this.customMessages.get(targetLocale) || {};
        this.customMessages.set(targetLocale, { ...existing, ...messages });
    }

    /**
     * 设置当前语言
     */
    public setLocale(locale: string): void {
        if (!locale || locale === this.currentLocale) return;
        this.currentLocale = locale;
        this.listeners.forEach((listener) => {
            try {
                listener(locale);
            } catch (err) {
                console.error("[I18nManager] listener error", err);
            }
        });
    }

    /**
     * 获取当前语言
     */
    public getLocale(): string {
        return this.currentLocale;
    }

    /**
     * 监听语言变化
     */
    public onLocaleChange(listener: (locale: string) => void): () => void {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }

    /**
     * 查找语言包（精确匹配 -> 前缀匹配 -> 英文回退）
     */
    public getLanguagePack(locale?: string): LanguagePack {
        const target = locale || this.currentLocale;
        if (this.languagePacks.has(target)) {
            return this.languagePacks.get(target)!;
        }
        const short = target.split("-")[0];
        if (this.languagePacks.has(short)) {
            return this.languagePacks.get(short)!;
        }
        // 回退到 en-US
        return this.languagePacks.get("en-US") || enUS;
    }

    /**
     * 获取当前文本书写方向 (ltr / rtl)
     */
    public getDirection(locale?: string): "ltr" | "rtl" {
        if (this.explicitDir) {
            return this.explicitDir;
        }
        const target = locale || this.currentLocale;
        if (isRtlLocale(target)) {
            return "rtl";
        }
        if (this.languagePacks.has(target)) {
            const pack = this.languagePacks.get(target)!;
            if (pack.dir) {
                return pack.dir;
            }
        }
        return "ltr";
    }

    /**
     * 明确设置书写方向
     */
    public setDirection(dir?: "ltr" | "rtl"): void {
        this.explicitDir = dir;
    }

    /**
     * 翻译指定的 key 并支持参数插值
     * 例如 t("grid.pagination.showing") 或 t("hello {name}", { name: "Bob" })
     */
    public t(key: string, params?: Record<string, any>, defaultValue?: string): string {
        // 1. 查找 custom messages
        const custom = this.customMessages.get(this.currentLocale);
        let template: string | undefined = custom?.[key];

        // 2. 查找当前语言包
        if (template === undefined) {
            const pack = this.getLanguagePack(this.currentLocale);
            template = pack.messages?.[key];
        }

        // 3. 回退查找英文包
        if (template === undefined && this.currentLocale !== "en-US") {
            const enPack = this.getLanguagePack("en-US");
            template = enPack.messages?.[key];
        }

        // 4. 若未找到，使用 defaultValue 或 key
        if (template === undefined) {
            template = defaultValue !== undefined ? defaultValue : key;
        }

        // 5. 参数插值 {paramName}
        if (params && typeof template === "string") {
            return template.replace(/\{(\w+)\}/g, (_, match) => {
                return match in params ? String(params[match]) : `{${match}}`;
            });
        }

        return template;
    }

    /**
     * 格式化日期
     * @param date - Date 对象或时间戳/ISO 字符串
     * @param options - 自定义 Intl.DateTimeFormatOptions 或格式字符串
     */
    public formatDate(
        date: Date | number | string,
        options?: string | Intl.DateTimeFormatOptions
    ): string {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) {
            return String(date);
        }

        const effectiveOptions = options || this.customDateFormat || this.getLanguagePack().dateFormat;

        if (typeof effectiveOptions === "string") {
            // 支持简单字符串模板格式化，如 "YYYY-MM-DD", "YYYY-MM-DD HH:mm:ss"
            return formatSimpleDatePattern(d, effectiveOptions);
        }

        try {
            return new Intl.DateTimeFormat(this.currentLocale, effectiveOptions as Intl.DateTimeFormatOptions).format(d);
        } catch {
            return d.toLocaleDateString(this.currentLocale);
        }
    }

    /**
     * 格式化数字
     * @param number - 数值
     * @param options - 自定义 Intl.NumberFormatOptions
     */
    public formatNumber(
        number: number,
        options?: Intl.NumberFormatOptions
    ): string {
        if (typeof number !== "number" || isNaN(number)) {
            return String(number);
        }

        const effectiveOptions = options || this.customNumberFormat || this.getLanguagePack().numberFormat;

        try {
            return new Intl.NumberFormat(this.currentLocale, effectiveOptions).format(number);
        } catch {
            return number.toLocaleString(this.currentLocale);
        }
    }
}

/**
 * 简单日期模板字符串替换函数
 */
function formatSimpleDatePattern(date: Date, pattern: string): string {
    const pad = (n: number, len = 2) => String(n).padStart(len, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return pattern
        .replace(/YYYY/g, String(year))
        .replace(/MM/g, month)
        .replace(/DD/g, day)
        .replace(/HH/g, hours)
        .replace(/mm/g, minutes)
        .replace(/ss/g, seconds);
}

// 单例实例供全局默认使用
export const defaultI18nManager = new I18nManager();
