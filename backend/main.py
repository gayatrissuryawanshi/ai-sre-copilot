from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import socketio
import asyncio
import random
from datetime import datetime

app = FastAPI(title="AI SRE Copilot Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")
socket_app = socketio.ASGIApp(sio, app)

incident_active = False
incident_resolved = False

healthy_logs = [
    {"source": "Datadog", "severity": "INFO", "service": "API Gateway", "event": "API request successful"},
    {"source": "Grafana", "severity": "INFO", "service": "Database", "event": "Database query completed"},
    {"source": "New Relic", "severity": "INFO", "service": "Checkout API", "event": "Transaction trace normal"},
    {"source": "Grafana", "severity": "WARNING", "service": "API Gateway", "event": "API latency slightly increased"},
    {"source": "Datadog", "severity": "INFO", "service": "Redis Cache", "event": "Cache hit successful"},
]

class ChatRequest(BaseModel):
    message: str
    logs: list = []
    incident: dict | None = None

def now_time():
    return datetime.now().strftime("%H:%M:%S")

def incident_payload(status="critical"):
    if status == "resolved":
        return {
            "id": "INC-2026-0524",
            "status": "Resolved",
            "severity": "Resolved",
            "priority": "P1",
            "manual_priority": "P2",
            "ai_priority": "P1 - Critical",
            "manual_rca": "42 min",
            "ai_rca": "4 min",
            "time_saved": "90%",
            "root_cause": "Redis and database overload was recovered through AI-guided remediation.",
            "confidence": "99%",
            "sla_risk": "Low",
            "mttr": "4m 12s",
            "impacted_users": "0",
            "revenue_risk": "₹0/hour",
            "summary": "AI recovery restarted Redis, scaled the database connection pool, and stabilized dependent services.",
            "affected_services": [
                {"name": "API Gateway", "status": "Healthy"},
                {"name": "Redis Cache", "status": "Healthy"},
                {"name": "Database", "status": "Healthy"},
                {"name": "Payment Service", "status": "Healthy"},
                {"name": "Auth Service", "status": "Healthy"},
            ],
            "telemetry_signals": [
                "Datadog: Redis timeout pattern cleared",
                "Grafana: API latency returned to baseline",
                "Grafana: Database connection pool normalized",
                "New Relic: Payment service error rate recovered",
            ],
            "rca_steps": [
                "Collected Redis logs from Datadog",
                "Verified DB saturation through Grafana",
                "Checked payment traces from New Relic",
                "Matched similar historical incident",
                "Validated recovery after runbook execution",
            ],
            "recent_deployment": "v2.4.1 deployed 4 minutes before incident. No rollback required after recovery.",
            "similar_incident": "Incident #142: Redis overload caused cascading API failures. Fixed by scaling Redis nodes and DB pool.",
            "dependency_chain": ["Redis Timeout", "DB Pool Exhaustion", "API Latency", "Payment Failure"],
            "confidence_signals": [
                "Redis timeout pattern cleared",
                "Database saturation recovered",
                "Payment traces normalized",
                "SLA breach avoided",
            ],
            "business_impact": [
                "No active user impact",
                "Payment flow stabilized",
                "Checkout recovery confirmed",
                "SLA breach avoided",
            ],
            "runbook": [
                "Keep Redis memory under observation",
                "Continue monitoring database pool",
                "Verify payment service health",
                "Prepare post-incident report",
            ],
            "checklist": [
                "Confirm Redis health",
                "Confirm database pool size",
                "Confirm payment success rate",
                "Share incident report",
            ],
            "timeline": [
                {"time": "12:41", "event": "Incident triggered"},
                {"time": "12:42", "event": "AI analysis started"},
                {"time": "12:43", "event": "Root cause identified"},
                {"time": "12:44", "event": "Recovery executed"},
                {"time": "12:45", "event": "System stabilized"},
            ],
        }

    return {
        "id": "INC-2026-0524",
        "status": "Active",
        "severity": "Critical",
        "priority": "P1",
        "manual_priority": "P2",
        "ai_priority": "P1 - Critical",
        "manual_rca": "42 min",
        "ai_rca": "4 min",
        "time_saved": "90%",
        "root_cause": "Redis timeout caused database connection pool exhaustion, leading to API latency spikes and payment failures.",
        "confidence": "96%",
        "sla_risk": "High",
        "mttr": "Live",
        "impacted_users": "12,400",
        "revenue_risk": "₹1.2L/hour",
        "summary": "AI correlated Datadog logs, Grafana metrics, and New Relic traces. Redis timeout appears to be the starting failure, cascading into database overload and payment errors.",
        "affected_services": [
            {"name": "API Gateway", "status": "Warning"},
            {"name": "Redis Cache", "status": "Critical"},
            {"name": "Database", "status": "Warning"},
            {"name": "Payment Service", "status": "Down"},
            {"name": "Auth Service", "status": "Healthy"},
        ],
        "telemetry_signals": [
            "Datadog: Redis timeout errors increased by 312%",
            "Grafana: API latency reached 1200ms p95",
            "Grafana: Database connection pool at 98%",
            "New Relic: Payment transaction failures detected",
        ],
        "rca_steps": [
            "Detected Redis timeout spike in Datadog",
            "Matched Grafana API latency spike",
            "Confirmed DB pool exhaustion",
            "Checked New Relic payment trace failures",
            "Compared against similar incident #142",
        ],
        "recent_deployment": "v2.4.1 deployed 4 minutes before incident. Redis config updated 5 minutes before outage.",
        "similar_incident": "Incident #142: Redis overload caused cascading API failures. Fixed by scaling Redis nodes and DB pool.",
        "dependency_chain": ["Redis Timeout", "DB Pool Exhaustion", "API Latency", "Payment Failure"],
        "confidence_signals": [
            "Error spike correlation",
            "Deployment timing match",
            "Redis timeout pattern",
            "Similar incident recall",
        ],
        "business_impact": [
            "Payment transactions delayed",
            "18% API failure rate",
            "User checkout experience degraded",
            "SLA breach risk high",
        ],
        "runbook": [
            "Restart Redis service",
            "Scale database connection pool",
            "Enable request throttling",
            "Notify on-call engineer",
        ],
        "checklist": [
            "Confirm Redis restart",
            "Validate DB connection pool",
            "Verify API latency",
            "Confirm payment success rate",
        ],
        "timeline": [
            {"time": "12:41", "event": "Incident triggered"},
            {"time": "12:42", "event": "AI acknowledged incident"},
            {"time": "12:43", "event": "Root cause analysis started"},
            {"time": "12:44", "event": "Recovery pending"},
        ],
    }

