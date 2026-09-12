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
                onConfirm: options?.onConfirm || null,
                onCancel: options?.onCancel || null,
            };

            setModalState({
                isOpen: true,
                type: options?.type || 'info',
                title: options?.title || '',
                message: options?.message || '',
                confirmText: options?.confirmText || '',
                cancelText: options?.cancelText || '',
                variant: options?.variant || 'primary',
                showCloseButton: options?.showCloseButton !== false,
                closeOnBackdrop: options?.closeOnBackdrop !== false,
            });
        });
    }, []);

    // Helper: Success
    const showSuccess = useCallback(
        (titleOrOptions, message, confirmText) => {
            const options =
                typeof titleOrOptions === 'object' && titleOrOptions !== null
                    ? titleOrOptions
                    : { title: titleOrOptions, message, confirmText };
            return showAlert({ ...options, type: 'success' });
        },
        [showAlert]
    );

    // Helper: Error
    const showError = useCallback(
        (titleOrOptions, message, confirmText) => {
            const options =
                typeof titleOrOptions === 'object' && titleOrOptions !== null
                    ? titleOrOptions
                    : { title: titleOrOptions, message, confirmText };
            return showAlert({ ...options, type: 'error' });
        },
        [showAlert]
    );

    // Helper: Warning
    const showWarning = useCallback(
        (titleOrOptions, message, confirmText) => {
            const options =
                typeof titleOrOptions === 'object' && titleOrOptions !== null
                    ? titleOrOptions
                    : { title: titleOrOptions, message, confirmText };
            return showAlert({ ...options, type: 'warning' });
        },
        [showAlert]
    );

    // Helper: Info
    const showInfo = useCallback(
        (titleOrOptions, message, confirmText) => {
            const options =
                typeof titleOrOptions === 'object' && titleOrOptions !== null
                    ? titleOrOptions
                    : { title: titleOrOptions, message, confirmText };
            return showAlert({ ...options, type: 'info' });
        },
        [showAlert]
    );

    // Helper: Confirm (returns Promise<boolean>)
    const showConfirm = useCallback(
        (titleOrOptions, message, confirmText, cancelText, variant = 'primary') => {
            const options =
                typeof titleOrOptions === 'object' && titleOrOptions !== null
                    ? titleOrOptions
                    : {
                          title: titleOrOptions,
                          message,
                          confirmText: confirmText || 'Konfirmasi',
                          cancelText: cancelText || 'Batal',
                          variant,
                      };
            return showAlert({
                ...options,
                type: 'confirm',
                variant: options.variant || (options.isDanger ? 'danger' : 'primary'),
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
