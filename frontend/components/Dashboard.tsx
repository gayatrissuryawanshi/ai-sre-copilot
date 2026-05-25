'use client'

import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const socket = io('http://localhost:8000')

type PageName =
  | 'Dashboard'
  | 'Incidents'
  | 'Services'
  | 'Monitoring'
  | 'AI Analysis'
  | 'Runbooks'
  | 'History'
  | 'Reports'
  | 'Info'

type ToolName = 'Datadog' | 'Grafana' | 'New Relic' | null

type LogItem = {
  time: string
  source: string
  severity: string
  service: string
  event: string
}

type ServiceItem = {
  service: string
  status: string
  source: string
}

type Incident = {
  id: string
  status: string
  severity: string
  priority: string
  manual_priority: string
  ai_priority: string
  manual_rca: string
  ai_rca: string
  time_saved: string
  root_cause: string
  confidence: string
  sla_risk: string
  mttr: string
  impacted_users: string
  revenue_risk: string
  summary: string
  affected_services: { name: string; status: string }[]
  telemetry_signals: string[]
  rca_steps: string[]
  recent_deployment: string
  similar_incident: string
  dependency_chain: string[]
  confidence_signals: string[]
  business_impact: string[]
  runbook: string[]
  checklist: string[]
  timeline: { time: string; event: string }[]
}

type ChatMessage = {
  role: 'user' | 'ai'
  text: string
}

type HistoryItem = {
  id: string
  createdAt: string
  assignedAt: string
  resolvedAt: string
  impact: string
  urgency: string
  priority: string
  incidentClass: string
  route: string
  assignee: string
  aiTime: string
  engineerTime: string
  status: string
  rootCause: string
  resolution: string
}

const navItems: PageName[] = [
  'Dashboard',
  'Incidents',
  'Services',
  'Monitoring',
  'AI Analysis',
  'Runbooks',
  'History',
  'Reports',
  'Info',
]

const engineers = [
  'AI SRE Copilot',
  'Mr. Mohan Suryawanshi — Principal SRE, 12 yrs',
  'Ms. Priya Nair — Cloud Reliability Lead, 9 yrs',
  'Mr. Aditya Kulkarni — DevOps Lead, 8 yrs',
  'Ms. Sneha Patil — Platform Engineer, 6 yrs',
  'Mr. Vivek Rao — Incident Commander, 11 yrs',
  'Ms. Aditi Menon — Database Reliability Engineer, 7 yrs',
  'Mr. Kunal Shah — Redis Specialist, 6 yrs',
  'Ms. Neha Joshi — Payment Systems Engineer, 5 yrs',
  'Mr. Arjun Mehta — Junior SRE, 2 yrs',
]

const initialServiceHealth: ServiceItem[] = [
  { service: 'API Gateway', status: 'Healthy', source: 'Grafana' },
  { service: 'Redis Cache', status: 'Healthy', source: 'Datadog' },
  { service: 'Database', status: 'Healthy', source: 'Grafana' },
  { service: 'Payment Service', status: 'Healthy', source: 'New Relic' },
  { service: 'Auth Service', status: 'Healthy', source: 'New Relic' },
]

const toolDetails = {
  Datadog: {
    title: 'Datadog',
    subtitle: 'Logs, Alerts & Infrastructure Monitoring',
    usedFor: ['Logs', 'Alerts', 'Infrastructure monitoring', 'Redis failures', 'CPU spikes'],
    projectUse: ['Redis logs correlation', 'Critical alert routing', 'Service anomaly detection', 'Incident severity signal'],
    liveSignals: ['[CRITICAL] Redis timeout detected', '[ALERT] API error rate crossed threshold', '[WARN] CPU spike on backend node'],
    accent: 'cyan',
  },
  Grafana: {
    title: 'Grafana',
    subtitle: 'Metrics Dashboard & Visualization',
    usedFor: ['Metrics dashboards', 'CPU graphs', 'Memory usage', 'Latency charts', 'SLA monitoring'],
    projectUse: ['Live telemetry graphs', 'Latency tracking', 'Memory and CPU trend analysis', 'SLA breach visibility'],
    liveSignals: ['CPU usage: 91%', 'API latency: 2.8s', 'Database pool saturation: 87%'],
    accent: 'orange',
  },
  'New Relic': {
    title: 'New Relic',
    subtitle: 'APM, Traces & Transaction Monitoring',
    usedFor: ['APM', 'Distributed tracing', 'Transaction monitoring', 'Payment flow tracing', 'API dependency tracking'],
    projectUse: ['Payment trace analysis', 'API dependency intelligence', 'Checkout failure detection', 'Slow transaction RCA'],
    liveSignals: ['Payment transaction failed at Redis lookup', 'Checkout trace latency increased', 'API dependency chain degraded'],
    accent: 'purple',
  },
}

function getRoutingRule(impact: string, urgency: string) {
  const i = impact.includes('High')
    ? 'High'
    : impact.includes('Medium')
      ? 'Medium'
      : 'Low'

  const u = urgency.includes('High')
    ? 'High'
    : urgency.includes('Medium')
      ? 'Medium'
      : 'Low'

  if (i === 'High' && u === 'High') {
    return {
      priority: 'P1',
      label: 'War Room Active',
      route: 'AI + Best Engineer',
      assignedTo: 'AI SRE Copilot + Mr. Mohan Suryawanshi — Principal SRE, 12 yrs',
      group: 'AI Auto Recovery + Principal SRE',
      aiTime: '4 min',
      engineerTime: '42 min',
      color: 'text-red-300 border-red-500/40 bg-red-500/10 shadow-red-500/20',
      reason:
        'High impact and high urgency. The incident is routed to both AI Copilot and the best available SRE immediately.',
    }
  }

  if (i === 'High' && u === 'Medium') {
    return {
      priority: 'P2',
      label: 'Major Incident',
      route: 'Senior Engineer',
      assignedTo: 'Ms. Priya Nair — Cloud Reliability Lead, 9 yrs',
      group: 'Cloud Reliability Team',
      aiTime: '8 min',
      engineerTime: '38 min',
      color: 'text-orange-300 border-orange-500/40 bg-orange-500/10 shadow-orange-500/20',
      reason:
        'High impact but medium urgency. Routed to a high-level engineer for controlled response.',
    }
  }

  if (i === 'Medium' && u === 'High') {
    return {
      priority: 'P2',
      label: 'Urgent Degradation',
      route: 'AI + Incident Commander',
      assignedTo: 'AI SRE Copilot + Mr. Vivek Rao — Incident Commander, 11 yrs',
      group: 'Incident Command Team',
      aiTime: '6 min',
      engineerTime: '35 min',
      color: 'text-orange-300 border-orange-500/40 bg-orange-500/10 shadow-orange-500/20',
      reason:
        'Medium impact but high urgency. AI assists the incident commander for fast triage.',
    }
  }

  if (i === 'Medium' && u === 'Medium') {
    return {
      priority: 'P3',
      label: 'Service Degradation',
      route: 'Platform Engineer',
      assignedTo: 'Ms. Sneha Patil — Platform Engineer, 6 yrs',
      group: 'Platform Reliability Team',
      aiTime: '12 min',
      engineerTime: '45 min',
      color: 'text-yellow-300 border-yellow-500/40 bg-yellow-500/10 shadow-yellow-500/20',
      reason:
        'Moderate impact and urgency. Routed to platform engineering for standard investigation.',
    }
  }

  if (i === 'Low' && u === 'High') {
    return {
      priority: 'P3',
      label: 'Fast Triage',
      route: 'On-call Specialist',
      assignedTo: 'Mr. Kunal Shah — Redis Specialist, 6 yrs',
      group: 'On-call Reliability Team',
      aiTime: '10 min',
      engineerTime: '30 min',
      color: 'text-yellow-300 border-yellow-500/40 bg-yellow-500/10 shadow-yellow-500/20',
      reason:
        'Low impact but urgent. Routed to the specialist queue for quick validation.',
    }
  }

  return {
    priority: 'P4',
    label: 'Observation',
    route: 'Monitoring Queue',
    assignedTo: 'Cloud Reliability Team',
    group: 'Monitoring Queue',
    aiTime: '15 min',
    engineerTime: '50 min',
    color: 'text-emerald-300 border-emerald-500/40 bg-emerald-500/10 shadow-emerald-500/20',
    reason:
      'Low impact or low urgency. Kept under monitoring without war-room escalation.',
  }
}

