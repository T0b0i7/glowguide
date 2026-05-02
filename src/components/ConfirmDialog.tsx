import { ReactNode, useState } from 'react';
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
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onCancel}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white rounded-3xl shadow-2xl border border-beauty-soft p-6 sm:p-8 max-w-md w-full"
          >
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-full bg-red-100 flex-shrink-0">
                <AlertTriangle className="text-red-500" size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-display text-2xl font-bold text-gray-900 mb-2">
                  {title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {message}
                </p>
              </div>
              <button
                onClick={onCancel}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors flex-shrink-0"
                aria-label="Close"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={onCancel}
                className="px-6 py-3 rounded-2xl bg-white text-gray-600 font-semibold border border-beauty-soft hover:bg-gray-50 transition-all"
              >
                {cancelLabel}
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-3 rounded-2xl bg-red-500 text-white font-semibold shadow-lg hover:bg-red-600 transition-all"
              >
                {confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
