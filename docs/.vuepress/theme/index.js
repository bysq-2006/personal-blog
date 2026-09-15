import { getDirname, path } from 'vuepress/utils'
import { defaultTheme } from '@vuepress/theme-default'

const __dirname = getDirname(import.meta.url)

export default (options) => ({
  name: 'vuepress-theme-custom',
  extends: defaultTheme(),
  clientConfigFile: path.resolve(__dirname, 'client.js'),
  // 说明：palette 变量文件由 defaultTheme() 内置的 palettePlugin 加载，
  // 路径为 docs/.vuepress/styles/palette.scss。
  // 不要在这里再注册 palettePlugin()，否则会触发
  // "plugin @vuepress/plugin-palette has been used multiple times" 警告。
})