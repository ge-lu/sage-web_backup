import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

/**
 * 错误回退 UI 组件 (Functional Component)
 * 展示错误信息并提供重试/刷新选项
 */
const ErrorFallback: React.FC<{
  error: Error;
  resetErrorBoundary: () => void;
}> = ({ error, resetErrorBoundary }) => {
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="flex items-center justify-center h-[100dvh] bg-[#F5F7F9] px-6">
      <div className="text-center max-w-md">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2 font-heading">
            Something went wrong
          </h2>
          <p className="text-gray-600 mb-1">
            Application encountered an unexpected error.
          </p>
          {error && (
            <p className="text-sm text-gray-500 mt-2 font-mono bg-gray-100 p-2 rounded max-h-32 overflow-auto text-left">
              {error.message}
            </p>
          )}
        </div>

        <div className="flex gap-3 justify-center">
          <button
            onClick={resetErrorBoundary}
            className="px-6 py-3 bg-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-300 transition-colors active:scale-95"
          >
            Try Again
          </button>
          <button
            onClick={handleReload}
            className="px-6 py-3 bg-guardian-blue text-white rounded-xl font-bold hover:bg-blue-700 transition-colors active:scale-95 shadow-sm"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ErrorBoundary 必须还是 Class Component
 * 原因: React 目前仅在 Class Component 中支持 `getDerivedStateFromError` 和 `componentDidCatch` 生命周期方法。
 * 详情参考: https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary
 * 
 * 我们将 UI 部分提取为了 `ErrorFallback` 函数组件以尽可能满足函数式编程风格。
 */
class ErrorBoundary extends Component<Props, State> {
  [x: string]: any;
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    if (typeof window !== 'undefined' && (window as any).IpuMobile) {
      try {
        // (window as any).IpuMobile.reportError?.(error.message);
      } catch (e) {
        console.warn('Failed to report error to IPU:', e);
      }
    }
  }

  handleReset = () => {
    this.props.onReset?.();
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorFallback 
          error={this.state.error!} 
          resetErrorBoundary={this.handleReset} 
        />
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
