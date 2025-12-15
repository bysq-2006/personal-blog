---
title: 小说快速转换为webgal脚手架
---

# 小说快速转换为web gal可用的脚手架代码脚本。

## 使用方式

这个脚本主要用于将小说文本转换为 WebGAL 可用的脚手架代码。对于以“人名:”特殊格式的行，它会在前面插入一句代码（通常是加载人物模型的指令），然后添加原对话内容。这个插入的代码可以通过右侧的“编辑映射”按钮来更改映射表，从而自定义每个人物对应的代码。

## 示例

**输入：**

```
千早爱音: 你好啊
长崎素世: 早上好
这是一个旁白句子。
```

**输出：**

```
changeFigure:mygo_avemujica_v6/anon/037_school_winter-2023_rip/model.json -left;
千早爱音: 你好啊 -fontSize=default -center;
changeFigure:mygo_avemujica_v6/soyo/039_school_winter-2023_rip/model.json -right;
长崎素世: 早上好 -fontSize=default -center;
英文：这是一个旁白句子。 -fontSize=default -center;
```

<div style="width: 100%; height: 800px; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
  <iframe src="/parts/galzhuanhuan.html" width="100%" height="100%" style="border: none; border-radius: 8px;"></iframe>
</div>