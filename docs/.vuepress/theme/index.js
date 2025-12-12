import { getDirname, path } from 'vuepress/utils'
import { palettePlugin } from '@vuepress/plugin-palette'
import { defaultTheme } from '@vuepress/theme-default'

const __dirname = getDirname(import.meta.url)

export default (options) => ({
  name: 'vuepress-theme-custom',
  extends: defaultTheme(),
  clientConfigFile: path.resolve(__dirname, 'client.js'),
  plugins: [
    palettePlugin(),
  ],
  // 可以在这里添加更多配置，如插件、模板等
})