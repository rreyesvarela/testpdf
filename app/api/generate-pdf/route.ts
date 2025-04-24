// The following code represents the refactored solution to integrate 
// the agenda-pdf functionality into generate-pdf

import puppeteer, { Browser, Page } from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import { NextRequest } from 'next/server';
import { ApiResponse } from '@/app/[id]/organigrama/OrganigramaApiData';

export type AreaType = 'Rev' | 'Adh' | 'AF' | 'RHH';

const routeToParam: { [key in AreaType]: string } = {
  'Rev': "revestimientos",
  'Adh': 'adhesivos',
  'AF': 'administracion-y-finanzas',
  'RHH': 'recursos-humanos'
};

// Interfaces para las respuestas de API - from agenda-pdf.ts
interface Employee {
  userId: number;
  userName: string;
  name: string;
  lastName: string;
  puestoOuId: string | number;
  positionName: string;
  puestoName?: string;
  photo64base: string;
  redFlag: boolean;
  vacantFlag: boolean;
}

interface Successor {
  userIdSuccessor: number | string;
  userNameSuccessor: string;
  term: string;
  photo64base: string;
  fullName: string;
  app: string;
  idPuesto: string;
}

// Estructura para mantener el orden de las páginas - from agenda-pdf.ts
interface OrderedPdfSection {
  name: string;
  buffer: Uint8Array;
  order: number;
}

// Sistema de caché mejorado - from agenda-pdf.ts
class PdfCache {
  private cache: Map<string, {
    buffer: Uint8Array;
    timestamp: number;
    url: string;
  }> = new Map();
  private maxAge: number = 15 * 60 * 1000; // 15 minutos
  
  get(url: string): Uint8Array | null {
    const entry = this.cache.get(url);
    if (!entry) return null;
    
    const now = Date.now();
    if (now - entry.timestamp > this.maxAge) {
      this.cache.delete(url);
      return null;
    }
    
    return entry.buffer;
  }
  
  set(url: string, buffer: Uint8Array): void {
    this.cache.set(url, {
      buffer,
      timestamp: Date.now(),
      url
    });
    
    // Si el caché es demasiado grande, eliminar las entradas más antiguas
    if (this.cache.size > 80) { // Reducido a 80
      const entries = Array.from(this.cache.entries());
      const oldest = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, 15); 
      
      for (const [key] of oldest) {
        this.cache.delete(key);
      }
    }
  }
}

// Interfaces para la matriz de sucesión - from generate-pdf.ts
interface PotentialSuccessorsData {
  userIdSuccessor: string;
  userNameSuccessor: string;
  term: string;
  photo64base: string;
  fullName: string;
  app: string;
  idPuesto: string;
}

interface PotentialSuccessorsForData {
  ouIdPuestoEmployee: string;
  term: string;
  positionName: string;
  app: string;
}

interface UserData {
  userId: number;
  userName: string;
  // Otros campos que pueda tener
}

interface ResponseDataMatrixSuccession {
  user: UserData;
  potentialSuccessors: PotentialSuccessorsData[];
  potentialSuccessorFor: PotentialSuccessorsForData[];
}

// Configuraciones con tiempos de espera optimizados - from agenda-pdf.ts
const PAGE_LOAD_TIMEOUT = 120000; // Aumentado a 120 segundos para agenda
const CONTENT_WAIT_TIME = 6000;   // from generate-pdf.ts
const DEFAULT_WAIT_TIME = 10000;  // Aumentado el tiempo base para agenda

// Tiempos de espera optimizados según tipo de página - from agenda-pdf.ts
const WAIT_TIMES = {
  'fichaTalento': 6000,     // Aumentado
  'app': 6000,              // Aumentado
  'cartaReemplazo': 12000,  // Aumentado significativamente
  'temas': 3000,            
  'agenda': 12000,          // Aumentado
  'directores': 10000,      // Aumentado
  'default': 10000          // Aumentado
};

// Configuración de paralelismo - from agenda-pdf.ts
const SUCCESSORS_CONCURRENCY = 2;  // Reducido a 2 para mejor estabilidad
const EMPLOYEE_BATCH_SIZE = 2;     // Reducido a 2 para mejor estabilidad
const PAGE_POOL_SIZE = 8;          // Reducido para evitar sobrecarga
const CONCURRENCY_LIMIT = 6;       // from generate-pdf.ts

// Configuración Puppeteer optimizada - combined from both files
const PUPPETEER_ARGS = [
  '--no-sandbox',
  '--disable-setuid-sandbox',
  '--disable-dev-shm-usage',
  '--disable-extensions',
  '--disable-background-timer-throttling',
  '--disable-backgrounding-occluded-windows',
  '--disable-breakpad',
  '--disable-component-update',
  '--no-first-run',
  '--disable-features=site-per-process',
  '--js-flags=--max-old-space-size=2048',
  '--window-size=2400,1080',
];

// Pool de páginas mejorado - from agenda-pdf.ts
class PagePool {
  private browser: Browser;
  private availablePages: Page[] = [];
  private maxSize: number;
  private blockedResources: string[] = [
    'google-analytics', 'analytics', 'googletagmanager',
    'facebook', 'twitter', 'linkedin', 'tracking',
    'advertisement', 'ads', 'doubleclick'
  ];

  constructor(browser: Browser, maxSize: number = 10) {
    this.browser = browser;
    this.maxSize = maxSize;
  }

  async getPage(): Promise<Page> {
    if (this.availablePages.length > 0) {
      return this.availablePages.pop()!;
    } else {
      const page = await this.browser.newPage();
      await page.setDefaultNavigationTimeout(PAGE_LOAD_TIMEOUT);
      
      // Bloquear recursos no esenciales
      await page.setRequestInterception(true);
      page.on('request', (req) => {
        const url = req.url().toLowerCase();
        const resourceType = req.resourceType();
        
        if (
          (resourceType === 'media' ||
          resourceType === 'font' ||
          this.blockedResources.some(term => url.includes(term)))
        ) {
          req.abort();
        } else {
          req.continue();
        }
      });
      
      // Establecer viewport más grande para mejor renderizado
      await page.setViewport({
        width: 2400,
        height: 1080,
        deviceScaleFactor: 1
      });
      
      return page;
    }
  }

