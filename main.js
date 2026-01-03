const { app, BrowserWindow, ipcMain, globalShortcut } = require('electron');
const path = require('path');

// 加载 Native Addon
// macOS 使用 Quartz Event Services，Windows 使用 SendInput API
let keyboard;
try {
  // 根据平台加载不同的编译结果
  const modulePath = process.platform === 'win32' 
    ? './build/Release/keyboard.node'
    : './build/Release/keyboard.node';

  keyboard = require(modulePath);
  console.log('✅ 键盘模块加载成功 (平台:', process.platform, ')');
} catch (error) {
  console.error('❌ 无法加载键盘模块，请先运行 npm install 编译 Native Addon:', error.message);
  keyboard = null;
}

let mainWindow;
let isTyping = false;
let typingConfig = null;
let typingTimeoutId = null; // 用于跟踪当前的定时器

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    resizable: false,
    title: '自动刷屏工具',
    // macOS 优化：让窗口即使失去焦点也能响应某些事件
    acceptFirstMouse: true // 第一次点击即使窗口没有焦点也能触发点击事件
  });

  mainWindow.loadFile('index.html');

  // 注册全局快捷键用于停止
  globalShortcut.register('CommandOrControl+Shift+S', () => {
    stopTyping();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // 防止窗口焦点变化影响刷屏
  // 当窗口获得焦点时，不要停止刷屏
  mainWindow.on('focus', () => {
    // 窗口获得焦点时不影响刷屏
    // 键盘输入会发送到当前活动的窗口（浏览器窗口）
  });

  mainWindow.on('blur', () => {
    // 窗口失去焦点时也不影响刷屏
    // 这样可以确保即使在后台也能继续刷屏
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  // macOS 通常需要保持应用运行
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
  stopTyping();
});

// 开始输入
ipcMain.on('start-typing', (event, config) => {
  if (isTyping) {
    event.reply('typing-error', '刷屏已在运行中');
    return;
  }
  
  // 检查 keyboard 模块是否可用
  if (!keyboard) {
    event.reply('typing-error', '键盘模块未加载！请先运行 npm install 编译 Native Addon');
    return;
  }
  
  // Windows 和 macOS 的权限检查
  if (process.platform === 'win32') {
    // Windows: SendInput 通常需要管理员权限才能正常工作
    // 实际测试会在 performTyping 中进行
  } else if (process.platform === 'darwin') {
    // macOS: 需要辅助功能权限
    // 通过尝试创建键盘事件来检查权限
    // 如果权限不足，CGEventPost 会失败但不抛出异常
    // 实际测试会在 performTyping 中进行
  }
  
  typingConfig = config;
  isTyping = true;
  
  // 延迟5秒后开始输入，给用户时间切换到目标窗口并点击输入框
  // 注意：键盘输入会发送到当前获得焦点的控件，请确保输入框保持聚焦
  typingTimeoutId = setTimeout(() => {
    if (isTyping && typingConfig) {
      performTyping(typingConfig);
    }
  }, 5000);
  
  event.reply('typing-started');
});

// 停止输入
ipcMain.on('stop-typing', () => {
  stopTyping();
});

function stopTyping() {
  if (isTyping) {
    console.log('停止刷屏');
    isTyping = false;
    typingConfig = null;
    // 清除所有定时器
    if (typingTimeoutId !== null) {
      clearTimeout(typingTimeoutId);
      typingTimeoutId = null;
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send('typing-stopped');
    }
  }
}

// 执行输入
function performTyping(config) {
  if (!isTyping || !typingConfig) {
    return;
  }

  let count = 0;
  const { content, times, interval } = config;

  function typeOnce() {
    // 严格检查状态，确保刷屏不会被意外中断
    if (!isTyping || !typingConfig || count >= times) {
      if (count >= times) {
        console.log('刷屏完成，停止');
        stopTyping();
      } else {
        console.log('状态检查失败，停止刷屏. isTyping:', isTyping, 'typingConfig:', !!typingConfig);
        stopTyping();
      }
      return;
    }

    try {
      // 使用 Native Addon 精确输入内容
      // 使用 Quartz Event Services (macOS) 或 SendInput (Windows)，避免 key repeat 问题
      // 注意：键盘输入会发送到当前活动窗口/获得焦点的控件
      // 如果用户点击了其他地方，输入会发送到那个位置
      console.log(`准备输入第 ${count + 1} 次: "${content}"`);
      keyboard.typeString(content);
      
      // 等待一小段时间确保内容输入完成
      typingTimeoutId = setTimeout(() => {
        // 再次检查状态，防止在等待期间被停止
        if (!isTyping || !typingConfig) {
          console.log('等待期间状态被改变，停止');
          return;
        }

        try {
          // 按回车发送
          keyboard.pressEnter();
          
          count++;
          console.log(`刷屏进度: ${count}/${times}, isTyping: ${isTyping}`);
          
          // 更新进度（只有在状态正常时才更新）
          if (mainWindow && !mainWindow.isDestroyed() && isTyping && typingConfig) {
            mainWindow.webContents.send('typing-progress', {
              current: count,
              total: times
            });
          } else {
            console.warn('状态异常，不更新进度. isTyping:', isTyping, 'typingConfig:', !!typingConfig);
          }

          // 继续下一次或停止
          if (count < times && isTyping && typingConfig) {
            typingTimeoutId = setTimeout(typeOnce, interval);
          } else {
            console.log('刷屏完成或达到次数限制，停止. count:', count, 'times:', times);
            stopTyping();
          }
        } catch (error) {
          console.error('输入错误（回车）:', error);
          if (mainWindow && !mainWindow.isDestroyed()) {
            const errorMsg = error.message || '输入失败，请检查辅助功能权限';
            mainWindow.webContents.send('typing-error', errorMsg);
          }
          stopTyping();
        }
      }, 100); // 等待输入完成
      
    } catch (error) {
      console.error('输入错误（内容）:', error);
      if (mainWindow && !mainWindow.isDestroyed()) {
        const errorMsg = error.message || '输入失败，请检查辅助功能权限';
        mainWindow.webContents.send('typing-error', errorMsg);
      }
      stopTyping();
    }
  }

  typeOnce();
}