def service_health(status="healthy"):
    if status == "critical":
        return [
            {"service": "API Gateway", "status": "Warning", "source": "Grafana"},
            {"service": "Redis Cache", "status": "Critical", "source": "Datadog"},
            {"service": "Database", "status": "Warning", "source": "Grafana"},
            {"service": "Payment Service", "status": "Down", "source": "New Relic"},
            {"service": "Auth Service", "status": "Healthy", "source": "New Relic"},
        ]

    return [
        {"service": "API Gateway", "status": "Healthy", "source": "Grafana"},
        {"service": "Redis Cache", "status": "Healthy", "source": "Datadog"},
        {"service": "Database", "status": "Healthy", "source": "Grafana"},
        {"service": "Payment Service", "status": "Healthy", "source": "New Relic"},
        {"service": "Auth Service", "status": "Healthy", "source": "New Relic"},
    ]

async def emit_log(source, severity, service, event):
    await sio.emit("log", {
        "time": now_time(),
        "source": source,
        "severity": severity,
        "service": service,
        "event": event,
    })

async def generate_metrics():
    global incident_active, incident_resolved

    while True:
        if incident_active:
            metrics = {
                "time": now_time(),
                "cpu": random.randint(75, 96),
                "memory": random.randint(72, 94),
                "latency": random.randint(900, 1650),
                "incidents": random.randint(4, 9),
            }
        elif incident_resolved:
            metrics = {
                "time": now_time(),
                "cpu": random.randint(35, 62),
                "memory": random.randint(42, 67),
                "latency": random.randint(180, 520),
                "incidents": random.randint(0, 1),
            }
        else:
            metrics = {
                "time": now_time(),
                "cpu": random.randint(30, 70),
                "memory": random.randint(40, 76),
                "latency": random.randint(150, 850),
                "incidents": random.randint(0, 3),
            }

        await sio.emit("metrics", metrics)
        await asyncio.sleep(2)

