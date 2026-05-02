import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmer',
  cancelLabel = 'Annuler',
  onConfirm,
  onCancel
}) => {
  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative bg-white rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-beauty-soft p-8 sm:p-10 max-w-md w-full overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-2 bg-red-500" />
            
            <div className="relative">
              <div className="flex items-start gap-5">
                <div className="p-4 rounded-3xl bg-red-50 flex-shrink-0">
                  <AlertTriangle className="text-red-500" size={32} />
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-display text-3xl font-bold text-gray-900 mb-3 leading-tight">
                    {title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    {message}
                  </p>
                </div>
                <button
                  onClick={onCancel}
                  className="p-2 rounded-2xl hover:bg-gray-100 transition-colors flex-shrink-0 -mt-2 -mr-2"
                  aria-label="Close"
                >
                  <X size={24} className="text-gray-400" />
                </button>
              </div>

              <div className="flex items-center gap-4 mt-10">
                <button
                  onClick={onCancel}
                  className="flex-1 py-4 rounded-2xl bg-white text-gray-700 font-bold border-2 border-beauty-soft hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  className="flex-1 py-4 rounded-2xl bg-red-500 text-white font-bold shadow-xl shadow-red-200 hover:bg-red-600 hover:shadow-red-300 transition-all active:scale-95"
                >
                  {confirmLabel}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
