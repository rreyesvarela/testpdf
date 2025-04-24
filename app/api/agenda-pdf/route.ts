import puppeteer, { Browser, Page } from 'puppeteer';
import { PDFDocument } from 'pdf-lib';
import { NextRequest } from 'next/server';

type AreaType = 'Rev' | 'Adh' | 'AF' | 'RHH';

const routeToParam: { [key in AreaType]: string } = {
  'Rev': "revestimientos",
  'Adh': 'adhesivos',
  'AF': 'administracion-y-finanzas',
  'RHH': 'recursos-humanos'
};

// Configuraciones con tiempos de espera optimizados
const PAGE_LOAD_TIMEOUT = 120000; // Aumentado a 120 segundos
const DEFAULT_WAIT_TIME = 10000;  // Aumentado el tiempo base

// Tiempos de espera optimizados según tipo de página
const WAIT_TIMES = {
  'fichaTalento': 6000,     // Aumentado
  'app': 6000,              // Aumentado
  'cartaReemplazo': 12000,  // Aumentado significativamente
  'temas': 3000,            
  'agenda': 12000,          // Aumentado
  'directores': 10000,      // Aumentado
  'default': 10000          // Aumentado
};

// Configuración de paralelismo
const SUCCESSORS_CONCURRENCY = 2;  // Reducido a 2 para mejor estabilidad
const EMPLOYEE_BATCH_SIZE = 2;     // Reducido a 2 para mejor estabilidad
const PAGE_POOL_SIZE = 8;          // Reducido para evitar sobrecarga

// Configuración Puppeteer optimizada
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

// Interfaces para las respuestas de API
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

// Estructura para mantener el orden de las páginas
interface OrderedPdfSection {
  name: string;
  buffer: Uint8Array;
  order: number;
}

// Sistema de caché mejorado
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

// Pool de páginas mejorado
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

/**
 * Genera un PDF completo con el orden correcto: temas, manager, agenda, directores y empleados con sus sucesores
 */
export async function GET(request: NextRequest) {
  console.log(`[${new Date().toISOString()}] Inicio del proceso de generación de PDF`);
  const startTime = Date.now();
  
  const url = new URL(request.url);
  const queryParams = url.searchParams;
  const area = queryParams.get('area') as AreaType;
  
  if (!area || !routeToParam[area]) {
    return new Response(
      JSON.stringify({ error: 'Área no válida o no especificada' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const baseUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/${routeToParam[area]}`;
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
    
    // Definir las páginas estáticas que queremos generar
    const staticPages = [
      { url: `${baseUrl}/temas`, name: "Temas", order: 1 },
      { url: `${baseUrl}/agenda`, name: "Agenda", order: 3 },
      { url: `${baseUrl}/directoresn3`, name: "Directores N3", order: 4 }
    ];
    
    // PASO 1: Obtener datos de organigrama y generar página de temas
    console.time('Initial Data Fetch');
    
    // Ejecutamos en paralelo la obtención de datos y la generación de la página de temas
    const [organigramaData, temasPagePdf] = await Promise.all([
      // Obtener datos de organigrama
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/organigrama?area=${area}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error al obtener datos de organigrama: ${response.status} ${response.statusText}`);
          }
          return response.json();
        }),
      
      // Generar página de temas mientras tanto
      generatePagePdf(pagePool, staticPages[0].url, staticPages[0].name, pdfCache)
    ]);
    
    console.timeEnd('Initial Data Fetch');
    
    // Extraer empleados y manager de los datos obtenidos
    const employees = organigramaData.employees || [];
    const manager = organigramaData.manager;
    
    console.log(`[${new Date().toISOString()}] Se encontraron ${employees.length} directores y ${manager ? 1 : 0} manager.`);
    
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
    
    return new Response(finalPdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${routeToParam[area]}_completo.pdf"`,
      },
    });
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Error generando PDF:`, error);
    
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
 * Procesa un empleado (o manager) con control de orden, obtiene sus sucesores y genera todas las páginas de PDF necesarias
 */
async function processEmployeeWithOrder(
  pagePool: PagePool, 
  baseUrl: string, 
  employee: Employee, 
  pdfCache: PdfCache,
  baseOrder: number // Orden base para este empleado
): Promise<OrderedPdfSection[]> {
  const { userId, userName, puestoOuId, name, lastName } = employee;
  const fullName = `${name} ${lastName}`;
  const sections: OrderedPdfSection[] = [];
  
  console.log(`[${new Date().toISOString()}] Procesando: ${fullName} (ID: ${userId}, Orden: ${baseOrder})`);
  
  try {
    // Asegurar que puestoOuId sea string
    const idPuesto = typeof puestoOuId === 'number' ? puestoOuId.toString() : puestoOuId;
    
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
        `${baseUrl}/${userId}/cartaReemplazo?idPuesto=${idPuesto}&userName=${encodeURIComponent(userName)}`,
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
 * Procesa un lote de sucesores en paralelo con control de orden
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
 * Procesa un único sucesor, generando ficha de talento y app con control de orden
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
      
      // Generar app en paralelo
      generatePagePdf(
        pagePool,
        `${baseUrl}/${userData.userId}/app?userName=${encodeURIComponent(userNameSuccessor)}&userId=${successorId}&positionId=${userData.idPuesto}&isPDF=true&name=${encodeURIComponent(successorName)}`,
        `APP para ${successorName}`,
        pdfCache
      )
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
 * Genera el PDF de una página específica con caché y manejo de errores mejorado
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
 * Añade un buffer PDF al documento PDF principal
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