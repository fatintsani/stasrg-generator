import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import AlertModal from '../Components/AlertModal';

const AlertContext = createContext(null);

export function AlertProvider({ children }) {
    const [modalState, setModalState] = useState({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        confirmText: '',
        cancelText: '',
        variant: 'primary',
        showCloseButton: true,
        closeOnBackdrop: true,
    });

    // Keep track of active promise resolver for async confirms/alerts
    const resolverRef = useRef(null);
    const callbacksRef = useRef({ onConfirm: null, onCancel: null });

    const closeAlert = useCallback(() => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
        if (resolverRef.current) {
            resolverRef.current(false);
            resolverRef.current = null;
        }
    }, []);

    const showAlert = useCallback((options) => {
        return new Promise((resolve) => {
            resolverRef.current = resolve;
            callbacksRef.current = {
                onConfirm: typeof options?.onConfirm === 'function' ? options.onConfirm : null,
                onCancel: typeof options?.onCancel === 'function' ? options.onCancel : null,
            };

            const rawConfirmText =
                typeof options?.confirmText === 'string' ? options.confirmText : '';
            const rawCancelText =
                typeof options?.cancelText === 'string' ? options.cancelText : '';

            setModalState({
                isOpen: true,
                type: options?.type || 'info',
                title: options?.title || '',
                message: options?.message || '',
                confirmText: rawConfirmText,
                cancelText: rawCancelText,
                variant: options?.variant || 'primary',
                showCloseButton: options?.showCloseButton !== false,
                closeOnBackdrop: options?.closeOnBackdrop !== false,
            });
        });
    }, []);

    // Helper: Success
    const showSuccess = useCallback(
        (titleOrOptions, message, confirmText) => {
            let options = {};
            if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
                options = { ...titleOrOptions };
            } else {
                options = {
                    title: titleOrOptions || '',
                    message: message || '',
                    confirmText: typeof confirmText === 'string' ? confirmText : 'Mengerti',
                };
            }
            return showAlert({ ...options, type: 'success' });
        },
        [showAlert]
    );

    // Helper: Error
    const showError = useCallback(
        (titleOrOptions, message, confirmText) => {
            let options = {};
            if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
                options = { ...titleOrOptions };
            } else {
                options = {
                    title: titleOrOptions || '',
                    message: message || '',
                    confirmText: typeof confirmText === 'string' ? confirmText : 'Tutup',
                };
            }
            return showAlert({ ...options, type: 'error' });
        },
        [showAlert]
    );

    // Helper: Warning
    const showWarning = useCallback(
        (titleOrOptions, message, confirmText) => {
            let options = {};
            if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
                options = { ...titleOrOptions };
            } else {
                options = {
                    title: titleOrOptions || '',
                    message: message || '',
                    confirmText: typeof confirmText === 'string' ? confirmText : 'Mengerti',
                };
            }
            return showAlert({ ...options, type: 'warning' });
        },
        [showAlert]
    );

    // Helper: Info
    const showInfo = useCallback(
        (titleOrOptions, message, confirmText) => {
            let options = {};
            if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
                options = { ...titleOrOptions };
            } else {
                options = {
                    title: titleOrOptions || '',
                    message: message || '',
                    confirmText: typeof confirmText === 'string' ? confirmText : 'Mengerti',
                };
            }
            return showAlert({ ...options, type: 'info' });
        },
        [showAlert]
    );

    // Helper: Confirm (returns Promise<boolean>)
    const showConfirm = useCallback(
        (titleOrOptions, message, confirmTextOrOnConfirm, cancelTextOrOnCancel, variant = 'primary') => {
            let options = {};
            if (typeof titleOrOptions === 'object' && titleOrOptions !== null) {
                options = { ...titleOrOptions };
            } else {
                options.title = titleOrOptions || '';
                options.message = message || '';

                // Handle legacy callback pattern: showConfirm(title, message, onConfirm, onCancel, variant)
                if (typeof confirmTextOrOnConfirm === 'function') {
                    options.onConfirm = confirmTextOrOnConfirm;
                    if (typeof cancelTextOrOnCancel === 'function') {
                        options.onCancel = cancelTextOrOnCancel;
                    } else if (typeof cancelTextOrOnCancel === 'string') {
                        options.variant = cancelTextOrOnCancel;
                    }
                } else if (typeof confirmTextOrOnConfirm === 'string') {
                    options.confirmText = confirmTextOrOnConfirm;
                    if (typeof cancelTextOrOnCancel === 'string') {
                        options.cancelText = cancelTextOrOnCancel;
                    }
                    if (variant) {
                        options.variant = variant;
                    }
                }
            }

            // Auto-detect danger variant if delete / hapus / keluar action
            const isDeleteAction =
                options.isDanger ||
                (typeof options.title === 'string' &&
                    /hapus|delete|keluar|logout|terminate/i.test(options.title));

            const resolvedVariant =
                options.variant || (isDeleteAction ? 'danger' : 'primary');

            const resolvedConfirmText =
                typeof options.confirmText === 'string' && options.confirmText.trim()
                    ? options.confirmText
                    : (resolvedVariant === 'danger' ? 'Hapus' : 'Konfirmasi');

            const resolvedCancelText =
                typeof options.cancelText === 'string' && options.cancelText.trim()
                    ? options.cancelText
                    : 'Batal';

            return showAlert({
                ...options,
                type: 'confirm',
                variant: resolvedVariant,
                confirmText: resolvedConfirmText,
                cancelText: resolvedCancelText,
            });
        },
        [showAlert]
    );

    const handleConfirm = useCallback(() => {
        if (callbacksRef.current.onConfirm) {
            callbacksRef.current.onConfirm();
        }
        if (resolverRef.current) {
            resolverRef.current(true);
            resolverRef.current = null;
        }
        setModalState((prev) => ({ ...prev, isOpen: false }));
    }, []);

    const handleCancel = useCallback(() => {
        if (callbacksRef.current.onCancel) {
            callbacksRef.current.onCancel();
        }
        if (resolverRef.current) {
            resolverRef.current(false);
            resolverRef.current = null;
        }
        setModalState((prev) => ({ ...prev, isOpen: false }));
    }, []);

    return (
        <AlertContext.Provider
            value={{
                showAlert,
                showSuccess,
                showError,
                showWarning,
                showInfo,
                showConfirm,
                closeAlert,
            }}
        >
            {children}
            <AlertModal
                isOpen={modalState.isOpen}
                onClose={closeAlert}
                type={modalState.type}
                title={modalState.title}
                message={modalState.message}
                confirmText={modalState.confirmText}
                cancelText={modalState.cancelText}
                variant={modalState.variant}
                showCloseButton={modalState.showCloseButton}
                closeOnBackdrop={modalState.closeOnBackdrop}
                onConfirm={handleConfirm}
                onCancel={handleCancel}
            />
        </AlertContext.Provider>
    );
}

export function useAlert() {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
}
