import { createServer } from "./app.js";

const { server, config } = createServer();

server.listen(config.port, () => {
  console.log(`MunchAI running on http://localhost:${config.port}`);
});

