'use client'

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

export default function HistorySlide({
  history,
  statusColor,
}: {
  history: HistoryItem[]
  statusColor: (status: string) => string
}) {
  if (!history.length) {
    return (
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl p-10 text-center">
        <div className="text-3xl mb-4">📂</div>

        <div className="text-2xl font-bold text-zinc-300">
          No Incident History
        </div>

        <div className="text-zinc-500 mt-2">
          Submitted incidents will appear here with timeline,
          RCA, assignment, and resolution tracking.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-3xl font-black bg-gradient-to-r from-cyan-300 via-purple-300 to-emerald-300 bg-clip-text text-transparent">
            Incident History
          </div>

          <div className="text-zinc-500 mt-1">
            AI-powered incident lifecycle tracking
          </div>
        </div>

        <div className="px-5 py-3 rounded-2xl border border-cyan-500/25 bg-cyan-500/10 text-cyan-300 shadow-lg shadow-cyan-500/10">
          Total Incidents: {history.length}
        </div>
      </div>

      <div className="space-y-4">
        {history.map((item, index) => (
          <div
            key={index}
            className="bg-slate-950/85 border border-slate-800 rounded-3xl p-6 shadow-2xl shadow-cyan-500/5"
          >
            <div className="flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="text-2xl font-bold text-cyan-300">
                  {item.id}
                </div>

                <div className="text-zinc-500 mt-1">
                  {item.incidentClass}
                </div>
              </div>

              <div
                className={`px-4 py-2 rounded-2xl border text-sm font-semibold ${statusColor(
                  item.status
                )}`}
              >
                {item.status}
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 mt-6">
              <MetricCard
                title="Priority"
                value={item.priority}
                color="text-red-300"
              />

              <MetricCard
                title="AI RCA"
                value={item.aiTime}
                color="text-emerald-300"
              />

              <MetricCard
                title="Engineer RCA"
                value={item.engineerTime}
                color="text-orange-300"
              />

              <MetricCard
                title="Assignment"
                value={item.route}
                color="text-cyan-300"
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-5">
              <div className="bg-black/40 border border-cyan-500/20 rounded-2xl p-5">
                <div className="text-cyan-300 font-semibold mb-4">
                  Incident Timeline
                </div>

                <div className="space-y-4">
                  <TimelineItem
                    title="Incident Created"
                    value={item.createdAt}
                    color="bg-red-400"
                  />

                  <TimelineItem
                    title="Assigned"
                    value={item.assignedAt}
                    color="bg-yellow-400"
                  />

                  <TimelineItem
                    title="Resolved"
                    value={item.resolvedAt}
                    color="bg-emerald-400"
                  />
                </div>
              </div>

              <div className="bg-black/40 border border-purple-500/20 rounded-2xl p-5">
                <div className="text-purple-300 font-semibold mb-4">
                  AI Root Cause Analysis
                </div>

                <div className="space-y-3 text-sm">
                  <InfoRow
                    label="Impact"
                    value={item.impact}
                  />

                  <InfoRow
                    label="Urgency"
                    value={item.urgency}
                  />

                  <InfoRow
                    label="Assigned To"
                    value={item.assignee}
                  />

                  <InfoRow
                    label="Root Cause"
                    value={item.rootCause}
                  />

                  <InfoRow
                    label="Resolution"
                    value={item.resolution}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 bg-black/40 border border-emerald-500/20 rounded-2xl p-5">
              <div className="text-emerald-300 font-semibold mb-4">
                AI Operational Intelligence
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4">
                  <div className="text-zinc-500 text-xs">
                    Telemetry Correlation
                  </div>

                  <div className="text-zinc-300 mt-2">
                    Datadog logs matched with Grafana latency spikes.
                  </div>
                </div>

                <div className="bg-cyan-500/10 border border-cyan-500/20 rounded-2xl p-4">
                  <div className="text-zinc-500 text-xs">
                    Deployment Correlation
                  </div>

                  <div className="text-zinc-300 mt-2">
                    v2.4.1 deployment detected before outage.
                  </div>
                </div>

                <div className="bg-purple-500/10 border border-purple-500/20 rounded-2xl p-4">
                  <div className="text-zinc-500 text-xs">
                    Similar Incident Recall
                  </div>

                  <div className="text-zinc-300 mt-2">
                    Incident #142 matched 84% confidence.
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
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
    <div className="bg-black/40 border border-slate-800 rounded-2xl p-4">
      <div className="text-xs text-zinc-500">
        {title}
      </div>

      <div className={`text-xl font-bold mt-2 ${color}`}>
        {value}
      </div>
    </div>
  )
}

function TimelineItem({
  title,
  value,
  color,
}: {
  title: string
  value: string
  color: string
}) {
  return (
    <div className="flex items-start gap-4">
      <div className={`h-3 w-3 rounded-full mt-1 ${color}`} />

      <div>
        <div className="text-zinc-300 font-medium">
          {title}
        </div>

        <div className="text-zinc-500 text-sm mt-1">
          {value}
        </div>
      </div>
    </div>
  )
}

function InfoRow({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="flex justify-between gap-4 border-b border-slate-800 pb-2">
      <span className="text-zinc-500">{label}</span>

      <span className="text-zinc-300 text-right">
        {value}
      </span>
    </div>
  )
}