---
title: ssl证书办理过程
date: 2025-12-13
category:
  - web
  - 计算机网络
---

## 使用的开源项目

[acme.sh](https://github.com/acmesh-official/acme.sh)  
acme.sh 是一个用纯 Shell 脚本编写的 ACME 协议客户端，主要用于自动化获取和续订 SSL/TLS 证书（尤其是免费的 Let's Encrypt 证书）。

---

## 安装 acme.sh

首先，使用如下命令下载安装 acme.sh，并指定你的邮箱（用于接收证书到期等通知）：

```bash
curl https://get.acme.sh | sh -s email=你的邮箱@example.com
```

安装完成后，会在你的 home 目录下生成 `.acme.sh/` 文件夹：

```
drwx------  5 root root 4096 Dec 14 17:08 .acme.sh/
```

---

## 申请证书

以 bysq.top 为例，假设你的网站根目录为 `/var/www/html/dist`，可以使用如下命令申请证书：

```bash
acme.sh --issue -d bysq.top --webroot /var/www/html/dist --email 你的邮箱@example.com
```

### 参数说明

- `--issue`：表示申请（签发）证书。
- `-d bysq.top`：指定要申请证书的域名。可以多次使用 `-d` 添加多个域名（如 `-d bysq.top -d www.bysq.top`）。
- `--webroot /var/www/html/dist`：指定网站的根目录。acme.sh 会在该目录下自动创建验证文件，CA 服务器会通过 HTTP 访问这些文件来验证域名所有权。
- `--email 你的邮箱@example.com`：指定用于注册和通知的邮箱（建议使用真实可用邮箱）。

### 注意事项

- 你的 nginx 配置中，`server_name` 必须包含你要申请的域名，`root` 路径要和 `--webroot` 保持一致。
- 80 端口必须对外开放，且能被 Let's Encrypt 服务器访问。
- 如果你之前用过 ZeroSSL，建议切换到 Let's Encrypt CA，可以用如下命令设置默认 CA：
  ```bash
  acme.sh --set-default-ca --server letsencrypt
  ```

---

## 安装证书到 nginx

证书申请成功后，acme.sh 会输出证书和密钥的路径。你可以用如下命令自动安装证书并重载 nginx：

```bash
acme.sh --install-cert -d bysq.top \
  --key-file /etc/nginx/ssl/_.bysq.top.key \
  --fullchain-file /etc/nginx/ssl/_.bysq.top.pem \
  --reloadcmd "systemctl reload nginx"
```

- `--install-cert`：安装证书到指定路径。
- `--key-file`：指定私钥保存路径。
- `--fullchain-file`：指定完整证书链保存路径。
- `--reloadcmd`：证书更新后自动重载 nginx。

---

## 总结

整个流程如下：

1. 安装 acme.sh 并配置邮箱。
2. 用 `--issue` 和 `--webroot` 申请证书，参数要和 nginx 配置对应。
3. 用 `--install-cert` 安装证书并自动重载 nginx。

这样就可以实现网站 HTTPS 免费证书的自动化申请和续期。