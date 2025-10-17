#!/usr/bin/env tsx
/**
 * Automated Knowledge Ingestion Pipeline
 * 
 * Automatically ingests documentation from:
 * - GitHub repositories
 * - Stack Overflow Q&A
 * - API documentation
 * - Developer blogs & tutorials
 * - Community forums (Reddit, Dev.to)
 * 
 * Uses MCP tools: Exa (search), BrowserBase (scraping), Context7 (library docs)
 * Stores in: Chroma vector database
 * 
 * Based on MCP research findings for optimal cost and performance
 */

import { ChromaClient } from 'chromadb';
import { DefaultEmbeddingFunction } from '@chroma-core/default-embed';
import { createHash } from 'crypto';
import cron from 'node-cron';
import { writeFileSync, existsSync, mkdirSync } from 'fs';

// ===== Configuration =====
const CONFIG = {
  chromaUrl: 'http://localhost:8000',
  collectionName: 'easypost-knowledge',
  batchSize: 1000,
  concurrency: 5,
  logDir: './logs',
  maxRetries: 3,
};

// ===== Types =====
interface Source {
  type: 'url' | 'exa-search' | 'context7' | 'github-api';
  data: string | SearchQuery;
  category: string;
  priority?: number; // 1 = high, 5 = low
  updateFrequency?: 'daily' | 'weekly' | 'monthly';
}

interface SearchQuery {
  query: string;
  numResults: number;
}

interface Document {
  content: string;
  url: string;
  toolUsed: string;
  metadata: Record<string, any>;
}

interface IngestionLog {
  timestamp: string;
  totalSources: number;
  totalDocuments: number;
  successfulFetches: number;
  errors: number;
  toolUsage: Record<string, number>;
  duration: number;
}

// ===== COMPREHENSIVE SOURCE DEFINITIONS =====

const AUTOMATED_SOURCES: Source[] = [
  // === GITHUB REPOSITORIES (Priority 1 - Daily) ===
  {
    type: 'url',
    data: 'https://raw.githubusercontent.com/EasyPost/easypost-node/master/README.md',
    category: 'github-readme',
    priority: 1,
    updateFrequency: 'daily'
  },
  {
    type: 'url',
    data: 'https://raw.githubusercontent.com/EasyPost/easypost-node/master/CHANGELOG.md',
    category: 'github-changelog',
    priority: 1,
    updateFrequency: 'daily'
  },
  {
    type: 'url',
    data: 'https://raw.githubusercontent.com/EasyPost/easypost-node/master/CONTRIBUTING.md',
    category: 'github-contributing',
    priority: 2,
    updateFrequency: 'weekly'
  },
  {
    type: 'url',
    data: 'https://raw.githubusercontent.com/EasyPost/easypost-node/master/UPGRADING.md',
    category: 'github-upgrade-guide',
    priority: 1,
    updateFrequency: 'monthly'
  },
  
  // === STACK OVERFLOW (Priority 2 - Daily) ===
  {
    type: 'exa-search',
    data: { 
      query: 'EasyPost international shipping customs site:stackoverflow.com', 
      numResults: 20 
    },
    category: 'stackoverflow-shipping',
    priority: 2,
    updateFrequency: 'daily'
  },
  {
    type: 'exa-search',
    data: { 
      query: 'EasyPost address validation best practices site:stackoverflow.com', 
      numResults: 15 
    },
    category: 'stackoverflow-validation',
    priority: 2,
    updateFrequency: 'daily'
  },
  {
    type: 'exa-search',
    data: { 
      query: 'EasyPost TypeScript Node.js examples site:stackoverflow.com', 
      numResults: 15 
    },
    category: 'stackoverflow-examples',
    priority: 2,
    updateFrequency: 'daily'
  },
  
  // === API DOCUMENTATION (Priority 1 - Weekly) ===
  {
    type: 'exa-search',
    data: { 
      query: 'EasyPost API reference documentation shipments',
      numResults: 10 
    },
    category: 'api-docs-shipments',
    priority: 1,
    updateFrequency: 'weekly'
  },
  {
    type: 'exa-search',
    data: { 
      query: 'EasyPost API customs forms international guide', 
      numResults: 8 
    },
    category: 'api-docs-customs',
    priority: 1,
    updateFrequency: 'weekly'
  },
  {
    type: 'exa-search',
    data: { 
      query: 'EasyPost webhook events documentation', 
      numResults: 5 
    },
    category: 'api-docs-webhooks',
    priority: 2,
    updateFrequency: 'weekly'
  },
  
  // === TUTORIALS & BLOGS (Priority 3 - Weekly) ===
  {
    type: 'exa-search',
    data: { 
      query: 'EasyPost shipping automation tutorial 2024 2025', 
      numResults: 12 
    },
    category: 'tutorials-automation',
    priority: 3,
    updateFrequency: 'weekly'
  },
  {
    type: 'exa-search',
    data: { 
      query: 'TypeScript MCP server development guide', 
      numResults: 10 
    },
    category: 'tutorials-mcp',
    priority: 3,
    updateFrequency: 'weekly'
  },
  {
    type: 'exa-search',
    data: { 
      query: 'Chroma vector database RAG pipeline tutorial', 
      numResults: 8 
    },
    category: 'tutorials-rag',
    priority: 3,
    updateFrequency: 'weekly'
  },
  
  // === COMMUNITY FORUMS (Priority 4 - Weekly) ===
  {
    type: 'exa-search',
    data: { 
      query: 'EasyPost shipping integration site:reddit.com', 
      numResults: 15 
    },
    category: 'community-reddit',
    priority: 4,
    updateFrequency: 'weekly'
  },
  {
    type: 'exa-search',
    data: { 
      query: 'shipping API comparison EasyPost Shippo site:dev.to', 
      numResults: 10 
    },
    category: 'community-devto',
    priority: 4,
    updateFrequency: 'weekly'
  },
  
  // === GITHUB ISSUES & DISCUSSIONS (Priority 3 - Weekly) ===
  {
    type: 'exa-search',
    data: { 
      query: 'EasyPost common issues solutions site:github.com/EasyPost', 
      numResults: 20 
    },
    category: 'github-issues',
    priority: 3,
    updateFrequency: 'weekly'
  },
  
  // === LIBRARY DOCUMENTATION via Context7 (Priority 1 - Monthly) ===
  {
    type: 'context7',
    data: '/chroma-core/chroma',
    category: 'library-docs-chroma',
    priority: 1,
    updateFrequency: 'monthly'
  }
];

