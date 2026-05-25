'use client'

export default function AIAnalysisSlide({
  incident,
  routingRule,
  isWarRoom,
}: any) {
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
            AI Root Cause Analysis
          </div>

          <div className="text-zinc-500 mt-1">
            Telemetry correlation and dependency intelligence
          </div>
        </div>

        <div
          className={`px-5 py-3 rounded-2xl border ${
            isWarRoom
              ? 'border-red-500/35 bg-red-500/10 text-red-300'
              : 'border-emerald-500/35 bg-emerald-500/10 text-emerald-300'
          }`}
        >
          {isWarRoom
            ? 'P1 War Room Active'
            : 'System Stable'}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <MetricCard
          title="AI Confidence"
          value={incident?.confidence || '96%'}
          color="text-cyan-300"
        />

        <MetricCard
          title="AI RCA Time"
          value={routingRule.aiTime}
          color="text-emerald-300"
        />

        <MetricCard
          title="Assignment Route"
          value={routingRule.route}
          color="text-purple-300"
        />
      </div>

      <div className="grid grid-cols-2 gap-5">
        <div className="bg-slate-950/85 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl shadow-cyan-500/10">
          <div className="text-cyan-300 text-xl font-bold mb-5">
            Telemetry Correlation
          </div>

          <div className="space-y-4">

            <TelemetryBox
              tool="Datadog"
              title="Infrastructure Alerts"
              desc="Redis timeout spikes detected across cluster nodes."
              color="border-cyan-500/20 bg-cyan-500/10"
            />

            <TelemetryBox
              tool="Grafana"
              title="Metrics Analysis"
              desc="CPU and API latency increased 4 minutes before outage."
              color="border-emerald-500/20 bg-emerald-500/10"
            />

            <TelemetryBox
              tool="New Relic"
              title="Transaction Tracing"
              desc="Payment traces failed after Redis dependency slowdown."
              color="border-purple-500/20 bg-purple-500/10"
            />
          </div>
        </div>

        <div className="bg-slate-950/85 border border-purple-500/20 rounded-3xl p-6 shadow-2xl shadow-purple-500/10">
          <div className="text-purple-300 text-xl font-bold mb-5">
            AI Reasoning Engine
          </div>

          <div className="space-y-5">

            <ReasonCard
              title="Deployment Correlation"
              value="v2.4.1 deployed 4 min before outage."
            />

            <ReasonCard
              title="Similar Incident Recall"
              value="Incident #142 matched 84% similarity."
            />

            <ReasonCard
              title="Confidence Reasoning"
              value="Redis timeout patterns matched historical P1 incidents."
            />

            <ReasonCard
              title="Business Impact"
              value="Checkout latency increased causing payment transaction failures."
            />
          </div>
        </div>
      </div>

      <div className="bg-slate-950/85 border border-red-500/20 rounded-3xl p-6 shadow-2xl shadow-red-500/10">
        <div className="flex items-center justify-between mb-6">
          <div className="text-red-300 text-xl font-bold">
            Root Cause Dependency Graph
          </div>

          <div className="px-4 py-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
            Cascading Failure Chain
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 overflow-x-auto">

          <DependencyNode
            label="Redis Timeout"
            color="from-red-500 to-red-700"
          />

          <Arrow />

          <DependencyNode
            label="DB Pool Exhaustion"
            color="from-orange-500 to-orange-700"
          />

          <Arrow />

          <DependencyNode
            label="API Latency"
            color="from-yellow-500 to-yellow-700"
          />

          <Arrow />

          <DependencyNode
            label="Payment Failure"
            color="from-purple-500 to-purple-700"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-5">

        <div className="bg-slate-950/85 border border-emerald-500/20 rounded-3xl p-6 shadow-2xl shadow-emerald-500/10">
          <div className="text-emerald-300 text-xl font-bold mb-5">
            AI Recommendation
          </div>

          <div className="space-y-3 text-sm">

            <Recommendation text="Restart Redis instance immediately." />

            <Recommendation text="Scale database connection pool." />

            <Recommendation text="Throttle incoming API traffic." />

            <Recommendation text="Verify payment trace recovery." />

            <Recommendation text="Notify on-call reliability engineer." />
          </div>
        </div>

        <div className="bg-slate-950/85 border border-cyan-500/20 rounded-3xl p-6 shadow-2xl shadow-cyan-500/10">
          <div className="text-cyan-300 text-xl font-bold mb-5">
            AI Live Analysis
          </div>

          <div className="space-y-4">

            <LiveStep text="Analyzing telemetry signals..." />

            <LiveStep text="Matching historical incidents..." />

            <LiveStep text="Evaluating deployment changes..." />

            <LiveStep text="Correlating service dependencies..." />

            <LiveStep text="Generating recovery strategy..." />
          </div>
        </div>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  color,
}: {
  title: string
  value: string
  color: string
}) {
  return (
    <div className="bg-slate-950/85 border border-slate-800 rounded-3xl p-5 shadow-xl">
      <div className="text-zinc-500 text-sm">
        {title}
      </div>

      <div className={`text-3xl font-black mt-3 ${color}`}>
        {value}
      </div>
    </div>
  )
}

function TelemetryBox({
  tool,
  title,
  desc,
  color,
}: any) {
  return (
    <div className={`border rounded-2xl p-4 ${color}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-zinc-200 font-semibold">
          {tool}
        </div>

        <div className="text-xs text-emerald-300">
          ● Connected
        </div>
      </div>

      <div className="text-sm text-zinc-300 font-medium">
        {title}
      </div>

      <div className="text-sm text-zinc-500 mt-2">
        {desc}
      </div>
    </div>
  )
}

function ReasonCard({
  title,
  value,
}: any) {
  return (
    <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-4">
      <div className="text-zinc-500 text-xs">
        {title}
      </div>

      <div className="text-zinc-300 mt-2">
        {value}
      </div>
    </div>
  )
}

function DependencyNode({
  label,
  color,
}: any) {
  return (
    <div
      className={`min-w-[180px] bg-gradient-to-br ${color} rounded-2xl p-5 text-center shadow-xl`}
    >
      <div className="text-white font-bold">
        {label}
      </div>
    </div>
  )
}

function Arrow() {
  return (
    <div className="text-zinc-500 text-2xl">
      →
    </div>
  )
}

function Recommendation({
  text,
}: {
  text: string
}) {
  return (
    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 text-zinc-300">
      • {text}
    </div>
  )
}

function LiveStep({
  text,
}: {
  text: string
}) {
  return (
    <div className="flex items-center gap-3 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4">
      <div className="h-3 w-3 rounded-full bg-cyan-400 animate-pulse" />

      <div className="text-zinc-300">
        {text}
      </div>
    </div>
  )
}
