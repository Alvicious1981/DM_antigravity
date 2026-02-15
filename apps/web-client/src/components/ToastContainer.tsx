"use client";

import { useEffect, useState } from "react";
import { LogEvent } from "@/hooks/useAgentState";
import { X, Info, AlertTriangle, AlertOctagon } from "lucide-react";

interface ToastProps {
    toast: LogEvent;
    onDismiss: () => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => setIsVisible(true));

        // Auto-dismiss after 5 seconds
        const timer = setTimeout(() => {
            setIsVisible(false);
            // Allow animation to finish before removing
            setTimeout(onDismiss, 300);
        }, 5000);

        return () => clearTimeout(timer);
    }, [onDismiss]);

    const handleDismiss = () => {
        setIsVisible(false);
        setTimeout(onDismiss, 300);
    };

    const getIcon = () => {
        switch (toast.level) {
            case "error": return <AlertOctagon size={18} className="text-red-500" />;
            case "warning": return <AlertTriangle size={18} className="text-yellow-500" />;
            case "info":
            default: return <Info size={18} className="text-blue-500" />;
        }
    };

    const getBorderColor = () => {
        switch (toast.level) {
            case "error": return "border-red-500/50";
            case "warning": return "border-yellow-500/50";
            case "info":
            default: return "border-blue-500/50";
        }
    };

    return (
        <div
            className={`
                flex w-80 items-start gap-3 rounded-lg border bg-[#141416]/95 p-4 shadow-xl backdrop-blur-md transition-all duration-300 ease-out mb-2
                ${getBorderColor()}
                ${isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
            `}
        >
            <div className="mt-0.5 shrink-0">{getIcon()}</div>
            <div className="flex-1">
                <p className="text-sm font-medium text-[#e0e0e4]">{toast.message}</p>
            </div>
            <button
                onClick={handleDismiss}
                className="shrink-0 text-ash/40 hover:text-ash transition-colors"
                aria-label="Cerrar notificación"
            >
                <X size={16} />
            </button>
        </div>
    );
}

interface ToastContainerProps {
    toasts: LogEvent[];
    onDismiss: (index: number) => void;
}

export default function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none">
            {toasts.map((toast, index) => (
                <div key={index} className="pointer-events-auto">
                    <Toast
                        toast={toast}
                        onDismiss={() => onDismiss(index)}
                    />
                </div>
            ))}
        </div>
    );
}
