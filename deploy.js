import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// 配置文件路径
const configPath = path.join(process.cwd(), 'deploy-config.json');

// 检查配置文件是否存在
if (!fs.existsSync(configPath)) {
  console.error('❌ 配置文件 deploy-config.json 不存在，请创建并配置服务器信息。');
  process.exit(1);
}

// 读取配置
let config;
try {
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
} catch (error) {
  console.error('❌ 读取配置文件失败：', error.message);
  process.exit(1);
}

const { host, username, privateKeyPath, password, remotePath } = config.server;

// 检查必要配置
if (!host || !username || !remotePath) {
  console.error('❌ 配置文件不完整，请检查 host、username 和 remotePath。');
  process.exit(1);
}

// 检查认证方式
let useKeyAuth = false;
if (privateKeyPath && fs.existsSync(privateKeyPath)) {
  useKeyAuth = true;
  console.log('🔐 使用SSH密钥认证');
} else if (password) {
  console.log('🔐 使用密码认证（警告：不安全，建议使用SSH密钥）');
} else {
  console.error('❌ 缺少认证信息：请提供 privateKeyPath 或 password。');
  process.exit(1);
}

// 检查 dist 目录是否存在
const distPath = path.join(process.cwd(), 'docs', '.vuepress', 'dist');
if (!fs.existsSync(distPath)) {
  console.error('❌ dist 目录不存在，请先构建项目。');
  process.exit(1);
}

console.log('🚀 开始部署...');

// 生成时间戳作为压缩包名称
const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
const archiveName = `blog-deploy-${timestamp}.tar.gz`;
const archivePath = path.join(process.cwd(), archiveName);

// 1. 打包 dist 目录
console.log('📦 打包文件...');
try {
  execSync(`tar -czf "${archivePath}" -C "${distPath}" .`, { stdio: 'inherit' });
  console.log('✅ 打包完成');
} catch (error) {
  console.error('❌ 打包失败：', error.message);
  process.exit(1);
}

// 2. 发送到服务器
console.log('📤 发送到服务器...');
let scpCommand;
if (useKeyAuth) {
  scpCommand = `scp -i "${privateKeyPath}" "${archivePath}" ${username}@${host}:${remotePath}/`;
} else {
  // 使用密码认证（需要安装 sshpass）
  scpCommand = `sshpass -p "${password}" scp "${archivePath}" ${username}@${host}:${remotePath}/`;
}

try {
  execSync(scpCommand, { stdio: 'inherit' });
  console.log('✅ 发送完成');
} catch (error) {
  console.error('❌ 发送失败：', error.message);
  // 清理本地压缩包
  fs.unlinkSync(archivePath);
  process.exit(1);
}

// 3. 在服务器上解压缩并清理
console.log('🔧 服务器解压缩...');
const remoteCommands = [
  `cd ${remotePath}`,
  `tar -xzf ${archiveName}`,
  `rm ${archiveName}`
].join(' && ');

let sshCommand;
if (useKeyAuth) {
  sshCommand = `ssh -i "${privateKeyPath}" ${username}@${host} "${remoteCommands}"`;
} else {
  sshCommand = `sshpass -p "${password}" ssh ${username}@${host} "${remoteCommands}"`;
}

try {
  execSync(sshCommand, { stdio: 'inherit' });
  console.log('✅ 服务器处理完成');
} catch (error) {
  console.error('❌ 服务器处理失败：', error.message);
  // 注意：此时压缩包已在服务器上，可能需要手动清理
}

// 4. 删除本地压缩包
console.log('🧹 清理本地文件...');
try {
  fs.unlinkSync(archivePath);
  console.log('✅ 本地清理完成');
} catch (error) {
  console.error('❌ 本地清理失败：', error.message);
}

console.log('🎉 部署成功！');