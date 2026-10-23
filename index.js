export default {
  async fetch(request) {
    const url = new URL(request.url);
    
    // If no URL provided, show a search box
    if (!url.searchParams.get('url')) {
      return new Response(`
        <html>
          <head>
            <title>Proxy</title>
            <style>
              body { background:#1a1a1a; color:white; font-family:sans-serif; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; }
              form { width:80%; max-width:600px; }
              input { width:100%; padding:15px; font-size:18px; border:none; border-radius:8px; margin-bottom:10px; box-sizing:border-box; }
              button { width:100%; padding:15px; font-size:18px; background:#00c7b7; color:white; border:none; border-radius:8px; cursor:pointer; }
            </style>
          </head>
          <body>
            <form action="/" method="GET">
              <input type="text" name="url" placeholder="Enter URL (e.g., https://reddit.com)" required>
              <button type="submit">Browse</button>
            </form>
          </body>
        </html>
      `, { headers: { 'Content-Type': 'text/html' } });
    }

    // Get the target URL
    let targetUrl = url.searchParams.get('url');
    if (!targetUrl.startsWith('http')) {
      targetUrl = 'https://' + targetUrl;
    }

    try {
      // Fetch the content
      const response = await fetch(targetUrl);
      const body = await response.text();
      
      // Rewrite links so they stay in your proxy
      const rewrittenBody = body.replace(/href=["']([^"']*?)["']/g, `href="?url=$1"`);
      const finalBody = rewrittenBody.replace(/src=["']([^"']*?)["']/g, `src="?url=$1"`);

      return new Response(finalBody, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Access-Control-Allow-Origin": "*"
        }
      });
    } catch (error) {
      return new Response(`Error: ${error.message}`, { status: 500 });
    }
  }
};
