/**
 * 将当前事项的礼金明细和礼品清单写入 Excel 文件。
 */
export function writeGiftExcel({ XLSX, app, config, utils }) {
  if (app.gifts.length === 0) {
    app.ui.showNotification("没有可导出的数据。");
    return;
  }

  /**
   * 将单条礼金记录的修改历史整理成 Excel 单元格文本。
   */
  const formatHistoryToString = (historyArray) => {
    if (!historyArray || historyArray.length === 0) return "无修改记录";
    return [...historyArray]
      .reverse()
      .map((record, index) => {
        const recordTime = new Date(record.timestamp).toLocaleString("zh-CN");
        return `[${index + 1}] ${recordTime}: ${record.changeLog}`;
      })
      .join("\n");
  };

  const dataToExport = [];
  const giftSheetData = [];

  let totalAmount = 0;
  let activeCount = 0;
  let abolishedCount = 0;

  for (let i = 0; i < app.gifts.length; i++) {
    const g = app.gifts[i];
    const isAbolished = g.data.abolished === true;
    const guestLevel = g.data.guestLevel !== undefined ? g.data.guestLevel : 0;
    const guestLevelName = config.GUEST_LEVELS[guestLevel] || config.GUEST_LEVELS[0];

    const remarkData = app.normalizeRemarkData(g.data.remarkData);
    const customRemark = remarkData.custom || "";
    const giftRemark = remarkData.gift || "";
    const relationRemark = remarkData.relation || "";
    const phoneRemark = remarkData.phone || "";
    const addressRemark = remarkData.address || "";

    if (!isAbolished && giftRemark) {
      giftSheetData.push({
        姓名: g.data.name,
        礼品名称: giftRemark,
        关系: relationRemark,
        登记时间: new Date(g.data.timestamp).toLocaleString("zh-CN"),
      });
    }

    dataToExport.push({
      姓名: g.data.name,
      金额: g.data.amount,
      收款类型: g.data.type,
      宾客等级: guestLevelName,
      备注: customRemark,
      礼品: giftRemark,
      关系: relationRemark,
      电话: phoneRemark,
      住址: addressRemark,
      状态: isAbolished ? "已作废" : "正常",
      作废理由: isAbolished ? g.data.abolishReason || "" : "",
      登记时间: new Date(g.data.timestamp).toLocaleString("zh-CN"),
      修改日志: formatHistoryToString(g.data.history),
    });

    if (isAbolished) {
      abolishedCount++;
    } else {
      activeCount++;
      totalAmount += g.data.amount;
    }
  }

  dataToExport.push({});
  dataToExport.push({
    姓名: "总计",
    金额: totalAmount,
    收款类型: `有效记录 ${activeCount} 条,作废 ${abolishedCount} 条,共 ${app.gifts.length} 条`,
  });

  const worksheet = XLSX.utils.json_to_sheet(dataToExport);
  worksheet["!cols"] = [
    { wch: 10 },
    { wch: 12 },
    { wch: 12 },
    { wch: 10 },
    { wch: 30 },
    { wch: 20 },
    { wch: 15 },
    { wch: 18 },
    { wch: 25 },
    { wch: 10 },
    { wch: 30 },
    { wch: 22 },
    { wch: 60 },
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "礼金明细");

  if (giftSheetData.length > 0) {
    const giftWorksheet = XLSX.utils.json_to_sheet(giftSheetData, {
      header: ["姓名", "礼品名称", "关系", "登记时间"],
    });

    giftWorksheet["!cols"] = [
      { wch: 10 },
      { wch: 30 },
      { wch: 18 },
      { wch: 22 },
    ];

    XLSX.utils.book_append_sheet(workbook, giftWorksheet, "礼品清单");
  }

  const eventDateInfo = utils.getEventDateInfo(app.currentEvent.startDateTime);
  XLSX.writeFile(workbook, `${app.currentEvent.name}-礼金明细(${eventDateInfo.localeDate}).xlsx`);
  app.ui.showNotification("导出成功！", "success");
  return true;
}
