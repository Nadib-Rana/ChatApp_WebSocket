export const buildWsUrl = (apiUrl: string, token: string) => {
  let url = apiUrl;
  // ensure no trailing slash
  if (url.endsWith("/")) url = url.slice(0, -1);
  url = url.replace(/^http/i, (m) => (m === "http" ? "ws" : "wss"));
  // server.ts attaches websocket to same server, so connect to server origin
  return `${url}/?token=${encodeURIComponent(token)}`;
};

export const connectWebSocket = (apiUrl: string, token: string, onMessage: (data: any) => void) => {
  const wsUrl = buildWsUrl(apiUrl, token);
  const ws = new WebSocket(wsUrl);

  ws.onopen = () => {
    console.log("WS connected");
  };

  ws.onmessage = (ev) => {
    try {
      const data = JSON.parse(ev.data);
      onMessage(data);
    } catch (err) {
      console.warn("Invalid WS message", err);
    }
  };

  ws.onclose = () => console.log("WS closed");
  ws.onerror = (e) => console.error("WS error", e);

  return ws;
};
