import {
  BarChart3,
  Cpu,
  Download,
  FileSearch,
  Lock,
  Monitor,
  Package,
  Sparkles,
  Upload,
  Users,
  Zap,
} from 'lucide-react'

export const navItems = [
  { key: 'landing', label: 'Home', icon: Sparkles },
  { key: 'dashboard', label: 'Dashboard', icon: Monitor },
  { key: 'upload', label: 'Upload', icon: Upload },
  { key: 'processing', label: 'Processing', icon: Cpu },
  { key: 'results', label: 'Results', icon: BarChart3 },
  { key: 'history', label: 'History', icon: FileSearch },
  { key: 'reports', label: 'Reports', icon: Download },
  { key: 'settings', label: 'Settings', icon: Lock },
]

export const trustedBy = ['National Grid', 'Civic Labs', 'TechPulse', 'Insight AI']

export const features = [
  {
    title: 'AI Analysis',
    description: 'AI models comb through your inputs to discover patterns, risks, and strategic signals.',
    accent: 'from-cyan-500 to-blue-500',
  },
  {
    title: 'Real-Time Processing',
    description: 'Optimized inference pipelines deliver insights within seconds at scale.',
    accent: 'from-violet-500 to-fuchsia-500',
  },
  {
    title: 'Smart Insights',
    description: 'Context-aware summaries make complex data immediately actionable.',
    accent: 'from-sky-400 to-cyan-500',
  },
  {
    title: 'Automated Reporting',
    description: 'Automatically generate polished export-ready reports for stakeholders.',
    accent: 'from-indigo-500 to-cyan-400',
  },
  {
    title: 'Data Visualization',
    description: 'Dashboards and charts highlight impact, trends, and anomaly detection.',
    accent: 'from-slate-400 to-sky-500',
  },
  {
    title: 'Collaboration Tools',
    description: 'Share findings, review analyses, and keep teams aligned in one place.',
    accent: 'from-fuchsia-500 to-cyan-500',
  },
]

export const processSteps = [
  { step: 'Upload', label: 'Input files, images, documents, and data.' },
  { step: 'AI Processing', label: 'AI pipelines validate and analyze the submission.' },
  { step: 'Results', label: 'Interactive insights appear in the dashboard.' },
  { step: 'Export', label: 'Export findings into reports or shareable summaries.' },
]

export const benefitCards = [
  {
    title: 'Intelligent Data Analysis',
    description:
      'Advanced AI models automatically analyze uploaded information and uncover meaningful insights.',
    gradient: 'from-cyan-500 via-blue-600 to-violet-500',
  },
  {
    title: 'Real-Time Processing',
    description: 'Receive results within seconds through optimized AI inference pipelines.',
    gradient: 'from-blue-500 via-sky-500 to-cyan-400',
  },
  {
    title: 'Actionable Recommendations',
    description: 'Transform raw information into decisions using AI-generated recommendations.',
    gradient: 'from-violet-500 via-fuchsia-500 to-pink-500',
  },
]

export const quickStats = [
  { label: 'Total Uploads', value: '12.8K' },
  { label: 'Analyses Completed', value: '8.2K' },
  { label: 'Success Rate', value: '98.7%' },
  { label: 'Avg. Processing Time', value: '18s' },
]

export const historyRows = [
  { file: 'incident-data.xlsx', date: 'Jun 18', status: 'Complete', score: '93' },
  { file: 'survey-report.pdf', date: 'Jun 17', status: 'Processing', score: '—' },
  { file: 'traffic-images.zip', date: 'Jun 16', status: 'Complete', score: '88' },
  { file: 'city-insights.docx', date: 'Jun 15', status: 'Complete', score: '91' },
]

export const reportCards = [
  { name: 'Infrastructure Risk Report', date: 'Jun 18', status: 'Ready' },
  { name: 'Emergency Response Audit', date: 'Jun 16', status: 'Review' },
  { name: 'Public Safety Summary', date: 'Jun 14', status: 'Ready' },
]

export const settingsOptions = [
  { label: 'Email Notifications', description: 'Receive critical updates when analysis completes.' },
  { label: 'Two-Factor Authentication', description: 'Protect your account with an additional verification step.' },
  { label: 'Default AI Model', description: 'Choose the model used for new analyses by default.' },
]