async def generate_logs():
    while True:
        log = random.choice(healthy_logs)
        await emit_log(log["source"], log["severity"], log["service"], log["event"])
        await asyncio.sleep(3)

@app.get("/simulate-failure")
async def simulate_failure():
    global incident_active, incident_resolved
    incident_active = True
    incident_resolved = False

    await emit_log("Datadog", "CRITICAL", "Redis Cache", "Redis timeout after 5000ms")
    await emit_log("Grafana", "WARNING", "API Gateway", "p95 latency increased to 1200ms")
    await emit_log("Grafana", "ERROR", "Database", "Connection pool exhausted at 98%")
    await emit_log("New Relic", "ERROR", "Payment Service", "Payment transaction failed with 503")

    await sio.emit("service_health", service_health("critical"))
    await sio.emit("incident", incident_payload("critical"))
    await sio.emit("toast", "🚨 P1 Critical Incident Detected")

    return {"status": "incident created"}

@app.get("/deploy-fix")
async def deploy_fix():
    global incident_active, incident_resolved
    incident_active = False
    incident_resolved = True

    await emit_log("AI Engine", "INFO", "Recovery", "AI recovery workflow started")
    await emit_log("Runbook", "INFO", "Redis Cache", "Restarting Redis service")
    await emit_log("Runbook", "INFO", "Database", "Scaling database connection pool")
    await emit_log("Runbook", "SUCCESS", "Payment Service", "Payment service recovered")
    await emit_log("AI Engine", "SUCCESS", "System", "Incident resolved successfully")

    await sio.emit("service_health", service_health("healthy"))
    await sio.emit("incident", incident_payload("resolved"))
    await sio.emit("toast", "✅ Incident Resolved — System Stabilized")

    return {"status": "recovery executed"}

@app.get("/escalate-oncall")
async def escalate_oncall():
    await emit_log("AI Engine", "INFO", "On-call", "On-call engineer Gayatri S. notified")
    await sio.emit("toast", "📞 On-call engineer notified")
    return {"status": "on-call notified"}

@app.post("/ai-chat")
async def ai_chat(request: ChatRequest):
    msg = request.message.lower()

    if "root" in msg or "cause" in msg or "broke" in msg:
        reply = "Root cause: Redis timeout triggered database connection pool exhaustion. This caused API latency spikes and payment failures. Signals are correlated from Datadog logs, Grafana metrics, and New Relic traces."

    elif "tool" in msg or "datadog" in msg or "grafana" in msg or "new relic" in msg or "source" in msg:
        reply = "Datadog detected Redis logs and alerts, Grafana showed CPU/memory/latency and database metrics, and New Relic detected APM traces and payment transaction failures."

    elif "service" in msg or "affected" in msg:
        reply = "Affected services: Redis Cache is critical, Database is warning, API Gateway has high latency, and Payment Service is down. Auth Service remains healthy."

    elif "fix" in msg or "recover" in msg or "runbook" in msg or "next" in msg:
        reply = "Next SRE action: restart Redis, scale the database connection pool, enable request throttling, verify payment traces, and monitor latency for 5 minutes."

    elif "impact" in msg or "business" in msg or "user" in msg or "sla" in msg:
        reply = "Business impact: delayed payments, 18% API failure rate, degraded checkout experience, high SLA breach risk, and estimated revenue risk of ₹1.2L/hour."

    elif "deployment" in msg or "change" in msg:
        reply = "Recent deployment correlation: v2.4.1 and Redis config changes happened minutes before the incident. This increases confidence that the recent change may be related."

    elif "similar" in msg or "past" in msg:
        reply = "Similar incident recall: Incident #142 had Redis overload causing cascading API failures. It was fixed by scaling Redis nodes and increasing DB pool capacity."

    elif "simple" in msg or "explain" in msg:
        reply = "Simple explanation: Redis became slow, database connections filled up, APIs slowed down, and payments started failing. AI connected all signals and suggested recovery."

    else:
        reply = "Ask me about root cause, affected services, Datadog/Grafana/New Relic signals, recent deployments, business impact, or recovery steps."

    return {"reply": reply}

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(generate_metrics())
    asyncio.create_task(generate_logs())

