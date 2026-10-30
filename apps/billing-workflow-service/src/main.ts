import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { problemFromError } from '../../../packages/http/src/problem-details.js';
import { healthResponse, isHealthPath } from '../../../packages/observability/src/health-controller.js';
import { ChangeAuditService, InMemoryAuditSink } from './audit/change-audit.service.js';
import { ObligationController } from './obligations/presentation/obligation.controller.js';
import { ObligationService } from './obligations/application/obligation.service.js';
import { InMemoryObligationRepository } from './obligations/infrastructure/obligation.repository.js';
import { PaymentController } from './payments/presentation/payment.controller.js';
import { PaymentService, InMemoryPaymentRepository } from './payments/application/payment.service.js';

const tenantId = 'demo-tenant';
const audit = new ChangeAuditService(new InMemoryAuditSink());
const obligations = new ObligationService(new InMemoryObligationRepository(), audit);
const payments = new PaymentService(new InMemoryPaymentRepository(), audit);
const obligationController = new ObligationController(obligations);
function json(response: ServerResponse, status: number, value: unknown) {
  response.writeHead(status, { 'content-type': 'application/json', 'access-control-allow-origin': '*' });
  response.end(JSON.stringify(value, (_, item) => item?.constructor?.name === 'ArsMoney' ? item.toString() : item));
}
async function readBody(request: IncomingMessage): Promise<Record<string, unknown>> { let raw = ''; for await (const chunk of request) raw += chunk; return raw ? JSON.parse(raw) as Record<string, unknown> : {}; }
function parts(url: string) { return new URL(url, 'http://localhost').pathname.split('/').filter(Boolean); }
const server = createServer(async (request, response) => {
  if (request.method === 'OPTIONS') { response.writeHead(204, { 'access-control-allow-origin': '*', 'access-control-allow-headers': 'content-type' }); response.end(); return; }
  if (isHealthPath(request.url)) { json(response, 200, healthResponse('billing-workflow-service')); return; }
  if (!request.url?.startsWith('/api/v1/')) { json(response, 404, { error: 'Ruta no encontrada' }); return; }
  const path = parts(request.url); const resource = path[2]; const id = path[3];
  try {
    if (resource === 'obligations' && request.method === 'GET' && !id) { json(response, 200, await obligations.list({ tenantId })); return; }
    if (resource === 'obligations' && request.method === 'POST' && !id) { const input = await readBody(request); const result = await obligationController.create({ ...input, tenantId } as never); json(response, result.status, result.body); return; }
    if (resource === 'obligations' && request.method === 'GET' && id) { const result = await obligationController.detail(tenantId, id); json(response, result.status, result.body); return; }
    if (resource === 'obligations' && request.method === 'POST' && id && path[4] === 'cancel') { const input = await readBody(request); const result = await obligationController.cancel(tenantId, id, String(input.reason ?? '')); json(response, result.status, result.body); return; }
    if (resource === 'obligations' && request.method === 'POST' && id && path[4] === 'payments') { const input = await readBody(request); const result = await new PaymentController(payments).report({ ...input, tenantId, obligationId: id, receiptFileName: String(input.receiptFileName ?? 'manual.pdf'), receiptFileSizeBytes: Number(input.receiptFileSizeBytes ?? 0), receiptFileMimeType: (input.receiptFileMimeType ?? 'application/pdf') as 'application/pdf' } as never); json(response, result.status, result.body); return; }
    if (resource === 'payments' && request.method === 'GET' && id) { json(response, 200, await payments.list(tenantId, id)); return; }
    if (resource === 'payments' && request.method === 'POST' && id && path[4] === 'validate') { const result = await new PaymentController(payments).validate(tenantId, id); if (result.status === 200) { const payment = result.body as { obligationId: string; amount: string }; await obligations.applyValidatedPayment(tenantId, payment.obligationId, payment.amount); } json(response, result.status, result.body); return; }
    if (resource === 'payments' && request.method === 'POST' && id && path[4] === 'reject') { const input = await readBody(request); const result = await new PaymentController(payments).reject(tenantId, id, String(input.reason ?? '')); json(response, result.status, result.body); return; }
    json(response, 404, { error: 'Ruta no encontrada' });
  } catch (error) { const result = problemFromError(error); json(response, result.status, result); }
});
const port = Number(process.env.PORT ?? 3000);
server.listen(port, '0.0.0.0', () => console.log(`billing-workflow-service listening on ${port}`));