// ===== AUTOMATED INGESTION CLASS =====

class AutomatedIngestionPipeline {
  private client: ChromaClient;
  private collection: any;
  private stats = {
    totalFetched: 0,
    totalErrors: 0,
    toolUsage: { direct: 0, exa: 0, browserbase: 0, context7: 0 }
  };
  
  constructor() {
    this.client = new ChromaClient({ path: CONFIG.chromaUrl });
    this.ensureLogDir();
  }
  
  private ensureLogDir() {
    if (!existsSync(CONFIG.logDir)) {
      mkdirSync(CONFIG.logDir, { recursive: true });
    }
  }
  
  async initialize() {
    const embedder = new DefaultEmbeddingFunction();
    
    try {
      this.collection = await this.client.getCollection({
        name: CONFIG.collectionName,
        embeddingFunction: embedder
      });
      console.log('✅ Using existing collection:', CONFIG.collectionName);
    } catch {
      this.collection = await this.client.createCollection({
        name: CONFIG.collectionName,
        metadata: {
          description: 'Automated knowledge base with multi-source ingestion',
          created_at: new Date().toISOString()
        },
        embeddingFunction: embedder
      });
      console.log('✅ Created new collection:', CONFIG.collectionName);
    }
    
    const count = await this.collection.count();
    console.log(`📊 Current documents: ${count}`);
  }
  
  // Generate SHA256 ID from content
  private generateId(content: string): string {
    return createHash('sha256').update(content).digest('hex').substring(0, 32);
  }
  
  // Fetch via direct HTTP (for GitHub raw, simple pages)
  private async directFetch(url: string): Promise<Document> {
    this.stats.toolUsage.direct++;
    console.log(`  📥 Direct fetch: ${url}`);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const content = await response.text();
    return {
      content,
      url,
      toolUsed: 'direct-fetch',
      metadata: {
        fetchedAt: new Date().toISOString(),
        httpStatus: response.status
      }
    };
  }
  