# from fastapi import FastAPI
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel
# import socketio
# import asyncio
# import random
# from datetime import datetime

# app = FastAPI(title="AI SRE Copilot Backend")

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# sio = socketio.AsyncServer(cors_allowed_origins="*", async_mode="asgi")
# socket_app = socketio.ASGIApp(sio, app)

# incident_active = False
# incident_resolved = False

# healthy_logs = [
#     {"source": "Datadog", "severity": "INFO", "service": "API Gateway", "event": "API request successful"},
#     {"source": "Grafana", "severity": "INFO", "service": "Database", "event": "Database query completed"},
#     {"source": "New Relic", "severity": "INFO", "service": "Checkout API", "event": "Transaction trace normal"},
#     {"source": "Grafana", "severity": "WARNING", "service": "API Gateway", "event": "API latency slightly increased"},
#     {"source": "Datadog", "severity": "INFO", "service": "Redis Cache", "event": "Cache hit successful"},
# ]

# class ChatRequest(BaseModel):
#     message: str
#     logs: list = []
#     incident: dict | None = None


# def now_time():
#     return datetime.now().strftime("%H:%M:%S")


# def incident_payload(status="critical"):
#     if status == "resolved":
#         return {
#             "id": "INC-2026-0524",
#             "status": "Resolved",
#             "severity": "Resolved",
#             "priority": "P1",
#             "root_cause": "Redis and database overload was recovered through AI-guided remediation.",
#             "confidence": "99%",
#             "sla_risk": "Low",
#             "mttr": "4m 12s",
#             "impacted_users": "0",
#             "revenue_risk": "₹0/hour",
#             "summary": "AI recovery restarted Redis, scaled the database connection pool, and stabilized dependent services.",
#             "affected_services": [
#                 {"name": "API Gateway", "status": "Healthy"},
#                 {"name": "Redis Cache", "status": "Healthy"},
#                 {"name": "Database", "status": "Healthy"},
#                 {"name": "Payment Service", "status": "Healthy"},
#             ],
#             "telemetry_signals": [
#                 "Redis timeout pattern cleared",
#                 "Database connection pool normalized",
#                 "API latency returned to baseline",
#                 "Payment service error rate recovered",
#             ],
#             "recent_deployment": "v2.4.1 deployed 4 minutes before incident. No rollback required after recovery.",
#             "similar_incident": "Incident #142: Redis overload caused cascading API failures. Resolved by scaling Redis and DB pool.",
#             "dependency_chain": ["API Gateway", "Redis Cache", "Database Pool", "Payment Service"],
#             "confidence_signals": [
#                 "Redis timeout pattern matched",
#                 "Database saturation confirmed",
#                 "Telemetry recovered after fix",
#                 "Similar incident match found",
#             ],
#             "business_impact": [
#                 "No active user impact",
#                 "Payment flow stabilized",
#                 "SLA breach avoided",
#             ],
#             "runbook": [
#                 "Keep Redis memory under observation",
#                 "Continue monitoring database pool",
#                 "Verify payment service health",
#                 "Prepare post-incident report",
#             ],
#             "timeline": [
#                 {"time": "12:41", "event": "Incident triggered"},
#                 {"time": "12:42", "event": "AI analysis started"},
#                 {"time": "12:43", "event": "Root cause identified"},
#                 {"time": "12:44", "event": "Recovery executed"},
#                 {"time": "12:45", "event": "System stabilized"},
#             ],
#         }

