import * as core from '@opentelemetry/core';
import { ExportResult } from '@opentelemetry/core';
import { ReadableSpan, SpanExporter } from '@opentelemetry/sdk-trace-base';

export class ConsoleStringExporter implements SpanExporter {
  export(spans: ReadableSpan[], resultCallback: (result: ExportResult) => void): void {
    return this._sendSpans(spans, resultCallback);
  }

  public shutdown() {
    this._sendSpans([]);
    return Promise.resolve();
  }

  protected _exportInfo(span: ReadableSpan) {
    return {
      traceId: span.spanContext().traceId,
      parentId: span.parentSpanId,
      name: span.name,
      id: span.spanContext().spanId,
      kind: span.kind,
      timestamp: core.hrTimeToMicroseconds(span.startTime),
      duration: core.hrTimeToMicroseconds(span.duration),
      attributes: span.attributes,
      status: span.status,
      events: span.events,
    };
  }

  protected _sendSpans(spans: ReadableSpan[], resultCallback?: (result: ExportResult) => void): void {
    for (const span of spans) {
      console.log(JSON.stringify(this._exportInfo(span)));
    }
    if (resultCallback) {
      return resultCallback({ code: core.ExportResultCode.SUCCESS });
    }
  }
}
