# 电子礼簿 Nuxt 版

基于原版 [gift-book](https://github.com/jingguanzhang/gift-book) 迁移，使用 Nuxt 4 + Vue 3。
目前保留原来的界面和业务逻辑，没有新增后端、登录平台或状态管理库。

## 启动

```sh
pnpm install
pnpm dev
```

本地开发时，终端会显示访问地址，默认首页为 Nuxt 开发服务地址，宾客屏为同域名下的 `/guest-screen`。
部署到线上后不需要改成固定地址，首页使用你的正式域名，宾客屏会自动使用当前网站域名打开，例如 `https://你的域名/guest-screen`。

## 部署路径

项目通过 `.env` 里的 `NUXT_APP_BASE_URL` 控制部署基础路径：

```env
# 通用静态部署，根路径和二级目录通常都可用
NUXT_APP_BASE_URL=./

# 如果平台要求绝对路径，根路径部署可改为：
# NUXT_APP_BASE_URL=/

# 如果平台要求绝对路径，二级目录部署可改为：
# NUXT_APP_BASE_URL=/gift-book/
```

修改 `.env` 后需要重新执行 `pnpm build` 或 `pnpm generate`。

## 目录

```text
app/
  app.vue                   页面入口
  pages/index.vue           礼簿首页
  pages/guest-screen.vue    宾客屏
  components/               创建事项、礼金录入表单
  assets/css/tailwind.css    构建时生成的样式
  utils/                    安全处理、按需加载工具
  composables/useLegacyPage.js  加载依赖并启动页面
  legacy/                   从原 HTML 提取的业务逻辑
public/
  static/                   原有图片、字体和第三方库
  styles/                   两个页面的样式
```

修改页面布局看 `pages`，修改记账逻辑看 `legacy/gift-book.js`。
创建事项和礼金录入已经改成 Vue 表单，其余界面继续使用现有业务脚本。
Excel、PDF、统计依赖按需加载。样式在构建时生成，修改业务脚本中的样式类名也会被扫描。

## 数据

数据仍保存在当前浏览器的 IndexedDB，沿用 `GiftRegistryDB` 和原来的加密格式。
浏览器会按协议、域名和端口隔离数据，本地开发地址和线上正式域名的数据也会分开保存。
换地址后看不到旧数据属于正常情况，请先在原系统导出备份，再在新系统导入；平时固定使用同一个线上域名。

管理密码只保存在页面内存，刷新或重新打开页面后需要重新解锁；事项和礼金记录不会因此清除。
升级后会清理旧的浏览器密码缓存，数据加密格式保持兼容。副屏只接收同源主窗口发送的数据，姓名与备注按普通文字显示，副屏富文本仅保留文字格式。

## 构建

```sh
pnpm build
pnpm generate
pnpm test
```

`pnpm generate` 的静态文件位于 `.output/public`，使用 HTTP 静态服务部署。首页、宾客屏以及旧的 `.html` 地址均已配置。

## Docker 部署

服务器已安装 Docker 和 Docker Compose 后，在项目目录执行：

```sh
docker compose up -d --build
```

默认会启动在服务器 `3000` 端口：

```text
http://服务器IP:3000/
```

如果要换端口，可以临时指定：

```sh
APP_PORT=8080 docker compose up -d --build
```

如果不用 Compose，也可以直接构建运行：

```sh
docker build -t gift-book-nuxt .
docker run -d --name gift-book-nuxt -p 3000:80 --restart unless-stopped gift-book-nuxt
```

如果部署到二级目录，优先保持 `.env` 里的 `NUXT_APP_BASE_URL=./`。如果你的反向代理或平台要求绝对路径，再改成类似：

```env
NUXT_APP_BASE_URL=/gift-book/
```

然后重新执行：

```sh
docker compose up -d --build
```

注意：系统数据仍保存在访问者自己的浏览器本地。换域名、换浏览器或清理浏览器数据后，看不到旧数据属于正常情况。

## 来源

原项目作者：jingguanzhang。此版本调整了 Nuxt 目录、路由和页面生命周期。
原始许可见 `License`，原版项目说明见 `README.original.md`。
