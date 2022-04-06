import {
  MeterProvider,
  Meter,
  ConsoleMetricExporter
} from '@opentelemetry/sdk-metrics-base';
import { Counter } from '@opentelemetry/api-metrics';
import { SpanExporter } from '@opentelemetry/sdk-trace-base';
import { RequestHandler } from 'express';
import gql from 'graphql-tag';

export class RequestCountMeter {
  meter: Meter;
  requestCount: Counter;
  boundInstruments: Map<string, Counter>;

  constructor(meterName: string, exporter: SpanExporter) {
    console.log(exporter);
    this.meter = new MeterProvider({
      exporter: new ConsoleMetricExporter(), // this is done becuase we know that MetricExporter and SpanExporter
      interval: 1000,
    }).getMeter(meterName);

    this.requestCount = this.meter.createCounter('requests', {
      description: 'Count all incoming requests',
    });
    this.boundInstruments = new Map();
  }
  private createLabelForCounter(_query:string){
    const query = gql`${_query}`;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return query.definitions.map((defination: Record<any, any>) => defination.name.value).join(",");
  }

  public countAllRequests() {
    const middleWare: RequestHandler = (req, res, next) => {
      if(req.body.query){
        const label = this.createLabelForCounter(req.body.query);
        if (!this.boundInstruments.has(label)) {
          const labels = { operationName: label, variables: req.body.variables || {} };
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          const boundCounter = this.requestCount.bind(labels);
          this.boundInstruments.set(label, boundCounter);
        }
        const requestPath = this.boundInstruments.get(label);
        if (requestPath) {
          requestPath.add(1);
        }
      }
     
      next();
    };
    return middleWare;
  }
}
