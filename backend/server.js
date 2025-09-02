const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3002;

const cors = require('cors');
const ORIGIN = 'https://websiteaudit.stradinger.me';

app.use(cors({
  origin: ORIGIN,
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

app.options('*', cors({
  origin: ORIGIN,
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));


// Middleware
app.use(cors());
app.use(express.json());

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// WCAG-Scan Proxy Endpoint
app.post('/api/wcag-scan', async (req, res) => {
  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: 'URL fehlt' });
  }

  try {
    const n8nUrl = `https://workflow.stradinger.me/webhook/wcag-scan?url=${encodeURIComponent(url)}`;
    console.log(`Calling n8n webhook: ${n8nUrl}`);

    const n8nRes = await fetch(n8nUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'WebAudit-Backend/1.0'
      }
      // Kein timeout mehr - Anfrage läuft so lange wie nötig
    });

    if (!n8nRes.ok) {
      const text = await n8nRes.text().catch(() => "");
      console.error(`n8n Error: ${n8nRes.status} - ${text}`);
      return res.status(502).json({
        error: 'n8n Webhook Fehler',
        status: n8nRes.status,
        body: text
      });
    }

    const responseText = await n8nRes.text();

    // JSON 1:1 durchreichen
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.status(200).send(responseText);

  } catch (error) {
    console.error('WCAG-Scan Error:', error);

    // Spezielle Behandlung für verschiedene Fehlertypen
    let errorMessage = 'Interner Server-Fehler';
    let errorDetails = error.message;

    if (error.code === 'TIMEOUT' || error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
      errorMessage = 'Timeout: Die Analyse dauert länger als erwartet';
      errorDetails = 'Der n8n-Workflow hat nicht rechtzeitig geantwortet. Dies kann bei komplexen Websites vorkommen.';
    } else if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
      errorMessage = 'Verbindungsfehler zum Analyse-Service';
      errorDetails = 'Der n8n-Workflow konnte nicht erreicht werden.';
    }

    res.status(500).json({
      error: errorMessage,
      message: errorDetails,
      code: error.code || 'UNKNOWN'
    });
  }
});

// SEO-Audit Proxy Endpoint
app.post('/api/seo-audit', async (req, res) => {
  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: 'URL fehlt' });
  }

  try {
    // Korrigierte URL basierend auf dem n8n Workflow
    const n8nUrl = `https://workflow.stradinger.me/webhook/seo-audit?url=${encodeURIComponent(url)}`;
    console.log(`Calling SEO n8n webhook: ${n8nUrl}`);

    const n8nRes = await fetch(n8nUrl, {
      method: 'GET',
      headers: {
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'User-Agent': 'WebAudit-Backend/1.0'
      }
      // Kein timeout mehr - Anfrage läuft so lange wie nötig
    });

    if (!n8nRes.ok) {
      const text = await n8nRes.text().catch(() => "");
      console.error(`SEO n8n Error: ${n8nRes.status} - ${text}`);
      return res.status(502).json({
        error: 'SEO n8n Webhook Fehler',
        status: n8nRes.status,
        body: text
      });
    }

    const contentType = n8nRes.headers.get('content-type') || '';

    // Der SEO Workflow gibt HTML zurück (basierend auf dem Markdown-Node)
    if (contentType.includes('text/html') || contentType.includes('application/xml')) {
      const htmlContent = await n8nRes.text();
      res.json({
        html: htmlContent, // Frontend prüft zuerst auf html
        htmlContent: htmlContent, // Fallback
        contentType: contentType
      });
    } else {
      // Fallback für andere Content-Types
      const responseText = await n8nRes.text();
      try {
        const jsonData = JSON.parse(responseText);
        res.json(jsonData);
      } catch (parseError) {
        // Wenn es kein JSON ist, geben wir es als HTML zurück
        res.json({
          html: responseText, // Frontend prüft zuerst auf html
          htmlContent: responseText, // Fallback
          contentType: 'text/html'
        });
      }
    }

  } catch (error) {
    console.error('SEO-Scan Error:', error);

    // Spezielle Behandlung für verschiedene Fehlertypen
    let errorMessage = 'Interner Server-Fehler';
    let errorDetails = error.message;

    if (error.code === 'TIMEOUT' || error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
      errorMessage = 'Timeout: Die SEO-Analyse dauert länger als erwartet';
      errorDetails = 'Der n8n-Workflow hat nicht rechtzeitig geantwortet. Dies kann bei komplexen Websites vorkommen.';
    } else if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
      errorMessage = 'Verbindungsfehler zum SEO-Service';
      errorDetails = 'Der n8n-Workflow konnte nicht erreicht werden.';
    }

    res.status(500).json({
      error: errorMessage,
      message: errorDetails,
      code: error.code || 'UNKNOWN'
    });
  }
});

// Statement Proxy Endpoint
app.post('/api/statement-generation', async (req, res) => {
  const { url } = req.body || {};

  if (!url) {
    return res.status(400).json({ error: 'URL fehlt' });
  }

  try {
    const n8nUrl = `https://workflow.stradinger.me/webhook/ally-statement?url=${encodeURIComponent(url)}`;
    console.log(`Calling Statement n8n webhook: ${n8nUrl}`);

    const n8nRes = await fetch(n8nUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/pdf',
        'User-Agent': 'WebAudit-Backend/1.0'
      }
      // Kein timeout mehr - Anfrage läuft so lange wie nötig
    });

    if (!n8nRes.ok) {
      const text = await n8nRes.text().catch(() => "");
      console.error(`Statement n8n Error: ${n8nRes.status} - ${text}`);
      return res.status(502).json({
        error: 'Statement n8n Webhook Fehler',
        status: n8nRes.status,
        body: text
      });
    }

    // Prüfe Content-Type
    const contentType = n8nRes.headers.get('content-type') || '';

    if (contentType.includes('application/pdf')) {
      // PDF empfangen - erstelle Data URL
      const pdfBuffer = await n8nRes.arrayBuffer();
      const base64Pdf = Buffer.from(pdfBuffer).toString('base64');
      const dataUrl = `data:application/pdf;base64,${base64Pdf}`;

      // Gebe JSON mit pdfUrl zurück
      res.json({
        pdfUrl: dataUrl,
        contentType: 'application/pdf',
        size: pdfBuffer.byteLength
      });

    } else {
      // Fallback: Wenn JSON zurückkommt
      const responseText = await n8nRes.text();
      try {
        const jsonData = JSON.parse(responseText);
        res.json(jsonData);
      } catch (parseError) {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.status(200).send(responseText);
      }
    }

  } catch (error) {
    console.error('Statement-Generation Error:', error);

    // Spezielle Behandlung für verschiedene Fehlertypen
    let errorMessage = 'Interner Server-Fehler';
    let errorDetails = error.message;

    if (error.code === 'TIMEOUT' || error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
      errorMessage = 'Timeout: Die Barrierefreiheitserklärung dauert länger als erwartet';
      errorDetails = 'Der n8n-Workflow hat nicht rechtzeitig geantwortet. Dies kann bei komplexen Websites vorkommen.';
    } else if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND') {
      errorMessage = 'Verbindungsfehler zum Statement-Service';
      errorDetails = 'Der n8n-Workflow konnte nicht erreicht werden.';
    }

    res.status(500).json({
      error: errorMessage,
      message: errorDetails,
      code: error.code || 'UNKNOWN'
    });
  }
});

const http = require('http');
const server = http.createServer(app);
server.headersTimeout = 650000;
server.requestTimeout = 650000;
server.listen(PORT, () => console.log(`listen ${PORT}`));

