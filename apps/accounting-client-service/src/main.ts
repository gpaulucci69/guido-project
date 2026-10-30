import { createServer } from "node:http";
import {
  healthResponse,
  isHealthPath,
} from "../../../packages/observability/src/health-controller.js";
const port = Number(process.env.PORT ?? 3002);
createServer((request, response) => {
  if (isHealthPath(request.url)) {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify(healthResponse("accounting-client-service")));
    return;
  }
  response.writeHead(200, { "content-type": "application/json" });
  response.end(JSON.stringify({ status: "ok" }));
}).listen(port);
