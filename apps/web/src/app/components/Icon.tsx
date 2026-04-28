import type { CSSProperties } from 'react';
import {
  ArrowRight,
  ArrowLeft,
  ArrowUpRight,
  UploadCloud,
  Cpu,
  FileText,
  ShieldCheck,
  Mail,
  MailCheck,
  Send,
  Building2,
  LayoutDashboard,
  History,
  User,
  Info,
  ChevronRight,
  Menu,
  LogOut,
  Plus,
  Wind,
  Bone,
  PieChart,
  BarChart3,
  TrendingUp,
  Search,
  Printer,
  Download,
  AlertTriangle,
  Sparkles,
  Lock,
  X,
  Activity,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

const ICONS = {
  'arrow-right': ArrowRight,
  'arrow-left': ArrowLeft,
  'arrow-up-right': ArrowUpRight,
  'upload-cloud': UploadCloud,
  cpu: Cpu,
  'file-text': FileText,
  'shield-check': ShieldCheck,
  mail: Mail,
  'mail-check': MailCheck,
  send: Send,
  'building-2': Building2,
  'layout-dashboard': LayoutDashboard,
  history: History,
  user: User,
  info: Info,
  'chevron-right': ChevronRight,
  menu: Menu,
  'log-out': LogOut,
  plus: Plus,
  wind: Wind,
  bone: Bone,
  'pie-chart': PieChart,
  'bar-chart-3': BarChart3,
  'trending-up': TrendingUp,
  search: Search,
  printer: Printer,
  download: Download,
  'alert-triangle': AlertTriangle,
  sparkles: Sparkles,
  lock: Lock,
  x: X,
  activity: Activity,
  'check-circle-2': CheckCircle2,
  'alert-circle': AlertCircle,
} as const;

export type IconName = keyof typeof ICONS;

type IconProps = {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: CSSProperties;
};

export function Icon({ name, size = 18, color = 'currentColor', strokeWidth = 1.75, style }: IconProps) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', ...style }} aria-hidden="true">
      <Cmp size={size} color={color} strokeWidth={strokeWidth} />
    </span>
  );
}
