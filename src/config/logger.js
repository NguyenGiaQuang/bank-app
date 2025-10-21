import pino from 'pino';
const logger = pino({ transport: { target: 'pino-pretty' }, level: 'info' });
export default logger;
