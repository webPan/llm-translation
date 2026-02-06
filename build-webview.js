/**
 * Webview 构建脚本
 * 使用 esbuild 编译 webview TypeScript 代码
 */

const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const isWatch = process.argv.includes('--watch');

// 确保输出目录存在
const outDir = path.join(__dirname, 'out', 'webview', 'views');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 基础构建选项
const getBaseOptions = () => ({
  format: 'iife',
  platform: 'browser',
  target: 'es2020',
  bundle: true,
  // 外部依赖 - 这些将在运行时由 VS Code 提供
  external: ['vscode'],
  define: {
    'process.env.NODE_ENV': '"production"',
  },
  loader: {
    '.ts': 'tsx',
  },
  // 压缩输出
  minify: process.env.NODE_ENV === 'production',
  sourcemap: true,
  // 忽略 CSS 导入（如果需要单独处理 CSS）
  logLevel: 'info',
});

/**
 * 构建设置面板
 */
async function buildSettingsPanel() {
  const entryFile = path.join(__dirname, 'src', 'webview', 'views', 'settings.ts');

  if (!fs.existsSync(entryFile)) {
    console.log('⚠️  设置面板入口文件不存在，跳过构建...');
    return;
  }

  const options = {
    ...getBaseOptions(),
    entryPoints: [entryFile],
    outfile: path.join(outDir, 'settings.js'),
  };

  if (isWatch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    console.log('👀 监视设置面板...');
  } else {
    await esbuild.build(options);
    console.log('✅ 设置面板构建成功！');
  }
}

/**
 * 构建简单面板
 */
async function buildSimplePanel() {
  const entryFile = path.join(__dirname, 'src', 'webview', 'views', 'simple.ts');

  if (!fs.existsSync(entryFile)) {
    console.log('⚠️  简单面板入口文件不存在，跳过构建...');
    return;
  }

  const options = {
    ...getBaseOptions(),
    entryPoints: [entryFile],
    outfile: path.join(outDir, 'simple.js'),
  };

  if (isWatch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    console.log('👀 监视简单面板...');
  } else {
    await esbuild.build(options);
    console.log('✅ 简单面板构建成功！');
  }
}

/**
 * 构建完整面板
 */
async function buildFullPanel() {
  const entryFile = path.join(__dirname, 'src', 'webview', 'views', 'full.ts');

  if (!fs.existsSync(entryFile)) {
    console.log('⚠️  完整面板入口文件不存在，跳过构建...');
    return;
  }

  const options = {
    ...getBaseOptions(),
    entryPoints: [entryFile],
    outfile: path.join(outDir, 'full.js'),
  };

  if (isWatch) {
    const ctx = await esbuild.context(options);
    await ctx.watch();
    console.log('👀 监视完整面板...');
  } else {
    await esbuild.build(options);
    console.log('✅ 完整面板构建成功！');
  }
}

/**
 * 复制 CSS 文件（如果有）
 */
async function copyStyles() {
  const stylesDir = path.join(__dirname, 'src', 'webview', 'views', 'styles');
  const outStylesDir = path.join(outDir, 'styles');

  if (fs.existsSync(stylesDir)) {
    if (!fs.existsSync(outStylesDir)) {
      fs.mkdirSync(outStylesDir, { recursive: true });
    }

    const files = fs.readdirSync(stylesDir);
    for (const file of files) {
      if (file.endsWith('.css')) {
        fs.copyFileSync(
          path.join(stylesDir, file),
          path.join(outStylesDir, file)
        );
      }
    }
    console.log('✅ 样式文件复制成功！');
  }
}

/**
 * 复制 codicon 资源
 */
async function copyCodicons() {
  const codiconDir = path.join(__dirname, 'node_modules', '@vscode', 'codicons', 'dist');
  const outCodiconDir = path.join(outDir, 'styles', 'codicons');

  if (!fs.existsSync(codiconDir)) {
    console.log('⚠️  codicons 资源不存在，跳过复制...');
    return;
  }

  if (!fs.existsSync(outCodiconDir)) {
    fs.mkdirSync(outCodiconDir, { recursive: true });
  }

  const files = fs.readdirSync(codiconDir);
  for (const file of files) {
    fs.copyFileSync(
      path.join(codiconDir, file),
      path.join(outCodiconDir, file)
    );
  }

  console.log('✅ codicon 资源复制成功！');
}

/**
 * 主函数
 */
async function main() {
  console.log('🔨 开始构建 webview...\n');

  try {
    // 并行构建所有面板
    await Promise.all([
      buildSettingsPanel(),
      buildSimplePanel(),
      buildFullPanel(),
    ]);

    // 复制样式文件
    await copyStyles();
    await copyCodicons();

    if (!isWatch) {
      console.log('\n✨ 所有 webview 构建完成！');
    }
  } catch (error) {
    console.error('\n❌ 构建失败:', error);
    process.exit(1);
  }
}

// 运行构建
main();
