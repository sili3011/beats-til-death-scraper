import Bottleneck from 'bottleneck';
import pRetry from 'p-retry';
import fs from 'node:fs/promises';
import path from 'node:path';
import { log } from './log.js';

const limiter = new Bottleneck({ minTime: 200 }); // 5 req/s

export async function httpGetJson(url: string, etagPath?: string) {
  const headers: Record<string,string> = {};
  if (etagPath) {
    try {
      const etag = await fs.readFile(etagPath, 'utf8');
      headers['If-None-Match'] = etag.trim();
    } catch {}
  }
  
  return limiter.schedule(() =>
    pRetry(async () => {
      log(`Fetching: ${url}`);
      const res = await fetch(url, { headers });
      
      if (res.status === 304) {
        log(`Not modified: ${url}`);
        return { status: 304 as const, json: null };
      }
      
      if (!res.ok) {
        if (res.status === 404) {
          log(`Not found (404): ${url}`);
          return { status: 404 as const, json: null };
        }
        throw new Error(`HTTP ${res.status} ${url}`);
      }
      
      const etag = res.headers.get('etag');
      const json = await res.json();
      
      if (etag && etagPath) {
        await fs.mkdir(path.dirname(etagPath), { recursive: true });
        await fs.writeFile(etagPath, etag);
      }
      
      log(`Success: ${url} (${res.status})`);
      return { status: 200 as const, json };
    }, { retries: 3, onFailedAttempt: (error) => log(`Retry ${error.attemptNumber}: ${error.message}`) })
  );
}

export async function httpGetText(url: string, etagPath?: string) {
  const headers: Record<string, string> = {};
  if (etagPath) {
    try {
      const etag = await fs.readFile(etagPath, 'utf8');
      headers['If-None-Match'] = etag.trim();
    } catch {}
  }

  return limiter.schedule(() =>
    pRetry(async () => {
      log(`Fetching: ${url}`);
      const res = await fetch(url, { headers });

      if (res.status === 304) {
        log(`Not modified: ${url}`);
        return { status: 304 as const, text: null };
      }
      if (!res.ok) {
        if (res.status === 404) {
          log(`Not found (404): ${url}`);
          return { status: 404 as const, text: null };
        }
        throw new Error(`HTTP ${res.status} ${url}`);
      }

      const etag = res.headers.get('etag');
      const text = await res.text();

      if (etag && etagPath) {
        await fs.mkdir(path.dirname(etagPath), { recursive: true });
        await fs.writeFile(etagPath, etag);
      }

      log(`Success: ${url} (${res.status})`);
      return { status: 200 as const, text };
    }, { retries: 3, onFailedAttempt: (error) => log(`Retry ${error.attemptNumber}: ${error.message}`) })
  );
}



