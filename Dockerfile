# 阶段1：构建前端静态文件
FROM node:20-alpine AS builder
WORKDIR /app
# 复制package.json和pnpm-lock.yaml（或package-lock.json）
COPY package.json pnpm-lock.yaml* ./
# 安装包管理工具（根据你的项目选择：npm/yarn/pnpm）
RUN npm install -g pnpm
RUN pnpm install
# 复制所有源码
COPY . .
# 构建生产环境包
RUN pnpm run build

# 阶段2：用Nginx运行静态文件
FROM nginx:alpine
# 从构建阶段复制打包后的文件到Nginx默认目录
COPY --from=builder /app/dist /usr/share/nginx/html
# 复制自定义Nginx配置（可选，解决前端路由刷新404问题）
COPY nginx.conf /etc/nginx/conf.d/default.conf
# 暴露Nginx端口
EXPOSE 80
# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