  async releasePage(page: Page): Promise<void> {
    if (this.availablePages.length < this.maxSize) {
      try {
        await page.evaluate(() => {
          try {
            window.stop();
            // Limpiar memoria
            if (window.gc) window.gc();
          } catch {
            // Ignorar errores
          }
        }).catch(() => {});
        
        this.availablePages.push(page);
      } catch  {
        await page.close().catch(() => {});
      }
    } else {
      await page.close().catch(() => {});
    }
  }

  async close(): Promise<void> {
    await Promise.all(this.availablePages.map(page => page.close().catch(() => {})));
    this.availablePages = [];
  }
}

// Tipo para representar todos los URLs de un empleado - from generate-pdf.ts
interface EmployeeUrlPair {
  employeeId: number;
  employeeName: string;
  employeeIndex: number; 
  urls: {
    type: string;
    url: string;
    description?: string;
  }[];
}

// Función para procesar empleados en lotes paralelos - from generate-pdf.ts
async function processEmployeesInBatches(
  employeePairs: EmployeeUrlPair[],
  processEmployeePair: (pair: EmployeeUrlPair, index: number, total: number) => Promise<{
    buffers: Array<{type: string, buffer: Uint8Array | null, success: boolean, description?: string}>
    success: boolean
  }>,
  batchSize: number
): Promise<Array<{
  employeeId: number,
  employeeName: string,
  employeeIndex: number,
  buffers: Array<{type: string, buffer: Uint8Array | null, success: boolean, description?: string}>,
  success: boolean
}>> {
  const results: Array<{
    employeeId: number,
    employeeName: string,
    employeeIndex: number,
    buffers: Array<{type: string, buffer: Uint8Array | null, success: boolean, description?: string}>,
    success: boolean
  }> = [];
  
  for (let i = 0; i < employeePairs.length; i += batchSize) {
    const batch = employeePairs.slice(i, i + batchSize);
    
    try {
      // Crear promesas para este lote, pasando información de progreso
      const batchPromises = batch.map((pair, batchIndex) => {
        const globalIndex = i + batchIndex;
        return processEmployeePair(pair, globalIndex, employeePairs.length)
          .then(result => ({
            employeeId: pair.employeeId,
            employeeName: pair.employeeName,
            employeeIndex: pair.employeeIndex,
            ...result
          }))
          .catch(error => {
            console.error(`Error procesando empleado ${pair.employeeName}:`, error);
            
            return {
              employeeId: pair.employeeId,
              employeeName: pair.employeeName,
              employeeIndex: pair.employeeIndex,
              buffers: pair.urls.map(url => ({
                type: url.type,
                buffer: null,
                success: false,
                description: url.description
              })),
              success: false
            };
          });
      });
      
      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);
    } catch (error) {
      console.error(`Error procesando lote de empleados:`, error);
      
      // Registrar cada empleado como fallido
      for (const pair of batch) {
        results.push({
          employeeId: pair.employeeId,
          employeeName: pair.employeeName,
          employeeIndex: pair.employeeIndex,
          buffers: pair.urls.map(url => ({
            type: url.type,
            buffer: null,
            success: false,
            description: url.description
          })),
          success: false
        });
      }
    }
  }
  
  // Ordenar por índice original
  return results.sort((a, b) => a.employeeIndex - b.employeeIndex);
}

/**
 * Genera el PDF de una página específica con caché y manejo de errores mejorado - from agenda-pdf.ts
 */