  // Fetch via Exa MCP (NOTE: This is a placeholder - actual MCP call would be in Cursor/Claude)
  private async fetchViaExa(query: string, numResults: number): Promise<Document[]> {
    this.stats.toolUsage.exa++;
    console.log(`  🔍 Exa search: "${query}" (${numResults} results)`);
    
    // In production with actual MCP integration:
    // const results = await callMCPTool('exa', 'web_search_exa', { query, numResults });
    
    // For now, return placeholder showing what would happen
    console.log(`     ℹ️  In production, this would call Exa MCP to search and return ${numResults} URLs`);
    console.log(`     ℹ️  Then fetch content from each URL using get_contents_exa`);
    
    return [];
  }
  
  // Fetch via Context7 MCP for library documentation
  private async fetchViaContext7(libraryId: string): Promise<Document> {
    this.stats.toolUsage.context7++;
    console.log(`  📚 Context7 library docs: ${libraryId}`);
    
    // In production:
    // const docs = await callMCPTool('Context7', 'get-library-docs', { 
    //   context7CompatibleLibraryID: libraryId,
    //   tokens: 5000
    // });
    
    console.log(`     ℹ️  In production, this would fetch library docs via Context7 MCP`);
    
    return {
      content: `[Placeholder: Context7 docs for ${libraryId}]`,
      url: `context7://${libraryId}`,
      toolUsed: 'context7-mcp',
      metadata: { fetchedAt: new Date().toISOString() }
    };
  }
  
  // Resolve sources to documents
  private async resolveSources(sources: Source[]): Promise<Document[]> {
    const documents: Document[] = [];
    
    for (const source of sources) {
      try {
        if (source.type === 'url') {
          const doc = await this.directFetch(source.data as string);
          documents.push({
            ...doc,
            metadata: { ...doc.metadata, category: source.category, priority: source.priority }
          });
        }
        else if (source.type === 'exa-search') {
          const searchData = source.data as SearchQuery;
          const docs = await this.fetchViaExa(searchData.query, searchData.numResults);
          documents.push(...docs.map(d => ({
            ...d,
            metadata: { ...d.metadata, category: source.category, priority: source.priority }
          })));
        }
        else if (source.type === 'context7') {
          const doc = await this.fetchViaContext7(source.data as string);
          documents.push({
            ...doc,
            metadata: { ...doc.metadata, category: source.category, priority: source.priority }
          });
        }
      } catch (error: any) {
        this.stats.totalErrors++;
        console.error(`  ❌ Error processing ${source.type} source:`, error.message);
      }
    }
    
    return documents;
  }
  
  // Main ingestion method
  async runIngestion(sourceFilter?: 'daily' | 'weekly' | 'monthly') {
    const startTime = Date.now();
    console.log('\n🤖 ===== AUTOMATED INGESTION STARTED =====\n');
    console.log(`📅 Filter: ${sourceFilter || 'ALL'}`);
    console.log(`⏰ Time: ${new Date().toISOString()}\n`);
    
    await this.initialize();
    
    // Filter sources by update frequency
    let sources = AUTOMATED_SOURCES;
    if (sourceFilter) {
      sources = sources.filter(s => s.updateFrequency === sourceFilter);
      console.log(`📋 Filtered to ${sources.length}/${AUTOMATED_SOURCES.length} ${sourceFilter} sources\n`);
    }
    
    // Resolve all sources to documents
    console.log('🔄 Resolving sources...\n');
    const documents = await this.resolveSources(sources);
    console.log(`\n📥 Resolved ${documents.length} documents from ${sources.length} sources\n`);
    
    if (documents.length === 0) {
      console.log('⚠️  No documents to ingest');
      return;
    }
    
    // Batch ingest with deduplication
    console.log('💾 Ingesting to Chroma...\n');
    await this.batchIngest(documents);
    
    // Generate and save log
    const duration = Date.now() - startTime;
    const log = this.generateLog(sources.length, documents.length, duration);
    this.saveLog(log);
    
    console.log('\n✅ ===== INGESTION COMPLETE =====\n');
    console.log(`⏱️  Duration: ${(duration/1000).toFixed(2)}s`);
    console.log(`📊 Documents: ${documents.length}`);
    console.log(`❌ Errors: ${this.stats.totalErrors}`);
    console.log(`💾 Log saved to: ${CONFIG.logDir}/ingestion-${log.timestamp}.json\n`);
  }
  
