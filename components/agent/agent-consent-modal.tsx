"use client"

import React from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Shield, Lock, AlertTriangle, Check, X, Server, Database, Coins } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ScopeConfig {
    id: string
    name: string
    description: string
    icon: React.ReactNode
}

const SCOPES: ScopeConfig[] = [
    {
        id: "read:finance",
        name: "Financial Data",
        description: "View project budget and ROI projections",
        icon: <Coins className="h-4 w-4" />
    },
    {
        id: "read:energy_history",
        name: "Energy History",
        description: "Access historical utility usage patterns",
        icon: <Database className="h-4 w-4" />
    },
    {
        id: "read:utility_usage",
        name: "Utility Data",
        description: "Fetch verified meter data from utility provider",
        icon: <Server className="h-4 w-4" />
    }
]

interface AgentConsentModalProps {
    isOpen: boolean
    onAccept: (scopes: string[]) => void
    onDeny: () => void
    agentName?: string
}

export function AgentConsentModal({ isOpen, onAccept, onDeny, agentName = "Solvix Optimizer" }: AgentConsentModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-card border rounded-lg shadow-lg overflow-hidden"
            >
                {/* Header */}
                <div className="bg-primary px-6 py-6 text-center border-b border-primary-foreground/10">
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary-foreground/20 flex items-center justify-center border border-primary-foreground/30">
                        <Shield className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h2 className="text-xl font-semibold text-primary-foreground">Authorize Access</h2>
                    <p className="text-sm text-white mt-1">
                        <span className="font-medium text-white">{agentName}</span> is requesting access to your account.
                    </p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="space-y-4">
                        <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider text-xs">
                            Requested Permissions
                        </p>

                        {SCOPES.map(scope => (
                            <div key={scope.id} className="flex items-start gap-3 p-3 rounded-md bg-secondary/50 border border-border/50">
                                <div className="mt-0.5 text-primary">
                                    {scope.icon}
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium leading-none">{scope.name}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{scope.description}</p>
                                    <div className="mt-1.5 flex items-center gap-1.5">
                                        <div className="px-1.5 py-0.5 rounded bg-zinc-200 dark:bg-zinc-800 text-[10px] font-mono text-zinc-600 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 inline-block">
                                            {scope.id}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-md p-3 flex gap-3 items-start">
                        <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-600 dark:text-amber-400">
                            By authorizing, this agent will be able to read this data until you revoke access. The agent <strong>cannot</strong> modify your account settings or password.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-secondary/30 px-6 py-4 flex gap-3 justify-end border-t">
                    <Button variant="ghost" onClick={onDeny}>
                        Deny
                    </Button>
                    <Button onClick={() => onAccept(SCOPES.map(s => s.id))} className="gap-2">
                        <Check className="h-4 w-4" />
                        Authorize Agent
                    </Button>
                </div>
            </motion.div>
        </div>
    )
}
