# public 静态资源目录说明

- images/：存放博客用到的图片（如文章插图、banner、logo等）
- icons/：存放网站 favicon、svg 图标等
- media/：存放音频、视频等多媒体文件
- fonts/：自定义字体文件（如 .woff2、.ttf 等）
- downloads/：可供用户下载的文件（如 PDF、压缩包、软件等）

所有放在 public 下的资源，打包后会自动映射到网站根目录，可通过 `/images/xxx.png` 直接访问。