  // Batch ingest with deduplication
  private async batchIngest(documents: Document[]) {
    const BATCH_SIZE = CONFIG.batchSize;
    let processed = 0;
    
    for (let i = 0; i < documents.length; i += BATCH_SIZE) {
      const batch = documents.slice(i, Math.min(i + BATCH_SIZE, documents.length));
      
      // Generate SHA256 IDs (auto-dedupe)
      const ids = batch.map(d => this.generateId(d.content));
      
      // Upsert to Chroma
      await this.collection.upsert({
        ids,
        documents: batch.map(d => d.content),
        metadatas: batch.map((d, idx) => ({
          source_url: d.url,
          source_category: d.metadata.category,
          tool_used: d.toolUsed,
          content_hash: ids[idx],
          indexed_at: new Date().toISOString(),
          priority: d.metadata.priority || 3,
          ...d.metadata
        }))
      });
      
      processed += batch.length;
      console.log(`  ✅ Batch ${Math.floor(i/BATCH_SIZE) + 1}: ${processed}/${documents.length} documents`);
    }
  }
  
  // Generate ingestion log
  private generateLog(totalSources: number, totalDocs: number, duration: number): IngestionLog {
    return {
      timestamp: new Date().toISOString(),
      totalSources,
      totalDocuments: totalDocs,
      successfulFetches: this.stats.totalFetched,
      errors: this.stats.totalErrors,
      toolUsage: this.stats.toolUsage,
      duration
    };
  }
  
  // Save log to file
  private saveLog(log: IngestionLog) {
    const timestamp = log.timestamp.replace(/[:.]/g, '-');
    const logPath = `${CONFIG.logDir}/ingestion-${timestamp}.json`;
    writeFileSync(logPath, JSON.stringify(log, null, 2));
  }
  
  // Get collection stats
  async getStats() {
    const count = await this.collection.count();
    return {
      totalDocuments: count,
      ingestionStats: this.stats,
      collection: CONFIG.collectionName
    };
  }
}

// ===== SCHEDULING FUNCTIONS =====

async function runDaily() {
  console.log('\n⏰ DAILY INGESTION (2 AM)');
  const pipeline = new AutomatedIngestionPipeline();
  await pipeline.runIngestion('daily');
}

async function runWeekly() {
  console.log('\n⏰ WEEKLY INGESTION (Monday 3 AM)');
  const pipeline = new AutomatedIngestionPipeline();
  await pipeline.runIngestion('weekly');
}

async function runMonthly() {
  console.log('\n⏰ MONTHLY INGESTION (1st of month, 4 AM)');
  const pipeline = new AutomatedIngestionPipeline();
  await pipeline.runIngestion('monthly');
}

async function setupScheduler() {
  console.log('🤖 ===== AUTOMATED KNOWLEDGE INGESTION SCHEDULER =====\n');
  console.log('Schedules:');
  console.log('  📅 Daily (2 AM)    : GitHub repos, Stack Overflow Q&A');
  console.log('  📅 Weekly (Mon 3AM): API docs, Tutorials, Community');
  console.log('  📅 Monthly (1st 4AM): Library documentation updates');
  console.log('');
  console.log('✅ Scheduler started. Press Ctrl+C to stop.\n');
  
  // Daily ingestion - GitHub + Stack Overflow
  cron.schedule('0 2 * * *', runDaily);
  
  // Weekly ingestion - API docs, Tutorials, Community
  cron.schedule('0 3 * * 1', runWeekly);
  
  // Monthly ingestion - Library docs
  cron.schedule('0 4 1 * *', runMonthly);
  
  // Keep process alive
  await new Promise(() => {});
}

// ===== SPECIFIC INGESTION FUNCTIONS =====

