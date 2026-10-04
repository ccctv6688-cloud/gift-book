export const CONFIG = {
  ITEMS_PER_PAGE: 12,
  MAX_COVER_SIZE: 2 * 1024 * 1024,
  PRINT_SPLIT_THRESHOLD: 1008,
  APP_NAME: "电子礼簿系统 - 专业版",
  DB_NAME: "GiftRegistryDB",
  DB_VERSION: 1,
  GUEST_LEVELS: ["普宾", ...Array.from({ length: 100 }, (_, index) => `排序${100 - index}`)],
  PASSWORD_CACHE_DURATION: 5,
};

export const DEFAULT_PRINT_OPTIONS = Object.freeze({
  printCover: true,
  printEndPage: true,
  printAppendix: true,
  printSummary: true,
  printAbolished: true,
  showCoverTitle: true,
  pdfEngine: "browser",
});

/**
 * 礼簿通用工具方法，集中处理金额、日期、文件读取和设备判断。
 */
export class Utils {
  /**
   * 将数字金额格式化为人民币展示文本。
   */
  static formatCurrency(amount) {
    return new Intl.NumberFormat("zh-CN", {
      style: "currency",
      currency: "CNY",
    }).format(amount || 0);
  }

  /**
   * 将数字金额转换为中文大写金额。
   */
  static amountToChinese(n) {
    if (typeof n !== "number" && typeof n !== "string") return "";
    n = parseFloat(n);
    if (isNaN(n) || n === null) return "";
    if (n === 0) return "零元整";

    let unit = "京亿万仟佰拾兆万仟佰拾亿仟佰拾万仟佰拾元角分";
    let str = "";
    let s = n.toString();

    if (s.indexOf(".") > -1) s = (n * 100).toFixed(0);
    else s += "00";

    if (s.length > unit.length) return "金额过大";
    unit = unit.substr(unit.length - s.length);

    for (let i = 0; i < s.length; i++) {
      str += "零壹贰叁肆伍陆柒捌玖".charAt(s.charAt(i)) + unit.charAt(i);
    }

    return str
      .replace(/零(仟|佰|拾|角)/g, "零")
      .replace(/(零)+/g, "零")
      .replace(/零(兆|万|亿|元)/g, "$1")
      .replace(/(兆|亿)万/g, "$1")
      .replace(/(京|兆)亿/g, "$1")
      .replace(/(京)兆/g, "$1")
      .replace(/(亿)万/g, "$1")
      .replace(/(京|兆|亿|仟|佰|拾)(万?)(.)/g, "$1$2$3")
      .replace(/零元/g, "元")
      .replace(/零分/g, "")
      .replace(/零角/g, "零")
      .replace(/元$/g, "元整")
      .replace(/角$/g, "角整");
  }

  /**
   * 读取上传文件并转成 Base64，主要用于保存封面和背景图。
   */
  static async readFileAsBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  /**
   * 生成创建事项时使用的默认日期和时间。
   */
  static getCurrentDateTime() {
    const now = new Date();
    const pad = (num) => num.toString().padStart(2, "0");
    const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
    const time = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
    return { date, time };
  }

  /**
   * 把事项日期整理成页面显示和文件名需要的格式。
   */
  static getEventDateInfo(dateInput) {
    const date = new Date(dateInput);
    if (Number.isNaN(date.getTime())) {
      return { date, formattedDisplay: "", localeDate: "" };
    }
    const formattedDisplay = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    return {
      date,
      formattedDisplay,
      localeDate: date.toLocaleDateString("zh-CN"),
    };
  }

  /**
   * 生成用于导出文件名的时间戳。
   */
  static formatTimestampForFilename(date = new Date()) {
    const pad = (num) => num.toString().padStart(2, "0");
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }

  /**
   * 判断当前浏览器是否偏移动端，用于选择更稳的打印/PDF方式。
   */
  static isMobile() {
    return /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  }
}
