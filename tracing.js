const { NodeTracerProvider } = require('@opentelemetry/node');
const { B3MultiPropagator } = require('@opentelemetry/propagator-b3');
const { ZipkinExporter } = require('@opentelemetry/exporter-zipkin');
const { GrpcInstrumentation } = require('@opentelemetry/instrumentation-grpc');
const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
const { BatchSpanProcessor, ConsoleSpanExporter } = require('@opentelemetry/tracing');
const { registerInstrumentations } = require('@opentelemetry/instrumentation');

const provider = new NodeTracerProvider();
provider.register({
  propagator: new B3MultiPropagator(),
});

registerInstrumentations({
  instrumentations: [
    new GrpcInstrumentation(),
    new HttpInstrumentation(),
  ],
});

const exporter = new ZipkinExporter({
  serviceName: 'paymentservice',
  url: process.env.SIGNALFX_ENDPOINT_URL,
});

provider.addSpanProcessor(new BatchSpanProcessor(exporter));

const CONSOLE_SPAN = process.env['CONSOLE_SPAN'];
if (CONSOLE_SPAN === 'true') {
  provider.addSpanProcessor(new BatchSpanProcessor(new ConsoleSpanExporter(), { bufferTimeout: 1000 }));
}
