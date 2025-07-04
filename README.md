<h1 align="center">社交网络平台</h1>
<p align="center">
  <img src="https://img.shields.io/badge/code_size-54.8MB-blue" alt="code size"/>
  <img src="https://img.shields.io/badge/Vue-3.5.7-brightgreen" alt="languages"/>
  <img src="https://img.shields.io/badge/Vuex-4.1.0-brightgreen" alt="languages"/>
  <img src="https://img.shields.io/badge/Socket.io-4.8.1-brightgreen" alt="Tools"/>
  <img src="https://img.shields.io/badge/Express-4.18.0-brightgreen"
  alt="Tools"/>
  <img src="https://img.shields.io/badge/Mongoose-8.16.0-brightgreen" alt="Tools"/>
  <img src="https://img.shields.io/badge/last_commit-July_2025-orange" alt="last commit"/><br>
  <img src="https://img.shields.io/badge/Author-%E8%BD%AF%E4%BB%B6%E7%B3%BB%E7%BB%9F%E5%AE%9E%E8%B7%B5%E5%B0%8F%E7%BB%842-orange" alt="Author" />
</p>
<hr>

## 内容

- [内容](#内容)
  - [📌 项目简介](#-项目简介)
  - [📸 项目预览](#-项目预览)
  - [首页](#首页)
    - [开始进入界面](#开始进入界面)
    - [登录界面](#登录界面)
    - [注册界面](#注册界面)
    - [首页](#首页-1)
    - [个人信息界面](#个人信息界面)
    - [好友聊天界面](#好友聊天界面)
    - [群组聊天界面](#群组聊天界面)
    - [朋友圈界面](#朋友圈界面)
    - [发布动态界面](#发布动态界面)
    - [AI 对话界面](#ai-对话界面)
  - [⚙️ 已实现功能](#️-已实现功能)
  - [📦 技术栈](#-技术栈)
  - [🚀 安装依赖](#-安装依赖)
  - [📝 TODO](#-todo)
  - [🙋‍♂️ 贡献指南](#️-贡献指南)

### 📌 项目简介

基于 **Vue** + **Express** + **Socket.io** + **MongoDB** 实现的前后端分离的社交网络平台系统。平台具备个人资料卡、好友系统、消息功能、群组聊天。支持用户朋友圈发布动态、图片和互动。

### 📸 项目预览

#### 开始进入界面

<img width="1000" src="https://github.com/Meark231/Software_Group_Practice/blob/main/README-PIC/%E5%BC%80%E5%A7%8B%E8%BF%9B%E5%85%A5%E7%95%8C%E9%9D%A2.png"/>

#### 登录界面

<img width="1000" src="https://github.com/Meark231/Software_Group_Practice/blob/main/README-PIC/%E7%99%BB%E5%BD%95.png"/>

#### 注册界面

<img width="1000" src="https://github.com/Meark231/Software_Group_Practice/blob/main/README-PIC/%E6%B3%A8%E5%86%8C.png"/>

#### 首页

<img width="1000" src="https://github.com/Meark231/Software_Group_Practice/blob/main/README-PIC/%E9%A6%96%E9%A1%B5.png"/>

#### 个人信息界面

<img width="1000" src="https://github.com/Meark231/Software_Group_Practice/blob/main/README-PIC/%E4%B8%AA%E4%BA%BA%E4%BF%A1%E6%81%AF%E7%95%8C%E9%9D%A2.png"/>

#### 好友聊天界面

<img width="1000" src="https://github.com/Meark231/Software_Group_Practice/blob/main/README-PIC/%E5%A5%BD%E5%8F%8B%E8%81%8A%E5%A4%A9%E7%95%8C%E9%9D%A2.png"/>

#### 群组聊天界面

<img width="1000" src="https://github.com/Meark231/Software_Group_Practice/blob/main/README-PIC/%E7%BE%A4%E7%BB%84%E8%81%8A%E5%A4%A9%E7%95%8C%E9%9D%A2.png"/>

#### 朋友圈界面

<img width="1000" src="https://github.com/Meark231/Software_Group_Practice/blob/main/README-PIC/%E6%9C%8B%E5%8F%8B%E5%9C%88%E7%95%8C%E9%9D%A2.png"/>

#### 发布动态界面

<img width="1000" src="https://github.com/Meark231/Software_Group_Practice/blob/main/README-PIC/%E5%8F%91%E5%B8%83%E5%8A%A8%E6%80%81%E7%95%8C%E9%9D%A2.png"/>

#### AI 对话界面

<img width="1000" src="https://github.com/Meark231/Software_Group_Practice/blob/main/README-PIC/AI%E8%81%8A%E5%A4%A9%E7%95%8C%E9%9D%A2.png"/>

<img width="1000" src="https://github.com/Meark231/Software_Group_Practice/blob/main/README-PIC/AI%E8%81%8A%E5%A4%A9%E7%95%8C%E9%9D%A22.png"/>

### ⚙️ 已实现功能

1. 登录注册

2. 头像修改

3. 个性签名修改

4. 好友实时聊天

5. 创建群组

6. 群组聊天

7. 图片分享

8. 朋友圈动态发布

9. 朋友圈点赞评论

### 📦 技术栈

- **Vue3 框架**
- **HTML**
- **CSS**
- **JavaScript**
- **Socket.io**
- **Express 框架**
- **Node.js 框架**
- **MongoDB**

### 🚀 安装依赖

在 **MongoDB** 的 **bin** 文件目录下启动 MongoDB 数据库

```
net start MongoDB
```

安装依赖 `npm install`
在 **back_end** 文件目录下

```

npm install
node app.js
```

在 **front** 文件目录下

```
npm install
npm run serve
```

### 📝 TODO

- [ ] 个性化内容推荐和发现
- [ ] 活动组织和事件日历
- [ ] 第三方应用集成和 API
- [ ] 用户行为分析和数据报告
- [ ] 移动端适配和响应式设计

### 🙋‍♂️ 贡献指南

欢迎 PR 或 Issue！

1. Fork 本项目

2. 创建新分支：git checkout -b feature/功能名

3. 提交修改：git commit -m '添加功能说明'

4. 推送分支：git push origin feature/功能名

5. 提交 PR
