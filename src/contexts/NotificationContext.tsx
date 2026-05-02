import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle, XCircle, AlertTriangle, Info, X, Sparkles, Trash2, Edit3, Heart, Star, Loader2 } from 'lucide-react';

// Types
export type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'create' | 'update' | 'delete' | 'favorite';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  notify: (notification: Omit<Notification, 'id'>) => void;
  dismiss: (id: string) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  create: (title: string, message?: string) => void;
  update: (title: string, message?: string) => void;
  delete: (title: string, message?: string) => void;
  favorite: (title: string, message?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Configuration des styles par type
const typeStyles: Record<NotificationType, {
  icon: ReactNode;
  bgGradient: string;
  borderColor: string;
  iconBg: string;
  textColor: string;
  shadowColor: string;
}> = {
  success: {
    icon: <CheckCircle className="w-5 h-5" />,
    bgGradient: 'from-emerald-50 to-green-50',
    borderColor: 'border-emerald-200',
    iconBg: 'bg-emerald-500',
    textColor: 'text-emerald-800',
    shadowColor: 'shadow-emerald-500/20'
  },
  error: {
    icon: <XCircle className="w-5 h-5" />,
    bgGradient: 'from-red-50 to-rose-50',
    borderColor: 'border-red-200',
    iconBg: 'bg-red-500',
    textColor: 'text-red-800',
    shadowColor: 'shadow-red-500/20'
  },
  warning: {
    icon: <AlertTriangle className="w-5 h-5" />,
    bgGradient: 'from-amber-50 to-orange-50',
    borderColor: 'border-amber-200',
    iconBg: 'bg-amber-500',
    textColor: 'text-amber-800',
    shadowColor: 'shadow-amber-500/20'
  },
  info: {
    icon: <Info className="w-5 h-5" />,
    bgGradient: 'from-blue-50 to-cyan-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-500',
    textColor: 'text-blue-800',
    shadowColor: 'shadow-blue-500/20'
  },
  create: {
    icon: <Sparkles className="w-5 h-5" />,
    bgGradient: 'from-violet-50 to-purple-50',
    borderColor: 'border-violet-200',
    iconBg: 'bg-violet-500',
    textColor: 'text-violet-800',
    shadowColor: 'shadow-violet-500/20'
  },
  update: {
    icon: <Edit3 className="w-5 h-5" />,
    bgGradient: 'from-blue-50 to-indigo-50',
    borderColor: 'border-blue-200',
    iconBg: 'bg-blue-500',
    textColor: 'text-blue-800',
    shadowColor: 'shadow-blue-500/20'
  },
  delete: {
    icon: <Trash2 className="w-5 h-5" />,
    bgGradient: 'from-red-50 to-rose-50',
    borderColor: 'border-red-200',
    iconBg: 'bg-red-500',
    textColor: 'text-red-800',
    shadowColor: 'shadow-red-500/20'
  },
  favorite: {
    icon: <Heart className="w-5 h-5" />,
    bgGradient: 'from-pink-50 to-rose-50',
    borderColor: 'border-pink-200',
    iconBg: 'bg-pink-500',
    textColor: 'text-pink-800',
    shadowColor: 'shadow-pink-500/20'
  }
};

// Toast Component
const Toast: React.FC<{ notification: Notification; onDismiss: (id: string) => void }> = ({ notification, onDismiss }) => {
  const styles = typeStyles[notification.type];
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(notification.id), 300);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, scale: 0.95, filter: 'blur(4px)', transition: { duration: 0.2 } }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      className={`
        relative overflow-hidden rounded-2xl backdrop-blur-xl
        bg-gradient-to-r ${styles.bgGradient}
        border ${styles.borderColor}
        shadow-2xl ${styles.shadowColor}
        p-4 min-w-[360px] max-w-[420px]
        group hover:shadow-3xl hover:scale-[1.02] transition-all duration-300
      `}
    >
      {/* Gradient overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/10 pointer-events-none" />
      
      <div className="relative flex items-start gap-3">
        {/* Icon with pulse effect */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          className={`
            flex-shrink-0 w-10 h-10 rounded-xl
            ${styles.iconBg} text-white
            flex items-center justify-center
            shadow-lg ring-4 ring-white/50
          `}
        >
          {styles.icon}
        </motion.div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className={`font-bold text-base ${styles.textColor}`}
          >
            {notification.title}
          </motion.p>
          {notification.message && (
            <motion.p
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`text-sm mt-1 opacity-80 line-clamp-2 ${styles.textColor}`}
            >
              {notification.message}
            </motion.p>
          )}
        </div>

        {/* Dismiss button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleDismiss}
          className="flex-shrink-0 w-8 h-8 rounded-full
            bg-black/5 hover:bg-black/10 dark:bg-white/20 dark:hover:bg-white/30
            flex items-center justify-center
            transition-colors duration-200"
        >
          <X className="w-4 h-4 text-gray-500" />
        </motion.button>
      </div>

      {/* Progress bar for auto-dismiss */}
      {notification.duration && notification.duration > 0 && (
        <motion.div
          initial={{ scaleX: 1 }}
          animate={{ scaleX: 0 }}
          transition={{ duration: notification.duration / 1000, ease: 'linear' }}
          className="absolute bottom-0 left-0 right-0 h-1 origin-left"
          style={{
            background: `linear-gradient(90deg, transparent, ${styles.iconBg})`
          }}
        />
      )}
    </motion.div>
  );
};

// Notification Container
const NotificationContainer: React.FC<{ notifications: Notification[]; onDismiss: (id: string) => void }> = ({
  notifications,
  onDismiss
}) => {
  return createPortal(
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 pointer-events-none p-4">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <div key={notification.id} className="pointer-events-auto">
            <Toast notification={notification} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body
  );
};

// Provider Component
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const notify = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = crypto.randomUUID();
    const newNotification = { ...notification, id, duration: notification.duration ?? 5000 };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto dismiss
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, newNotification.duration);
    }
  }, [dismiss]);

  // Helper methods
  const success = useCallback((title: string, message?: string) => {
    notify({ type: 'success', title, message });
  }, [notify]);

  const error = useCallback((title: string, message?: string) => {
    notify({ type: 'error', title, message, duration: 7000 });
  }, [notify]);

  const warning = useCallback((title: string, message?: string) => {
    notify({ type: 'warning', title, message, duration: 6000 });
  }, [notify]);

  const info = useCallback((title: string, message?: string) => {
    notify({ type: 'info', title, message, duration: 5000 });
  }, [notify]);

  const create = useCallback((title: string, message?: string) => {
    notify({ type: 'create', title, message: message || 'Nouvel élément créé avec succès' });
  }, [notify]);

  const update = useCallback((title: string, message?: string) => {
    notify({ type: 'update', title, message: message || 'Modifications enregistrées' });
  }, [notify]);

  const del = useCallback((title: string, message?: string) => {
    notify({ type: 'delete', title, message: message || 'Élément supprimé' });
  }, [notify]);

  const favorite = useCallback((title: string, message?: string) => {
    notify({ type: 'favorite', title, message: message || 'Ajouté aux favoris' });
  }, [notify]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      notify,
      dismiss,
      success,
      error,
      warning,
      info,
      create,
      update,
      delete: del,
      favorite
    }}>
      {children}
      <NotificationContainer notifications={notifications} onDismiss={dismiss} />
    </NotificationContext.Provider>
  );
};

// Hook
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
