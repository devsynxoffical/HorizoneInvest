const http = require("http");
const app = require("./app");
const env = require("./config/env");
const { initializeSocket } = require("./socket");
const db = require("./db/knex");
const {
  creditPendingDailyProfitsForAllUsers,
  settleMaturedPrincipalsForAllUsers,
} = require("./services/investmentProfitService");

const server = http.createServer(app);
initializeSocket(server);

let autoProfitTimer = null;
async function runAutoProfitCycle() {
  try {
    await creditPendingDailyProfitsForAllUsers(db);
    await settleMaturedPrincipalsForAllUsers(db);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Auto profit cycle failed:", error.message);
  }
}

server.listen(env.port, () => {
  // eslint-disable-next-line no-console
  console.log(`HorizonInvest backend running on port ${env.port}`);
  const intervalMinutes = Math.max(1, Number(process.env.AUTO_PROFIT_INTERVAL_MINUTES || 10));
  const enabled = String(process.env.AUTO_PROFIT_ENABLED || "true").toLowerCase() !== "false";
  if (enabled) {
    runAutoProfitCycle();
    autoProfitTimer = setInterval(runAutoProfitCycle, intervalMinutes * 60 * 1000);
    // eslint-disable-next-line no-console
    console.log(`Auto profit scheduler enabled (every ${intervalMinutes} min)`);
  }
});

server.on("close", () => {
  if (autoProfitTimer) clearInterval(autoProfitTimer);
});