async function ingestGitHub() {
  console.log('\n📦 GITHUB INGESTION\n');
  const githubSources = AUTOMATED_SOURCES.filter(s => s.category.startsWith('github'));
  
  const pipeline = new AutomatedIngestionPipeline();
  await pipeline.initialize();
  
  const docs = await pipeline['resolveSources'](githubSources);
  if (docs.length > 0) {
    await pipeline['batchIngest'](docs);
    console.log(`✅ Ingested ${docs.length} GitHub documents`);
  }
}

async function ingestStackOverflow() {
  console.log('\n💬 STACK OVERFLOW INGESTION\n');
  const soSources = AUTOMATED_SOURCES.filter(s => s.category.startsWith('stackoverflow'));
  
  const pipeline = new AutomatedIngestionPipeline();
  await pipeline.initialize();
  
  const docs = await pipeline['resolveSources'](soSources);
  if (docs.length > 0) {
    await pipeline['batchIngest'](docs);
    console.log(`✅ Ingested ${docs.length} Stack Overflow documents`);
  }
}

async function ingestAPIDocs() {
  console.log('\n📚 API DOCUMENTATION INGESTION\n');
  const apiSources = AUTOMATED_SOURCES.filter(s => s.category.startsWith('api-docs'));
  
  const pipeline = new AutomatedIngestionPipeline();
  await pipeline.initialize();
  
  const docs = await pipeline['resolveSources'](apiSources);
  if (docs.length > 0) {
    await pipeline['batchIngest'](docs);
    console.log(`✅ Ingested ${docs.length} API documentation documents`);
  }
}

async function ingestAll() {
  console.log('\n🌐 FULL INGESTION (ALL SOURCES)\n');
  const pipeline = new AutomatedIngestionPipeline();
  await pipeline.runIngestion();
}

// ===== CLI INTERFACE =====

const command = process.argv[2];

(async () => {
  try {
    switch (command) {
      case 'once':
        await ingestAll();
        break;
      case 'schedule':
        await setupScheduler();
        break;
      case 'github':
        await ingestGitHub();
        break;
      case 'stackoverflow':
        await ingestStackOverflow();
        break;
      case 'api-docs':
        await ingestAPIDocs();
        break;
      case 'daily':
        await runDaily();
        break;
      case 'weekly':
        await runWeekly();
        break;
      case 'monthly':
        await runMonthly();
        break;
      default:
        console.log('🤖 Automated Knowledge Ingestion Pipeline\n');
        console.log('Usage:');
        console.log('  tsx scripts/automated-ingestion.ts once           # Run full ingestion now');
        console.log('  tsx scripts/automated-ingestion.ts schedule       # Start scheduler (stays running)');
        console.log('  tsx scripts/automated-ingestion.ts github         # Ingest GitHub only');
        console.log('  tsx scripts/automated-ingestion.ts stackoverflow  # Ingest Stack Overflow only');
        console.log('  tsx scripts/automated-ingestion.ts api-docs       # Ingest API docs only');
        console.log('  tsx scripts/automated-ingestion.ts daily          # Run daily ingestion');
        console.log('  tsx scripts/automated-ingestion.ts weekly         # Run weekly ingestion');
        console.log('  tsx scripts/automated-ingestion.ts monthly        # Run monthly ingestion');
        console.log('');
        console.log('📅 Schedules:');
        console.log('  Daily (2 AM)     : GitHub repos + Stack Overflow');
        console.log('  Weekly (Mon 3 AM): API docs + Tutorials + Community');
        console.log('  Monthly (1st 4 AM): Library documentation');
        console.log('');
        console.log('Sources configured: ' + AUTOMATED_SOURCES.length);
        console.log('  - GitHub: ' + AUTOMATED_SOURCES.filter(s => s.category.startsWith('github')).length);
        console.log('  - Stack Overflow: ' + AUTOMATED_SOURCES.filter(s => s.category.startsWith('stackoverflow')).length);
        console.log('  - API Docs: ' + AUTOMATED_SOURCES.filter(s => s.category.startsWith('api-docs')).length);
        console.log('  - Tutorials: ' + AUTOMATED_SOURCES.filter(s => s.category.startsWith('tutorials')).length);
        console.log('  - Community: ' + AUTOMATED_SOURCES.filter(s => s.category.startsWith('community')).length);
        console.log('  - Library Docs: ' + AUTOMATED_SOURCES.filter(s => s.type === 'context7').length);
    }
    
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
})();

