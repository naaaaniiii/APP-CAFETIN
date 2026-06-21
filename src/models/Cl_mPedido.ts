/**
 * Modelo del Pedido (Cl_mPedido)
 * 
 * Mantiene el estado (como el carrito de compras) y realiza cálculos.
 */
export default class Cl_mPedido {
  private _id: string = "";
  private _cedula: number = 0;
  private _nombre: string = "";
  private _resumenProductos: string = "";
  private _montoTotal$: number = 0;
  private _montoTotalBs: number = 0;
  private _metodoPago: "transferencia" | "pago_movil" | "punto" | "efectivo_usd" | "efectivo_bs" = "transferencia";
  private _cuentaOrigen: string = "";
  private _cuentaDestino: string = "";
  private _referencia: string = "";
  // Campos específicos de Punto de Venta
  private _puntoCedula: number = 0;
  private _puntoTipoCuenta: "ahorro" | "corriente" | "" = "";
  private _puntoClave: string = "";
  private _status: "pendiente" | "aceptado" | "rechazado" = "pendiente";
  private _carrito: { [id: string]: { nombre: string; cantidad: number; precio: number; codigo: string } } = {};

  constructor({
    id,
    cedula,
    nombre,
    resumenProductos,
    montoTotal$,
    montoTotalBs,
    metodoPago = "transferencia",
    cuentaOrigen = "",
    cuentaDestino = "",
    referencia = "",
    puntoCedula = 0,
    puntoTipoCuenta = "",
    puntoClave = "",
    status = "pendiente",
  }: {
    id: string;
    cedula: number;
    nombre: string;
    resumenProductos: string;
    montoTotal$: number;
    montoTotalBs: number;
    metodoPago?: "transferencia" | "pago_movil" | "punto" | "efectivo_usd" | "efectivo_bs";
    cuentaOrigen?: string;
    cuentaDestino?: string;
    referencia?: string;
    puntoCedula?: number;
    puntoTipoCuenta?: "ahorro" | "corriente" | "";
    puntoClave?: string;
    status?: "pendiente" | "aceptado" | "rechazado";
  }) {
    this.id = id;
    this.cedula = cedula;
    this.nombre = nombre;
    this.resumenProductos = resumenProductos;
    this.montoTotal$ = montoTotal$;
    this.montoTotalBs = montoTotalBs;
    this.metodoPago = metodoPago;
    this.cuentaOrigen = cuentaOrigen;
    this.cuentaDestino = cuentaDestino;
    this.referencia = referencia;
    this.puntoCedula = puntoCedula;
    this.puntoTipoCuenta = puntoTipoCuenta;
    this.puntoClave = puntoClave;
    this.status = status;
  }

  public get id(): string { 
    return this._id; 
  }
  public set id(value: string) { 
    this._id = value;
   }

  public get cedula(): number {
     return this._cedula;
     }
  public set cedula(value: number) { 
    this._cedula = value;
   }

  public get nombre(): string {
     return this._nombre;
     }
  public set nombre(value: string) { 
    this._nombre = value; 
  }

  public get resumenProductos(): string { 
    return this._resumenProductos; 
  }
  public set resumenProductos(value: string) { 
    this._resumenProductos = value;
   }

  public get montoTotal$(): number {
     return this._montoTotal$; 
    }
  public set montoTotal$(value: number) {
     this._montoTotal$ = value;
     }

  public get montoTotalBs(): number { 
    return this._montoTotalBs;
   }
  public set montoTotalBs(value: number) { 
    this._montoTotalBs = value;
   }

  public get metodoPago(): "transferencia" | "pago_movil" | "punto" | "efectivo_usd" | "efectivo_bs" {
     return this._metodoPago; 
    }
  public set metodoPago(value: "transferencia" | "pago_movil" | "punto" | "efectivo_usd" | "efectivo_bs") { 
    this._metodoPago = value; 
  }

  public get cuentaOrigen(): string { 
    return this._cuentaOrigen; 
  }
  public set cuentaOrigen(value: string) { 
    this._cuentaOrigen = value; 
  }

  public get cuentaDestino(): string { 
    return this._cuentaDestino; 
  }
  public set cuentaDestino(value: string) { 
    this._cuentaDestino = value; 
  }

  public get referencia(): string { 
    return this._referencia;
   }
  public set referencia(value: string) { 
    this._referencia = value; 
  }

  public get puntoCedula(): number { 
    return this._puntoCedula; 
  }
  public set puntoCedula(value: number) { 
    this._puntoCedula = value;
   }

  public get puntoTipoCuenta(): "ahorro" | "corriente" | "" {
     return this._puntoTipoCuenta; 
    }
  public set puntoTipoCuenta(value: "ahorro" | "corriente" | "") { 
    this._puntoTipoCuenta = value;
   }

