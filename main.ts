Deno.serve(async (req) => {
  const url = new URL(req.url);
  const match = url.pathname.match(/^\/inventory\/(\d{17})$/);

  if (!match) return Response.json({ error: "Not found" }, { status: 404 });

  const secret = req.headers.get("x-proxy-secret");
  if (secret !== Deno.env.get("PROXY_SECRET")) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const steamId = match[1];
  try {
    const res = await fetch(
      `https://steamcommunity.com/inventory/${steamId}/730/2?l=english&count=5000`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          "Accept": "application/json, text/plain, */*",
          "Referer": `https://steamcommunity.com/profiles/${steamId}/inventory/`,
        },
      }
    );
    const text = await res.text();
    return new Response(text, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 502 });
  }
});
