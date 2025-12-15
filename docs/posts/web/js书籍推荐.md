---
date: 2025-12-13
category:
  - web
  - JavaScript
---

# JavaScript 书籍推荐-You Don't Know JS
## 简介
本文推荐一本经典的javaScript书籍系列——《You Don't Know JS》。该系列书籍深入浅出地讲解了JavaScript的核心概念和高级特性，适合希望深入理解JavaScript的开发者阅读。
<br>
[You Don't Know JS (YDKJS)](https://github.com/getify/You-Dont-Know-JS)

## 笔记
这里，会记录我觉得比较重要的笔记，方便日后查阅。

### window不等于全局对象
在浏览器环境中，`window`对象是全局对象的一个实例，但它们并不完全相同。全局对象包含了所有全局变量和函数，而`window`对象则是浏览器特有的全局对象，包含了与浏览器相关的属性和方法。
```javascript
window.something = 42;

let something = "Kyle";

console.log(something);
// Kyle

console.log(window.something);
// 42
```
比如如上代码所示，`something`变量和`window.something`属性是两个不同的实体。