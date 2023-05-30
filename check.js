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
    
    // Changes for QEP
    // (1) Randon number to decide if it's:
    // - 0 to 5 --> Normal transaction
    // - 6, 7 or 8 --> featureFlag = newTaxCode, newSpeedAlgo, and advancedMode
    // - 9 --> hipsterCard workflows
    iNum = Math.floor(Math.random() * 9) + 1;
    // (2) Random number for rest of the customer number 6 digits
    iCust = Math.floor((Math.random() * 900000) + 100000);
    // (3) Concatenate and stringify
    customerNum = "" + iCust + iNum;
    // (4) Add feature flag
    switch(iNum) {
      case 6:
        featureFlag = 'newTaxCode'
	break;
      case 7:
        featureFlag = 'newSpeedAlgo'
	break;
      case 8:
        featureFlag = 'advancedMode'
	break;
      default:
        featureFlag = 'none'
    }
    // (5) Add attribute to span
    const grpcActiveSpan = getSpan(context.active());
    grpcActiveSpan.setAttributes({
      'featureFlag': featureFlag
    });
    // (6) Call creditcheckservice with customer num
    const response = await axios.get(`${creditCheckServiceUrl}/check?customernum=${customerNum}`);
    // (7) Log it out
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
