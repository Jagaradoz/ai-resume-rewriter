"use client"

import { useEffect } from "react"
import toast, { Toaster as HotToaster, useToasterStore } from "react-hot-toast"

const TOAST_LIMIT = 3

export function Toaster() {
    const { toasts } = useToasterStore()

    useEffect(() => {
        toasts
            .filter((t) => t.visible)
            .filter((_, i) => i >= TOAST_LIMIT)
            .forEach((t) => toast.dismiss(t.id))
    }, [toasts])

    return (
        <HotToaster
            position="bottom-right"
            toastOptions={{
                style: {
                    background: "oklch(1 0 0)",
                    color: "oklch(0.145 0 0)",
                    border: "1px solid oklch(0.922 0 0)",
                    borderRadius: "0.625rem",
                    fontFamily: "var(--font-geist-sans)",
                    fontSize: "0.875rem",
                    paddingTop: "0.7rem",
                    paddingBottom: "0.7rem",
                    paddingLeft: "0.8rem",
                    paddingRight: "0.8rem",
                },
                error: {
                    style: {
                        background: "oklch(1 0 0)",
                        color: "oklch(0.577 0.245 27.325)",
                        border: "1px solid oklch(0.922 0 0)",
                    },
                    iconTheme: {
                        primary: "oklch(0.577 0.245 27.325)",
                        secondary: "oklch(1 0 0)",
                    },
                },
                success: {
                    style: {
                        background: "oklch(1 0 0)",
                        color: "oklch(0.145 0 0)",
                        border: "1px solid oklch(0.922 0 0)",
                    },
                },
                duration: 4000,
            }}
        />
    )
}
