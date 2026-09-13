# paper-home

博客首页线稿楼 + 阳台道具。

- 预览/打点：`index.html`（不必部署到博客）
- 构图数据：`layout.json`（真正要用的位置、模型、尺寸）

博客首页只读 `layout.json` + `assets/models/`，不要拷贝 `index.html`。

## 来源

| 文件 | 来源 | 许可（以原页为准） |
|---|---|---|
| home.glb | Hunyuan3D | 自用生成 |
| houseplant | Quaternius | 见 Poly Pizza 原页 |
| potted plant | scaranto | 见 Poly Pizza 原页 |
| succulent pot | Isa Lousberg | 见 Poly Pizza 原页 |
| laptop | Alex Safayan | 见 Sketchfab/Poly 原页 |

## 预览

在 `D:\bysq` 下已有静态服务时打开：

http://127.0.0.1:8765/paper-home/index.html

十个盆栽写在 `layout.json` 的 `placements`。MacBook 在 `catalog.laptop`，点好坐标后往 `placements` 加一条 `"kind": "laptop"` 即可。

`catalog` 里的 `height` / `width` 是世界坐标上限；单条 placement 可以覆盖。
