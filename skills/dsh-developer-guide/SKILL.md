---
name: dsh-developer-guide
description: 开发或扩展 DeepSeek Harness 插件（宿主/客户端/工具/LLM 适配器/设置，dsh-vibe 即实例）时使用。先读本页路由，再按任务只读需要的文件。
---

# 开发 DSH Web Bundle 插件

## 开发

### 基础

- [第一个插件](开发/基础/第一个插件.md)
- [插件配置](开发/基础/插件配置.md)
- [打包与安装插件](开发/基础/打包与安装插件.md)
- [开发一个工具](开发/基础/开发一个工具.md)

### 框架能力

- [插件与生命周期](开发/框架能力/插件与生命周期.md)
- [服务与依赖](开发/框架能力/服务与依赖.md)
- [事件系统](开发/框架能力/事件系统.md)

### 实战

- [能力的三层拆分](开发/实战/能力的三层拆分.md)
- [LLM适配器](开发/实战/LLM适配器.md)

### Cordis 框架教程

- [总览](开发/Cordis 框架教程/总览.md)
- [1.第一个插件](开发/Cordis 框架教程/1.第一个插件.md)
- [2.生命周期与副作用](开发/Cordis 框架教程/2.生命周期与副作用.md)
- [3.服务](开发/Cordis 框架教程/3.服务.md)
- [4.事件](开发/Cordis 框架教程/4.事件.md)
- [5.配置](开发/Cordis 框架教程/5.配置.md)
- [6.组合与热重载](开发/Cordis 框架教程/6.组合与热重载.md)
- [7.进入Harness](开发/Cordis 框架教程/7.进入Harness.md)

## 参考

### 概念

- [架构](参考/概念/架构.md)
- [Cordis入门](参考/概念/Cordis入门.md)
- [能力服务](参考/概念/能力服务.md)
- [Agent生命周期](参考/概念/Agent生命周期.md)
- [Tool执行](参考/概念/Tool执行.md)

### 生成参考

- [插件配置](参考/生成参考/插件配置.md)
- [ToolSchema](参考/生成参考/ToolSchema.md)
- [持久化事件](参考/生成参考/持久化事件.md)

### Cordis API

- [Context](参考/Cordis API/Context.md)
- [Events](参考/Cordis API/Events.md)
- [Fiber](参考/Cordis API/Fiber.md)
- [PluginRegistry](参考/Cordis API/PluginRegistry.md)
- [Service](参考/Cordis API/Service.md)
- [继承接口面](参考/Cordis API/继承接口面.md)

### 开发手册

- [新增Package](参考/开发手册/新增Package.md)
- [新增Tool](参考/开发手册/新增Tool.md)
- [新增LLMAdapter](参考/开发手册/新增LLMAdapter.md)
- [新增设置卡片](参考/开发手册/新增设置卡片.md)
- [扩展模式](参考/开发手册/扩展模式.md)
- [新增ConversationNode](参考/开发手册/新增ConversationNode.md)
