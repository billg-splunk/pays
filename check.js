const axios = require('axios');

const uuid = require('uuid/v4');
const pino = require('pino');

const { context, getSpan, setSpan, SpanKind, trace } = require('@opentelemetry/api');

const creditCheckServiceUrl = 'http://creditcheckservice:8888';

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
  try {
    //const location = ‘USA’;
    //const response = await axios.get(`${creditCheckServiceUrl}/test?location=${location}`);
    const response = await axios.get(`${creditCheckServiceUrl}/check?customernum=123456`);
    logger.info(
      { 'type': 'INFO',
        'operation': 'credit-check-service call'
      },
      response.data
    );
  } catch (error) {
    logger.error(
      { 'type': 'ERROR'
      },
      response.data
    );
  }
}
