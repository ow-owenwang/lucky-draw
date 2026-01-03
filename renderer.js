const contentInput = document.getElementById('content');
const timesInput = document.getElementById('times');
const intervalInput = document.getElementById('interval');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const statusDiv = document.getElementById('status');
const progressDiv = document.getElementById('progress');
const hintDiv = document.getElementById('hint');

let isRunning = false;
let countdownTimer = null;
let progressUpdateCount = 0; // 用于调试：跟踪进度更新次数

// 开始按钮点击事件
// 使用 mousedown 确保即使窗口没有焦点也能触发
startBtn.addEventListener('mousedown', (e) => {
  // 如果窗口没有焦点，第一次点击会激活窗口，所以我们也需要处理 click
  // 这里只防止默认行为，让 click 事件正常处理
});

startBtn.addEventListener('click', () => {
  const content = contentInput.value.trim();
  const times = parseInt(timesInput.value);
  const interval = parseInt(intervalInput.value);

  if (!content) {
    alert('请输入要刷屏的内容！');
    return;
  }

  if (!times || times < 1) {
    alert('请输入有效的次数！');
    return;
  }

  if (!interval || interval < 1) {
    alert('时间间隔至少1毫秒！');
    return;
  }
  
  // 警告：如果间隔太小（小于10ms），可能会有性能问题和输入混乱
  if (interval < 10) {
    const confirmed = confirm('⚠️ 警告：间隔太小（< 10ms）可能导致输入混乱或系统响应缓慢。\n\n由于系统处理和字符间延迟，实际间隔可能不会达到设置值。\n\n是否继续？');
    if (!confirmed) {
      return;
    }
  }

  isRunning = true;
  progressUpdateCount = 0; // 重置进度计数
  startBtn.disabled = true;
  stopBtn.disabled = false;
  
  // 显示提示
  hintDiv.style.display = 'block';
  statusDiv.style.display = 'block';
  statusDiv.className = 'status waiting';
  statusDiv.textContent = '⏰ 请在5秒内切换到目标窗口并点击输入框...';
  
  // 倒计时
  let countdown = 5;
  const countdownInterval = setInterval(() => {
    countdown--;
    if (countdown > 0) {
      statusDiv.textContent = `⏰ ${countdown}秒后开始，请切换到目标窗口并点击输入框！`;
    } else {
      clearInterval(countdownInterval);
      statusDiv.textContent = '🚀 正在刷屏中... ⚠️ 请保持输入框聚焦！';
      statusDiv.className = 'status running';
    }
  }, 1000);

  // 发送开始信号
  window.electronAPI.startTyping({
    content,
    times,
    interval
  });

  // 保存 interval ID 以便清理
  countdownTimer = countdownInterval;
});

// 停止按钮点击事件
// 使用 mousedown 而不是 click，这样即使窗口没有焦点（第一次点击激活窗口），也能立即触发
stopBtn.addEventListener('mousedown', (e) => {
  e.preventDefault(); // 防止按钮获得焦点（避免影响输入框）
  window.electronAPI.stopTyping();
});

// 同时也监听 click 作为备用
stopBtn.addEventListener('click', () => {
  window.electronAPI.stopTyping();
});

// 监听开始事件
window.electronAPI.onTypingStarted(() => {
  console.log('开始刷屏');
});

// 监听停止事件
window.electronAPI.onTypingStopped(() => {
  console.log('前端收到停止事件');
  isRunning = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  statusDiv.className = 'status stopped';
  statusDiv.textContent = '✅ 刷屏已停止';
  hintDiv.style.display = 'none';
  progressDiv.textContent = '';
  
  // 清理倒计时定时器
  if (countdownTimer !== null) {
    clearInterval(countdownTimer);
    countdownTimer = null;
  }
  
  // 3秒后隐藏状态
  setTimeout(() => {
    statusDiv.style.display = 'none';
  }, 3000);
});

// 监听进度事件
window.electronAPI.onTypingProgress((event, data) => {
  // 只有在运行中才更新进度
  if (!isRunning) {
    console.warn('收到进度更新，但前端状态已停止. 进度:', data);
    return;
  }
  progressUpdateCount++;
  const { current, total } = data;
  const percentage = ((current / total) * 100).toFixed(1);
  progressDiv.textContent = `进度: ${current} / ${total} (${percentage}%)`;
  console.log(`进度更新 #${progressUpdateCount}: ${current}/${total}`);
});

// 监听错误事件
window.electronAPI.onTypingError((event, message) => {
  isRunning = false;
  startBtn.disabled = false;
  stopBtn.disabled = true;
  statusDiv.style.display = 'block';
  statusDiv.className = 'status stopped';
  statusDiv.textContent = `❌ ${message}`;
  hintDiv.style.display = 'none';
  progressDiv.textContent = '';
  
  alert(message);
});