const glass =
  'bg-slate-950/75 backdrop-blur-xl border rounded-2xl shadow-xl transition-all'

export default function Dashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [activePage, setActivePage] = useState<PageName>('Dashboard')

  const [logs, setLogs] = useState<LogItem[]>([])
  const [metrics, setMetrics] = useState<any[]>([])
  const [incident, setIncident] = useState<Incident | null>(null)
  const [serviceHealth, setServiceHealth] = useState<ServiceItem[]>(initialServiceHealth)

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      text: 'Hi Gayatri. I can help with RCA, affected services, routing, business impact, and recovery steps.',
    },
  ])

  const [input, setInput] = useState('')
  const [toast, setToast] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [selectedTool, setSelectedTool] = useState<ToolName>(null)

  const [impact, setImpact] = useState('1 - High')
  const [urgency, setUrgency] = useState('1 - High')
  const [manualPriority, setManualPriority] = useState('P2')
  const [incidentClass, setIncidentClass] = useState('Performance Degradation')
  const [assignedTo, setAssignedTo] = useState('AI SRE Copilot')
  const [assignmentMode, setAssignmentMode] = useState('Not Assigned')
  const [engineerDropdown, setEngineerDropdown] = useState(false)
  const [incidentHistory, setIncidentHistory] = useState<HistoryItem[]>([])
  const [showRoutingInfo, setShowRoutingInfo] = useState(false)

  const chatEndRef = useRef<HTMLDivElement | null>(null)
  const routingRule = getRoutingRule(impact, urgency)

  useEffect(() => {
    const saved = localStorage.getItem('ai-sre-incident-history')
    if (saved) setIncidentHistory(JSON.parse(saved))
  }, [])

  useEffect(() => {
    localStorage.setItem('ai-sre-incident-history', JSON.stringify(incidentHistory))
  }, [incidentHistory])

  useEffect(() => {
    socket.on('metrics', (data) => setMetrics((prev) => [...prev.slice(-18), data]))
    socket.on('log', (data) => setLogs((prev) => [data, ...prev.slice(0, 45)]))
    socket.on('incident', (data) => setIncident(data))
    socket.on('service_health', (data) => setServiceHealth(data))
    socket.on('toast', (data) => {
      setToast(data)
      setTimeout(() => setToast(''), 3500)
    })

    return () => {
      socket.off('metrics')
      socket.off('log')
      socket.off('incident')
      socket.off('service_health')
      socket.off('toast')
    }
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const isWarRoom = incident?.status === 'Active'
  const healthyCount = serviceHealth.filter((s) => s.status === 'Healthy').length

  const executiveCards = useMemo(
    () => [
      {
        label: 'Healthy Services',
        value: `${healthyCount}/${serviceHealth.length}`,
        sub: 'Live service map',
        color: 'text-emerald-300',
        border: 'border-emerald-500/25',
      },
      {
        label: 'Incidents Raised',
        value: incidentHistory.length.toString(),
        sub: 'Stored in history',
        color: incidentHistory.length ? 'text-orange-300' : 'text-emerald-300',
        border: incidentHistory.length ? 'border-orange-500/35' : 'border-emerald-500/25',
      },
      {
        label: 'SLA Risk',
        value: incident?.sla_risk || 'Low',
        sub: isWarRoom ? 'Risk active' : 'Within target',
        color: isWarRoom ? 'text-orange-300' : 'text-emerald-300',
        border: isWarRoom ? 'border-orange-500/35' : 'border-emerald-500/25',
      },
      {
        label: 'Current MTTR',
        value: incident?.mttr || '0m',
        sub: 'Resolution clock',
        color: 'text-cyan-300',
        border: 'border-cyan-500/25',
      },
      {
        label: 'AI Confidence',
        value: incident?.confidence || '—',
        sub: 'Signal correlation',
        color: 'text-purple-300',
        border: 'border-purple-500/25',
      },
      {
        label: 'Assignment',
        value: assignmentMode,
        sub: `${routingRule.priority} • ${routingRule.route}`,
        color: 'text-cyan-300',
        border: 'border-cyan-500/25',
      },
    ],
    [healthyCount, serviceHealth.length, incident, isWarRoom, incidentHistory, assignmentMode, routingRule]
  )

  const createIncident = async () => {
    await fetch('http://localhost:8000/simulate-failure')
  }

  const submitIncidentForm = async () => {
    const now = new Date()
    const id = `INC-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(
      now.getDate()
    ).padStart(2, '0')}-${String(incidentHistory.length + 1).padStart(3, '0')}`

    const item: HistoryItem = {
      id,
      createdAt: now.toLocaleString(),
      assignedAt: now.toLocaleString(),
      resolvedAt: 'Pending',
      impact,
      urgency,
      priority: routingRule.priority,
      incidentClass,
      route: routingRule.route,
      assignee: assignedTo === 'AI SRE Copilot' ? routingRule.assignedTo : assignedTo,
      aiTime: routingRule.aiTime,
      engineerTime: routingRule.engineerTime,
      status: routingRule.priority === 'P1' ? 'War Room Active' : 'Assigned',
      rootCause: 'Pending AI RCA',
      resolution: 'Not resolved',
    }

    setIncidentHistory((prev) => [item, ...prev])
    setManualPriority(routingRule.priority)
    setAssignedTo(item.assignee)
    setAssignmentMode(routingRule.route)
    setToast(`✅ ${id} submitted → ${routingRule.route}`)

    if (routingRule.priority === 'P1') await fetch('http://localhost:8000/simulate-failure')
    setTimeout(() => setToast(''), 3500)
  }

  const resolveLatestIncident = async () => {
    await fetch('http://localhost:8000/deploy-fix')

    setIncidentHistory((prev) =>
      prev.map((item, index) =>
        index === 0
          ? {
              ...item,
              resolvedAt: new Date().toLocaleString(),
              status: 'Resolved',
              rootCause: 'Redis timeout → DB pool exhaustion → API latency → Payment failure',
              resolution: 'Redis restarted, DB pool scaled, payment traces verified',
            }
          : item
      )
    )
  }

  const assignToAI = () => {
    setAssignedTo(routingRule.assignedTo)
    setAssignmentMode(routingRule.route)
    setManualPriority(routingRule.priority)
    setToast('🤖 AI assessment applied')
    setTimeout(() => setToast(''), 3000)
  }

  const assignToEngineer = () => {
    setEngineerDropdown(true)
    setAssignmentMode('Engineer Selected')
    setToast('👨‍💻 Select engineer, then submit incident')
    setTimeout(() => setToast(''), 3000)
  }

  const sendQuickMessage = async (question: string) => {
    setMessages((prev) => [...prev, { role: 'user', text: question }])

    try {
      const response = await fetch('http://localhost:8000/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: question, logs, incident }),
      })

      const data = await response.json()
      setMessages((prev) => [...prev, { role: 'ai', text: data.reply }])
    } catch {
      setMessages((prev) => [...prev, { role: 'ai', text: 'Backend is not connected.' }])
    }
  }

  const sendMessage = async () => {
    if (!input.trim()) return
    const msg = input
    setInput('')
    await sendQuickMessage(msg)
  }

  const downloadReport = () => {
    const latest = incidentHistory[0]
    const report = `
AI SRE COPILOT INCIDENT REPORT

Incident ID: ${latest?.id || incident?.id || 'No incident'}
Status: ${latest?.status || incident?.status || 'Healthy'}
Incident Classification: ${incidentClass}
Impact: ${impact}
Urgency: ${urgency}
Priority: ${routingRule.priority}
Route: ${routingRule.route}
Assigned To: ${assignedTo}
AI RCA Time: ${routingRule.aiTime}
Engineer RCA Time: ${routingRule.engineerTime}

Root Cause:
${latest?.rootCause || incident?.root_cause || 'Pending AI RCA'}

Resolution:
${latest?.resolution || 'Not resolved'}

Monitoring Sources:
Datadog → Redis logs and alerts
Grafana → CPU, memory, latency, DB metrics
New Relic → APM traces and payment failures
`

    const blob = new Blob([report], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ai-sre-report-${latest?.id || 'healthy'}-${Date.now()}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const statusColor = (status: string) => {
    if (status === 'Critical' || status === 'Down' || status.includes('War')) return 'text-red-300 bg-red-500/10 border-red-500/35'
    if (status === 'Warning' || status === 'Assigned') return 'text-yellow-300 bg-yellow-500/10 border-yellow-500/35'
    if (status === 'Resolved' || status === 'Healthy') return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/35'
    return 'text-zinc-300 bg-zinc-500/10 border-zinc-500/30'
  }

  const severityColor = (severity: string) => {
    if (severity === 'CRITICAL' || severity === 'ERROR') return 'text-red-300 bg-red-500/10 border-red-500/25'
    if (severity === 'WARNING') return 'text-yellow-300 bg-yellow-500/10 border-yellow-500/25'
    if (severity === 'SUCCESS') return 'text-emerald-300 bg-emerald-500/10 border-emerald-500/25'
    return 'text-cyan-300 bg-cyan-500/10 border-cyan-500/25'
  }

  if (!isLoggedIn) {
    return <LoginScreen setIsLoggedIn={setIsLoggedIn} />
  }

  return (
    <div className="min-h-screen text-zinc-200 flex bg-slate-950">
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -18, x: 18 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          className="fixed right-6 top-6 z-50 bg-slate-950 border border-cyan-500/40 shadow-2xl shadow-cyan-500/20 rounded-2xl px-5 py-3 text-sm text-cyan-100"
        >
          {toast}
        </motion.div>
      )}

      <aside className="w-60 fixed left-0 top-0 bottom-0 bg-black/80 border-r border-cyan-500/10 p-4">
        <div className="mb-8">
          <div className="text-2xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
            AI SRE
          </div>
          <div className="text-xs text-zinc-500">Incident Intelligence</div>
        </div>

        <div className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item}
              onClick={() => setActivePage(item)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm border transition ${
                activePage === item
                  ? 'bg-cyan-500/15 border-cyan-400/40 text-cyan-200 shadow-lg shadow-cyan-500/10'
                  : 'border-transparent text-zinc-500 hover:bg-slate-900 hover:text-cyan-200'
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-slate-950/80 border border-purple-500/20 rounded-2xl p-4 shadow-lg shadow-purple-500/10">
            <div className="text-xs text-zinc-500 mb-2">Human vs AI</div>
            <div className="text-red-300 text-sm">Engineer RCA: 42 min</div>
            <div className="text-emerald-300 text-sm">AI RCA: 4 min</div>
            <div className="text-emerald-300 text-2xl font-bold mt-2">90%</div>
            <div className="text-xs text-zinc-500">Time saved</div>
          </div>
        </div>
      </aside>

      <main className="ml-60 w-full p-5 space-y-5 pb-28">
        <Header
          isWarRoom={isWarRoom}
          activePage={activePage}
          profileOpen={profileOpen}
          setProfileOpen={setProfileOpen}
          setIsLoggedIn={setIsLoggedIn}
          setActivePage={setActivePage}
          setSelectedTool={setSelectedTool}
        />

        <ToolInfoModal selectedTool={selectedTool} setSelectedTool={setSelectedTool} />

        {activePage === 'Dashboard' && (
          <>
            <ExecutiveCards cards={executiveCards} />

            <Charts metrics={metrics} />

            <section className="grid grid-cols-3 gap-4">
              <CreateIncidentBox
                impact={impact}
                urgency={urgency}
                incidentClass={incidentClass}
                routingRule={routingRule}
                setActivePage={setActivePage}
              />

              <AIWorkingBox
                incident={incident}
                routingRule={routingRule}
                isWarRoom={isWarRoom}
              />

              <ResolveIncidentBox
                incident={incident}
                resolveLatestIncident={resolveLatestIncident}
                downloadReport={downloadReport}
              />
            </section>

            <section className="grid grid-cols-3 gap-4">
              <LogsTable logs={logs} severityColor={severityColor} />
              <ServiceHealthPanel
                serviceHealth={serviceHealth}
                incident={incident}
                statusColor={statusColor}
              />
            </section>
          </>
        )}

        {activePage === 'Incidents' && (
          <IncidentsSlide
            impact={impact}
            urgency={urgency}
            manualPriority={manualPriority}
            setImpact={setImpact}
            setUrgency={setUrgency}
            setManualPriority={setManualPriority}
            incidentClass={incidentClass}
            setIncidentClass={setIncidentClass}
            assignedTo={assignedTo}
            setAssignedTo={setAssignedTo}
            routingRule={routingRule}
            assignToAI={assignToAI}
            assignToEngineer={assignToEngineer}
            engineerDropdown={engineerDropdown}
            submitIncidentForm={submitIncidentForm}
            showRoutingInfo={showRoutingInfo}
            setShowRoutingInfo={setShowRoutingInfo}
          />
        )}

        {activePage === 'History' && <HistorySlide history={incidentHistory} statusColor={statusColor} />}

        {activePage === 'Services' && (
          <ServicesSlide serviceHealth={serviceHealth} statusColor={statusColor} />
        )}

        {activePage === 'Monitoring' && (
          <MonitoringSlide logs={logs} severityColor={severityColor} />
        )}

        {activePage === 'AI Analysis' && (
          <AIAnalysisSlide incident={incident} routingRule={routingRule} isWarRoom={isWarRoom} />
        )}

        {activePage === 'Runbooks' && (
          <RunbooksSlide incident={incident} resolveLatestIncident={resolveLatestIncident} />
        )}

        {activePage === 'Reports' && (
          <ReportsSlide
            history={incidentHistory}
            routingRule={routingRule}
            assignedTo={assignedTo}
            downloadReport={downloadReport}
          />
        )}

        {activePage === 'Info' && <InfoSlide />}
      </main>

      <FloatingChat
        chatOpen={chatOpen}
        setChatOpen={setChatOpen}
        messages={messages}
        input={input}
        setInput={setInput}
        sendMessage={sendMessage}
        sendQuickMessage={sendQuickMessage}
        chatEndRef={chatEndRef}
      />
    </div>
  )
}

function LoginScreen({ setIsLoggedIn }: any) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-zinc-200 overflow-hidden relative">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_30%),radial-gradient(circle_at_top_right,rgba(168,85,247,0.18),transparent_30%),radial-gradient(circle_at_bottom,rgba(16,185,129,0.12),transparent_35%)]" />

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-[440px] bg-slate-950/80 border border-cyan-500/20 rounded-3xl p-8 shadow-2xl shadow-cyan-500/20 backdrop-blur-2xl"
      >
        <div className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
          AI SRE COPILOT
        </div>

        <p className="text-zinc-500 mt-2">
          Autonomous Incident Intelligence Platform
        </p>

        <div className="mt-8 space-y-4">
          <input
            className="w-full bg-black/40 border border-slate-700 rounded-2xl px-4 py-3 text-zinc-300 outline-none focus:border-cyan-500"
            placeholder="Email"
            defaultValue="gayatri@sre.ai"
          />

          <input
            type="password"
            className="w-full bg-black/40 border border-slate-700 rounded-2xl px-4 py-3 text-zinc-300 outline-none focus:border-purple-500"
            placeholder="Password"
            defaultValue="123456"
          />

          <button
            onClick={() => setIsLoggedIn(true)}
            className="w-full bg-cyan-600 hover:bg-cyan-800 rounded-2xl py-3 font-bold text-cyan-50 shadow-lg shadow-cyan-500/25 transition"
          >
            Login to Dashboard
          </button>

          <div className="flex justify-between text-xs text-zinc-500">
            <span>Forgot Password?</span>
            <span>Support</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function Header({
  isWarRoom,
  activePage,
  profileOpen,
  setProfileOpen,
  setIsLoggedIn,
  setActivePage,
  setSelectedTool,
}: any) {
  return (
    <section className="bg-slate-950/85 border border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-2xl shadow-cyan-500/5 backdrop-blur-xl">
      <div>
        <div className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
          AI SRE COPILOT
        </div>

        <div className="text-sm text-zinc-500">
          Autonomous Incident Intelligence Platform • {activePage}
        </div>
      </div>

      <div
        className={`px-5 py-3 rounded-2xl border ${
          isWarRoom
            ? 'border-red-500/45 bg-red-500/10 text-red-300 animate-pulse shadow-lg shadow-red-500/20'
            : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300 shadow-lg shadow-emerald-500/10'
        }`}
      >
        {isWarRoom
          ? '🚨 WAR ROOM ACTIVE — P1 Critical'
          : '● LIVE SYSTEM — Monitoring Active'}
      </div>

      <div className="flex items-center gap-3 relative z-[999999]">
        <div className="hidden xl:flex gap-2 text-xs">
          {(['Datadog', 'Grafana', 'New Relic'] as const).map((tool) => (
            <button
              key={tool}
              onClick={() => setSelectedTool(tool)}
              className="px-3 py-2 rounded-xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-200 shadow-sm shadow-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition"
            >
              {tool}
            </button>
          ))}
        </div>

        <button
          onClick={() => setProfileOpen(!profileOpen)}
          className="flex items-center gap-3 bg-black/45 border border-purple-500/25 rounded-2xl px-3 py-2 shadow-lg shadow-purple-500/10"
        >
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center font-bold text-slate-950">
            G
          </div>

          <div className="text-left">
            <div className="text-xs font-semibold text-purple-200 leading-tight">
              Gayatri S.
            </div>

            <div className="text-[10px] text-zinc-500 leading-tight">
              SRE Intern
            </div>
          </div>
        </button>

        {profileOpen && (
          <div className="absolute right-0 top-16 z-[99999] w-56 bg-slate-950 border border-purple-500/30 rounded-2xl shadow-2xl shadow-purple-500/20 p-2">
            {[
              'My Assessment',
              'Support',
              'Forgot Password',
              'Info',
            ].map((item) => (
              <button
                key={item}
                onClick={() => {
                  if (item === 'Info') setActivePage('Info')
                }}
                className="w-full text-left px-4 py-3 rounded-xl text-sm text-zinc-300 hover:bg-purple-500/10 hover:text-purple-200"
              >
                {item}
              </button>
            ))}

            <button
              onClick={() => setIsLoggedIn(false)}
              className="w-full text-left px-4 py-3 rounded-xl text-sm text-red-300 hover:bg-red-500/10"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </section>
  )
}


function ToolInfoModal({ selectedTool, setSelectedTool }: { selectedTool: ToolName; setSelectedTool: (tool: ToolName) => void }) {
  if (!selectedTool) return null

  const tool = toolDetails[selectedTool]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-sm pt-24"
      onClick={() => setSelectedTool(null)}
    >
      <motion.div
        initial={{ opacity: 0, y: -18, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-[760px] bg-slate-950/95 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-500/20"
      >
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <div className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
              {tool.title}
            </div>
            <div className="text-sm text-zinc-500 mt-1">{tool.subtitle}</div>
          </div>

          <button
            onClick={() => setSelectedTool(null)}
            className="h-10 w-10 rounded-xl border border-slate-700 bg-black/40 text-zinc-400 hover:text-cyan-200 hover:border-cyan-500/40 transition"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-black/45 border border-cyan-500/20 rounded-2xl p-4">
            <div className="text-cyan-300 font-bold mb-3">Used For</div>
            <div className="space-y-2">
              {tool.usedFor.map((item) => (
                <div key={item} className="text-sm text-zinc-300">• {item}</div>
              ))}
            </div>
          </div>

          <div className="bg-black/45 border border-purple-500/20 rounded-2xl p-4">
            <div className="text-purple-300 font-bold mb-3">In This Project</div>
            <div className="space-y-2">
              {tool.projectUse.map((item) => (
                <div key={item} className="text-sm text-zinc-300">• {item}</div>
              ))}
            </div>
          </div>

          <div className="bg-black/45 border border-emerald-500/20 rounded-2xl p-4">
            <div className="text-emerald-300 font-bold mb-3">Live Signals</div>
            <div className="space-y-2 font-mono">
              {tool.liveSignals.map((item) => (
                <div key={item} className="text-xs text-zinc-300 border-b border-slate-800 pb-2">{item}</div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-xs text-zinc-500 mb-1">Why this matters</div>
          <div className="text-sm text-zinc-300 leading-relaxed">
            This popup explains how the simulated connector contributes to root cause analysis. The project does not call paid APIs; it locally simulates observability signals from {tool.title} to demonstrate real SRE incident workflow.
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function ExecutiveCards({ cards }: any) {
  return (
    <section className="grid grid-cols-6 gap-3">
      {cards.map((card: any) => (
        <div
          key={card.label}
          className={`${glass} ${card.border} p-4 hover:scale-[1.02]`}
        >
          <div className="text-xs text-zinc-500">
            {card.label}
          </div>

          <div className={`text-2xl font-black mt-2 ${card.color}`}>
            {card.value}
          </div>

          <div className="text-xs text-zinc-600 mt-1">
            {card.sub}
          </div>
        </div>
      ))}
    </section>
  )
}

function CreateIncidentBox({
  impact,
  urgency,
  incidentClass,
  routingRule,
  setActivePage,
}: any) {
  return (
    <div className={`${glass} border-red-500/30 p-5`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-red-300 text-xl font-bold">
          1. Create Incident
        </h2>

        <span className="text-xs px-3 py-1 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300">
          Intake
        </span>
      </div>

      <div className="space-y-3">
        <InfoRow label="Impact" value={impact} />
        <InfoRow label="Urgency" value={urgency} />
        <InfoRow label="Classification" value={incidentClass} />
        <InfoRow label="AI Priority" value={routingRule.priority} />
        <InfoRow label="Assignment Route" value={routingRule.route} />
      </div>

      <div className="mt-4 bg-black/40 border border-red-500/20 rounded-2xl p-3">
        <div className="text-xs text-zinc-500 mb-2">
          Incident Flow
        </div>

        <div className="text-xs text-zinc-300 leading-relaxed">
          Engineers create incidents manually. AI evaluates impact,
          urgency, telemetry signals, and routes incidents to the
          correct engineer or AI recovery workflow.
        </div>
      </div>

      <button
        onClick={() => setActivePage('Incidents')}
        className="mt-5 w-full bg-red-600 hover:bg-red-800 py-3 rounded-2xl font-bold text-red-50 shadow-lg shadow-red-500/20 transition"
      >
        ⚡ Open Incident Form
      </button>
    </div>
  )
}

function AIWorkingBox({
  incident,
  routingRule,
  isWarRoom,
}: any) {
  return (
    <div className={`${glass} border-cyan-500/30 p-5`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-cyan-300 text-xl font-bold">
          2. AI Working
        </h2>

        <span className="text-xs px-3 py-1 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-300">
          RCA Engine
        </span>
      </div>

      <div className="space-y-3">
        <div className="bg-black/40 border border-cyan-500/20 rounded-2xl p-3">
          <div className="text-xs text-zinc-500 mb-2">
            AI Activity
          </div>

          <div className="space-y-2 text-sm text-zinc-300">
            <div>• Analyzing Datadog telemetry</div>
            <div>• Correlating Grafana metrics</div>
            <div>• Matching New Relic traces</div>
            <div>• Evaluating dependency graph</div>
            <div>• Checking recent deployments</div>
            <div>• Searching similar incidents</div>
          </div>
        </div>

        <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-3">
          <div className="text-xs text-zinc-500 mb-2">
            AI Root Cause
          </div>

          <div className="text-sm text-zinc-300 leading-relaxed">
            {incident?.root_cause ||
              'Redis timeout triggered DB pool exhaustion causing API latency spikes and payment service degradation.'}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <MiniMetric
            title="AI RCA"
            value={routingRule.aiTime}
            color="text-emerald-300"
          />

          <MiniMetric
            title="Confidence"
            value={incident?.confidence || '96%'}
            color="text-cyan-300"
          />
        </div>

        <div
          className={`rounded-2xl border p-3 ${
            isWarRoom
              ? 'border-red-500/30 bg-red-500/10'
              : 'border-emerald-500/30 bg-emerald-500/10'
          }`}
        >
          <div className="text-xs text-zinc-500 mb-1">
            AI Decision
          </div>

          <div className="text-sm text-zinc-300">
            {routingRule.reason}
          </div>
        </div>
      </div>
    </div>
  )
}

function ResolveIncidentBox({
  incident,
  resolveLatestIncident,
  downloadReport,
}: any) {
  return (
    <div className={`${glass} border-emerald-500/30 p-5`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-emerald-300 text-xl font-bold">
          3. Resolve Incident
        </h2>

        <span className="text-xs px-3 py-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300">
          Recovery
        </span>
      </div>

      <div className="space-y-3">
        <InfoRow
          label="Engineer RCA"
          value={incident?.manual_rca || '42 min'}
        />

        <InfoRow
          label="AI RCA"
          value={incident?.ai_rca || '4 min'}
        />

        <InfoRow
          label="Time Saved"
          value={incident?.time_saved || '90%'}
        />

        <InfoRow
          label="Recovery Mode"
          value="AI Autonomous Recovery"
        />
      </div>

      <div className="mt-4 bg-black/40 border border-emerald-500/20 rounded-2xl p-3">
        <div className="text-xs text-zinc-500 mb-2">
          Recovery Actions
        </div>

        <div className="space-y-1 text-sm text-zinc-300">
          <div>• Restart Redis instance</div>
          <div>• Scale DB connection pool</div>
          <div>• Normalize API traffic</div>
          <div>• Validate payment traces</div>
        </div>
      </div>

      <button
        onClick={resolveLatestIncident}
        className="mt-5 w-full bg-emerald-600 hover:bg-emerald-800 py-3 rounded-2xl font-bold text-emerald-50 shadow-lg shadow-emerald-500/20 transition"
      >
        🛠 Execute AI Recovery
      </button>

      <button
        onClick={downloadReport}
        className="mt-3 w-full bg-slate-900 hover:bg-slate-800 border border-slate-700 py-3 rounded-2xl transition text-zinc-300"
      >
        Download Incident Report
      </button>
    </div>
  )
}
function Charts({ metrics }: any) {
  const chartItems = [
    { title: 'CPU Usage', key: 'cpu', stroke: '#22d3ee', suffix: '%' },
    { title: 'Memory Usage', key: 'memory', stroke: '#f59e0b', suffix: '%' },
    { title: 'API Latency', key: 'latency', stroke: '#ef4444', suffix: 'ms' },
    { title: 'Incident Frequency', key: 'incidents', stroke: '#a855f7', suffix: 'count' },
  ]

  return (
    <section className="grid grid-cols-4 gap-4">
      {chartItems.map((chart) => (
        <div key={chart.title} className={`${glass} border-cyan-500/15 p-4 shadow-cyan-500/10`}>
          <div className="flex justify-between mb-2">
            <h3 className="text-sm font-semibold text-cyan-100">{chart.title}</h3>
            <span className="text-xs text-cyan-300">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <AreaChart data={metrics}>
              <XAxis dataKey="time" hide />
              <YAxis hide />
              <Tooltip contentStyle={{ background: '#020617', border: '1px solid rgba(34,211,238,0.25)', borderRadius: '12px', color: '#cbd5e1' }} />
              <Area type="monotone" dataKey={chart.key} stroke={chart.stroke} fill={chart.stroke} fillOpacity={0.18} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
          <div className="text-xs text-zinc-600">Y-axis: {chart.suffix}</div>
        </div>
      ))}
    </section>
  )
}

function IncidentsSlide({
  impact,
  urgency,
  manualPriority,
  setImpact,
  setUrgency,
  setManualPriority,
  incidentClass,
  setIncidentClass,
  assignedTo,
  setAssignedTo,
  routingRule,
  assignToAI,
  assignToEngineer,
  engineerDropdown,
  submitIncidentForm,
  showRoutingInfo,
  setShowRoutingInfo,
}: any) {
  const priorities = [
    ['P1', 'War Room Active', 'Critical outage/customer impact', 'border-red-500/40 bg-red-500/10 text-red-300'],
    ['P2', 'Major Incident', 'High impact but partially working', 'border-orange-500/40 bg-orange-500/10 text-orange-300'],
    ['P3', 'Service Degradation', 'Performance issue/limited impact', 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300'],
    ['P4', 'Low Priority', 'Minor issue/observation', 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'],
  ]

  return (
    <section className="space-y-4">
      <div className={`${glass} border-purple-500/30 p-5`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-purple-300 text-xl font-bold">Incident Priority Classification</h2>
          <button onClick={() => setShowRoutingInfo(!showRoutingInfo)} className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-800 text-purple-50 text-sm">
            ℹ How AI Assignment Works
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {priorities.map(([id, name, desc, color]) => (
            <button key={id} onClick={() => setManualPriority(id)} className={`text-left rounded-2xl border p-4 transition ${manualPriority === id ? `${color} shadow-lg shadow-purple-500/20` : 'border-slate-700 bg-black/40 text-zinc-400 hover:border-purple-500/40'}`}>
              <div className="text-lg font-bold">{id}</div>
              <div className="text-sm font-semibold mt-1">{name}</div>
              <div className="text-xs text-zinc-500 mt-2">{desc}</div>
            </button>
          ))}
        </div>

        {showRoutingInfo && <RoutingInfo />}
      </div>

      <section className="grid grid-cols-2 gap-4">
        <div className={`${glass} border-cyan-500/30 p-5`}>
          <h2 className="text-cyan-300 text-xl font-bold mb-5">Incident Form</h2>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Number" value="Auto-generated on submit" />
            <FormField label="User" value="Gayatri S." />
            <FormField label="Opened By" value="AI SRE Copilot" />
            <FormField label="Location" value="Mumbai Cloud Cluster" />
            <SelectField label="Incident Classification" value={incidentClass} setValue={setIncidentClass} options={['Performance Degradation', 'Service Outage', 'Database Saturation', 'Payment Failure', 'Security Alert', 'Infrastructure Alert']} />
            <FormField label="Business Service" value="Checkout & Payments" />
            <FormField label="Environment" value="Production" />
            <FormField label="Region" value="Mumbai Cloud Cluster" />
            <FormField label="Detection Source" value="Datadog + Grafana + New Relic" />
            <FormField label="Affected CI" value="Redis Cache / Database Pool" />
            <SelectField label="Impact" value={impact} setValue={setImpact} options={['1 - High', '2 - Medium', '3 - Low']} />
            <SelectField label="Urgency" value={urgency} setValue={setUrgency} options={['1 - High', '2 - Medium', '3 - Low']} />
            <SelectField label="Priority" value={manualPriority} setValue={setManualPriority} options={['P1', 'P2', 'P3', 'P4']} />
            <FormField label="Assignment Group" value={routingRule.group} />
            <FormField label="AI Suggested RCA" value={routingRule.aiTime} />
            <FormField label="Engineer RCA Estimate" value={routingRule.engineerTime} />
          </div>

          <div className="mt-4 space-y-3">
            <TextBox label="Short Description" value="Redis timeout causing DB pool exhaustion and payment failures" />
            <TextBox label="Description" value="Incident detected across Datadog logs, Grafana metrics, and New Relic traces." />
            <TextBox label="Status Update" value="Waiting for assignment and submission." />
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button onClick={assignToAI} className="bg-purple-600 hover:bg-purple-800 rounded-xl py-3 font-bold text-purple-50">Assign to AI</button>
            <button onClick={assignToEngineer} className="bg-orange-600 hover:bg-orange-800 rounded-xl py-3 font-bold text-orange-50">Assign to Engineer</button>
          </div>

          {engineerDropdown && (
            <div className="mt-4">
              <SelectField label="Assign to Engineer" value={assignedTo} setValue={setAssignedTo} options={engineers} />
            </div>
          )}

          <button onClick={submitIncidentForm} className="mt-4 w-full bg-cyan-600 hover:bg-cyan-800 rounded-xl py-3 font-bold text-cyan-50">Submit Incident</button>
        </div>

        <div className={`${glass} border-purple-500/30 p-5`}>
          <h2 className="text-purple-300 text-xl font-bold mb-5">AI Assessment & Routing</h2>
          <div className={`rounded-2xl border p-4 mb-4 ${routingRule.color}`}>
            <div className="text-2xl font-black">{routingRule.priority}</div>
            <div className="text-lg font-bold">{routingRule.label}</div>
            <div className="text-xs text-zinc-400 mt-2">{routingRule.reason}</div>
          </div>
          <div className="space-y-3">
            <InfoRow label="AI Route" value={routingRule.route} />
            <InfoRow label="AI Assigned To" value={routingRule.assignedTo} />
            <InfoRow label="Selected Assignee" value={assignedTo} />
            <InfoRow label="AI Group" value={routingRule.group} />
            <InfoRow label="AI RCA Time" value={routingRule.aiTime} />
            <InfoRow label="Engineer RCA Time" value={routingRule.engineerTime} />
            <InfoRow label="Manual Priority" value={manualPriority} />
          </div>
        </div>
      </section>
    </section>
  )
}

function RoutingInfo() {
  const rows = [
    ['High + High', 'P1', 'AI + Mr. Mohan Suryawanshi'],
    ['High + Medium', 'P2', 'Senior Engineer'],
    ['Medium + High', 'P2', 'AI + Incident Commander'],
    ['Medium + Medium', 'P3', 'Platform Engineer'],
    ['Low + High', 'P3', 'On-call Specialist'],
    ['Low/Medium + Low', 'P4', 'Monitoring Queue'],
  ]

  return (
    <div className="mt-4 overflow-auto rounded-2xl border border-purple-500/20 bg-black/40">
      <table className="w-full text-xs">
        <thead className="text-zinc-500 border-b border-slate-800">
          <tr><th className="p-3 text-left">Impact + Urgency</th><th className="p-3 text-left">Priority</th><th className="p-3 text-left">AI Assignment Logic</th></tr>
        </thead>
        <tbody>
          {rows.map((r) => <tr key={r[0]} className="border-b border-slate-800 text-zinc-300"><td className="p-3">{r[0]}</td><td className="p-3">{r[1]}</td><td className="p-3">{r[2]}</td></tr>)}
        </tbody>
      </table>
    </div>
  )
}

function HistorySlide({ history, statusColor }: any) {
  return (
    <section className={`${glass} border-cyan-500/25 p-5`}>
      <h2 className="text-cyan-300 text-xl font-bold mb-4">Incident History</h2>
      <div className="overflow-auto max-h-[620px]">
        <table className="w-full text-xs text-left">
          <thead className="text-zinc-500 border-b border-slate-700">
            <tr>{['ID', 'Created', 'Assigned', 'Resolved', 'Priority', 'Route', 'Assignee', 'AI Time', 'Engineer Time', 'Status'].map((h) => <th key={h} className="p-3">{h}</th>)}</tr>
          </thead>
          <tbody>
            {history.length === 0 ? <tr><td colSpan={10} className="p-6 text-center text-zinc-500">No incidents submitted yet.</td></tr> : history.map((item: HistoryItem) => (
              <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-900/70">
                <td className="p-3 text-cyan-300">{item.id}</td><td className="p-3">{item.createdAt}</td><td className="p-3">{item.assignedAt}</td><td className="p-3">{item.resolvedAt}</td><td className="p-3">{item.priority}</td><td className="p-3">{item.route}</td><td className="p-3">{item.assignee}</td><td className="p-3 text-emerald-300">{item.aiTime}</td><td className="p-3 text-red-300">{item.engineerTime}</td><td className="p-3"><span className={`px-2 py-1 rounded-lg border ${statusColor(item.status)}`}>{item.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function LogsTable({ logs, severityColor }: any) {
  return (
    <div className={`${glass} border-cyan-500/15 col-span-2 p-4`}>
      <h2 className="text-cyan-300 text-lg font-bold mb-3">Live Logs Stream</h2>
      <div className="overflow-auto max-h-[300px]">
        <table className="w-full text-xs text-left">
          <thead className="text-zinc-500 border-b border-slate-700"><tr><th className="py-2">Time</th><th>Source</th><th>Severity</th><th>Service</th><th>Event</th></tr></thead>
          <tbody>{logs.map((log: LogItem, i: number) => <tr key={i} className="border-b border-slate-800 hover:bg-slate-900/70"><td className="py-2 text-zinc-600">{log.time}</td><td className="text-purple-300">{log.source}</td><td><span className={`px-2 py-1 rounded-lg border ${severityColor(log.severity)}`}>{log.severity}</span></td><td className="text-zinc-300">{log.service}</td><td className="text-zinc-400">{log.event}</td></tr>)}</tbody>
        </table>
      </div>
    </div>
  )
}

function ServiceHealthPanel({ serviceHealth, incident, statusColor }: any) {
  return (
    <div className={`${glass} border-emerald-500/15 p-4`}>
      <h2 className="text-emerald-300 text-lg font-bold mb-3">Service Health Map</h2>
      <div className="space-y-2">
        {serviceHealth.map((s: ServiceItem) => <div key={s.service} className="flex justify-between items-center bg-black/45 rounded-xl px-3 py-2 border border-slate-800/80"><div><div className="text-sm text-zinc-300">{s.service}</div><div className="text-xs text-zinc-600">{s.source}</div></div><span className={`text-xs px-2 py-1 rounded-lg border ${statusColor(s.status)}`}>{s.status}</span></div>)}
      </div>
      <div className="mt-4 bg-black/45 border border-purple-500/25 rounded-xl p-3"><div className="text-xs text-zinc-500 mb-2">Executive Impact</div>{(incident?.business_impact || ['No active business impact']).map((impact: string) => <div key={impact} className="text-xs text-zinc-300 mb-1">• {impact}</div>)}</div>
    </div>
  )
}

function ServicesSlide({ serviceHealth, statusColor }: any) {
  return <section className="grid grid-cols-5 gap-4">{serviceHealth.map((s: ServiceItem) => <div key={s.service} className={`${glass} border-emerald-500/20 p-5`}><div className="text-lg font-bold text-emerald-200">{s.service}</div><div className="text-sm text-zinc-600 mb-4">{s.source}</div><span className={`text-xs px-3 py-2 rounded-xl border ${statusColor(s.status)}`}>{s.status}</span><div className="mt-5 text-xs text-zinc-500">Telemetry source: {s.source}</div></div>)}</section>
}

function MonitoringSlide({ logs, severityColor }: any) {
  return <section className="space-y-4"><div className="grid grid-cols-3 gap-4">{[['Datadog', 'Redis logs + alerts stream', 'Detects timeout and critical logs'], ['Grafana', 'CPU, memory, latency dashboards', 'Detects API and DB saturation'], ['New Relic', 'APM traces + payment failures', 'Detects transaction errors']].map(([tool, main, sub]) => <div key={tool} className={`${glass} border-cyan-500/30 p-5`}><div className="text-xl font-bold text-cyan-300">{tool}</div><div className="text-sm mt-3 text-zinc-300">{main}</div><div className="text-xs text-zinc-600 mt-2">{sub}</div><div className="mt-4 text-emerald-300 text-sm">● Simulated connector active</div></div>)}</div><LogsTable logs={logs} severityColor={severityColor} /></section>
}

function AIAnalysisSlide({ incident, routingRule, isWarRoom }: any) {
  return <section className="grid grid-cols-2 gap-4"><div className={`${glass} border-cyan-500/30 p-5`}><h2 className="text-cyan-300 text-xl font-bold mb-4">Deep AI Root Cause Analysis</h2><MiniPanel title="Root Cause Conclusion" items={[incident?.root_cause || 'Redis timeout caused DB pool exhaustion, API latency, and payment degradation.']} /><MiniPanel title="Telemetry Evidence" items={incident?.telemetry_signals || ['Datadog: Redis timeout spike', 'Grafana: DB pool saturation', 'New Relic: payment trace failure']} /><MiniPanel title="Confidence Reasoning" items={incident?.confidence_signals || ['Error spike correlation', 'Dependency chain match', 'Similar incident recall']} /></div><div className={`${glass} border-purple-500/30 p-5`}><h2 className="text-purple-300 text-xl font-bold mb-4">Correlation Intelligence</h2><MiniPanel title="Recent Deployment" items={[incident?.recent_deployment || 'v2.4.1 and Redis config changed minutes before outage']} /><MiniPanel title="Similar Incident Recall" items={[incident?.similar_incident || 'Incident #142: Redis overload caused cascading API failures']} /><div className={`mt-3 rounded-2xl border p-4 ${isWarRoom ? 'border-red-500/30 bg-red-500/10' : 'border-cyan-500/30 bg-cyan-500/10'}`}><div className="text-xs text-zinc-500">AI Routing</div><div className="text-sm text-zinc-300 mt-2">{routingRule.reason}</div></div></div></section>
}

function RunbooksSlide({ incident, resolveLatestIncident }: any) {
  return <section className="grid grid-cols-2 gap-4"><div className={`${glass} border-emerald-500/30 p-5`}><h2 className="text-emerald-300 text-xl font-bold mb-4">Recommended Recovery Runbook</h2><MiniPanel title="Runbook Steps" items={incident?.runbook || ['Restart Redis service', 'Scale DB connection pool', 'Enable throttling', 'Verify payment traces']} /><button onClick={resolveLatestIncident} className="mt-5 w-full bg-emerald-600 hover:bg-emerald-800 py-3 rounded-xl font-bold text-emerald-50 shadow-lg shadow-emerald-500/20">🛠 Execute AI Recovery</button></div><div className={`${glass} border-cyan-500/30 p-5`}><h2 className="text-cyan-300 text-xl font-bold mb-4">Post-Incident Checklist</h2><MiniPanel title="Checklist" items={incident?.checklist || ['Confirm Redis health', 'Confirm DB pool', 'Verify API latency', 'Prepare report']} /></div></section>
}

function ReportsSlide({ history, routingRule, assignedTo, downloadReport }: any) {
  const latest = history[0]
  return <section className="grid grid-cols-2 gap-4"><div className={`${glass} border-purple-500/30 p-5`}><h2 className="text-purple-300 text-xl font-bold mb-4">Incident Report Summary</h2><InfoRow label="Latest Incident" value={latest?.id || 'No incident'} /><InfoRow label="AI Priority" value={latest?.priority || routingRule.priority} /><InfoRow label="AI Route" value={latest?.route || routingRule.route} /><InfoRow label="Assigned To" value={latest?.assignee || assignedTo} /><InfoRow label="AI RCA" value={latest?.aiTime || routingRule.aiTime} /><InfoRow label="Engineer RCA" value={latest?.engineerTime || routingRule.engineerTime} /></div><div className={`${glass} border-emerald-500/30 p-5`}><h2 className="text-emerald-300 text-xl font-bold mb-4">Export</h2><p className="text-sm text-zinc-400 leading-relaxed">The report includes assignment route, timestamps, RCA, resolution, monitoring sources, and zero-cost architecture note.</p><button onClick={downloadReport} className="mt-5 w-full bg-emerald-600 hover:bg-emerald-800 py-3 rounded-xl font-bold text-emerald-50 shadow-lg shadow-emerald-500/20">Download Incident Report</button></div></section>
}

function InfoSlide() {
  const features = [
    {
      title: 'AI Incident Detection',
      desc: 'AI detects outages from logs, metrics, and traces automatically.',
    },
    {
      title: 'Datadog Integration',
      desc: 'Used for logs, alerts, Redis failures, and infrastructure monitoring.',
    },
    {
      title: 'Grafana Metrics',
      desc: 'Used for CPU, memory, latency, and SLA visualization.',
    },
    {
      title: 'New Relic Tracing',
      desc: 'Used for payment traces and dependency analysis.',
    },
    {
      title: 'Root Cause Analysis',
      desc: 'AI correlates telemetry and predicts probable root cause.',
    },
    {
      title: 'AI Routing',
      desc: 'Incidents automatically route to best engineer or AI.',
    },
    {
      title: 'War Room',
      desc: 'Critical incidents activate emergency response mode.',
    },
    {
      title: 'Live Logs',
      desc: 'Streaming logs visible in real time.',
    },
    {
      title: 'Live Metrics',
      desc: 'Real-time graph monitoring for infrastructure.',
    },
    {
      title: 'Business Impact',
      desc: 'AI predicts customer and revenue impact.',
    },
    {
      title: 'AI Recovery',
      desc: 'AI suggests and executes recovery steps.',
    },
    {
      title: 'Incident History',
      desc: 'All incidents stored for analysis and recall.',
    },
    {
      title: 'Executive Reports',
      desc: 'Downloadable incident reports for management.',
    },
    {
      title: 'Human vs AI RCA',
      desc: 'Shows reduction in resolution time.',
    },
    {
      title: 'Zero Cost Simulation',
      desc: 'Entire observability ecosystem simulated locally.',
    },
  ]

  return (
    <section className="space-y-8">
      <div>
        <div className="text-4xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
          AI SRE COPILOT ROADMAP
        </div>

        <div className="text-zinc-500 mt-2">
          Interactive architecture & feature explanation
        </div>
      </div>

      <div className="relative min-h-[700px] overflow-hidden rounded-3xl border border-cyan-500/20 bg-slate-950/70 p-10">
        

        <div className="grid grid-cols-5 gap-6 relative">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{
                opacity: 0,
                y: index % 2 === 0 ? -50 : 50,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.08,
              }}
              className="group"
            >
              <div className="rounded-3xl border border-cyan-500/20 bg-black/40 p-5 shadow-2xl shadow-cyan-500/10 hover:scale-105 transition cursor-pointer h-52">
                <div className="text-xs text-zinc-500">
                  Feature {index + 1}
                </div>

                <div className="text-lg font-bold text-cyan-200 mt-3">
                  {feature.title}
                </div>

                <div className="text-sm text-zinc-400 mt-4 leading-relaxed">
                  {feature.desc}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
function FloatingChat({ chatOpen, setChatOpen, messages, input, setInput, sendMessage, sendQuickMessage, chatEndRef }: any) {
  const questions = ['What is the root cause?', 'Which tools detected this?', 'Which services are affected?', 'What should SRE do next?', 'What is the business impact?']
  return <div className="fixed right-6 bottom-6 z-40">{chatOpen && <motion.div initial={{ opacity: 0, y: 20, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="w-[420px] h-[560px] bg-slate-950 border border-purple-500/35 shadow-2xl shadow-purple-500/25 rounded-2xl p-4 mb-4 flex flex-col"><div className="flex justify-between items-center mb-3"><div><div className="text-purple-300 font-bold">AI Assistant</div><div className="text-xs text-zinc-600">Zero-cost rule-based SRE answers</div></div><button onClick={() => setChatOpen(false)} className="text-zinc-500 hover:text-purple-200">✕</button></div><div className="grid grid-cols-1 gap-2 mb-3">{questions.map((q) => <button key={q} onClick={() => sendQuickMessage(q)} className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-left text-zinc-300">{q}</button>)}</div><div className="flex-1 overflow-auto space-y-2 mb-3">{messages.map((msg: ChatMessage, i: number) => <div key={i} className={`rounded-xl px-3 py-2 text-sm ${msg.role === 'user' ? 'bg-cyan-500/10 border border-cyan-500/25 text-cyan-100 ml-10' : 'bg-black/45 border border-purple-500/25 text-zinc-300 mr-10'}`}><span className="font-bold text-purple-300">{msg.role === 'user' ? 'You: ' : 'AI: '}</span>{msg.text}</div>)}<div ref={chatEndRef} /></div><div className="flex gap-2"><input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') sendMessage() }} className="flex-1 bg-black border border-slate-700 rounded-xl px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500" placeholder="Ask AI..." /><button onClick={sendMessage} className="bg-purple-600 hover:bg-purple-800 px-4 rounded-xl text-purple-50">Send</button></div></motion.div>}<button onClick={() => setChatOpen(!chatOpen)} className="bg-purple-600 hover:bg-purple-800 border border-purple-400/30 shadow-2xl shadow-purple-500/30 rounded-full px-5 py-4 font-bold text-purple-50">🤖 AI Assistant</button></div>
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return <div className="flex justify-between gap-4 border-b border-slate-800 pb-2"><span className="text-zinc-600">{label}</span><span className="text-right text-zinc-300">{value}</span></div>
}

function MiniMetric({ title, value, color }: { title: string; value: string; color: string }) {
  return <div className="bg-black/45 border border-slate-700 rounded-xl p-3"><div className="text-xs text-zinc-600">{title}</div><div className={`text-lg font-bold ${color}`}>{value}</div></div>
}

function MiniPanel({ title, items }: { title: string; items: string[] }) {
  return <div className="mt-3 bg-black/45 border border-slate-700/80 rounded-xl p-3"><div className="text-xs text-zinc-500 mb-2">{title}</div><div className="space-y-1">{items.map((item) => <div key={item} className="text-xs text-zinc-300 leading-relaxed">• {item}</div>)}</div></div>
}

function FormField({ label, value }: { label: string; value: string }) {
  return <div><label className="text-xs text-zinc-600">{label}</label><div className="mt-1 bg-black/45 border border-slate-700 rounded-xl px-3 py-2 text-sm text-zinc-300">{value}</div></div>
}

const inputClass =
  'mt-1 w-full bg-black/45 border border-slate-700 rounded-xl px-3 py-2 text-sm text-zinc-300 outline-none focus:border-cyan-500'

function SelectField({ label, value, setValue, options }: any) {
  return <div><label className="text-xs text-zinc-600">{label}</label><select value={value} onChange={(e) => setValue(e.target.value)} className={inputClass}>{options.map((op: string) => <option key={op}>{op}</option>)}</select></div>
}

function TextBox({ label, value }: { label: string; value: string }) {
  return <div><label className="text-xs text-zinc-600">{label}</label><div className="mt-1 bg-black/45 border border-slate-700 rounded-xl px-3 py-3 text-sm min-h-[70px] text-zinc-300">{value}</div></div>
}
