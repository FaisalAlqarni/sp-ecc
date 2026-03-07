---
name: logging-best-practices
description: Logging best practices focused on wide events (canonical log lines) for structured, context-rich application logging.
---

# Logging Best Practices: Wide Events

## 1. Purpose & When to Apply

Apply these patterns when:
- Building or refactoring logging in any backend service
- Reviewing code that adds or modifies log statements
- Investigating production issues and finding logs lack context
- Setting up logging for a new service or endpoint

## 2. Wide Events Pattern

A **wide event** (also called a canonical log line) is a single, rich log event emitted once per request or unit of work. Instead of scattering dozens of log lines throughout handler code, you build up context as the request progresses and emit one comprehensive event at the end.

**Strive for one wide event per request — this is a goal, not an absolute rule.** Some situations legitimately need additional log lines (e.g., error details, external service calls). The point is to make the wide event your primary observability signal.

### Why Wide Events?

- **One event = one row** in your log aggregator. Filtering, grouping, and correlating become trivial.
- **High dimensionality** — a single event can carry 20+ fields without performance cost.
- **High cardinality** — fields like `user_id`, `order_id`, or `trace_id` have many unique values, which is exactly what you need for drill-down investigation.

## 3. Context & Dimensionality

Every wide event should carry enough context to answer: *"What happened, to whom, how long did it take, and did it succeed?"*

### Required Fields

| Field | Description | Example |
|-------|-------------|---------|
| `request_id` | Unique identifier for this request/operation | `req_abc123` |
| `duration_ms` | How long the operation took | `142` |
| `status` | HTTP status or outcome | `200`, `error` |
| `method` | HTTP method or operation type | `POST` |
| `path` | Route or endpoint | `/api/orders` |

### Business Context (add as relevant)

| Field | Description |
|-------|-------------|
| `user_id` | Who initiated the request |
| `tenant_id` | Multi-tenant isolation |
| `resource_id` | Primary resource being acted on |
| `action` | Business action performed |
| `error_class` | Exception class name on failure |
| `error_message` | Exception message on failure |

### Dimensionality Guidelines

- **Add fields generously** — structured logging handles wide events efficiently.
- **Use consistent names** across services: `user_id` not `userId` in one and `user` in another.
- **Prefer flat structures** over nested objects for easier querying.

## 4. Structure & Format

### Single Logger Instance

One logger per service or class. Never create ad-hoc logger instances.

### Middleware-Based Context

Attach shared fields (request ID, user, timing) in middleware — not scattered through handlers. The handler only adds business-specific context.

### JSON Output

Always use JSON format in production. Human-readable formats are fine for local development.

### Two Log Levels

- **INFO** — wide events and significant business operations
- **ERROR** — unexpected failures that need investigation

Avoid using DEBUG, TRACE, or WARN in production logging. If you need conditional verbosity, use feature flags or sampling, not log levels.

### Consistent Schema

Define and document your event schema. All services should use the same field names for common concepts.

## 5. Robustness

### Always Emit in Finally/Ensure