async function generatePagePdf(
  pagePool: PagePool, 
  pageUrl: string, 
  pageName: string,
  pdfCache: PdfCache,
  overrideWaitTime?: number
): Promise<Uint8Array | null> {
  // Revisar caché primero
  const cachedPdf = pdfCache.get(pageUrl);
  if (cachedPdf) {
    console.log(`[${new Date().toISOString()}] Usando versión en caché para ${pageName}`);
    return cachedPdf;
  }
  
  // Determinar tiempo de espera según tipo de página o usar el override
  let waitTime = overrideWaitTime || DEFAULT_WAIT_TIME;
  
  if (!overrideWaitTime) {
    if (pageName.includes('Ficha')) waitTime = WAIT_TIMES.fichaTalento;
    else if (pageName.includes('APP')) waitTime = WAIT_TIMES.app;
    else if (pageName.includes('Carta')) waitTime = WAIT_TIMES.cartaReemplazo;
    else if (pageName.includes('Temas')) waitTime = WAIT_TIMES.temas;
    else if (pageName.includes('Agenda')) waitTime = WAIT_TIMES.agenda;
    else if (pageName.includes('Directores')) waitTime = WAIT_TIMES.directores;
  }
  
  const page = await pagePool.getPage();
  
  try {
    console.log(`[${new Date().toISOString()}] Cargando ${pageName} (espera: ${waitTime}ms)`);
    
    // Navegar a la URL con reintento
    let success = false;
    let attempts = 0;
    const maxAttempts = 2;
    
    while (!success && attempts < maxAttempts) {
      try {
        attempts++;
        
        // Limpiar caché y cookies antes de navegar
        if (attempts > 1) {
          await page.evaluate(() => {
            try {
              // Intentar limpiar para evitar problemas de carga
              localStorage.clear();
              sessionStorage.clear();
              if (window.gc) window.gc();
            } catch {}
          }).catch(() => {});
        }
        
        // Navegar con timeout aumentado
        await page.goto(pageUrl, { 
          waitUntil: 'networkidle2', // Cambiado a networkidle2 que es menos estricto
          timeout: PAGE_LOAD_TIMEOUT 
        });
        
        success = true;
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error en intento ${attempts}/${maxAttempts} para ${pageName}:`, error);
        if (attempts >= maxAttempts) throw error;
        // Esperamos antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    // Esperar tiempo específico para el tipo de página
    await new Promise(resolve => setTimeout(resolve, waitTime));
    
    // Verificar si la página se ha cargado correctamente (específico para carta de reemplazo)
    if (pageName.includes('Carta')) {
      // Esperar a que elementos clave estén cargados
      await page.evaluate(() => {
        return new Promise((resolve) => {
          // Comprobar cada 500ms si los elementos clave están cargados
          const checkInterval = setInterval(() => {
            const contentLoaded = document.querySelector('.carta-container') || 
                                  document.querySelector('.carta-reemplazo') || 
                                  document.querySelector('.card');
            
            if (contentLoaded) {
              clearInterval(checkInterval);
              resolve(true);
            }
          }, 500);
          
          // Establecer un tiempo máximo de espera
          setTimeout(() => {
            clearInterval(checkInterval);
            resolve(false);
          }, 8000);
        });
      }).catch(() => false);
      
      // Esperar un poco más tras la comprobación
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Generar el PDF con configuración mejorada
    const pdfBuffer = await page.pdf({
      format: 'A4',
      landscape: true,
      printBackground: true,
      margin: { top: '5mm', right: '5mm', bottom: '5mm', left: '5mm' },
      scale: 0.72,
      displayHeaderFooter: false,
      preferCSSPageSize: true,
      width: '297mm',
      timeout: 60000, // 60 segundos para la generación del PDF
    });
    
    console.log(`[${new Date().toISOString()}] PDF de ${pageName} generado correctamente`);
    
    // Guardar en caché
    pdfCache.set(pageUrl, pdfBuffer);
    
    return pdfBuffer;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error generando PDF de ${pageName}:`, error);
    return null;
  } finally {
    // Devolver la página al pool
    await pagePool.releasePage(page);
  }
}

/**
 * Añade un buffer PDF al documento PDF principal - from agenda-pdf.ts
 */
async function addPdfToDocument(pdfDoc: PDFDocument, pdfBuffer: Uint8Array, pageName: string): Promise<void> {
  try {
    console.log(`[${new Date().toISOString()}] Añadiendo ${pageName} al PDF final`);
    
    const loadedPdf = await PDFDocument.load(pdfBuffer);
    const pages = await pdfDoc.copyPages(loadedPdf, loadedPdf.getPageIndices());
    
    for (const page of pages) {
      pdfDoc.addPage(page);
    }
    
    console.log(`[${new Date().toISOString()}] ${pageName} añadido correctamente`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error al añadir ${pageName} al PDF:`, error);
  }
}

/**
 * Procesa un empleado (o manager) con control de orden, obtiene sus sucesores y genera todas las páginas de PDF necesarias
 * - from agenda-pdf.ts
 */
async function processEmployeeWithOrder(
  pagePool: PagePool, 
  baseUrl: string, 
  employee: Employee, 
  pdfCache: PdfCache,
  baseOrder: number // Orden base para este empleado
): Promise<OrderedPdfSection[]> {
  const { userId, userName, puestoOuId, name, lastName, redFlag } = employee;
  const fullName = `${name} ${lastName}`;
  const sections: OrderedPdfSection[] = [];
  
  console.log(`[${new Date().toISOString()}] Procesando: ${fullName} (ID: ${userId}, Orden: ${baseOrder}, RedFlag: ${redFlag ? 'Sí' : 'No'})`);
  
  try {
    // Asegurar que puestoOuId sea string
    const idPuesto = typeof puestoOuId === 'number' ? puestoOuId.toString() : puestoOuId;
    
    // Si el empleado tiene redFlag, generamos la página adicional primero
    if (redFlag) {
      console.log(`[${new Date().toISOString()}] Empleado ${fullName} tiene RedFlag. Generando página adicional...`);
      
      // Generar la página de organigrama especial para redFlag
      const redFlagUrl = `${baseUrl}/organigrama?bloque=2&isPDF=true&area=${routeToParam[baseUrl.split('/').pop() as AreaType]}&userId=${userId}&userName=${encodeURIComponent(userName)}`;
      
      const redFlagPdf = await generatePagePdf(
        pagePool,
        redFlagUrl,
        `Información RedFlag para ${fullName}`,
        pdfCache,
        WAIT_TIMES.default // Usamos el tiempo de espera por defecto
      );
      
      // Añadir la página de RedFlag a las secciones si se generó correctamente
      if (redFlagPdf) {
        sections.push({
          name: `RedFlag - ${fullName}`,
          buffer: redFlagPdf,
          order: baseOrder - 0.1 // Justo antes de la carta de reemplazo
        });
        console.log(`[${new Date().toISOString()}] Página RedFlag generada correctamente para ${fullName}`);
      } else {
        console.error(`[${new Date().toISOString()}] No se pudo generar la página RedFlag para ${fullName}`);
      }
    }
    
    // Paso 1: Generar carta de reemplazo con reintentos mejorados
    console.time(`Employee ${userId} Carta`);
    
    // Generar carta de reemplazo con máximo 3 intentos
    let cartaPdf = null;
    let attempts = 0;
    const maxCartaAttempts = 3;
    
    while (!cartaPdf && attempts < maxCartaAttempts) {
      attempts++;
      console.log(`[${new Date().toISOString()}] Intento ${attempts}/${maxCartaAttempts} para carta de reemplazo de ${fullName}`);
      
      // Aumentar tiempo de espera en cada reintento
      const adjustedWaitTime = WAIT_TIMES.cartaReemplazo + (attempts - 1) * 2000;
      
      cartaPdf = await generatePagePdf(
        pagePool, 
        `${baseUrl}/${userId}/cartaReemplazo?idPuesto=${idPuesto}&userName=${encodeURIComponent(userName)}&isPDF=true&name=${encodeURIComponent(fullName)}`,
        `Carta de reemplazo para ${fullName}`,
        pdfCache,
        adjustedWaitTime
      );
      
      if (!cartaPdf && attempts < maxCartaAttempts) {
        // Esperar antes de reintentar
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.timeEnd(`Employee ${userId} Carta`);
    
    // Añadir carta de reemplazo a las secciones si se generó correctamente
    if (cartaPdf) {
      sections.push({
        name: `Carta de reemplazo - ${fullName}`,
        buffer: cartaPdf,
        order: baseOrder
      });
    } else {
      console.error(`[${new Date().toISOString()}] No se pudo generar la carta de reemplazo para ${fullName} después de ${maxCartaAttempts} intentos`);
    }
    
    // Paso 2: Obtener sucesores
    console.time(`Employee ${userId} Successors Data`);
    
    const successorsUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/successors?userId=${userId}&userName=${encodeURIComponent(userName)}&idPuesto=${idPuesto}`;
    
    let successorsResponse;
    let successorsData = { data: { potentialSuccessors: [] } };
    
    try {
      successorsResponse = await fetch(successorsUrl);
      
      if (successorsResponse.ok) {
        successorsData = await successorsResponse.json();
      } else {
        console.warn(`No se pudieron obtener sucesores para ${fullName}: ${successorsResponse.status}`);
      }
    } catch (error) {
      console.error(`Error obteniendo sucesores para ${fullName}:`, error);
    }
    
    console.timeEnd(`Employee ${userId} Successors Data`);
    
    // Extraer sucesores
    const successors = successorsData.data?.potentialSuccessors || [];
    console.log(`[${new Date().toISOString()}] Se encontraron ${successors.length} sucesores para ${fullName}`);
    
    // Paso 3: Procesar sucesores
    if (successors.length > 0) {
      const successorSections = await processSuccessorsWithOrder(
        successors,
        pagePool,
        baseUrl,
        {
          userId,
          userName,
          idPuesto: 'user' in successorsData.data && typeof successorsData.data.user === 'object' && successorsData.data.user !== null
            ? (successorsData.data.user as { idPuesto: string }).idPuesto
            : idPuesto
        },
        pdfCache,
        baseOrder + 1 // Los sucesores comienzan después de la carta de reemplazo
      );
      
      // Añadir secciones de sucesores
      sections.push(...successorSections);
    }
    
    console.log(`[${new Date().toISOString()}] Completado procesamiento de ${fullName} y sus ${successors.length} sucesores`);
    
    return sections;
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error procesando ${fullName}:`, error);
    return sections; // Devolver las secciones que se hayan podido generar
  }
}

/**
 * Procesa un lote de sucesores en paralelo con control de orden - from agenda-pdf.ts
 */
async function processSuccessorsWithOrder(
  successors: Successor[],
  pagePool: PagePool,
  baseUrl: string,
  userData: { userId: number, userName: string, idPuesto: string },
  pdfCache: PdfCache,
  baseOrder: number
): Promise<OrderedPdfSection[]> {
  const allSections: OrderedPdfSection[] = [];
  
  for (let i = 0; i < successors.length; i += SUCCESSORS_CONCURRENCY) {
    const batch = successors.slice(i, i + SUCCESSORS_CONCURRENCY);
    if (batch.length > 1) {
      console.log(`[${new Date().toISOString()}] Procesando lote de ${batch.length} sucesores en paralelo...`);
    }
    
    // Procesar en paralelo con control de orden
    const batchPromises = batch.map((successor, index) => 
      processSuccessorWithOrder(
        successor, 
        pagePool, 
        baseUrl, 
        userData, 
        pdfCache, 
        baseOrder + i + index // Cada sucesor tiene su propio orden
      )
    );
    
    // Recolectar secciones
    const batchSectionsArray = await Promise.all(batchPromises);
    
    // Aplanar y añadir a las secciones
    for (const sections of batchSectionsArray) {
      allSections.push(...sections);
    }
    
    // Breve pausa entre lotes
    if (i + SUCCESSORS_CONCURRENCY < successors.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return allSections;
}

/**
 * Procesa un único sucesor, generando ficha de talento y app con control de orden - from agenda-pdf.ts
 */
async function processSuccessorWithOrder(
  successor: Successor,
  pagePool: PagePool,
  baseUrl: string,
  userData: { userId: number, userName: string, idPuesto: string },
  pdfCache: PdfCache,
  order: number
): Promise<OrderedPdfSection[]> {
  const { userIdSuccessor, userNameSuccessor, fullName: successorName, idPuesto: successorIdPuesto } = successor;
  const sections: OrderedPdfSection[] = [];
  
  // Convertir userIdSuccessor a número
  const successorId = typeof userIdSuccessor === 'number' ? userIdSuccessor : parseInt(userIdSuccessor as string, 10);
  
  try {
    // Generar ficha de talento y app en paralelo
    console.time(`Successor Processing ${userIdSuccessor}`);
    
    const [fichaTalentoPdf, appPdf] = await Promise.all([
      // Generar ficha de talento
      generatePagePdf(
      pagePool,
      `${baseUrl}/${successorId}/fichaTalento?userName=${encodeURIComponent(userNameSuccessor)}&userId=${successorId}&positionId=${successorIdPuesto}&isPDF=true&name=${encodeURIComponent(successorName)}`,
      `Ficha de talento para ${successorName}`,
      pdfCache
      ),
      
      // Generar app en paralelo solo si successor.app existe
      successor.app
      ? generatePagePdf(
        pagePool,
        `${baseUrl}/${userData.userId}/app?userName=${encodeURIComponent(userNameSuccessor)}&userId=${successorId}&positionId=${userData.idPuesto}&isPDF=true&name=${encodeURIComponent(successorName)}`,
        `APP para ${successorName}`,
        pdfCache
        )
      : Promise.resolve(null)
    ]);
    
    // Añadir ficha de talento a las secciones
    if (fichaTalentoPdf) {
      sections.push({
        name: `Ficha Talento - ${successorName}`,
        buffer: fichaTalentoPdf,
        order: order // Orden base para la ficha
      });
    }
    
    // Añadir app a las secciones
    if (appPdf) {
      sections.push({
        name: `APP - ${successorName}`,
        buffer: appPdf,
        order: order + 0.5 // Orden después de la ficha pero antes del siguiente sucesor
      });
    }
    
    console.timeEnd(`Successor Processing ${userIdSuccessor}`);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error procesando sucesor ${successorName}:`, error);
  }
  
  return sections;
}

/**
 * NUEVA FUNCIÓN: Genera un PDF completo para el área especificada 
 * (Reemplaza la función GET de agenda-pdf.ts)
 */
async function generateAgendaPdf(
  area: AreaType,
  baseUrlOverride?: string, // Opcional para permitir sobreescribir la URL base
  skipInitialPages: boolean = false // Nuevo parámetro para evitar duplicación
): Promise<{
  pdfBuffer: Uint8Array | null;
  success: boolean;
  error?: string;
}> {
  console.log(`[${new Date().toISOString()}] Inicio del proceso de generación de PDF de agenda`);
  const startTime = Date.now();
  
  if (!area || !routeToParam[area]) {
    return {
      pdfBuffer: null,
      success: false,
      error: 'Área no válida o no especificada'
    };
  }
  
  const baseUrl = baseUrlOverride || `${process.env.NEXT_PUBLIC_BASE_URL}/${routeToParam[area]}`;
  let browser: Browser | null = null;
  let pagePool: PagePool | null = null;
  const pdfCache = new PdfCache();
  
  // Array para almacenar las secciones PDF en orden
  const orderedPdfSections: OrderedPdfSection[] = [];
  
  try {
    console.log(`[${new Date().toISOString()}] Iniciando generación de PDF para área: ${area}`);
    console.time('Total Process');
    
    // Iniciar navegador
    console.time('Browser Start');
    browser = await puppeteer.launch({
      headless: true,
      args: PUPPETEER_ARGS,
      defaultViewport: {
        width: 2400,
        height: 1080,
        deviceScaleFactor: 1,
      },
    });
    console.timeEnd('Browser Start');
    
    // Crear pool de páginas
    pagePool = new PagePool(browser, PAGE_POOL_SIZE);
    
    // PASO 1: Obtener datos de organigrama y generar página de temas
    console.time('Initial Data Fetch');
    
    // Ejecutamos en paralelo la obtención de datos
    const organigramaData = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/organigrama?area=${area}`)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Error al obtener datos de organigrama: ${response.status} ${response.statusText}`);
        }
        return response.json();
      });
    
    console.timeEnd('Initial Data Fetch');
    
    // Extraer empleados y manager de los datos obtenidos
    const employees = organigramaData.employees || [];
    const manager = organigramaData.manager;
    
    console.log(`[${new Date().toISOString()}] Se encontraron ${employees.length} directores y ${manager ? 1 : 0} manager.`);
    
    // PASO 0: Generar páginas iniciales requeridas (solo si no se indica saltarlas)
    if (!skipInitialPages) {
      console.time('Initial Pages');
      
      // Definir las páginas iniciales
      const initialPages = [
        { url: `${baseUrl}/agenda?isPDF=true&carta=true`, name: "Página de Agenda (Inicial)", order: 0.2 },
        { url: `${baseUrl}/temas?carta=true`, name: "Página de Temas (Inicial)", order: 0.3 },
      ];
      
      // Generar todas las páginas iniciales en paralelo
      const initialPagesPromises = initialPages.map(page => 
        pagePool ? generatePagePdf(pagePool, page.url, page.name, pdfCache) : Promise.reject(new Error("PagePool is null"))
      );
      
      const initialPdfBuffers = await Promise.all(initialPagesPromises);
      
      // Añadir las páginas iniciales a las secciones ordenadas
      initialPages.forEach((page, index) => {
        if (initialPdfBuffers[index]) {
          orderedPdfSections.push({
            name: page.name,
            buffer: initialPdfBuffers[index]!,
            order: page.order
          });
          console.log(`[${new Date().toISOString()}] Añadida página inicial: ${page.name}`);
        } else {
          console.warn(`[${new Date().toISOString()}] No se pudo generar la página: ${page.name}`);
        }
      });
      
      console.timeEnd('Initial Pages');
    } else {
      console.log(`[${new Date().toISOString()}] Saltando la generación de páginas iniciales para evitar duplicación`);
    }
    
    // Definir las páginas estáticas que queremos generar
    const staticPages = [
      { url: `${baseUrl}/temas`, name: "Temas", order: 1 },
      { url: `${baseUrl}/agenda`, name: "Agenda", order: 3 },
      { url: `${baseUrl}/directoresn3`, name: "Directores N3", order: 4 }
    ];
    
    // Generar la página de temas (ahora que ya tenemos los datos)
    const temasPagePdf = await generatePagePdf(pagePool, staticPages[0].url, staticPages[0].name, pdfCache);
    
    // Añadir la página de temas a las secciones ordenadas
    if (temasPagePdf) {
      orderedPdfSections.push({
        name: "Página de Temas",
        buffer: temasPagePdf,
        order: 1
      });
    }
    
    // PASO 2: Procesar al manager (debe ir después de temas)
    console.time('Manager Processing');
    
    if (manager) {
      const managerSections = await processEmployeeWithOrder(
        pagePool, 
        baseUrl, 
        manager, 
        pdfCache, 
        2 // Orden después de temas
      );
      
      // Añadir secciones del manager a la lista ordenada
      orderedPdfSections.push(...managerSections);
    }
    
    console.timeEnd('Manager Processing');
    
    // PASO 3: Generar las otras páginas estáticas (agenda y directores)
    console.time('Static Pages');
    
    const [agendaPagePdf, directorsPagePdf] = await Promise.all([
      generatePagePdf(pagePool, staticPages[1].url, staticPages[1].name, pdfCache),
      generatePagePdf(pagePool, staticPages[2].url, staticPages[2].name, pdfCache)
    ]);
    
    // Añadir páginas estáticas a las secciones ordenadas
    if (agendaPagePdf) {
      orderedPdfSections.push({
        name: "Página de Agenda",
        buffer: agendaPagePdf,
        order: 3
      });
    }
    
    if (directorsPagePdf) {
      orderedPdfSections.push({
        name: "Página de Directores N3",
        buffer: directorsPagePdf,
        order: 4
      });
    }
    
    console.timeEnd('Static Pages');
    
    // PASO 4: Procesar empleados en lotes (comienzan en orden 5)
    console.time('Process Employees');
    
    let currentEmployeeOrder = 5;
    
    // Dividir empleados en lotes
    for (let i = 0; i < employees.length; i += EMPLOYEE_BATCH_SIZE) {
      const batch = employees.slice(i, i + EMPLOYEE_BATCH_SIZE);
      console.log(`[${new Date().toISOString()}] Procesando lote ${Math.ceil((i+1)/EMPLOYEE_BATCH_SIZE)}/${Math.ceil(employees.length/EMPLOYEE_BATCH_SIZE)} (${batch.length} empleados)`);
      
      // Procesar empleados en paralelo dentro del lote
      const employeePromises = batch.map((employee: Employee, index: number) => {
        if (!pagePool) throw new Error("PagePool is null");
        // Asignar orden secuencial a cada empleado
        return processEmployeeWithOrder(
          pagePool, 
          baseUrl, 
          employee, 
          pdfCache, 
          currentEmployeeOrder + index * 3 // Multiplicamos por 3 para dejar espacio para las páginas de cada empleado
        );
      });
      
      // Recolectar todas las secciones PDF de los empleados
      const employeeSectionsArray = await Promise.all(employeePromises);
      
      // Aplanar el array de arrays y añadir a las secciones ordenadas
      for (const sections of employeeSectionsArray) {
        orderedPdfSections.push(...sections);
      }
      
      // Actualizar el orden para el siguiente lote
      currentEmployeeOrder += batch.length * 3;
      
      // Breve pausa entre lotes para liberar memoria
      if (i + EMPLOYEE_BATCH_SIZE < employees.length) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
    
    console.timeEnd('Process Employees');
    
    // PASO 5: Ordenar y combinar todas las secciones PDF
    console.time('Combine PDFs');
    
    // Ordenar las secciones según el número de orden
    orderedPdfSections.sort((a, b) => a.order - b.order);
    
    // Crear documento PDF final
    const pdfDoc = await PDFDocument.create();
    
    // Añadir cada sección en el orden correcto
    for (const section of orderedPdfSections) {
      console.log(`[${new Date().toISOString()}] Añadiendo sección "${section.name}" (orden: ${section.order}) al PDF final`);
      await addPdfToDocument(pdfDoc, section.buffer, section.name);
    }
    
    console.timeEnd('Combine PDFs');
    
    // Guardar PDF final
    console.time('Save Final PDF');
    const finalPdfBytes = await pdfDoc.save();
    console.timeEnd('Save Final PDF');
    
    const totalTime = Date.now() - startTime;
    console.log(`[${new Date().toISOString()}] PDF generado correctamente (${Math.round(finalPdfBytes.byteLength / 1024)} KB) en ${totalTime}ms (${(totalTime/1000).toFixed(2)}s)`);
    console.timeEnd('Total Process');
    
    return {
      pdfBuffer: finalPdfBytes,
      success: true
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error generando PDF:`, error);
    
    return {
      pdfBuffer: null, 
      success: false,
      error: error instanceof Error ? error.message : String(error)
    };
  } finally {
    // Cerrar el navegador
    if (pagePool) {
      await pagePool.close().catch(() => {});
    }
    
    if (browser) {
      await browser.close().catch(() => {});
      console.log(`[${new Date().toISOString()}] Navegador cerrado correctamente`);
    }
  }
}

/**
 * Endpoint principal para la generación de PDF con incorporación de agenda opcional
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const queryParams = url.searchParams;
  const area = queryParams.get('area') as AreaType;
  const includeAgenda = queryParams.get('includeAgenda') !== 'false'; // Por defecto incluir agenda
  
  if (!area || !routeToParam[area]) {
    return new Response(
      JSON.stringify({ error: 'Área no válida o no especificada' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  let browser: Browser | null = null;
  let pagePool: PagePool | null = null;
  
  try {
    console.log(`[${new Date().toISOString()}] Iniciando generación de PDF para área: ${area}`);
    
    // Obtener datos con mejor manejo de errores
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/organigrama?${queryParams.toString()}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Error al obtener datos: ${response.status} ${response.statusText}`);
    }

    const data: ApiResponse = await response.json();

    if (!data.employees || !Array.isArray(data.employees) || data.employees.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No se encontraron empleados' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Crear pares de URLs base por empleado
    const employeePairsPromises = data.employees.map(async (employee, index) => {
      const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${routeToParam[area]}`;
      const { userId, userName, puestoOuId: positionId, name = '', lastName = '' } = employee;
      
      // Parámetros comunes para todas las URLs
      const commonParams = `userName=${encodeURIComponent(userName)}&userId=${userId}&positionId=${positionId}&isPDF=true&name=${encodeURIComponent(name)}&lastName=${encodeURIComponent(lastName)}`;
      
      // URLs base para cada empleado
      const baseUrls = [
        {
          type: 'fichaTalento',
          url: `${baseUrl}/${userId}/fichaTalento?${commonParams}`,
          description: 'Ficha de Talento'
        },
        {
          type: 'comentarios',
          url: `${baseUrl}/${userId}/fichaTalento/comentarios?${commonParams}`,
          description: 'Comentarios'
        },
        {
          type: 'matriz-de-sucesion',
          url: `${baseUrl}/${userId}/matriz-de-sucesion?${commonParams}`,
          description: 'Matriz de Sucesión'
        },
        {
          type: 'app',
          url: `${baseUrl}/${userId}/app?${commonParams}`,
          description: 'APP'
        },
        {
          type: 'pdi',
          url: `${baseUrl}/${userId}/pdi?${commonParams}`,
          description: 'PDI'
        }
      ];
      
      // Obtener datos de matriz de sucesión
      try {
        console.log(`Obteniendo datos de matriz de sucesión para ${userName}`);
        const matrixResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/matrixSuccession?userId=${userId}&userName=${encodeURIComponent(userName)}`);
        
        if (matrixResponse.ok) {
          const matrixData: { data: ResponseDataMatrixSuccession } = await matrixResponse.json();
          const successionsData = matrixData.data;
          
          // URLs para potenciales sucesores (dos URLs por cada sucesor: app y ficha-talento)
          const successorUrls = successionsData.potentialSuccessors.flatMap((successor) => [
            // URL para potential-successor-app
            {
              type: 'potential-successor-app',
              url: `${baseUrl}/${userId}/app?userName=${encodeURIComponent(successor.userNameSuccessor)}&userId=${successor.userIdSuccessor}&positionId=${positionId}&isPDF=true&name=${encodeURIComponent(successor.fullName)}`,
              description: `Sucesor App: ${successor.fullName || successor.userNameSuccessor} (${successor.term})`
            },
            // URL para potential-successor-ficha-talento
            {
              type: 'potential-successor-ficha-talento',
              url: `${baseUrl}/${userId}/fichaTalento?userName=${encodeURIComponent(successor.userNameSuccessor)}&userId=${successor.userIdSuccessor}&positionId=${positionId}&isPDF=true&name=${encodeURIComponent(successor.fullName)}`,
              description: `Sucesor Ficha: ${successor.fullName || successor.userNameSuccessor} (${successor.term})`
            }
          ]);
          
          // URLs para puestos donde el empleado podría ser sucesor (solo una URL de tipo app)
          const successorForUrls = successionsData.potentialSuccessorFor.map((position) => ({
            type: 'potential-successor-for-app',
            url: `${baseUrl}/${userId}/app?userName=${encodeURIComponent(userName)}&userId=${userId}&positionId=${position.ouIdPuestoEmployee}&isPDF=true`,
            description: `Sucesor para: ${position.positionName} (${position.term})`
          }));
          
          // Combinar todas las URLs
          return {
            employeeId: userId,
            employeeName: userName,
            employeeIndex: index,
            urls: [...baseUrls, ...successorUrls, ...successorForUrls]
          };
        } else {
          console.warn(`No se pudieron obtener datos de matriz de sucesión para ${userName}: ${matrixResponse.status} ${matrixResponse.statusText}`);
        }
      } catch (error) {
        console.error(`Error obteniendo datos de matriz de sucesión para ${userName}:`, error);
      }
      
      // Si hay error, solo devolver las URLs base
      return {
        employeeId: userId,
        employeeName: userName,
        employeeIndex: index,
        urls: baseUrls
      };
    });
    
    // Esperar a que se resuelvan todas las promesas de los pares de empleados
    const employeePairs = await Promise.all(employeePairsPromises);

    console.log(`[${new Date().toISOString()}] Total de empleados a procesar: ${employeePairs.length}`);
    console.log(`[${new Date().toISOString()}] Total de URLs a procesar: ${employeePairs.reduce((sum, emp) => sum + emp.urls.length, 0)}`);
    console.time('PDF Generation Time');

    // Iniciar navegador con configuración optimizada
    browser = await puppeteer.launch({
      headless: true,
      args: PUPPETEER_ARGS,
      defaultViewport: {
        width: 2200, // Ancho aumentado para mejor visualización
        height: 1080,
        deviceScaleFactor: 1, // Asegura una resolución nítida
      },
    });
    
    // Crear pool de páginas
    pagePool = new PagePool(browser, CONCURRENCY_LIMIT * 2);

    // Función para procesar un par de URLs para un empleado
    const processEmployeePair = async (pair: EmployeeUrlPair, index: number, total: number) => {
      const results: Array<{
        type: string, 
        buffer: Uint8Array | null, 
        success: boolean,
        description?: string
      }> = [];
      let allSuccess = true;
      
      console.log(`[${new Date().toISOString()}] Procesando empleado [${index + 1}/${total}]: ${pair.employeeName} (${pair.urls.length} URLs)`);
      
      // Procesar secuencialmente las URLs para este empleado
      for (const urlInfo of pair.urls) {
        if (!pagePool) {
          throw new Error('Page pool is not initialized');
        }
        
        // Obtener una página del pool
        const page = await pagePool.getPage();
        
        try {
          console.log(`- Generando ${urlInfo.type}${urlInfo.description ? ` (${urlInfo.description})` : ''} para ${pair.employeeName}`);
          
          // Navegar a la URL
          await page.goto(urlInfo.url, { 
            waitUntil: 'networkidle0', 
            timeout: PAGE_LOAD_TIMEOUT 
          });
          
          // Esperar tiempo fijo
          await new Promise(resolve => setTimeout(resolve, CONTENT_WAIT_TIME));
                    
          // Generar el PDF con escala reducida para mejor visualización y ancho específico
          const pdfBuffer = await page.pdf({
            format: 'A4',
            landscape: true,
            printBackground: true,
            margin: { top: '3mm', right: '3mm', bottom: '3mm', left: '3mm' },
            scale: 0.75, // Reducido ligeramente para mostrar más contenido horizontalmente
            displayHeaderFooter: false,
            preferCSSPageSize: true,
            width: '297mm', // Ancho explícito para un A4 landscape (A4 = 210×297 mm)
          });
          
          console.log(`  ✓ ${urlInfo.type} generado correctamente`);
          
          results.push({
            type: urlInfo.type,
            buffer: pdfBuffer,
            success: true,
            description: urlInfo.description
          });
        } catch (error) {
          console.error(`  ✗ Error generando ${urlInfo.type}${urlInfo.description ? ` (${urlInfo.description})` : ''}:`, error);
          
          results.push({
            type: urlInfo.type,
            buffer: null,
            success: false,
            description: urlInfo.description
          });
          
          allSuccess = false;
        } finally {
          // Devolver la página al pool
          await pagePool.releasePage(page);
        }
      }
      
      return {
        buffers: results,
        success: allSuccess
      };
    };

    // Procesar empleados en lotes paralelos
    const employeeResults = await processEmployeesInBatches(
      employeePairs,
      processEmployeePair,
      CONCURRENCY_LIMIT
    );
    
    // Crear el PDF combinado final
    console.log(`[${new Date().toISOString()}] Combinando PDFs...`);
    const combinedPdf = await PDFDocument.create();
    
    // Generar las páginas iniciales adicionales en el orden exacto especificado
    console.log(`[${new Date().toISOString()}] Generando páginas iniciales adicionales...`);
    
    // Definir las páginas iniciales requeridas en el orden exacto que deben aparecer
    const initialPages = [
      { url: `${process.env.NEXT_PUBLIC_BASE_URL}/${routeToParam[area]}?isPDF=true`, name: "Página Inicial", description: "Página principal" },
      { url: `${process.env.NEXT_PUBLIC_BASE_URL}/${routeToParam[area]}/agenda?isPDF=true&talento=true`, name: "Página de Agenda (Inicial)", description: "Agenda inicial" },
      { url: `${process.env.NEXT_PUBLIC_BASE_URL}/${routeToParam[area]}/temas?organigrama=true`, name: "Página de Temas (Inicial)", description: "Temas iniciales" },
      { 
        url: `${process.env.NEXT_PUBLIC_BASE_URL}/${routeToParam[area]}/organigrama?bloque=1&isPDF=true&area=${routeToParam[area]}`, 
        name: "Página de Organigrama", 
        description: "Organigrama" 
      }
    ];
    
    // Generamos todas las páginas iniciales y las almacenamos temporalmente
    const initialPageBuffers: Array<{name: string, pdf: PDFDocument, pageCount: number}> = [];
    
    if (pagePool) {
      try {
        // Procesamos las páginas iniciales
        for (const page of initialPages) {
          console.log(`[${new Date().toISOString()}] Generando página: ${page.name}`);
          
          // Obtener PDF de la página
          const pagePdf = await generatePagePdf(
            pagePool,
            page.url,
            page.name,
            new PdfCache(), // Usamos un caché nuevo para evitar conflictos
            WAIT_TIMES.default
          );
          
          // Si se generó correctamente, almacenarlo
          if (pagePdf) {
            try {
              const pagePdfDoc = await PDFDocument.load(pagePdf);
              initialPageBuffers.push({
                name: page.name,
                pdf: pagePdfDoc,
                pageCount: pagePdfDoc.getPageCount()
              });
              console.log(`[${new Date().toISOString()}] Página "${page.name}" generada correctamente`);
            } catch (pageError) {
              console.error(`[${new Date().toISOString()}] Error al cargar la página "${page.name}":`, pageError);
            }
          } else {
            console.warn(`[${new Date().toISOString()}] No se pudo generar la página "${page.name}"`);
          }
        }
        
        // Ahora añadimos las páginas al principio del documento en el orden inverso
        // (para que al insertar al principio, queden en el orden correcto)
        for (let i = initialPageBuffers.length - 1; i >= 0; i--) {
          const pageBuffer = initialPageBuffers[i];
          console.log(`[${new Date().toISOString()}] Añadiendo "${pageBuffer.name}" al PDF (${pageBuffer.pageCount} páginas)`);
          
          const pageIndices = pageBuffer.pdf.getPageIndices();
          const copiedPages = await combinedPdf.copyPages(pageBuffer.pdf, pageIndices);
          
          // Insertar páginas al principio del documento
          // Añadimos en orden inverso dentro de cada documento para mantener el orden correcto
          for (let j = copiedPages.length - 1; j >= 0; j--) {
            combinedPdf.insertPage(0, copiedPages[j]);
          }
        }
        
        console.log(`[${new Date().toISOString()}] Páginas iniciales añadidas en el orden especificado`);
      } catch (error) {
        console.error(`[${new Date().toISOString()}] Error al generar las páginas iniciales:`, error);
      }
    }
    
    // Combinar los PDFs de empleados en el orden correcto
    for (const employeeResult of employeeResults) {
      console.log(`Añadiendo documentos de ${employeeResult.employeeName} al PDF final`);
      
      // Para cada empleado, añadir todos sus documentos
      for (const bufferInfo of employeeResult.buffers) {
        if (!bufferInfo.success || !bufferInfo.buffer) {
          console.log(`Saltando ${bufferInfo.type}${bufferInfo.description ? ` (${bufferInfo.description})` : ''} para ${employeeResult.employeeName} (fallido)`);
          continue;
        }
        
        try {
          const pdfDoc = await PDFDocument.load(bufferInfo.buffer);
          const copiedPages = await combinedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
          
          for (const page of copiedPages) {
            combinedPdf.addPage(page);
          }
          
          console.log(`  - ${bufferInfo.type}${bufferInfo.description ? ` (${bufferInfo.description})` : ''} añadido correctamente`);
        } catch (error) {
          console.error(`Error al añadir ${bufferInfo.type}${bufferInfo.description ? ` (${bufferInfo.description})` : ''} para ${employeeResult.employeeName}:`, error);
        }
      }
    }
    
    // Añadir la agenda al final del PDF si está habilitado (pasamos skipInitialPages=true)
    if (includeAgenda) {
      console.log(`[${new Date().toISOString()}] Generando PDF de agenda para añadir al documento...`);
      
      // Llamar a la nueva función en lugar de a la API, pero indicando que salte las páginas iniciales
      const agendaResult = await generateAgendaPdf(area, undefined, true);
      
      if (agendaResult.success && agendaResult.pdfBuffer) {
        try {
          // Cargar PDF de agenda
          const agendaPdf = await PDFDocument.load(agendaResult.pdfBuffer);
          
          // Copiar páginas al documento principal
          const pageIndices = agendaPdf.getPageIndices();
          const copiedPages = await combinedPdf.copyPages(agendaPdf, pageIndices);
          
          // Añadir páginas al documento final
          for (const page of copiedPages) {
            combinedPdf.addPage(page);
          }
          
          console.log(`[${new Date().toISOString()}] Agenda añadida correctamente al PDF (${pageIndices.length} páginas)`);
        } catch (error) {
          console.error(`[${new Date().toISOString()}] Error al añadir agenda al PDF:`, error);
        }
      } else {
        console.warn(`[${new Date().toISOString()}] No se pudo generar el PDF de agenda: ${agendaResult.error || 'Error desconocido'}`);
      }
    }
    
    // Guardar el PDF final
    const finalPdfBytes = await combinedPdf.save();
    console.timeEnd('PDF Generation Time');
    
    console.log(`[${new Date().toISOString()}] PDF generado correctamente (${Math.round(finalPdfBytes.byteLength / 1024)} KB)`);
    
    return new Response(finalPdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="documentos_${routeToParam[area]}_${includeAgenda ? 'con_agenda' : 'sin_agenda'}.pdf"`,
      },
    });
    
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error crítico al generar el PDF:`, error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Error al generar el PDF',
        details: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } finally {
    // Limpiar recursos
    if (pagePool) {
      await pagePool.close().catch(() => {});
    }
    
    if (browser) {
      await browser.close().catch(() => {});
      console.log(`[${new Date().toISOString()}] Navegador cerrado correctamente`);
    }
  }
}