  public get puntoClave(): string { 
    return this._puntoClave;
   }
  public set puntoClave(value: string) { 
    this._puntoClave = value; 
  }

  public get status(): "pendiente" | "aceptado" | "rechazado" { 
    return this._status; 
  }
  public set status(value: "pendiente" | "aceptado" | "rechazado") {
     this._status = value; 
    }
  /**
   * LÓGICA DE NEGOCIO: Convierte un texto resumido de los productos en una lista de objetos.
   * Ejemplo de entrada: "2xHamburguesa, 1xRefresco"
   * Ejemplo de salida: [{ producto: "Hamburguesa", cantidad: 2 }, { producto: "Refresco", cantidad: 1 }]
   * 
   * ¿Cómo funciona?
   * 1. Recorre letra por letra el texto `resumenProductos`.
   * 2. Usa las comas (,) para saber dónde termina un producto y empieza el siguiente.
   * 3. Ignora las comas que estén dentro de paréntesis (por si el nombre del producto tiene una coma dentro).
   */
  public desglosarCantidades(): { producto: string; cantidad: number }[] {
    const listado: { 
      producto: string; 
      cantidad: number 
    }[] = []; // Aquí guardaremos la lista final
    
    // Si no hay productos, devolvemos la lista vacía inmediatamente
    if (!this.resumenProductos) return listado;
    
    let itemActual = ""; // Variable temporal para armar el texto de un solo producto, ej: "2xHamburguesa"
    let parentesis = 0;  // Contador para saber si estamos dentro de un paréntesis
    
    // Recorremos el texto letra por letra
    for (let i = 0; i < this.resumenProductos.length; i++) {
      const caracter = this.resumenProductos[i];
      
      if (caracter === '(') parentesis++; // Entramos a un paréntesis
      if (caracter === ')') parentesis--; // Salimos de un paréntesis
      
      // Si encontramos una coma y NO estamos dentro de un paréntesis, 
      // significa que ya terminamos de leer un producto completo.
      if (caracter === ',' && parentesis === 0) {
        // Le pasamos el texto ("2xHamburguesa") a extraerUnidades para que lo divida y lo guarde
        this.extraerUnidades(itemActual.trim(), listado);
        itemActual = ""; // Limpiamos para empezar a leer el siguiente producto
      } else {
        // Si no es una coma separadora, seguimos acumulando las letras
        itemActual += caracter;
      }
    }
    
    // Al terminar el ciclo, puede quedar el último producto acumulado sin guardar (porque no termina en coma).
    // Lo guardamos aquí.
    if (itemActual.trim()) {
      this.extraerUnidades(itemActual.trim(), listado);
    }
    
    return listado;
  }

  /**
   * MÉTODO AUXILIAR: Recibe el texto de un solo producto ("2xHamburguesa") y lo divide en Cantidad y Nombre.
   * Luego lo guarda en la lista.
   */
  private extraerUnidades(str: string, listado: { producto: string; cantidad: number }[]) {
    // Buscamos dónde está la letra "x" que separa la cantidad del nombre
    const posX = str.indexOf('x');
    
    if (posX !== -1) {
      // Si encontramos la "x", dividimos el texto en dos partes
      const cantStr = str.substring(0, posX).trim(); // Lo que está antes de la "x" (ej: "2")
      const prodStr = str.substring(posX + 1).trim(); // Lo que está después de la "x" (ej: "Hamburguesa")
      
      // Convertimos el texto "2" a un número de verdad
      const cantidad = parseInt(cantStr, 10);
      
      // Verificamos que sí sea un número válido y que el producto tenga nombre
      if (!isNaN(cantidad) && prodStr) {
        // Lo agregamos a nuestra lista oficial
        listado.push({ producto: prodStr, cantidad: cantidad });
      }
    } else {
      // Si no hay "x" (ej: solo dice "Hamburguesa"), asumimos que la cantidad es 1
      listado.push({ producto: str, cantidad: 1 });
    }
  }

  public inicializarCarrito(productos: any[]): void {
    this._carrito = {};
    productos.forEach((p) => {
      const key = p.idProd ? p.idProd.toString() : p.id;
      this._carrito[key] = {
        nombre: p.nombre,
        cantidad: 0,
        precio: p.precio,
        codigo: p.codigo || p.nombre
      };
    });
  }

  /**
   * LÓGICA DE NEGOCIO: Modifica la cantidad en el carritoCarrito y previene valores negativos.
   */
  public actualizarCantidadCarrito(id: string, incremento: number): void {
    if (this._carrito[id]) {
      this._carrito[id].cantidad = Math.max(0, this._carrito[id].cantidad + incremento);
    }
  }

