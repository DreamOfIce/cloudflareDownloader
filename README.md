# Cloudflare Downloader
下载受Cloudflare五秒盾保护的文件的API

# 安装
## 步骤
1. 克隆此仓库
2. 使用`pnpm install`来安装依赖(或者使用yarn：`yarn install`)
3. 运行`index.js`

## 环境变量
> 运行时会自动读取`.env`中的环境变量
- `PORT` 要监听的端口，默认8080
- `PROXY_HOST` 代理服务器的地址，为空则不使用代理
- `PROXY_PORT` 代理服务器的端口
- `PROXY_USER` 代理服务器的用户名
- `PROXY_PASS` 代理服务器的用户秘密

# 食用
访问 `API服务器/api/要下载的文件链接`即可下载对应文件
