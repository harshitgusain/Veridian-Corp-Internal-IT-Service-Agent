import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  auditLogs,
  employeeRequests,
  generatedTickets,
  getAIServiceStatus,
  historicalTickets,
  policies,
  processRequestWithAgent,
} from './server/policyEngine.ts';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get('/api/health', (req, res) => {
    const aiStatus = getAIServiceStatus();
    res.json({
      status: 'ok',
      service: 'Veridian Corp Internal IT Service Portal',
      engineAvailable: aiStatus.available,
      engine: aiStatus.status,
    });
  });

  // Knowledge base policies
  app.get('/api/policies', (req, res) => {
    res.json({ policies });
  });

  // Employee requests (all 15 from Data Pack)
  app.get('/api/employee-requests', (req, res) => {
    res.json({ employeeRequests });
  });

  // All tickets (historical queue + session generated)
  app.get('/api/tickets', (req, res) => {
    res.json({
      historicalTickets,
      generatedTickets,
      totalCount: historicalTickets.length + generatedTickets.length,
    });
  });

  // Audit logs
  app.get('/api/audit-logs', (req, res) => {
    res.json({ auditLogs });
  });

  // Process request through Agentic Pipeline
  app.post('/api/analyze', async (req, res) => {
    try {
      const { input, employeeName, employeeEmail, requestId } = req.body;
      if (!input || typeof input !== 'string') {
        res.status(400).json({ error: 'Input text is required' });
        return;
      }

      const result = await processRequestWithAgent(
        input,
        employeeName || 'Employee',
        employeeEmail || 'employee@veridian-corp.example',
        requestId
      );
      res.json(result);
    } catch (err: any) {
      console.error('Error processing IT request:', err);
      res.status(500).json({
        error: 'Failed to process request',
        message: err?.message || 'Internal error in IT service agent engine',
      });
    }
  });

  // Reset runtime tickets/audit logs
  app.post('/api/reset-session', (req, res) => {
    generatedTickets.length = 0;
    auditLogs.length = 0;
    res.json({ message: 'Session tickets and audit logs cleared' });
  });

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Veridian IT Support Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
