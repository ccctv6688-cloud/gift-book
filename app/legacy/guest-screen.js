import { createLegacyScope } from './scope.js'
import pellModule from 'pell'
import { escapeHtml, sanitizeRichText } from '../utils/safe-html.js'
import { isTrustedMessage, isGuestDisplayData } from '../utils/guest-messages.js'

const pell = pellModule?.default || pellModule

/**
 * 启动副屏页面，接收主屏消息并渲染礼簿展示内容。
 */
export function startGuestScreen(forms = {}) {
  const scope = createLegacyScope()
  const { listen, setTimeout, requestIdleCallback } = scope

  /**
   * 简易缓存管理器
   */
  const CacheManager = {
    CACHE_NAME: "guest-screen-qr-cache",
    SETTINGS_KEY: "guest-screen-settings",
    IMAGE_STORAGE_PREFIX: "guest-screen-image:",

    /**
     * 判断当前环境是否支持 Cache Storage 图片缓存。
     */
    hasCacheStorage() {
      return typeof caches !== "undefined" && typeof caches.open === "function" && typeof Response !== "undefined";
    },

    /**
     * 生成 localStorage 图片兜底缓存键名。
     */
    getImageStorageKey(key) {
      return `${this.IMAGE_STORAGE_PREFIX}${key}`;
    },

    /**
     * 将上传的图片文件转为 data URL，供 localStorage 兜底保存。
     */
    fileToDataUrl(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error || new Error("读取图片失败"));
        reader.readAsDataURL(file);
      });
    },

    /**
     * 将 localStorage 里的 data URL 转回 Blob，恢复成图片资源。
     */
    dataUrlToBlob(dataUrl) {
      const [header, data = ""] = dataUrl.split(",");
      const mime = header.match(/^data:(.*?);base64$/)?.[1] || "image/png";
      const binary = atob(data);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i += 1) {
        bytes[i] = binary.charCodeAt(i);
      }
      return new Blob([bytes], { type: mime });
    },
  
    /**
     * 保存二维码图片，优先使用 Cache Storage，失败时兜底到 localStorage。
     */
    async storeImage(key, file) {
      let stored = false;

      if (this.hasCacheStorage()) {
        try {
          const cache = await caches.open(this.CACHE_NAME);
          const response = new Response(file);
          await cache.put(key, response);
          stored = true;
        } catch (error) {
          console.warn(`Cache storage failed for image ${key}, using local storage fallback.`, error);
        }
      }

      try {
        const dataUrl = await this.fileToDataUrl(file);
        localStorage.setItem(this.getImageStorageKey(key), dataUrl);
        stored = true;
      } catch (error) {
        if (!stored) {
          console.error(`Failed to store image ${key}:`, error);
        } else {
          console.warn(`Failed to store fallback image ${key}:`, error);
        }
      }
    },
  
    /**
     * 读取二维码图片，优先读取 Cache Storage，再读取 localStorage 兜底数据。
     */
    async getImage(key) {
      if (this.hasCacheStorage()) {
        try {
          const cache = await caches.open(this.CACHE_NAME);
          const response = await cache.match(key);
          if (response) {
            return response.blob();
          }
        } catch (error) {
          console.warn(`Cache read failed for image ${key}, using local storage fallback.`, error);
        }
      }

      try {
        const dataUrl = localStorage.getItem(this.getImageStorageKey(key));
        if (dataUrl) {
          return this.dataUrlToBlob(dataUrl);
        }
        return null;
      } catch (error) {
        console.error(`Failed to get image ${key}:`, error);
        return null;
      }
    },
  
    /**
     * 删除指定二维码图片缓存。
     */
    async deleteImage(key) {
      if (this.hasCacheStorage()) {
        try {
          const cache = await caches.open(this.CACHE_NAME);
          await cache.delete(key);
        } catch (error) {
          console.warn(`Failed to delete cached image ${key}:`, error);
        }
      }

      localStorage.removeItem(this.getImageStorageKey(key));
    },
  
    /**
     * 合并并保存副屏显示设置。
     */
    storeSettings(settings) {
      try {
        const currentSettings = this.getSettings();
        const newSettings = { ...currentSettings, ...settings };
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(newSettings));
      } catch (error) {
        console.error("Failed to store settings:", error);
      }
    },
  
    /**
     * 读取副屏显示设置，读取失败时返回默认设置。
     */
    getSettings() {
      try {
        const settings = localStorage.getItem(this.SETTINGS_KEY);
        const defaults = { layout: "hidden", customText: "" };
        return settings ? { ...defaults, ...JSON.parse(settings) } : defaults;
      } catch (error) {
        console.error("Failed to get settings:", error);
        return { layout: "hidden", customText: "" };
      }
    },
  };
  
  /**
   * 根据隐私设置隐藏姓名，中间历史记录隐藏，最新记录保留全名。
   */
  function maskName(name, hidePrivacy, isLatest) {
    if (!hidePrivacy || isLatest) {
      return name;
    }
    const nameLength = name.length;
    if (nameLength <= 1) return name;
    if (nameLength === 2) return name[0] + "**";
    if (nameLength === 3) return name[0] + "**";
    return name.substring(0, 2) + "**";
  }
  
  /**
   * 副屏状态管理，负责消息接收、礼簿渲染、二维码设置和全屏控制。
   */
  class GuestScreen {
    /**
     * 初始化副屏实例并缓存 DOM 引用。
     */
    constructor() {
      this.currentData = null;
      this.cacheDOMElements();
    }
  
    /**
     * 缓存副屏页面需要频繁操作的 DOM 元素。
     */
    cacheDOMElements() {
      const $ = (id) => document.getElementById(id);
      const vueElements = forms.getElements?.() || {};
      this.appContainer = vueElements.appContainer ?? $("app-container");
      this.eventTitle = vueElements.eventTitle ?? $("event-title");
      this.giftBookContent = vueElements.giftBookContent ?? $("gift-book-content");
      this.fullscreenBtn = vueElements.fullscreenBtn ?? $("fullscreen-btn");
      this.fullscreenIcon = vueElements.fullscreenIcon ?? $("fullscreen-icon");
      this.fullscreenHint = vueElements.fullscreenHint ?? $("fullscreen-hint");
  
      this.layoutRoot = vueElements.layoutRoot ?? $("layout-root");
      this.qrCodeArea = vueElements.qrCodeArea ?? $("qr-code-area");
      this.qrAlipayContainer = vueElements.qrAlipayContainer ?? $("alipay-qr-container");
      this.qrWechatContainer = vueElements.qrWechatContainer ?? $("wechat-qr-container");
      this.qrAlipayImg = vueElements.qrAlipayImg ?? $("qr-alipay-img");
      this.qrWechatImg = vueElements.qrWechatImg ?? $("qr-wechat-img");
      this.customTextDisplay = vueElements.customTextDisplay ?? $("custom-text-display");
  
      this.settingsBtn = vueElements.settingsBtn ?? $("settings-btn");
      this.modalContainer = vueElements.modalContainer ?? $("modal-container");
      this.modal = vueElements.modal ?? $("modal");
      this.modalTitle = vueElements.modalTitle ?? $("modal-title");
      this.modalContent = vueElements.modalContent ?? $("modal-content");
      this.modalActions = vueElements.modalActions ?? $("modal-actions");
  
      this.pendingAlipayFile = null;
      this.pendingWechatFile = null;
      // 新增: 标记是否清空
      this.alipayCleared = false;
      this.wechatCleared = false;
    }
  
    /**
     * 绑定副屏消息监听和控件事件，并加载本地显示设置。
     */
    init() {
      listen(window, "message", (e) => this.handleMessage(e));
      window.opener?.postMessage({ type: "guest_screen_ready" }, window.location.origin);
      this.bindControlEvents();
      this.loadAndApplySettings();
    }
  
    /**
     * 绑定全屏按钮、设置按钮和全屏状态变化事件。
     */
    bindControlEvents() {
      listen(document, "fullscreenchange", () => {
        if (document.fullscreenElement) {
          this.fullscreenHint.style.display = "none";
          this.fullscreenIcon.className = "ri-fullscreen-exit-line text-2xl";
        } else {
          this.fullscreenIcon.className = "ri-fullscreen-line text-2xl";
        }
      });
  
      this.fullscreenBtn.addEventListener("click", () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch((err) => {
            console.error(`Error attempting to enable full-screen mode: ${err.message}`);
          });
        } else {
          document.exitFullscreen();
        }
      });
  
      this.settingsBtn.addEventListener("click", () => this.showSettingsModal());
    }
  
    /**
     * 处理主屏发送给副屏的展示数据和心跳消息。
     */
    handleMessage(event) {
      if (!isTrustedMessage(event, window.opener, window.location.origin)) return;
      if (!event.data || typeof event.data !== "object" || Array.isArray(event.data)) return;
      const { type, data } = event.data || {};
      switch (type) {
        case "guest_screen_update":
          if (!isGuestDisplayData(data)) return;
          this.updateDisplay(data);
          break;
        case "guest_screen_heartbeat":
          break;
      }
    }
  
    /**
     * 根据主屏数据更新副屏主题、标题和礼簿内容。
     */
    updateDisplay(data) {
      if (!data) return;
      this.currentData = data;
      document.body.className = data.theme || "theme-festive";
      this.eventTitle.textContent = data.eventName || "礼簿";
      this.renderGiftBook(data);
      this.appContainer.classList.remove("hidden");
    }
  
    /**
     * 渲染副屏礼簿的姓名、类型和金额三行内容。
     */
    renderGiftBook(data) {
      const { gifts, hidePrivacy, typeText } = data;
      const ITEMS_PER_PAGE = 12;
      const latestGiftId = gifts[gifts.length - 1]?.id;
      const displayGifts = [...gifts];
      while (displayGifts.length < ITEMS_PER_PAGE) {
        displayGifts.push(null);
      }
      const nameRow = document.createElement("div");
      nameRow.className = "gift-book-row";
      const typeRow = document.createElement("div");
      typeRow.className = "gift-book-row";
      const amountRow = document.createElement("div");
      amountRow.className = "gift-book-row";
      displayGifts.forEach((gift) => {
        const nameCell = document.createElement("div");
        nameCell.className = "book-cell name-cell";
        if (gift) {
          const isLatest = gift.id === latestGiftId;
          const displayName = maskName(gift.name, hidePrivacy, isLatest);
          const formattedName = displayName.length === 2 ? `${displayName[0]}\u3000${displayName[1]}` : displayName;
          nameCell.innerHTML = `<div class="name ${displayName.length > 4 ? "scale" : ""}">${escapeHtml(formattedName)}</div>`;
          if (isLatest) nameCell.classList.add("latest-entry");
        }
        nameRow.appendChild(nameCell);
        const typeCell = document.createElement("div");
        typeCell.className = "book-cell type-cell";
        typeCell.textContent = typeText || "贺礼";
        typeRow.appendChild(typeCell);
        const amountCell = document.createElement("div");
        amountCell.className = "book-cell amount-cell";
        if (gift) {
          const amountChinese = gift.amountChinese;
          amountCell.innerHTML = `
            <div class="amount-chinese ${amountChinese.length > 16 ? "scale" : ""}">${escapeHtml(amountChinese)}</div>
            <div class="amount-numeric ${Math.abs(gift.amount).toString().length > 8 ? "scale" : ""}">￥${escapeHtml(gift.amount)}</div>
          `;
          if (gift.id === latestGiftId) amountCell.classList.add("latest-entry");
        }
        amountRow.appendChild(amountCell);
      });
      this.giftBookContent.innerHTML = "";
      this.giftBookContent.append(nameRow, typeRow, amountRow);
    }
  
    /**
     * 读取二维码和自定义文字设置，并应用到副屏布局。
     */
    async loadAndApplySettings() {
      const settings = CacheManager.getSettings();
      const alipayBlob = await CacheManager.getImage("alipay-qr");
      const wechatBlob = await CacheManager.getImage("wechat-qr");
      const customText = settings.customText || "";
  
      const hasContent = !!alipayBlob || !!wechatBlob || (customText && customText.trim() !== "");
      this.applyLayout(settings.layout, hasContent);
  
      if (alipayBlob) {
        this.qrAlipayImg.src = URL.createObjectURL(alipayBlob);
        this.qrAlipayContainer.style.display = "flex";
      } else {
        this.qrAlipayImg.src = "";
        this.qrAlipayContainer.style.display = "none";
      }
      if (wechatBlob) {
        this.qrWechatImg.src = URL.createObjectURL(wechatBlob);
        this.qrWechatContainer.style.display = "flex";
      } else {
        this.qrWechatImg.src = "";
        this.qrWechatContainer.style.display = "none";
      }
      this.customTextDisplay.innerHTML = sanitizeRichText(customText);
    }
  
    /**
     * 根据设置控制二维码区域显示位置。
     */
    applyLayout(layout, hasContent) {
      this.layoutRoot.classList.remove("flex-row", "flex-row-reverse");
      const showQrArea = layout !== "hidden" && hasContent;
      if (showQrArea) {
        this.qrCodeArea.style.display = "flex";
        if (layout === "left") this.layoutRoot.classList.add("flex-row");
        else if (layout === "right") this.layoutRoot.classList.add("flex-row-reverse");
      } else {
        this.qrCodeArea.style.display = "none";
      }
    }
  
    /**
     * 打开副屏设置弹窗，允许配置二维码、自定义文字和显示位置。
     */
    async showSettingsModal() {
      this.pendingAlipayFile = null;
      this.pendingWechatFile = null;
      this.alipayCleared = false; // 重置状态
      this.wechatCleared = false; // 重置状态
  
      const settings = CacheManager.getSettings();
      const currentLayout = settings.layout || "hidden";
      const customText = settings.customText || "";
  
      const alipayBlob = await CacheManager.getImage("alipay-qr");
      const wechatBlob = await CacheManager.getImage("wechat-qr");
      const alipaySrc = alipayBlob ? URL.createObjectURL(alipayBlob) : "";
      const wechatSrc = wechatBlob ? URL.createObjectURL(wechatBlob) : "";
  
      this.modalTitle.textContent = "副屏显示设置";
      this.modalContent.innerHTML = `
        <div class="space-y-6 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700">显示收款码</label>
            <div class="flex space-x-4 mt-2">
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="layout-position" value="hidden" class="themed-text-radio themed-ring" ${currentLayout === "hidden" ? "checked" : ""}>
                <span>不显示</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="layout-position" value="left" class="themed-text-radio themed-ring" ${currentLayout === "left" ? "checked" : ""}>
                <span>左侧显示</span>
              </label>
              <label class="flex items-center space-x-2 cursor-pointer">
                <input type="radio" name="layout-position" value="right" class="themed-text-radio themed-ring" ${currentLayout === "right" ? "checked" : ""}>
                <span>右侧显示</span>
              </label>
            </div>
          </div>
  
          <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <div class="flex-1">
              <div class="flex justify-between items-center mb-1">
                <label class="block text-sm font-medium text-gray-700">支付宝 收款码</label>
                <button data-qr-clear="alipay" class="text-xs text-red-600 hover:underline ${alipaySrc ? "" : "hidden"}">清空</button>
              </div>
              <input type="file" data-qr-upload="alipay" accept="image/*" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300">
              <img data-qr-preview="alipay" src="${alipaySrc}" class="mt-2 rounded-lg ${alipaySrc ? "" : "hidden"} max-w-full h-auto max-h-32 object-contain border p-1 bg-white">
            </div>
            <div class="flex-1">
              <div class="flex justify-between items-center mb-1">
                <label class="block text-sm font-medium text-gray-700">微信 收款码</label>
                <button data-qr-clear="wechat" class="text-xs text-red-600 hover:underline ${wechatSrc ? "" : "hidden"}">清空</button>
              </div>
              <input type="file" data-qr-upload="wechat" accept="image/*" class="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-200 file:text-gray-700 hover:file:bg-gray-300">
              <img data-qr-preview="wechat" src="${wechatSrc}" class="mt-2 rounded-lg ${wechatSrc ? "" : "hidden"} max-w-full h-auto max-h-32 object-contain border p-1 bg-white">
            </div>
          </div>
  
          <div>
            <label class="block text-sm font-medium text-gray-700">自定义文字</label>
            <div data-role="pell-editor-container" class="mt-1"></div>
          </div>
        </div>
      `;
  
      this.modalActions.innerHTML = `
        <button data-role="modal-cancel" class="themed-button-secondary">取消</button>
        <button data-role="modal-save" class="themed-button-primary">保存设置</button>
      `;
  
      if (!pell?.init) {
        console.error("Pell.js 未加载!");
        return;
      }
  
      const pellEditorContainer = this.modalContent.querySelector('[data-role="pell-editor-container"]');
      const editor = pell.init({
        element: pellEditorContainer,
        onChange: () => {},
        defaultParagraphSeparator: "div",
        styleWithCSS: false,
        actions: [
          { icon: '<i class="ri-bold" title="加粗"></i>', title: "Bold", result: () => pell.exec("bold") },
          { icon: '<i class="ri-italic" title="斜体"></i>', title: "Italic", result: () => pell.exec("italic") },
          { icon: '<i class="ri-underline" title="下划线"></i>', title: "Underline", result: () => pell.exec("underline") },
        ],
      });
      editor.content.innerHTML = sanitizeRichText(customText);
  
      const actionbar = pellEditorContainer.querySelector(".pell-actionbar");
      const select = document.createElement("select");
      select.className = "custom-pell-select";
      select.title = "字号";
      select.innerHTML = `<option value="1">小</option><option value="3" selected>中</option><option value="5">大</option><option value="7">特大</option>`;
      select.onchange = () => {
        pell.exec("fontSize", select.value);
        editor.content.focus();
      };
      actionbar.appendChild(select);
      const colorInput = document.createElement("input");
      colorInput.type = "color";
      colorInput.className = "custom-pell-color";
      colorInput.title = "文字颜色";
      colorInput.value = "var(--primary-color)";
      colorInput.onchange = () => {
        pell.exec("foreColor", colorInput.value);
        editor.content.focus();
      };
      actionbar.appendChild(colorInput);
      const updateToolbarState = () => {
        const size = document.queryCommandValue("fontSize") || "3";
        if (select.value !== size) select.value = size;
      };
      editor.content.addEventListener("keyup", updateToolbarState);
      editor.content.addEventListener("mouseup", updateToolbarState);
  
      this.modalActions.querySelector('[data-role="modal-cancel"]').onclick = () => this.closeSettingsModal();
      this.modalActions.querySelector('[data-role="modal-save"]').onclick = () => this.handleSaveSettings(editor);
      this.getQrUploadInput("alipay").onchange = (e) => this.handleFilePreview(e, "alipay");
      this.getQrUploadInput("wechat").onchange = (e) => this.handleFilePreview(e, "wechat");
      this.getQrClearButton("alipay").onclick = () => this.handleClearPreview("alipay");
      this.getQrClearButton("wechat").onclick = () => this.handleClearPreview("wechat");
  
      this.modalContainer.classList.remove("hidden");
    }

    /**
     * 获取当前设置弹窗里的二维码上传输入框。
     */
    getQrUploadInput(type) {
      return this.modalContent.querySelector(`[data-qr-upload="${type}"]`);
    }

    /**
     * 获取当前设置弹窗里的二维码预览图。
     */
    getQrPreviewImage(type) {
      return this.modalContent.querySelector(`[data-qr-preview="${type}"]`);
    }

    /**
     * 获取当前设置弹窗里的二维码清空按钮。
     */
    getQrClearButton(type) {
      return this.modalContent.querySelector(`[data-qr-clear="${type}"]`);
    }
  
    /**
     * 清空某个二维码的预览图，并标记保存时需要删除缓存。
     */
    handleClearPreview(type) {
      const preview = this.getQrPreviewImage(type);
      const uploadInput = this.getQrUploadInput(type);
      const clearBtn = this.getQrClearButton(type);
      if (!preview || !uploadInput || !clearBtn) return;
  
      preview.src = "";
      preview.classList.add("hidden");
      uploadInput.value = "";
      clearBtn.classList.add("hidden");
  
      if (type === "alipay") {
        this.pendingAlipayFile = null;
        this.alipayCleared = true;
      } else if (type === "wechat") {
        this.pendingWechatFile = null;
        this.wechatCleared = true;
      }
    }
  
    /**
     * 关闭副屏设置弹窗并清理弹窗内容。
     */
    closeSettingsModal() {
      this.modalContainer.classList.add("hidden");
      this.modalContent.innerHTML = "";
      this.modalActions.innerHTML = "";
    }
  
    /**
     * 预览刚选择的二维码图片，并等待保存时写入缓存。
     */
    handleFilePreview(event, type) {
      const file = event.target.files[0];
      if (!file) return;
  
      if (type === "alipay") {
        this.pendingAlipayFile = file;
        this.alipayCleared = false;
      }
      if (type === "wechat") {
        this.pendingWechatFile = file;
        this.wechatCleared = false;
      }
  
      const preview = this.getQrPreviewImage(type);
      const clearBtn = this.getQrClearButton(type);
      if (!preview || !clearBtn) return;
      const oldSrc = preview.src;
      preview.src = URL.createObjectURL(file);
      preview.classList.remove("hidden");
      clearBtn.classList.remove("hidden");
  
      preview.onload = () => {
        if (oldSrc.startsWith("blob:")) {
          URL.revokeObjectURL(oldSrc);
        }
      };
    }
  
    /**
     * 保存副屏设置，更新二维码缓存、布局和自定义文字。
     */
    async handleSaveSettings(editor) {
      try {
        // 1. 根据标记和新文件更新图片
        if (this.alipayCleared) {
          await CacheManager.deleteImage("alipay-qr");
        } else if (this.pendingAlipayFile) {
          await CacheManager.storeImage("alipay-qr", this.pendingAlipayFile);
        }
  
        if (this.wechatCleared) {
          await CacheManager.deleteImage("wechat-qr");
        } else if (this.pendingWechatFile) {
          await CacheManager.storeImage("wechat-qr", this.pendingWechatFile);
        }
  
        // 2. 保存布局和文字
        const layout = this.modalContent.querySelector('input[name="layout-position"]:checked')?.value || "hidden";
        const customText = sanitizeRichText(editor.content.innerHTML);
        CacheManager.storeSettings({ layout, customText });
  
        // 3. 重新加载并应用
        await this.loadAndApplySettings();
  
        // 4. 关闭弹窗
        this.closeSettingsModal();
      } catch (error) {
        console.error("保存设置失败:", error);
        alert("保存设置失败，请重试。");
      }
    }
  }
  
  const guestScreen = new GuestScreen();
  guestScreen.init();
  
  listen(document, "keydown", (e) => {
    if (e.target.closest(".pell-content")) return;
    if (e.key === "F11") {
      e.preventDefault();
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.error(`Error attempting to enable full-screen mode: ${err.message}`);
        });
      } else {
        document.exitFullscreen();
      }
    }
    if (e.key === "Escape" && !document.fullscreenElement) {
      if (confirm("确定要关闭副屏吗？")) {
        window.close();
      }
    }
  });
  
  return { dispose: scope.dispose };
}
