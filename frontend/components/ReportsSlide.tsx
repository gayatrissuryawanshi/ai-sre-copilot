'use client'

export default function ReportsSlide({
  history,
  routingRule,
  assignedTo,
  downloadReport,
}: any) {
  const latest = history[0]

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
            Executive Incident Report
          </div>
          <div className="text-zinc-500 mt-1">
            RCA, business impact, SLA risk, and recovery summary
          </div>
        </div>

        <button
          onClick={downloadReport}
          className="bg-emerald-600 hover:bg-emerald-800 px-5 py-3 rounded-2xl font-bold text-emerald-50 shadow-lg shadow-emerald-500/20"
        >
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card title="Latest Incident" value={latest?.id || 'No incident'} color="text-cyan-300" />
        <Card title="Priority" value={latest?.priority || routingRule.priority} color="text-red-300" />
        <Card title="AI RCA Time" value={latest?.aiTime || routingRule.aiTime} color="text-emerald-300" />
        <Card title="Engineer RCA Time" value={latest?.engineerTime || routingRule.engineerTime} color="text-orange-300" />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-slate-950/85 border border-purple-500/25 rounded-3xl p-6 shadow-2xl shadow-purple-500/10">
          <h2 className="text-purple-300 text-xl font-bold mb-4">AI Summary</h2>

          <div className="space-y-3 text-sm">
            <Info label="Route" value={latest?.route || routingRule.route} />
            <Info label="Assigned To" value={latest?.assignee || assignedTo} />
            <Info label="Root Cause" value={latest?.rootCause || 'Redis timeout caused DB pool exhaustion and payment degradation.'} />
            <Info label="Resolution" value={latest?.resolution || 'Pending recovery execution.'} />
          </div>
        </div>

        <div className="bg-slate-950/85 border border-red-500/25 rounded-3xl p-6 shadow-2xl shadow-red-500/10">
          <h2 className="text-red-300 text-xl font-bold mb-4">Business Impact</h2>

          <div className="space-y-3 text-sm text-zinc-300">
            <div>• Payment checkout experience degraded</div>
            <div>• API latency increased due to Redis timeout</div>
            <div>• SLA breach risk marked as high during P1</div>
            <div>• Revenue risk exists if payment failures continue</div>
            <div>• AI reduced RCA time from 42 minutes to 4 minutes</div>
          </div>
        </div>
      </div>

      <div className="bg-slate-950/85 border border-cyan-500/25 rounded-3xl p-6 shadow-2xl shadow-cyan-500/10">
        <h2 className="text-cyan-300 text-xl font-bold mb-4">Monitoring Evidence</h2>

        <div className="grid grid-cols-3 gap-4">
          <Evidence title="Datadog" text="Redis timeout logs and P1 alert trigger detected." />
          <Evidence title="Grafana" text="CPU, memory, and API latency spike correlation." />
          <Evidence title="New Relic" text="Payment transaction traces failed after dependency slowdown." />
        </div>
      </div>
    </section>
  )
}

function Card({ title, value, color }: any) {
  return (
    <div className="bg-slate-950/85 border border-slate-800 rounded-3xl p-5 shadow-xl">
      <div className="text-xs text-zinc-500">{title}</div>
      <div className={`text-2xl font-black mt-2 ${color}`}>{value}</div>
    </div>
  )
}

function Info({ label, value }: any) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-800 pb-2">
      <span className="text-zinc-500">{label}</span>
      <span className="text-zinc-300 text-right">{value}</span>
    </div>
  )
}

function Evidence({ title, text }: any) {
  return (
    <div className="bg-black/40 border border-cyan-500/20 rounded-2xl p-4">
      <div className="text-cyan-300 font-bold">{title}</div>
      <div className="text-zinc-400 text-sm mt-2">{text}</div>
    </div>
  )
}