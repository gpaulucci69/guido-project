import { createServer } from "node:http";
const port = Number(process.env.PORT ?? 3001);
createServer((request, response) => {
  if (
    request.url === "/healthz" ||
    request.url === "/livez" ||
    request.url === "/readyz"
  ) {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ status: "ok" }));
    return;
  }
  response.writeHead(404);
  response.end();
}).listen(port);
