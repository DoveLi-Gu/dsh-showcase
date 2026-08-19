window.__ModuleLoader__.load({
  id: "dsh-showcase",
  factory: (require) => {
    const module = { exports: {} };
    const exports = module.exports;
    const React = require("react");
    const { useEffect, useRef, useState } = React;

const inject = ["slots", "locale", "connection"];

const RPC_CHANNEL = "/showcase-layout-summary";
const LOCALE_NAMESPACE = "showcase.layoutSummary.settings";
const STYLE_ID = "dsh-showcase-settings-style";
const THEME_VALUES = ["frontier-signal", "blue-big-fish"];

const messages = {
  zh: {
    title: "布局证据产物",
    description: "先完成采集与测试，再在交付或视觉审核节点生成摘要；海报是可选的重产物。",
    legend: "海报风格",
    dijiang: "终末地帝江号",
    dijiangHint: "冷白工程纸面、硬黑标题、亮黄模块与校准色。",
    fish: "蓝色大肥鱼",
    fishHint: "白底角色主视觉、钴蓝冲击字与金色贴纸。",
    posterLegend: "生成自包含 HTML 海报",
    posterHint: "关闭时只写入 Markdown，不创建或覆盖海报；已有 HTML 不会删除。打开后下一次调用会同时写入海报。",
    posterToggleLabel: "切换是否生成自包含 HTML 海报",
    posterOn: "已开启",
    posterOff: "已关闭",
    saving: "正在保存…",
    saved: "已保存，下一次调用生效。",
    failed: "保存失败，请重试。",
    loading: "正在读取插件设置…",
    unavailable: "插件设置服务当前不可用。",
  },
  en: {
    title: "Layout evidence artifacts",
    description: "Capture and test first, then generate at the delivery or visual-review checkpoint. The poster is optional and heavier.",
    legend: "Poster theme",
    dijiang: "Dijiang",
    dijiangHint: "Cool-white industrial sheet, hard black type, bright-yellow modules, and calibration accents.",
    fish: "Blue Big Fish",
    fishHint: "White character key visual, cobalt impact type, and small gold stickers.",
    posterLegend: "Generate self-contained HTML poster",
    posterHint: "Off writes only Markdown and does not create, overwrite, or delete an existing poster. On also writes the HTML poster on the next call.",
    posterToggleLabel: "Toggle self-contained HTML poster generation",
    posterOn: "On",
    posterOff: "Off",
    saving: "Saving…",
    saved: "Saved. The next tool call will use it.",
    failed: "Could not save the setting. Try again.",
    loading: "Loading plugin settings…",
    unavailable: "Plugin settings are currently unavailable.",
  },
};

const styles = `
.dsh-showcase-settings{position:relative;isolation:isolate;list-style:none;border:1px solid var(--dsw-alias-border-l2);border-radius:8px;background:var(--dsw-alias-background-base);overflow:hidden}
.dsh-showcase-settings::after{position:absolute;z-index:2;top:0;left:0;width:42%;height:2px;content:"";pointer-events:none;background:var(--dsw-alias-state-business-primary);opacity:0;transform:translateX(-110%)}
.dsh-showcase-settings[data-load-state=loading]::after,.dsh-showcase-settings[data-save-state=saving]::after{opacity:1;animation:dsh-showcase-settings-progress 1.05s cubic-bezier(.22,1,.36,1) infinite}
.dsh-showcase-settings__head{padding:16px 18px 13px;border-bottom:1px solid var(--dsw-alias-border-l2)}
.dsh-showcase-settings__title{margin:0;color:var(--dsw-alias-label-primary);font-size:14px;font-weight:650}
.dsh-showcase-settings__description{margin:4px 0 0;color:var(--dsw-alias-label-tertiary);font-size:12px;line-height:1.5}
.dsh-showcase-settings__body{padding:16px 18px 17px}
.dsh-showcase-settings__legend{margin:0 0 10px;color:var(--dsw-alias-label-secondary);font-size:12px;font-weight:600}
.dsh-showcase-settings__choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.dsh-showcase-settings__choice{position:relative;isolation:isolate;min-width:0;min-height:76px;padding:12px;text-align:left;color:var(--dsw-alias-label-primary);background:var(--dsw-alias-background-elevated);border:1px solid var(--dsw-alias-border-l2);border-radius:6px;overflow:hidden;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:border-color .18s cubic-bezier(.22,1,.36,1),background-color .18s cubic-bezier(.22,1,.36,1),transform .14s cubic-bezier(.22,1,.36,1)}
.dsh-showcase-settings__choice::before{position:absolute;top:10px;right:10px;width:7px;height:7px;border-radius:50%;content:"";pointer-events:none;background:var(--dsw-alias-state-business-primary);opacity:0;transform:scale(.35);transition:opacity .16s ease,transform .18s cubic-bezier(.22,1,.36,1)}
.dsh-showcase-settings__choice::after{position:absolute;right:11px;bottom:0;left:11px;height:2px;content:"";pointer-events:none;background:var(--dsw-alias-state-business-primary);transform:scaleX(0);transform-origin:left;transition:transform .2s cubic-bezier(.22,1,.36,1)}
.dsh-showcase-settings__choice[aria-checked=true]{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 10%,var(--dsw-alias-background-elevated))}
.dsh-showcase-settings__choice[aria-checked=true]::before{opacity:1;transform:scale(1)}
.dsh-showcase-settings__choice[aria-checked=true]::after{transform:scaleX(1)}
.dsh-showcase-settings__choice:not(:disabled):active{transform:translateY(0) scale(.99)}
.dsh-showcase-settings__choice:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:2px}
.dsh-showcase-settings__choice:disabled{cursor:not-allowed;opacity:.58;transform:none}
.dsh-showcase-settings__name{display:block;font-size:13px;font-weight:650}
.dsh-showcase-settings__hint{display:block;margin-top:5px;color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:1.45}
.dsh-showcase-settings__toggle-row{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:16px;padding-top:15px;border-top:1px solid var(--dsw-alias-border-l2)}
.dsh-showcase-settings__toggle-copy{min-width:0}
.dsh-showcase-settings__toggle{position:relative;isolation:isolate;flex:0 0 auto;width:50px;height:44px;padding:0;border:0;background:transparent;cursor:pointer;-webkit-tap-highlight-color:transparent}
.dsh-showcase-settings__toggle::before{position:absolute;inset:9px 1px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;content:"";background:var(--dsw-alias-background-elevated);transition:background-color .18s cubic-bezier(.22,1,.36,1),border-color .18s cubic-bezier(.22,1,.36,1)}
.dsh-showcase-settings__toggle::after{position:absolute;top:13px;left:5px;width:18px;height:18px;border-radius:50%;content:"";background:var(--dsw-alias-label-tertiary);transform:translateX(0);transition:transform .2s cubic-bezier(.22,1,.36,1),background-color .18s ease}
.dsh-showcase-settings__toggle[aria-checked=true]::before{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-primary)}
.dsh-showcase-settings__toggle[aria-checked=true]::after{background:var(--dsw-alias-background-base);transform:translateX(22px)}
.dsh-showcase-settings__toggle:not(:disabled):active::after{transform:translateX(0) scale(.86)}
.dsh-showcase-settings__toggle[aria-checked=true]:not(:disabled):active::after{transform:translateX(22px) scale(.86)}
.dsh-showcase-settings__toggle:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary);outline-offset:3px}
.dsh-showcase-settings__toggle:disabled{cursor:not-allowed;opacity:.58}
.dsh-showcase-settings__toggle-status{display:flex;align-items:center;gap:6px;margin-top:4px;color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:600}
.dsh-showcase-settings__toggle-status::before{flex:0 0 auto;width:5px;height:5px;border-radius:50%;content:"";background:var(--dsw-alias-label-tertiary);transition:background-color .16s ease,transform .16s cubic-bezier(.22,1,.36,1)}
.dsh-showcase-settings__toggle-status[data-enabled=true]::before{background:var(--dsw-alias-state-business-primary);transform:scale(1.2)}
.dsh-showcase-settings__status{display:flex;align-items:center;gap:7px;min-height:18px;margin:9px 0 0;color:var(--dsw-alias-label-tertiary);font-size:11px}
.dsh-showcase-settings__status::before{flex:0 0 auto;width:6px;height:6px;border-radius:50%;content:"";background:var(--dsw-alias-label-tertiary);opacity:0;transform:scale(.5);transition:opacity .16s ease,transform .16s cubic-bezier(.22,1,.36,1),background-color .16s ease}
.dsh-showcase-settings__status[data-state=saving]::before,.dsh-showcase-settings__status[data-state=saved]::before,.dsh-showcase-settings__status[data-state=failed]::before{opacity:1;transform:scale(1)}
.dsh-showcase-settings__status[data-state=saving]::before{animation:dsh-showcase-status-pulse .8s ease-in-out infinite}
.dsh-showcase-settings__status[data-state=saved]::before{background:var(--dsw-alias-state-business-primary)}
.dsh-showcase-settings__status[data-state=failed]{color:var(--dsw-alias-state-danger-primary)}
.dsh-showcase-settings__status[data-state=failed]::before{background:var(--dsw-alias-state-danger-primary)}
.dsh-showcase-settings__loading-choices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px}
.dsh-showcase-settings__loading-choice{height:76px;border:1px solid var(--dsw-alias-border-l2);border-radius:6px;background:var(--dsw-alias-background-elevated)}
.dsh-showcase-settings__loading-line{height:8px;margin:13px 12px 0;border-radius:4px;background:color-mix(in srgb,var(--dsw-alias-label-tertiary) 22%,transparent);animation:dsh-showcase-loading-pulse 1.1s ease-in-out infinite}
.dsh-showcase-settings__loading-line:last-child{width:58%;margin-top:9px;animation-delay:.12s}
.dsh-showcase-settings__loading-toggle{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:16px;padding-top:15px;border-top:1px solid var(--dsw-alias-border-l2)}
.dsh-showcase-settings__loading-toggle-copy{flex:1;min-width:0}
.dsh-showcase-settings__loading-switch{flex:0 0 auto;width:50px;height:26px;border:1px solid var(--dsw-alias-border-l2);border-radius:999px;background:var(--dsw-alias-background-elevated);animation:dsh-showcase-loading-pulse 1.1s ease-in-out infinite}
@keyframes dsh-showcase-settings-progress{0%{transform:translateX(-110%)}100%{transform:translateX(340%)}}
@keyframes dsh-showcase-loading-pulse{0%,100%{opacity:.45}50%{opacity:1}}
@keyframes dsh-showcase-status-pulse{0%,100%{opacity:.45;transform:scale(.75)}50%{opacity:1;transform:scale(1)}}
@media(hover:hover){.dsh-showcase-settings__choice:not(:disabled):hover{border-color:var(--dsw-alias-label-tertiary);background:color-mix(in srgb,var(--dsw-alias-label-primary) 4%,var(--dsw-alias-background-elevated));transform:translateY(-1px)}.dsh-showcase-settings__choice[aria-checked=true]:not(:disabled):hover{border-color:var(--dsw-alias-state-business-primary);background:color-mix(in srgb,var(--dsw-alias-state-business-primary) 14%,var(--dsw-alias-background-elevated))}.dsh-showcase-settings__choice:not(:disabled):hover:active{transform:translateY(0) scale(.99)}.dsh-showcase-settings__toggle:not(:disabled):hover::before{border-color:var(--dsw-alias-label-tertiary);background:color-mix(in srgb,var(--dsw-alias-label-primary) 5%,var(--dsw-alias-background-elevated))}.dsh-showcase-settings__toggle[aria-checked=true]:not(:disabled):hover::before{border-color:var(--dsw-alias-state-business-primary);background:var(--dsw-alias-state-business-primary)}}
@media(max-width:640px){.dsh-showcase-settings__choices{grid-template-columns:1fr}.dsh-showcase-settings__toggle-row{align-items:flex-start;flex-direction:column;gap:8px}.dsh-showcase-settings__toggle{margin-left:-1px}.dsh-showcase-settings__status{overflow-wrap:anywhere}}
@media(max-width:640px){.dsh-showcase-settings__loading-choices{grid-template-columns:1fr}.dsh-showcase-settings__loading-toggle{align-items:flex-start;flex-direction:column;gap:8px}}
@media(max-width:480px){.dsh-showcase-settings__head,.dsh-showcase-settings__body{padding-inline:10px}.dsh-showcase-settings__choice{min-height:44px;padding:9px}.dsh-showcase-settings__choice::before{top:8px;right:8px}.dsh-showcase-settings__hint{display:none}.dsh-showcase-settings__description{overflow-wrap:anywhere}.dsh-showcase-settings__toggle-copy{max-width:100%;overflow-wrap:anywhere}.dsh-showcase-settings__loading-choice{height:44px}.dsh-showcase-settings__loading-line{margin-top:11px}.dsh-showcase-settings__loading-line:last-child{display:none}}
@media(forced-colors:active){.dsh-showcase-settings__choice[aria-checked=true]{border-color:Highlight}.dsh-showcase-settings__choice::before,.dsh-showcase-settings__choice::after{background:Highlight}.dsh-showcase-settings__toggle::before{border-color:ButtonText;background:Canvas}.dsh-showcase-settings__toggle::after{background:ButtonText}.dsh-showcase-settings__toggle[aria-checked=true]::before{background:Highlight}.dsh-showcase-settings__toggle[aria-checked=true]::after{background:HighlightText}}
@media(prefers-reduced-motion:reduce){.dsh-showcase-settings::after,.dsh-showcase-settings__choice,.dsh-showcase-settings__choice::before,.dsh-showcase-settings__choice::after,.dsh-showcase-settings__toggle::before,.dsh-showcase-settings__toggle::after,.dsh-showcase-settings__toggle-status::before,.dsh-showcase-settings__status::before{transition:none}.dsh-showcase-settings[data-load-state=loading]::after,.dsh-showcase-settings[data-save-state=saving]::after{animation:none;opacity:1;transform:none}.dsh-showcase-settings__loading-line,.dsh-showcase-settings__loading-switch,.dsh-showcase-settings__status[data-state=saving]::before{animation:none}.dsh-showcase-settings__choice:hover,.dsh-showcase-settings__choice:not(:disabled):active{transform:none}}
`;

function installStyles() {
  if (document.getElementById(STYLE_ID)) return;
  const tag = document.createElement("style");
  tag.id = STYLE_ID;
  tag.textContent = styles;
  document.head.append(tag);
}

function createThemeCard(rpc) {
  return function ThemeCard({ t }) {
    const [theme, setTheme] = useState();
    const [generatePoster, setGeneratePoster] = useState(false);
    const [loadState, setLoadState] = useState("loading");
    const [saveState, setSaveState] = useState("idle");
    const mountedRef = useRef(true);
    const savingRef = useRef(false);
    const choiceRefs = useRef({});
    useEffect(() => {
      let active = true;
      mountedRef.current = true;
      rpc.call(RPC_CHANNEL, "get", {}).then((result) => {
        if (!active) return;
        const value = result.ok ? result.value : undefined;
        const validTheme = value?.theme === "frontier-signal" || value?.theme === "blue-big-fish";
        const validPosterSetting = value?.generatePoster === undefined || typeof value?.generatePoster === "boolean";
        if (validTheme && validPosterSetting) {
          setTheme(value.theme);
          if (typeof value.generatePoster === "boolean") setGeneratePoster(value.generatePoster);
          setLoadState("ready");
        } else {
          setLoadState("unavailable");
        }
      }).catch(() => {
        if (active) setLoadState("unavailable");
      });
      return () => {
        active = false;
        mountedRef.current = false;
      };
    }, []);

    if (loadState !== "ready") {
      const loading = loadState === "loading";
      return React.createElement("li", {
        className: "dsh-showcase-settings",
        "data-load-state": loadState,
        "aria-busy": loading,
      },
        React.createElement("div", { className: "dsh-showcase-settings__head" },
          React.createElement("h3", { className: "dsh-showcase-settings__title" }, t("title")),
          React.createElement("p", {
            className: "dsh-showcase-settings__description",
            role: "status",
            "aria-live": "polite",
          }, t(loadState))),
        loading && React.createElement("div", { className: "dsh-showcase-settings__body", "aria-hidden": true },
          React.createElement("div", { className: "dsh-showcase-settings__loading-choices" },
            ...THEME_VALUES.map((value) => React.createElement("div", {
              className: "dsh-showcase-settings__loading-choice",
              key: value,
            },
            React.createElement("div", { className: "dsh-showcase-settings__loading-line" }),
            React.createElement("div", { className: "dsh-showcase-settings__loading-line" })))),
          React.createElement("div", { className: "dsh-showcase-settings__loading-toggle" },
            React.createElement("div", { className: "dsh-showcase-settings__loading-toggle-copy" },
              React.createElement("div", { className: "dsh-showcase-settings__loading-line" }),
              React.createElement("div", { className: "dsh-showcase-settings__loading-line" })),
            React.createElement("div", { className: "dsh-showcase-settings__loading-switch" }))));
    }

    const disabled = saveState === "saving";
    const save = async (patch, rollback = () => {}) => {
      if (savingRef.current) return;
      savingRef.current = true;
      setSaveState("saving");
      try {
        const result = await rpc.call(RPC_CHANNEL, "set", patch);
        if (!mountedRef.current) return;
        const value = result.ok ? result.value : undefined;
        const validTheme = value?.theme === "frontier-signal" || value?.theme === "blue-big-fish";
        const validPosterSetting = value?.generatePoster === undefined || typeof value?.generatePoster === "boolean";
        if (validTheme && validPosterSetting) {
          setTheme(value.theme);
          if (typeof value.generatePoster === "boolean") setGeneratePoster(value.generatePoster);
          setSaveState("saved");
        } else {
          rollback();
          setSaveState("failed");
        }
      } catch {
        if (mountedRef.current) {
          rollback();
          setSaveState("failed");
        }
      } finally {
        savingRef.current = false;
      }
    };
    const choose = (nextTheme) => {
      if (savingRef.current || nextTheme === theme) return;
      const previousTheme = theme;
      setTheme(nextTheme);
      save({ theme: nextTheme }, () => setTheme(previousTheme));
    };
    const togglePoster = () => {
      if (savingRef.current) return;
      const previousValue = generatePoster;
      setGeneratePoster(!previousValue);
      save({ generatePoster: !previousValue }, () => setGeneratePoster(previousValue));
    };
    const moveChoiceFocus = (event, value) => {
      const currentIndex = THEME_VALUES.indexOf(value);
      let nextIndex;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") nextIndex = (currentIndex + 1) % THEME_VALUES.length;
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") nextIndex = (currentIndex - 1 + THEME_VALUES.length) % THEME_VALUES.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = THEME_VALUES.length - 1;
      if (nextIndex === undefined) return;
      event.preventDefault();
      const nextTheme = THEME_VALUES[nextIndex];
      choiceRefs.current[nextTheme]?.focus();
      choose(nextTheme);
    };

    const choice = (value, nameKey, hintKey) => React.createElement("button", {
      type: "button",
      role: "radio",
      "aria-checked": theme === value,
      className: "dsh-showcase-settings__choice",
      disabled,
      tabIndex: theme === value ? 0 : -1,
      ref: (node) => {
        choiceRefs.current[value] = node;
      },
      onClick: () => choose(value),
      onKeyDown: (event) => moveChoiceFocus(event, value),
    },
    React.createElement("span", { className: "dsh-showcase-settings__name" }, t(nameKey)),
    React.createElement("span", { className: "dsh-showcase-settings__hint" }, t(hintKey)));

    const status = saveState === "saving"
        ? t("saving")
        : saveState === "saved"
          ? t("saved")
          : saveState === "failed"
            ? t("failed")
            : "";

    return React.createElement("li", {
      className: "dsh-showcase-settings",
      "data-save-state": saveState,
      "aria-busy": disabled,
    },
      React.createElement("div", { className: "dsh-showcase-settings__head" },
        React.createElement("h3", { className: "dsh-showcase-settings__title" }, t("title")),
        React.createElement("p", { className: "dsh-showcase-settings__description" }, t("description"))),
      React.createElement("div", { className: "dsh-showcase-settings__body" },
        React.createElement("p", { className: "dsh-showcase-settings__legend", id: "dsh-showcase-theme-label" }, t("legend")),
        React.createElement("div", {
          className: "dsh-showcase-settings__choices",
          role: "radiogroup",
          "aria-labelledby": "dsh-showcase-theme-label",
          "aria-busy": disabled,
        },
          choice("frontier-signal", "dijiang", "dijiangHint"),
          choice("blue-big-fish", "fish", "fishHint")),
        React.createElement("div", { className: "dsh-showcase-settings__toggle-row" },
          React.createElement("div", { className: "dsh-showcase-settings__toggle-copy" },
            React.createElement("span", { className: "dsh-showcase-settings__name", id: "dsh-showcase-poster-label" }, t("posterLegend")),
            React.createElement("span", { className: "dsh-showcase-settings__hint", id: "dsh-showcase-poster-hint" }, t("posterHint")),
            React.createElement("span", {
              className: "dsh-showcase-settings__toggle-status",
              "data-enabled": generatePoster,
            }, generatePoster ? t("posterOn") : t("posterOff"))),
          React.createElement("button", {
            type: "button",
            role: "switch",
            "aria-checked": generatePoster,
            "aria-label": t("posterToggleLabel"),
            "aria-labelledby": "dsh-showcase-poster-label",
            "aria-describedby": "dsh-showcase-poster-hint",
            className: "dsh-showcase-settings__toggle",
            disabled,
            onClick: togglePoster,
          })),
        React.createElement("p", {
          className: "dsh-showcase-settings__status",
          "data-state": saveState,
          role: "status",
          "aria-live": "polite",
          "aria-atomic": true,
        }, status)));
  };
}

function apply(ctx) {
  installStyles();
  ctx.effect(() => ctx.locale.register(LOCALE_NAMESPACE, messages), "dsh-showcase: settings locale");
  const ThemeCard = createThemeCard(ctx.get("connection").rpc);
  ctx.slots.inject("settings.plugin.item", () => ctx.slots.register({
    name: "settings.plugin.item",
    id: "showcase-layout-summary",
    order: 30,
    locale: LOCALE_NAMESPACE,
  }, ThemeCard));
}

    exports.apply = apply;
    exports.inject = inject;
    return module.exports;
  },
});
