let excelToolsPromise

/**
 * 按需加载 Excel 导出库，并复用同一次加载结果。
 */
export async function loadExcelTools() {
  if (!excelToolsPromise) {
    excelToolsPromise = import('xlsx').catch((error) => {
      excelToolsPromise = null
      throw error
    })
  }
  return excelToolsPromise
}

let gridToolsPromise

/**
 * 按需加载统计弹窗使用的表格库，并避免重复下载同一模块。
 */
export async function loadGridTools() {
  if (!gridToolsPromise) {
    gridToolsPromise = import('gridjs').catch((error) => {
      gridToolsPromise = null
      throw error
    })
  }
  return gridToolsPromise
}

let pdfGeneratorPromise

/**
 * 按需加载 PDF 生成器，只有选择 PDF 引擎时才拉取相关代码。
 */
export async function loadPdfGenerator() {
  if (!pdfGeneratorPromise) {
    pdfGeneratorPromise = import('./GiftListPDFGenerator').then((module) => module.GiftRegistryPDF).catch((error) => {
      pdfGeneratorPromise = null
      throw error
    })
  }
  return pdfGeneratorPromise
}
