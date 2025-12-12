---
date: 2024-12-12
category:
  - 前端开发
  - JavaScript
---

# Pixi.js 使用教程

本教程是对 Pixi.js 官方文档的补充，重点讲解易错点和未详细说明的地方。详细内容请参考 [官方文档](https://pixijs.com/8.x/guides/concepts/scene-graph)。

## 安装和初始化

## 安装
### 不需要安装，直接在js里面引用

```html
<script src="https://pixijs.download/release/pixi.min.js"></script>
```

### 但是，对于使用pixi的地方，必须可以使用await（也就是异步环境）
#### 比如，模块
<details>
  <summary>模块详细知识</summary>
  &nbsp&nbsp 1.独立作用域：变量不会泄露到全局环境<br>
  &nbsp&nbsp 2.异步环境，可以直接使用await关键字<br>
  &nbsp&nbsp 3.严格模式：自动启用JavaScript的严格模式
</details>

```html
<script type="module"></script>
```
#### 或者，异步封装
```html
<script>
  async function name(params) {
    const app = new PIXI.Application();
  }
</script>
```


---
## 初始化
### 创建应用实例

```javascript
// 创建一个PIXI应用实例
const app = new PIXI.Application();

// 初始化应用
await app.init({ background: '#1099bb', resizeTo: window });

// 将应用的视图添加到DOM中
document.body.appendChild(app.view);
```

### 基本配置选项

```javascript
// 更多配置选项示例
await app.init({
  background: '#1099bb',    // 背景颜色
  resizeTo: window,         // 自适应尺寸
  antialias: true,          // 抗锯齿
  resolution: window.devicePixelRatio || 1, // 分辨率
  autoDensity: true,        // 自动调整密度
});
```

## 设置高宽自适应
### 固定大小与自适应

```javascript
// 手动处理窗口大小变化
window.addEventListener('resize', () => {
  //这里的高宽是某一个窗口高宽，手动计算并更改
  let w = window.innerWidth - editWidth;
  let h = window.innerHeight - navigationHeight;
  app.renderer.resize(w, h);
});

// 然后在ticker里面调用
app.ticker.add((ticker) => {
  movecanvas();
});
```

## 容器

用来方便管理的，是一个树形结构.

### 容器定义

```javascript
// 创建一个容器
const container = new PIXI.Container();

// 将容器添加到舞台
app.stage.addChild(container);
```

容器本身不渲染任何可见内容，它的主要作用是:
- 作为其他显示对象的父节点
- 提供坐标系统的转换
- 管理多个子元素作为一个整体

## Graphics()的小坑

### 必须先绘制图形再设置样式
```javascript
  // 比如
  const square = new Graphics()
  square.rect(0, 0, 100, 100)     // 绘制矩形
  square.stroke({ width: 2, color: 0x000000 }) // 设置边框
  square.fill({ color: 0xffffff }) // 填充白色
```
### 错误示范
```javascript
  // 比如
  const square = new Graphics()
  square.stroke({ width: 2, color: 0x000000 }) // 设置边框
  square.fill({ color: 0xffffff }) // 填充白色
  square.rect(0, 0, 100, 100)     // 绘制矩形
```

### square.rect(0, 0, 100, 100)的坑

#### square.rect(x, y ,w ,h),这里的X和y不是图形Graphics的坐标，而是绘制的图形相对于本身的坐标
#### 可以这样理解，假设绘制的图形就相当于人手上拿了一块牌子，这个坐标是相当于牌子显示的位置相对于这个人的位置，而不是人的坐标

### 绑定监听器的坑

#### 监听器点击移动放开这些事件都只会在显示的东西里面,所以单纯的容器没有显示任何东西绑定了是没有用的
#### app.stage.interactive = true // 使舞台可交互
#### 而且必须要打开这个属性才可以使用

### 设置锚点的各种坑

#### 1. Sprite 和 Graphics 的锚点属性不同
Sprite 使用 anchor（百分比）
Graphics 使用 pivot（像素值）
#### 2. 锚点改变会导致视觉位置偏移
```javascript
// 创建一个 100x100 的图形，位置在 (200, 200)
const obj = new Graphics()
obj.rect(0, 0, 100, 100)
obj.x = 200
obj.y = 200

// 情况1：默认锚点（左上角）
// 图形占据区域：(200,200) 到 (300,300)

// 情况2：设置中心锚点
obj.pivot.set(50, 50)
// 图形占据区域：(150,150) 到 (250,250)
// 视觉效果：图形向左上方移动了 50 像素！
```

## 二维仿射变换矩阵和worldTransform

#### worldTransform这个矩阵代表着当前这个图形的几乎所有坐标信息，考虑了锚点，缩放，旋转，位移叠加的效果，里面的数值可以理解为当前这个物体在相对于画布的坐标系下的数值

### 获取指针位置的坑

#### this.app.renderer.events.pointer.x 和 pointer.y 获取的是**页面左上角**的坐标，不是画布（canvas）左上角的坐标！

如果你需要得到相对于画布的坐标，应该这样写：

```javascript
const rect = app.view.getBoundingClientRect();
const x = app.renderer.events.pointer.x - rect.left;
const y = app.renderer.events.pointer.y - rect.top;
```

这样 x 和 y 才是相对于画布左上角的位置。




### 重要提示

⚠️ **zIndex** 会重新对容器排序，因为它修改显示顺序的原理就是修改排序，使用时需特别注意！