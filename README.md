# 示例页面
<img width="300" alt="截屏2025-06-03 15 18 23" src="https://github.com/user-attachments/assets/75df2c43-d9f4-4c0c-8f8e-d349f5967de4" />
<img width="300" alt="截屏2025-06-03 15 19 14" src="https://github.com/user-attachments/assets/9a7fff58-893a-487c-867b-390af1f62b09" />
<img width="300" alt="截屏2025-06-03 15 15 14" src="https://github.com/user-attachments/assets/5900734f-49cf-4c26-a630-cdab51fa2d7f" />

# Wallet Demo

A React-based cryptocurrency wallet demo application that demonstrates basic wallet functionality using ethers.js and bitcoinjs-lib.

## Prerequisites

Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)

## Installation

You have three options to install the project dependencies:

### Option 1: Using the installation script (Recommended)
```bash
# Make the script executable
chmod +x install.sh

# Run the installation script
./install.sh
```

The script will:
- Check if Node.js is installed
- Verify Node.js version compatibility
- Install all dependencies
- Provide status updates during installation

### Option 2: Using npm
```bash
npm install
```

### Option 3: Using yarn
```bash
yarn install
```

This will install all required dependencies listed in package.json, including:
- React and React DOM
- TypeScript
- ethers.js for Ethereum interactions
- bitcoinjs-lib for Bitcoin functionality
- bip39 for mnemonic generation
- Other development dependencies

## Getting Started

Follow these steps to run the project locally:

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd wallet_demo
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```
   This will start the application in development mode. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Available Scripts

In the project directory, you can run:

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Project Structure

```
wallet_demo/
├── public/          # Static files
├── src/            # Source files
├── package.json    # Project dependencies and scripts
└── tsconfig.json   # TypeScript configuration
```

## Technologies Used

- React
- TypeScript
- ethers.js
- bitcoinjs-lib
- bip39 for mnemonic generation

## Development

The project is built with:
- React 18
- TypeScript
- Create React App

## Building for Production

To create a production build:

```bash
npm run build
```

This will create an optimized build in the `build` folder.

## License

MIT License

Copyright (c) 2024 Wallet Demo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## Contributing

[Add contribution guidelines here]

---

# 钱包演示项目

这是一个基于 React 的加密货币钱包演示应用，使用 ethers.js 和 bitcoinjs-lib 实现基本的钱包功能。

## 环境要求

在开始之前，请确保已安装以下软件：
- [Node.js](https://nodejs.org/) (v14 或更高版本)
- [npm](https://www.npmjs.com/) (随 Node.js 一起安装)

## 安装

您有三种方式安装项目依赖：

### 选项 1：使用安装脚本（推荐）
```bash
# 使脚本可执行
chmod +x install.sh

# 运行安装脚本
./install.sh
```

该脚本将：
- 检查是否安装了 Node.js
- 验证 Node.js 版本兼容性
- 安装所有依赖
- 提供安装状态更新

### 选项 2：使用 npm
```bash
npm install
```

### 选项 3：使用 yarn
```bash
yarn install
```

这将安装 package.json 中列出的所有必需依赖，包括：
- React 和 React DOM
- TypeScript
- ethers.js（用于以太坊交互）
- bitcoinjs-lib（用于比特币功能）
- bip39（用于助记词生成）
- 其他开发依赖

## 开始使用

按照以下步骤在本地运行项目：

1. **克隆仓库**
   ```bash
   git clone <repository-url>
   cd wallet_demo
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动开发服务器**
   ```bash
   npm start
   ```
   这将启动开发模式的应用。在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看。

## 可用脚本

在项目目录中，您可以运行：

- `npm start` - 以开发模式运行应用
- `npm test` - 启动测试运行器
- `npm run build` - 构建生产版本
- `npm run eject` - 从 Create React App 中弹出（单向操作）

## 项目结构

```
wallet_demo/
├── public/          # 静态文件
├── src/            # 源代码文件
├── package.json    # 项目依赖和脚本
└── tsconfig.json   # TypeScript 配置
```

## 使用的技术

- React
- TypeScript
- ethers.js
- bitcoinjs-lib
- bip39 用于助记词生成

## 开发

项目使用以下技术构建：
- React 18
- TypeScript
- Create React App

## 构建生产版本

创建生产构建：

```bash
npm run build
```

这将在 `build` 文件夹中创建优化后的构建文件。

## 许可证

MIT 许可证

版权所有 (c) 2024 钱包演示项目

特此免费授予任何获得本软件和相关文档文件（"软件"）副本的人不受限制地处理本软件的权利，
包括但不限于使用、复制、修改、合并、发布、分发、再许可和/或销售本软件的副本，
以及允许获得本软件的人这样做，但须符合以下条件：

上述版权声明和本许可声明应包含在本软件的所有副本或重要部分中。

本软件按"原样"提供，不提供任何形式的明示或暗示的保证，包括但不限于对适销性、
特定用途的适用性和非侵权性的保证。在任何情况下，作者或版权持有人均不对任何索赔、
损害或其他责任负责，无论是在合同诉讼、侵权行为或其他方面，由软件或软件的使用或
其他交易引起、产生或与之相关。

## 贡献

[在此添加贡献指南] 