#     return {
#         "id": "INC-2026-0524",
#         "status": "Active",
#         "severity": "Critical",
#         "priority": "P1",
#         "root_cause": "Redis timeout caused database connection pool exhaustion, leading to API latency spikes and payment failures.",
#         "confidence": "96%",
#         "sla_risk": "High",
#         "mttr": "Live",
#         "impacted_users": "12,400",
#         "revenue_risk": "₹1.2L/hour",
#         "summary": "AI correlated Datadog logs, Grafana metrics, and New Relic traces. Redis timeout appears to be the starting failure, cascading into database overload and payment errors.",
#         "affected_services": [
#             {"name": "API Gateway", "status": "Warning"},
#             {"name": "Redis Cache", "status": "Critical"},
#             {"name": "Database", "status": "Warning"},
#             {"name": "Payment Service", "status": "Down"},
#         ],
#         "telemetry_signals": [
#             "Datadog: Redis timeout errors increased by 312%",
#             "Grafana: API latency reached 1200ms p95",
#             "Grafana: Database connection pool at 98%",
#             "New Relic: Payment transaction failures detected",
#         ],
#         "recent_deployment": "v2.4.1 deployed 4 minutes before incident. Redis config updated 5 minutes before outage.",
#         "similar_incident": "Incident #142: Redis overload caused cascading API failures. Resolved by scaling Redis nodes and DB pool.",
#         "dependency_chain": ["API Gateway", "Redis Cache", "Database Pool", "Payment Service"],
#         "confidence_signals": [
#             "Error spike correlation",
#             "Deployment timing match",
#             "Redis timeout pattern",
#             "Similar incident recall",
#         ],
#         "business_impact": [
#             "Payment transactions delayed",
#             "18% API failure rate",
#             "User checkout experience degraded",
#             "SLA breach risk high",
#         ],
#         "runbook": [
#             "Restart Redis service",
#             "Scale database connection pool",
#             "Enable request throttling",
#             "Notify on-call engineer",
#         ],
#         "timeline": [
#             {"time": "12:41", "event": "Incident triggered"},
#             {"time": "12:42", "event": "AI acknowledged incident"},
#             {"time": "12:43", "event": "Root cause analysis started"},
#             {"time": "12:44", "event": "Recovery pending"},
#         ],
#     }


# def service_health(status="healthy"):
#     if status == "critical":
#         return [
#             {"service": "API Gateway", "status": "Warning", "source": "Grafana"},
#             {"service": "Redis Cache", "status": "Critical", "source": "Datadog"},
#             {"service": "Database", "status": "Warning", "source": "Grafana"},
#             {"service": "Payment Service", "status": "Down", "source": "New Relic"},
#             {"service": "Auth Service", "status": "Healthy", "source": "New Relic"},
#         ]

#     return [
#         {"service": "API Gateway", "status": "Healthy", "source": "Grafana"},
#         {"service": "Redis Cache", "status": "Healthy", "source": "Datadog"},
#         {"service": "Database", "status": "Healthy", "source": "Grafana"},
#         {"service": "Payment Service", "status": "Healthy", "source": "New Relic"},
#         {"service": "Auth Service", "status": "Healthy", "source": "New Relic"},
#     ]


# async def emit_log(source, severity, service, event):
#     await sio.emit("log", {
#         "time": now_time(),
#         "source": source,
#         "severity": severity,
#         "service": service,
#         "event": event,
#     })


# async def generate_metrics():
#     global incident_active, incident_resolved

#     while True:
#         if incident_active:
#             metrics = {
#                 "time": now_time(),
#                 "cpu": random.randint(75, 96),
#                 "memory": random.randint(72, 94),
#                 "latency": random.randint(900, 1600),
#                 "incidents": random.randint(3, 8),
#             }
#         elif incident_resolved:
#             metrics = {
#                 "time": now_time(),
#                 "cpu": random.randint(35, 62),
#                 "memory": random.randint(42, 67),
#                 "latency": random.randint(180, 520),
#                 "incidents": random.randint(0, 2),
#             }
#         else:
#             metrics = {
#                 "time": now_time(),
#                 "cpu": random.randint(30, 70),
#                 "memory": random.randint(40, 76),
#                 "latency": random.randint(150, 850),
#                 "incidents": random.randint(0, 3),
#             }

#         await sio.emit("metrics", metrics)
#         await asyncio.sleep(2)


