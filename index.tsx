import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';

// 处理 Vite 代码分割 chunk 加载失败（IPU 离线包环境）
window.addEventListener('error', (e) => {
  if (e.message && e.message.includes('Loading chunk')) {
    console.error('Chunk loading failed:', e.message);
    // 在 IPU 环境下，可以尝试重试或提示用户
    if (confirm('资源加载失败，是否刷新页面？')) {
      window.location.reload();
    }
  }
});

// 处理未捕获的 Promise 拒绝
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  // 可以上报到监控系统
});

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    {/* <ErrorBoundary
      onError={(error, errorInfo) => {
        // 可以在这里上报错误到监控系统
        console.error('Application error:', error, errorInfo);
      }}
    > */}
      <App />
    {/* </ErrorBoundary> */}
  </React.StrictMode>
);