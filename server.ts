import express from 'express';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { initialData } from './src/data/initialData';
import { AppData, Order, StoreSettings } from './src/types';

const DATA_FILE = path.join(process.cwd(), 'data_store.json');

function loadStoreData(): AppData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        modules: Array.isArray(parsed.modules) ? parsed.modules : (parsed.modules !== undefined ? [] : initialData.modules),
        categories: Array.isArray(parsed.categories) ? parsed.categories : (parsed.categories !== undefined ? [] : initialData.categories),
        products: Array.isArray(parsed.products) ? parsed.products : (parsed.products !== undefined ? [] : initialData.products),
        banners: Array.isArray(parsed.banners) ? parsed.banners : (parsed.banners !== undefined ? [] : initialData.banners),
        orders: Array.isArray(parsed.orders) ? parsed.orders : [],
        settings: { ...initialData.settings, ...(parsed.settings || {}) },
      };
    } else {
      // First boot: create the canonical persistent data_store.json file immediately
      console.log('Initializing data_store.json from bootstrap template...');
      saveStoreData(initialData);
      return initialData;
    }
  } catch (err) {
    console.error('Failed to read data file, using initial data fallback:', err);
  }
  return initialData;
}

function saveStoreData(data: AppData): boolean {
  try {
    const tempFile = `${DATA_FILE}.tmp.${Date.now()}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DATA_FILE);
    return true;
  } catch (err) {
    console.error('Failed to save data file atomically:', err);
    try {
      fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (fallbackErr) {
      console.error('Fallback save also failed:', fallbackErr);
      return false;
    }
  }
}

let storeData: AppData = loadStoreData();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes

  // Dynamic PWA Web App Manifest
  app.get('/manifest.json', (_req, res) => {
    const s = (storeData.settings || {}) as StoreSettings;
    const manifest = {
      name: s.pwa_name || s.store_name || 'Hyperlocal WhatsApp Store',
      short_name: s.pwa_short_name || 'HyperlocalApp',
      description: s.pwa_description || 'Fastest hyperlocal delivery store directly integrated with WhatsApp.',
      start_url: '/',
      display: 'standalone',
      background_color: s.pwa_bg_color || '#f8fafc',
      theme_color: s.pwa_theme_color || '#059669',
      orientation: 'portrait-primary',
      icons: [
        {
          src: s.pwa_icon || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&auto=format&fit=crop&q=80',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: s.pwa_icon || 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=500&auto=format&fit=crop&q=80',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable'
        }
      ]
    };
    res.setHeader('Content-Type', 'application/json');
    res.json(manifest);
  });

  // Get full app data
  app.get('/api/data', (_req, res) => {
    res.json(storeData);
  });

  // Save/Update full app data
  app.post('/api/data', (req, res) => {
    try {
      if (req.body && typeof req.body === 'object') {
        const incoming = req.body as Partial<AppData>;
        storeData = {
          modules: Array.isArray(incoming.modules) ? incoming.modules : storeData.modules,
          categories: Array.isArray(incoming.categories) ? incoming.categories : storeData.categories,
          products: Array.isArray(incoming.products) ? incoming.products : storeData.products,
          banners: Array.isArray(incoming.banners) ? incoming.banners : storeData.banners,
          orders: Array.isArray(incoming.orders) ? incoming.orders : storeData.orders,
          settings: incoming.settings ? { ...storeData.settings, ...incoming.settings } : storeData.settings,
        };
        const saved = saveStoreData(storeData);
        if (!saved) {
          return res.status(500).json({ error: 'Failed to write data to disk' });
        }
        return res.json({ success: true, data: storeData });
      }
      return res.status(400).json({ error: 'Invalid payload: Expected JSON object' });
    } catch (err: any) {
      console.error('API /api/data error:', err);
      return res.status(500).json({ error: 'Internal server error: ' + (err?.message || 'Unknown') });
    }
  });

  // Place order & trigger n8n Webhook
  app.post('/api/orders', async (req, res) => {
    const newOrder: Order = req.body;
    if (!newOrder || !newOrder.order_id) {
      return res.status(400).json({ error: 'Invalid order data' });
    }

    // Add order to database
    storeData.orders = [newOrder, ...storeData.orders];
    saveStoreData(storeData);

    let webhookStatus = 'skipped';
    let webhookResponse = null;

    // Trigger n8n Webhook if configured
    if (storeData.settings.n8n_webhook_url) {
      try {
        const response = await fetch(storeData.settings.n8n_webhook_url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'order_created',
            order: newOrder,
            store_name: storeData.settings.store_name,
            timestamp: new Date().toISOString(),
          }),
        });

        webhookStatus = response.ok ? 'success' : 'failed';
        try {
          webhookResponse = await response.text();
        } catch {
          webhookResponse = null;
        }
      } catch (err: any) {
        console.error('Error triggering n8n webhook:', err);
        webhookStatus = 'error: ' + (err?.message || 'Network error');
      }
    }

    res.json({
      success: true,
      order: newOrder,
      webhookStatus,
      webhookResponse,
    });
  });

  // Export full backup JSON
  app.get('/api/backup', (_req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=hyperlocal_backup_${Date.now()}.json`);
    res.send(JSON.stringify(storeData, null, 2));
  });

  // Restore backup JSON
  app.post('/api/restore', (req, res) => {
    try {
      const backup: AppData = req.body;
      if (!backup || typeof backup !== 'object') {
        return res.status(400).json({ error: 'Invalid backup file structure' });
      }
      storeData = {
        modules: Array.isArray(backup.modules) ? backup.modules : initialData.modules,
        categories: Array.isArray(backup.categories) ? backup.categories : initialData.categories,
        products: Array.isArray(backup.products) ? backup.products : initialData.products,
        banners: Array.isArray(backup.banners) ? backup.banners : initialData.banners,
        orders: Array.isArray(backup.orders) ? backup.orders : [],
        settings: { ...initialData.settings, ...(backup.settings || {}) },
      };
      saveStoreData(storeData);
      return res.json({ success: true, data: storeData, message: 'Database successfully restored!' });
    } catch (err: any) {
      return res.status(500).json({ error: 'Failed to restore: ' + err.message });
    }
  });

  // Update Settings (n8n Webhook, etc.)
  app.post('/api/settings', (req, res) => {
    if (req.body && typeof req.body === 'object') {
      storeData.settings = { ...storeData.settings, ...req.body };
      saveStoreData(storeData);
      return res.json({ success: true, settings: storeData.settings, data: storeData });
    }
    return res.status(400).json({ error: 'Invalid settings' });
  });

  // Test n8n Webhook trigger
  app.post('/api/test-webhook', async (_req, res) => {
    if (!storeData.settings.n8n_webhook_url) {
      return res.status(400).json({ error: 'n8n Webhook URL is not configured' });
    }
    try {
      const response = await fetch(storeData.settings.n8n_webhook_url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'test_trigger',
          message: 'n8n Webhook test connection from Hyperlocal Store',
          timestamp: new Date().toISOString(),
        }),
      });
      const text = await response.text();
      return res.json({ success: response.ok, status: response.status, responseText: text });
    } catch (err: any) {
      return res.status(500).json({ error: 'Webhook connection failed: ' + err.message });
    }
  });

  // Vite Middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true as const,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
