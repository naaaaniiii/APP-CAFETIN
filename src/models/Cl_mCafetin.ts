import Cl_mPedido from "./Cl_mPedido.js";

export default class Cafetin {
  private _tasaCambio: number;
  private _pedidos: Cl_mPedido[] = [];

  constructor(tasaInicial: number = 0) {
    this._tasaCambio = tasaInicial;
  }

  public get tasaCambio(): number { 
    return this._tasaCambio; 
}
  public set tasaCambio(nuevaTasa: number) { 
    this._tasaCambio = nuevaTasa;
 }

  public setPedidos(arrayPlanos: any[]) {
    this._pedidos = [];
    arrayPlanos.forEach((p) => {
      this._pedidos.push(
        new Cl_mPedido({
          id: p.idPed ? p.idPed.toString() : (p.id || p._id || ""),
          nombre: p.nombre,
          cedula: p.cedula,
          resumenProductos: p.resumenProductos,
          montoTotal$: Number(p.montoTotal$),
          montoTotalBs: Number(p.montoTotalBs),
          cuentaOrigen: p.cuentaOrigen,
          cuentaDestino: p.cuentaDestino,
          referencia: p.referencia,
          status: p.status,
        })
      );
    });
  }

  public calcularTotalPedidos(): number {
    return this._pedidos.length;
  }

  /**
   * Calcula el monto total en USD pagado por un cliente (solo pedidos aceptados).
   * Lógica de negocio (Modelo) para mantener los cálculos fuera de la vista y del controlador.
   * @param cedula Cédula del cliente a consultar
   */
  public calcularTotalUSDCliente(cedula: number): number {
    return this.obtenerPedidosPorCedula(cedula)
      .filter(p => p.status === "aceptado")
      .reduce((sum, p) => sum + p.montoTotal$, 0);
  }

  /**
   * Calcula el monto total en Bolívares pagado por un cliente (solo pedidos aceptados).
   * Lógica de negocio (Modelo) para evitar cálculos matemáticos en el controlador o en la vista.
   * @param cedula Cédula del cliente a consultar
   */
  public calcularTotalBsCliente(cedula: number): number {
    return this.obtenerPedidosPorCedula(cedula)
      .filter(p => p.status === "aceptado")
      .reduce((sum, p) => sum + p.montoTotalBs, 0);
  }


  public calcularPendientes(): number {
    return this._pedidos.filter(p => p.status === "pendiente").length;
  }

  public calcularAceptados(): number {
    return this._pedidos.filter(p => p.status === "aceptado").length;
  }

  public calcularRechazados(): number {
    return this._pedidos.filter(p => p.status === "rechazado").length;
  }

  public calcularMontoAceptadoUsd(): number {
    return this._pedidos
      .filter(p => p.status === "aceptado")
      .reduce((acum, p) => acum + p.montoTotal$, 0);
  }

  public calcularMontoAceptadoBs(): number {
    return this.calcularMontoAceptadoUsd() * this._tasaCambio;
  }

  /**
   * LÓGICA DE NEGOCIO: Busca cuál es el producto que más se ha vendido en todo el cafetín.
   * 
   * ¿Cómo funciona?
   * 1. Revisa todos los pedidos registrados en el sistema.
   * 2. Filtra solo los pedidos que ya fueron "aceptados" (pagados y confirmados).
   * 3. Cuenta cuántas unidades de cada producto se han vendido, sin importar si lo escribieron 
   *    con mayúsculas o minúsculas (ej. trata "Empanada" y "empanada" como lo mismo).
   * 4. Al final, busca cuál producto tuvo el número más alto y lo devuelve como texto.
   */
  public obtenerProductoMasPedido(): string {
    // 1. DICCIONARIOS (Cajas para guardar datos)
    // conteoGlobal: Guardará la cantidad total vendida. Ejemplo: { "hamburguesa": 5, "refresco": 2 }
    const conteoGlobal: { [key: string]: number } = {};
    
    // formatoOriginal: Guardará el nombre bonito para mostrar en pantalla. Ejemplo: { "hamburguesa": "Hamburguesa Especial" }
    const formatoOriginal: { [key: string]: string } = {};

    // 2. RECOPILAR DATOS DE CADA PEDIDO
    // Recorremos la lista completa de pedidos
    this._pedidos.forEach(pedido => {
      // Solo nos importan los pedidos que fueron aceptados (no sumamos los rechazados ni los pendientes)
      if (pedido.status === "aceptado") {
        // Pedimos la lista de productos de este pedido (ej: [{producto: "Empanada", cantidad: 2}])
        const desgloses = pedido.desglosarCantidades();
        
        // Recorremos cada producto que trajo este pedido
        desgloses.forEach(item => {
          if (item.producto) {
            // Limpiamos el nombre: le quitamos espacios a los lados y lo ponemos en minúsculas.
            // Así evitamos que "Empanada" y "empanada " se cuenten por separado.
            const nombreLimpio = item.producto.trim().toLowerCase();
            
            // Sumamos la cantidad vendida al acumulado global de ese producto.
            // Si el producto no existía en nuestra "caja", asume que era 0 y le suma la cantidad.
            conteoGlobal[nombreLimpio] = (conteoGlobal[nombreLimpio] || 0) + item.cantidad;
            
            // Guardamos el nombre original (con sus mayúsculas y acentos) para usarlo al final
            formatoOriginal[nombreLimpio] = item.producto.trim();
          }
        });
      }
    });

    // 3. BUSCAR EL GANADOR (El que más se vendió)
    let productoMasVendidoClave = ""; // Aquí guardaremos el nombre (en minúsculas) del ganador
    let maxCantidad = 0; // Aquí guardaremos el récord de ventas actual

    // Recorremos nuestra "caja" de conteoGlobal para ver quién tiene el número mayor
    for (const clave in conteoGlobal) {
      if (conteoGlobal[clave] > maxCantidad) {
        // Si encontramos uno que superó el récord actual, lo coronamos como el nuevo ganador
        maxCantidad = conteoGlobal[clave];
        productoMasVendidoClave = clave;
      }
    }

    // 4. DEVOLVER EL RESULTADO
    // Si encontramos un ganador que haya vendido al menos 1 unidad
    if (maxCantidad > 0 && productoMasVendidoClave !== "") {
      // Devolvemos el nombre bonito + la cantidad (ej: "Empanada de Pollo (15 unds)")
      return `${formatoOriginal[productoMasVendidoClave]} (${maxCantidad} unds)`;
    }

    // Si nadie vendió nada (o no hay pedidos aceptados), devolvemos "Ninguno"
    return "Ninguno";
  }

  public obtenerPedidosPorCedula(cedula: number): Cl_mPedido[] {
    return this._pedidos.filter(p => p.cedula === cedula);
  }
}