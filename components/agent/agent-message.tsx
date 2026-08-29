'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  Check,
  Info,
  AlertCircle,
  Search,
  Cpu,
  Zap,
  FileText,
  Sparkles,
  Database,
  TrendingUp,
  ChevronRight,
  LayoutGrid,
  type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type AgentMessageType =
  | 'thinking'
  | 'loading'
  | 'success'
  | 'info'
  | 'error'
  | 'search'
  | 'processing'
  | 'analysis'
  | 'result'
  | 'data'
  | 'insight'
  | 'calculation'
  | 'summary'
  | 'action';

export type MessageStatus = 'active' | 'completed' | 'error';

export interface SummaryData {
  systemSizeKw: number;
  annualProductionKwh: number;
  totalCost: number;
  netCost: number;
  paybackYears: number;
  annualSavings: number;
  co2OffsetTons: number;
  onSave?: () => void;
  onStartOver?: () => void;
  isSaving?: boolean;
}

export interface AgentMessageData {
  id: string;
  type: AgentMessageType;
  text: string;
  timestamp: Date;
  status?: MessageStatus;
  resolvedType?: AgentMessageType;
  detail?: string;
  value?: string | number;
  subMessages?: Array<{
    text: string;
    delay?: number;
  }>;
  sparkline?: {
    data: number[];
    color?: string;
    label?: string;
  };
  summaryData?: SummaryData;
  onAction?: () => void;
  actionLabel?: string;
}

interface AgentMessageProps {
  message: AgentMessageData;
  className?: string;
}

const iconMap: Record<AgentMessageType, LucideIcon> = {
  thinking: Sparkles,
  loading: Loader2,
  success: Check,
  info: Info,
  error: AlertCircle,
  search: Search,
  processing: Cpu,
  analysis: Zap,
  result: FileText,
  data: Database,
  insight: Sparkles,
  calculation: TrendingUp,
  summary: LayoutGrid,
  action: Zap,
};

const iconColorMap: Record<AgentMessageType, string> = {
  thinking: 'text-primary',
  loading: 'text-primary',
  success: 'text-emerald-500',
  info: 'text-muted-foreground',
  error: 'text-red-500',
  search: 'text-blue-500',
  processing: 'text-amber-500',
  analysis: 'text-purple-500',
  result: 'text-emerald-500',
  data: 'text-sky-500',
  insight: 'text-violet-500',
  calculation: 'text-orange-500',
  summary: 'text-primary',
  action: 'text-primary',
};

const bgColorMap: Record<AgentMessageType, string> = {
  thinking: 'bg-primary/10',
  loading: 'bg-primary/10',
  success: 'bg-emerald-500/10',
  info: 'bg-muted',
  error: 'bg-red-500/10',
  search: 'bg-blue-500/10',
  processing: 'bg-amber-500/10',
  analysis: 'bg-purple-500/10',
  result: 'bg-emerald-500/10',
  data: 'bg-sky-500/10',
  insight: 'bg-violet-500/10',
  calculation: 'bg-orange-500/10',
  summary: 'bg-primary/10',
  action: 'bg-primary/10',
};

function useTypewriter(text: string, speed: number = 20, enabled: boolean = true) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    setDisplayedText('');
    setIsComplete(false);
    let index = 0;

    const timer = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsComplete(true);
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed, enabled]);

  return { displayedText, isComplete };
}

function ThinkingDots() {
  return (
    <span className="inline-flex items-center gap-0.5 ml-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1 h-1 rounded-full bg-current"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
          }}
        />
      ))}
    </span>
  );
}

import { Button } from '@/components/ui/button';
import { Sun, Clock, DollarSign, Leaf, ArrowRight, RotateCcw } from 'lucide-react';
import { formatINR } from '@/lib/utils';

function SummaryCard({ data }: { data: SummaryData }) {
  const formatCurrency = (value: number) => formatINR(value);
  const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value);

  const metrics = [
    { icon: Sun, label: 'System Size', value: `${data.systemSizeKw} kW`, color: 'text-amber-500 bg-amber-500/10' },
    { icon: Zap, label: 'Annual Production', value: `${formatNumber(data.annualProductionKwh)} kWh`, color: 'text-yellow-500 bg-yellow-500/10' },
    { icon: DollarSign, label: 'Net Cost', value: formatCurrency(data.netCost), color: 'text-emerald-500 bg-emerald-500/10' },
    { icon: Clock, label: 'Payback', value: `${data.paybackYears} years`, color: 'text-blue-500 bg-blue-500/10' },
    { icon: TrendingUp, label: 'Annual Savings', value: formatCurrency(data.annualSavings), color: 'text-violet-500 bg-violet-500/10' },
    { icon: Leaf, label: 'CO₂ Offset', value: `${data.co2OffsetTons.toFixed(1)} tons/yr`, color: 'text-green-500 bg-green-500/10' },
  ];

  return (
    <div className="mt-3 space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {metrics.map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/50"
          >
            <div className={cn('p-1.5 rounded-md', metric.color.split(' ')[1])}>
              <metric.icon className={cn('h-3.5 w-3.5', metric.color.split(' ')[0])} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] text-muted-foreground truncate">{metric.label}</p>
              <p className="text-xs font-semibold text-foreground">{metric.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="flex flex-col gap-2 pt-1"
      >
        <Button
          className="w-full gap-2"
          size="sm"
          onClick={data.onSave}
          disabled={data.isSaving}
        >
          {data.isSaving ? (
            <>
              <motion.div
                className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              Saving...
            </>
          ) : (
            <>
              Save & View Full Plan
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </Button>
        <Button
          variant="ghost"
          className="w-full gap-2 text-muted-foreground"
          size="sm"
          onClick={data.onStartOver}
          disabled={data.isSaving}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Start Over
        </Button>
      </motion.div>
    </div>
  );
}

function MiniSparkline({ data, color = 'text-primary', label }: { data: number[]; color?: string; label?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 24;
  const width = 80;
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="flex items-center gap-2">
      <svg width={width} height={height} className={cn('opacity-80', color)}>
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
        <motion.circle
          cx={(data.length - 1) / (data.length - 1) * width}
          cy={height - ((data[data.length - 1] - min) / range) * height}
          r="2.5"
          fill="currentColor"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: 'spring' }}
        />
      </svg>
      {label && <span className="text-xs text-muted-foreground">{label}</span>}
    </div>
  );
}