The wide event must fire even when the request fails. Use `finally` (JS/C#) or `ensure` (Ruby) blocks.

### Defensive Wrapping

A logging failure must never crash your application. Wrap logger calls so exceptions in the logging code itself are caught and swallowed.

### TypeScript Pattern

```typescript
try {
  // ... request handling
} catch (error) {
  ctx.wideEvent.error_class = error.constructor.name;
  ctx.wideEvent.error_message = error.message;
  throw error;
} finally {
  try {
    ctx.wideEvent.duration_ms = Date.now() - start;
    logger.info(ctx.wideEvent, "request completed");
  } catch {
    // Never let logging crash the app
  }
}
```

### Ruby Pattern

```ruby
begin
  # ... request handling
rescue => e
  wide_event[:error_class] = e.class.name
  wide_event[:error_message] = e.message
  raise
ensure
  wide_event[:duration_ms] = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000).round
  begin
    logger.info("request completed", **wide_event)
  rescue StandardError
    # Never let logging crash the app
  end
end
```

### C# Pattern

```csharp
try
{
    // ... request handling
}
catch (Exception ex)
{
    wideEvent["ErrorClass"] = ex.GetType().Name;
    wideEvent["ErrorMessage"] = ex.Message;
    throw;
}
finally
{
    try
    {
        wideEvent["DurationMs"] = stopwatch.ElapsedMilliseconds;
        Log.Information("Request completed {@WideEvent}", wideEvent);
    }
    catch
    {
        // Never let logging crash the app
    }
}
```

## 6. Security

- **Never log secrets** — API keys, tokens, passwords, connection strings
- **Never log PII** — email addresses, phone numbers, IP addresses (unless required and consented)
- **Redact sensitive fields** — if you must reference them, log a hash or masked version
- **Audit your wide event schema** — review what fields are being attached, especially from request headers or bodies

## 7. Why This Matters

When investigating a production incident, you need to answer questions like:
- "Which users were affected?"
- "How long did the slow requests take?"
- "What was different about the failing requests?"

With scattered logs, answering these questions requires correlating dozens of log lines across multiple files. With wide events, you filter one field and get the full picture in a single row.

**Investigation drill-down with wide events:**
1. Filter by `status = 500` → see all failed requests
2. Group by `error_class` → identify the most common failure
3. Filter by `error_class = "TimeoutError"` → see all timeout failures
4. Look at `duration_ms`, `path`, `user_id` → understand the pattern

## 8. Common Pitfalls

| Pitfall | Problem | Fix |
|---------|---------|-----|
| Scattered logs | Hard to correlate, noisy, expensive | Consolidate into one wide event |
| Missing finally/ensure | Wide event never fires on failure | Always emit in finally/ensure block |
| String interpolation | Not queryable, inconsistent format | Use structured key-value pairs |
| Multiple loggers | Inconsistent format, hard to configure | One logger per service/class |
| Logging secrets | Security breach | Redact or omit sensitive fields |
| Too many log levels | Noise, confusion about what to use | Stick to INFO + ERROR |
| Missing request ID | Cannot trace a single request | Add in middleware |
| Nested objects | Hard to query in most log tools | Prefer flat structures |

## 9. Examples

### TypeScript — pino + Hono Middleware

```typescript
import { Hono } from "hono";
import pino from "pino";

const logger = pino({ level: "info" });

type WideEvent = Record<string, unknown>;

// Middleware: build wide event context per request
function wideEventMiddleware() {
  return async (c: any, next: () => Promise<void>) => {
    const start = Date.now();
    const wideEvent: WideEvent = {
      request_id: c.req.header("x-request-id") || crypto.randomUUID(),
      method: c.req.method,
      path: c.req.path,
      user_agent: c.req.header("user-agent"),
    };

    // Store on context for handlers to enrich
    c.set("wideEvent", wideEvent);

    try {
      await next();
      wideEvent.status = c.res.status;
    } catch (error: any) {
      wideEvent.status = 500;
      wideEvent.error_class = error.constructor.name;
      wideEvent.error_message = error.message;
      throw error;
    } finally {
      try {
        wideEvent.duration_ms = Date.now() - start;
        logger.info(wideEvent, "request completed");
      } catch {
        // Never let logging crash the app
      }
    }
  };
}

const app = new Hono();
app.use("*", wideEventMiddleware());

app.post("/api/orders", async (c) => {
  const wideEvent = c.get("wideEvent") as WideEvent;
  const body = await c.req.json();

  // Handler only adds business context
  wideEvent.user_id = body.userId;
  wideEvent.order_id = body.orderId;
  wideEvent.action = "create_order";
  wideEvent.item_count = body.items?.length;

  const order = await createOrder(body);
  wideEvent.order_total = order.total;

  return c.json(order, 201);
});
```

### TypeScript — pino + Express Middleware

```typescript
import express from "express";
import pino from "pino";

const logger = pino({ level: "info" });

// Extend Express Request to carry wide event
declare global {
  namespace Express {
    interface Request {
      wideEvent: Record<string, unknown>;
    }
  }
}

function wideEventMiddleware(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const start = Date.now();
  req.wideEvent = {
    request_id: req.headers["x-request-id"] || crypto.randomUUID(),
    method: req.method,
    path: req.path,
    user_agent: req.headers["user-agent"],
  };

  // Capture status on response finish
  res.on("finish", () => {
    try {
      req.wideEvent.status = res.statusCode;
      req.wideEvent.duration_ms = Date.now() - start;
      logger.info(req.wideEvent, "request completed");
    } catch {
      // Never let logging crash the app
    }
  });

  next();
}

const app = express();
app.use(wideEventMiddleware);

app.post("/api/orders", async (req, res) => {
  req.wideEvent.user_id = req.body.userId;
  req.wideEvent.action = "create_order";

  const order = await createOrder(req.body);
  req.wideEvent.order_total = order.total;

  res.status(201).json(order);
});
```

### Rails — Semantic Logger + Rack Middleware

```ruby
# config/application.rb
config.rails_semantic_logger.format = :json
config.log_tags = {
  request_id: :request_id,
  ip: :remote_ip
}
```

```ruby
# app/middleware/wide_event_middleware.rb
class WideEventMiddleware
  include SemanticLogger::Loggable

  def initialize(app)
    @app = app
  end

  def call(env)
    start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    request = ActionDispatch::Request.new(env)
    wide_event = {
      request_id: request.request_id,
      method: request.method,
      path: request.path,
      user_agent: request.user_agent
    }

    # Store on request env for controllers to enrich
    env["wide_event"] = wide_event

    begin
      status, headers, body = @app.call(env)
      wide_event[:status] = status
      [status, headers, body]
    rescue => e
      wide_event[:status] = 500
      wide_event[:error_class] = e.class.name
      wide_event[:error_message] = e.message
      raise
    ensure
      wide_event[:duration_ms] = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000).round
      begin
        logger.info("request completed", **wide_event)
      rescue StandardError
        # Never let logging crash the app
      end
    end
  end
end

# config/application.rb
config.middleware.use WideEventMiddleware
```

```ruby
# app/controllers/application_controller.rb
class ApplicationController < ActionController::Base
  include SemanticLogger::Loggable

  private

  def wide_event
    request.env["wide_event"] ||= {}
  end
end

# app/controllers/orders_controller.rb
class OrdersController < ApplicationController
  def create
    wide_event[:user_id] = current_user.id
    wide_event[:action] = "create_order"

    order = Order.create!(order_params)
    wide_event[:order_id] = order.id
    wide_event[:order_total] = order.total

    render json: order, status: :created
  end
end
```

### Rails — around_action Alternative

For controller-level wide events without Rack middleware:

```ruby
class ApplicationController < ActionController::Base
  include SemanticLogger::Loggable

  around_action :emit_wide_event

  private

  def wide_event
    @wide_event ||= {
      request_id: request.request_id,
      method: request.method,
      path: request.path,
      user_agent: request.user_agent,
      user_id: current_user&.id
    }
  end

  def emit_wide_event
    start = Process.clock_gettime(Process::CLOCK_MONOTONIC)
    yield
    wide_event[:status] = response.status
  rescue => e
    wide_event[:status] = 500
    wide_event[:error_class] = e.class.name
    wide_event[:error_message] = e.message
    raise
  ensure
    wide_event[:duration_ms] = ((Process.clock_gettime(Process::CLOCK_MONOTONIC) - start) * 1000).round
    begin
      logger.info("request completed", **wide_event)
    rescue StandardError
      # Never let logging crash the app
    end
  end
end
```

### .NET 8 — Serilog + Custom WideEventMiddleware

```csharp
// Program.cs
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .WriteTo.Console(new Serilog.Formatting.Json.JsonFormatter())
    .CreateLogger();

builder.Host.UseSerilog();

var app = builder.Build();

app.UseMiddleware<WideEventMiddleware>();
app.MapControllers();

app.Run();
```

```csharp
// Middleware/WideEventMiddleware.cs
using System.Diagnostics;
using Serilog;
using Serilog.Context;

public class WideEventMiddleware
{
    private readonly RequestDelegate _next;

    public WideEventMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var stopwatch = Stopwatch.StartNew();
        var wideEvent = new Dictionary<string, object?>
        {
            ["RequestId"] = context.TraceIdentifier,
            ["Method"] = context.Request.Method,
            ["Path"] = context.Request.Path.Value,
            ["UserAgent"] = context.Request.Headers.UserAgent.ToString()
        };

        // Store in HttpContext.Items for controllers to enrich
        context.Items["WideEvent"] = wideEvent;

        try
        {
            await _next(context);
            wideEvent["Status"] = context.Response.StatusCode;
        }
        catch (Exception ex)
        {
            wideEvent["Status"] = 500;
            wideEvent["ErrorClass"] = ex.GetType().Name;
            wideEvent["ErrorMessage"] = ex.Message;
            throw;
        }
        finally
        {
            try
            {
                stopwatch.Stop();
                wideEvent["DurationMs"] = stopwatch.ElapsedMilliseconds;

                using (LogContext.PushProperty("WideEvent", wideEvent, destructureObjects: true))
                {
                    Log.Information("Request completed {@WideEvent}", wideEvent);
                }
            }
            catch
            {
                // Never let logging crash the app
            }
        }
    }
}
```

```csharp
// Controllers/OrdersController.cs
using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private Dictionary<string, object?> WideEvent =>
        HttpContext.Items["WideEvent"] as Dictionary<string, object?>
        ?? new Dictionary<string, object?>();

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
    {
        WideEvent["UserId"] = request.UserId;
        WideEvent["Action"] = "create_order";

        var order = await _orderService.CreateAsync(request);
        WideEvent["OrderId"] = order.Id;
        WideEvent["OrderTotal"] = order.Total;

        return CreatedAtAction(nameof(Get), new { id = order.Id }, order);
    }
}
```

### .NET 8 — Using Serilog.AspNetCore Request Logging

For simpler setups, use the built-in `UseSerilogRequestLogging` middleware which already condenses HTTP request logs into a single event:

```csharp
// Program.cs
using Serilog;

var builder = WebApplication.CreateBuilder(args);

Log.Logger = new LoggerConfiguration()
    .Enrich.FromLogContext()
    .WriteTo.Console(new Serilog.Formatting.Json.JsonFormatter())
    .CreateLogger();

builder.Host.UseSerilog();

var app = builder.Build();

// Single request completion event with timing, status, and path
app.UseSerilogRequestLogging(options =>
{
    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("RequestId", httpContext.TraceIdentifier);
        diagnosticContext.Set("UserAgent", httpContext.Request.Headers.UserAgent.ToString());
    };
});

app.MapControllers();
app.Run();
```

```csharp
// Controllers/OrdersController.cs — enrich via IDiagnosticContext
using Microsoft.AspNetCore.Mvc;
using Serilog;

[ApiController]
[Route("api/[controller]")]
public class OrdersController : ControllerBase
{
    private readonly IDiagnosticContext _diagnosticContext;

    public OrdersController(IDiagnosticContext diagnosticContext)
    {
        _diagnosticContext = diagnosticContext;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateOrderRequest request)
    {
        _diagnosticContext.Set("UserId", request.UserId);
        _diagnosticContext.Set("Action", "create_order");

        var order = await _orderService.CreateAsync(request);
        _diagnosticContext.Set("OrderId", order.Id);
        _diagnosticContext.Set("OrderTotal", order.Total);

        return CreatedAtAction(nameof(Get), new { id = order.Id }, order);
    }
}
```
