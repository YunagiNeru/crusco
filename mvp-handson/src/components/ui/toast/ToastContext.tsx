import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { X } from '@phosphor-icons/react';
import styles from './Toast.module.css';

// ■ トーストの型定義
export type ToastVariant = 'default' | 'success' | 'warning' | 'destructive';

type Toast = {
  id: string;
  message: string;
  variant: ToastVariant;
  action?: {
    label: string;
    onClick: () => void;
  };
};

type ToastContextType = {
  // [穴埋め1] 外部に公開する関数。「メッセージ」と「オプション」を受け取る
  showToast: (message: string, options?: { variant?: ToastVariant; action?: Toast['action'] }) => void;
};

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // トーストを消す関数
  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, options?: { variant?: ToastVariant; action?: Toast['action'] }) => {
    const id = Math.random().toString(36).substring(2, 9);
    const variant = options?.variant || 'default';
    
    // 新しいトーストを追加
    setToasts((prev) => [...prev, { id, message, variant, action: options?.action }]);

    // 3秒後に自動削除
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* ここでトーストを描画 (Portalを使わず簡易的に配置) */}
      <div className={styles.container}>
        {toasts.map((toast) => (
          <div key={toast.id} className={`${styles.toast} ${styles[toast.variant]}`}>
            <span className={styles.message}>{toast.message}</span>
            
            <div className={styles.actions}>
              {/* [穴埋め2] アクションボタンがあれば表示 */}
              {toast.action && (
                <button 
                  className={styles.actionButton}
                  onClick={() => {
                    toast.action?.onClick();
                    removeToast(toast.id); // アクション実行後閉じる
                  }}
                >
                  {toast.action.label}
                </button>
              )}

              {/* 閉じるボタン */}
              <button 
                className={styles.closeButton} 
                onClick={() => removeToast(toast.id)}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

// カスタムフック
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};