export function AgentMessage({ message, className }: AgentMessageProps) {
  const status = message.status ?? 'completed';
  const isActive = status === 'active';
  const isThinking = message.type === 'thinking' && isActive;
  const isLoading = (message.type === 'loading' || message.type === 'search' || message.type === 'processing' || message.type === 'analysis' || message.type === 'data' || message.type === 'calculation') && isActive;

  const displayType = status === 'completed' && message.resolvedType
    ? message.resolvedType
    : message.type;

  const Icon = iconMap[displayType];

  const { displayedText } = useTypewriter(message.text, 15, isActive && !isThinking);

  const [visibleSubMessages, setVisibleSubMessages] = useState<number>(0);

  useEffect(() => {
    if (!message.subMessages || status !== 'completed') return;

    const timers: ReturnType<typeof setTimeout>[] = [];

    message.subMessages.forEach((sub, index) => {
      const timer = setTimeout(() => {
        setVisibleSubMessages(index + 1);
      }, sub.delay ?? (index + 1) * 300);
      timers.push(timer);
    });

    return () => timers.forEach(t => clearTimeout(t));
  }, [message.subMessages, status]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: 'spring',
        damping: 25,
        stiffness: 350,
        duration: 0.25
      }}
      className={cn(
        'group relative py-3',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <motion.div
          className={cn(
            'flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-colors duration-300',
            bgColorMap[displayType]
          )}
          animate={isActive ? { scale: [1, 1.05, 1] } : {}}
          transition={isActive ? { duration: 2, repeat: Infinity } : {}}
        >
          <Icon
            className={cn(
              'h-4 w-4 transition-colors duration-300',
              iconColorMap[displayType],
              isLoading && 'animate-spin'
            )}
          />
        </motion.div>

        <div className="flex-1 min-w-0 pt-0.5">
          <p className={cn(
            'text-sm leading-relaxed',
            message.type === 'error' ? 'text-red-600 dark:text-red-400' : 'text-foreground'
          )}>
            {isActive ? displayedText : message.text}
            {isThinking && <ThinkingDots />}
            {isActive && !isThinking && (
              <motion.span
                className="inline-block w-0.5 h-4 bg-primary ml-0.5 align-middle"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            )}
          </p>

          {message.detail && status === 'completed' && (
            <motion.p
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="text-xs text-muted-foreground mt-1"
            >
              {message.detail}
            </motion.p>
          )}

          {message.value !== undefined && status === 'completed' && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-2 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50"
            >
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">{message.value}</span>
            </motion.div>
          )}

          {message.sparkline && status === 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mt-2"
            >
              <MiniSparkline
                data={message.sparkline.data}
                color={message.sparkline.color}
                label={message.sparkline.label}
              />
            </motion.div>
          )}

          {message.subMessages && message.subMessages.length > 0 && (
            <div className="mt-2 space-y-1 pl-2 border-l-2 border-border/50">
              {message.subMessages.slice(0, visibleSubMessages).map((sub, index) => (
                <motion.p
                  key={index}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-xs text-muted-foreground pl-2"
                >
                  {sub.text}
                </motion.p>
              ))}
            </div>
          )}

          {message.type === 'summary' && message.summaryData && (
            <SummaryCard data={message.summaryData} />
          )}

          {message.onAction && status === 'completed' && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-3"
            >
              <Button
                variant="default"
                size="sm"
                className="gap-2 bg-primary hover:bg-primary/90"
                onClick={message.onAction}
              >
                <Zap className="h-3.5 w-3.5" />
                {message.actionLabel || 'Continue'}
              </Button>
            </motion.div>
          )}
        </div>

        {isActive && (
          <motion.div
            className="shrink-0 mt-1"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <div className="h-2 w-2 rounded-full bg-primary" />
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