  public obtenerCantidadCarrito(id: string): number {
    return this._carrito[id] ? this._carrito[id].cantidad : 0;
  }

  /**
   * LÓGICA DE NEGOCIO (Matemática): Calcula el total en USD sumando los items del carritoCarrito.
   */
  public calcularTotalUSD(): number {
    return Object.values(this._carrito).reduce((acc, p) => acc + (p.cantidad * p.precio), 0);
  }

  /**
   * LÓGICA DE NEGOCIO (Matemática): Convierte el total de USD a Bs.
   */
  public calcularTotalBs(tasaUSD: number): number {
    return this.calcularTotalUSD() * tasaUSD;
  }

  /**
   * LÓGICA DE NEGOCIO: Prepara todos los datos finales del pedido antes de enviarlo.
   * Agarra todo lo que está en el carrito y lo convierte en los valores finales (Totales y Texto).
   * 
   * ¿Cómo funciona?
   * 1. Llama a las matemáticas para fijar el Total en dólares.
   * 2. Llama a las matemáticas para fijar el Total en bolívares.
   * 3. Crea el texto de resumenProductos (ej: "2xEmpanada, 1xJugo").
   *    Para hacer el texto:
   *    - Toma todos los productos del carrito (`Object.values`).
   *    - Filtra (.filter) descartando los que tienen cantidad 0.
   *    - Transforma (.map) cada uno a texto "cantidad x nombre".
   *    - Los une (.join) pegándolos con una coma y espacio.
   */
  public sincronizarPedido(tasaUSD: number): void {
    this.montoTotal$ = this.calcularTotalUSD();
    this.montoTotalBs = this.calcularTotalBs(tasaUSD);
    this.resumenProductos = Object.values(this._carrito)
      .filter((p) => p.cantidad > 0)
      .map((p) => `${p.cantidad}x${p.codigo || p.nombre}`)
      .join(", ");
  }

  /**
   * LÓGICA DE NEGOCIO: Vacía por completo el carrito de compras y resetea la cuenta.
   * 
   * ¿Cómo funciona?
   * 1. Recorre (`forEach`) todos los IDs de los productos en el carrito.
   * 2. Pone la `cantidad` de cada uno nuevamente en 0.
   * 3. Pone los montos totales (Dólares y Bolívares) en 0.
   * 4. Borra el texto de resumen ("").
   */
  public limpiarCarrito(): void {
    Object.keys(this._carrito).forEach((id) => {
      this._carrito[id].cantidad = 0;
    });
    this.montoTotal$ = 0;
    this.montoTotalBs = 0;
    this.resumenProductos = "";
  }

  /**
   * LÓGICA DE NEGOCIO ESTÁTICA: Calcula cuánto dinero ha entrado en total por pedidos aceptados.
   * Es 'static' porque no pertenece a un pedido individual, sino que procesa una lista de pedidos.
   * 
   * ¿Cómo funciona?
   * 1. Recibe una lista completa de pedidos.
   * 2. Filtra (`.filter`) dejando SOLAMENTE los pedidos que tienen status "aceptado" (ignora pendientes y rechazados).
   * 3. Suma (`.reduce`) todos los montos en Dólares ($) de esos pedidos aceptados.
   * 4. Suma (`.reduce`) todos los montos en Bolívares (Bs) de esos pedidos aceptados.
   * 5. Devuelve ambos totales agrupados en un objeto `{ totalUSD, totalBs }`.
   */
  public static calcularTotalesAceptados(pedidos: any[]): { totalUSD: number; totalBs: number } {
    // 1. Nos quedamos solo con los pedidos exitosos
    const aceptados = pedidos.filter((p: any) => p.status === "aceptado");
    
    // 2. Sumamos todo el dinero en dólares asegurándonos de que sean números reales (Number)
    const totalUSD = aceptados.reduce((sum: number, p: any) => sum + (Number(p.montoTotal$) || 0), 0);
    
    // 3. Sumamos todo el dinero en bolívares de la misma manera
    const totalBs = aceptados.reduce((sum: number, p: any) => sum + (Number(p.montoTotalBs) || 0), 0);
    
    // 4. Devolvemos el botín total calculado
    return { totalUSD, totalBs };
  }

  toJSON() {
    return {
      id: this.id,
      cedula: this.cedula,
      nombre: this.nombre,
      resumenProductos: this.resumenProductos,
      montoTotal$: this.montoTotal$,
      montoTotalBs: this.montoTotalBs,
      metodoPago: this.metodoPago,
      cuentaOrigen: this.cuentaOrigen,
      cuentaDestino: this.cuentaDestino,
      referencia: this.referencia,
      puntoCedula: this.puntoCedula,
      puntoTipoCuenta: this.puntoTipoCuenta,
      puntoClave: this.puntoClave,
      status: this.status,
    };
  }
}
