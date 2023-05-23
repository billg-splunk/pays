const uuid = require('uuid/v4');
const pino = require('pino');

const { context, getSpan, setSpan, SpanKind, trace } = require('@opentelemetry/api');

const logger = pino({
  name: 'paymentservice',
  messageKey: 'message',
  changeLevelName: 'severity',
  useLevelLabels: true,
  timestamp: pino.stdTimeFunctions.unixTime,
  mixin() {
    const span = getSpan(context.active());
    if (!span) {
      return {};
    }
    const { traceId, spanId } = span.context();

    return {
      trace_id: traceId.slice(-16), // convert to 64-bit format
      span_id: spanId,
      'service.name': 'paymentservice'
    };
  },
});

module.exports = async function check(request) {

}