# async def generate_logs():
#     while True:
#         log = random.choice(healthy_logs)
#         await emit_log(log["source"], log["severity"], log["service"], log["event"])
#         await asyncio.sleep(3)


# @app.get("/simulate-failure")
# async def simulate_failure():
#     global incident_active, incident_resolved
#     incident_active = True
#     incident_resolved = False

#     await emit_log("Datadog", "CRITICAL", "Redis Cache", "Redis timeout after 5000ms")
#     await emit_log("Grafana", "WARNING", "API Gateway", "p95 latency increased to 1200ms")
#     await emit_log("Grafana", "ERROR", "Database", "Connection pool exhausted at 98%")
#     await emit_log("New Relic", "ERROR", "Payment Service", "Payment transaction failed with 503")

#     await sio.emit("service_health", service_health("critical"))
#     await sio.emit("incident", incident_payload("critical"))
#     await sio.emit("toast", "🚨 P1 Critical Incident Detected")

#     return {"status": "incident created"}


# @app.get("/deploy-fix")
# async def deploy_fix():
#     global incident_active, incident_resolved
#     incident_active = False
#     incident_resolved = True

#     await emit_log("AI Engine", "INFO", "Recovery", "AI recovery workflow started")
#     await emit_log("Runbook", "INFO", "Redis Cache", "Restarting Redis service")
#     await emit_log("Runbook", "INFO", "Database", "Scaling database connection pool")
#     await emit_log("Runbook", "SUCCESS", "Payment Service", "Payment service recovered")
#     await emit_log("AI Engine", "SUCCESS", "System", "Incident resolved successfully")

#     await sio.emit("service_health", service_health("healthy"))
#     await sio.emit("incident", incident_payload("resolved"))
#     await sio.emit("toast", "✅ Incident Resolved — System Stabilized")

#     return {"status": "recovery executed"}


# @app.post("/ai-chat")
# async def ai_chat(request: ChatRequest):
#     msg = request.message.lower()
#     incident = request.incident

#     if "root" in msg or "cause" in msg or "broke" in msg:
#         reply = "Probable root cause: Redis timeout triggered database connection pool exhaustion. This created cascading latency in API Gateway and payment failures. Evidence comes from Datadog logs, Grafana latency metrics, and New Relic transaction traces."

#     elif "datadog" in msg or "grafana" in msg or "new relic" in msg or "source" in msg:
#         reply = "Telemetry correlation: Datadog reported Redis timeout errors, Grafana showed API latency and DB saturation, and New Relic captured payment transaction failures. Together these point to Redis/database overload."

#     elif "service" in msg or "affected" in msg:
#         reply = "Affected services: Redis Cache is critical, Database is warning, API Gateway has high latency, and Payment Service is down. Auth Service remains healthy."

#     elif "fix" in msg or "recover" in msg or "runbook" in msg or "next" in msg:
#         reply = "Recommended runbook: restart Redis, scale database connection pool, enable request throttling, verify payment service, and continue monitoring latency for 5 minutes."

#     elif "impact" in msg or "business" in msg or "user" in msg or "sla" in msg:
#         reply = "Business impact: users may face failed payments, slow checkout, and degraded experience. SLA breach risk is high until recovery completes."

#     elif "deployment" in msg or "change" in msg:
#         reply = "Recent change correlation: version v2.4.1 and Redis config changes happened minutes before the incident. This is a strong signal for root-cause investigation."

#     elif "similar" in msg or "past" in msg:
#         reply = "Similar incident recall: Incident #142 had Redis overload causing cascading API failures. It was resolved by scaling Redis nodes and increasing DB pool capacity."

#     elif "simple" in msg or "explain" in msg:
#         reply = "Simple explanation: Redis became slow, database connections filled up, APIs became slow, and payments started failing. AI connected all signals and suggested recovery steps."

#     else:
#         reply = "Ask me about root cause, affected services, Datadog/Grafana/New Relic signals, recent deployments, business impact, or recovery steps."

#     return {"reply": reply}


# @app.on_event("startup")
# async def startup_event():
#     asyncio.create_task(generate_metrics())
#     asyncio.create_task(generate_logs())