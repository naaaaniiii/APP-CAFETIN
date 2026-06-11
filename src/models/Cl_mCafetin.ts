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
          id: p.id || p._id,
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

  // MÉTODO CORREGIDO: Cuenta de forma segura sin importar mayúsculas/minúsculas ni espacios vacíos
  public obtenerProductoMasPedido(): string {
    const conteoGlobal: { [key: string]: number } = {};
    const formatoOriginal: { [key: string]: string } = {}; // Guarda el nombre bonito original para mostrarlo en el dashboard

    this._pedidos.forEach(pedido => {
      if (pedido.status === "aceptado") {
        const desgloses = pedido.desglosarCantidades();
        desgloses.forEach(item => {
          if (item.producto) {
            const nombreLimpio = item.producto.trim().toLowerCase();
            conteoGlobal[nombreLimpio] = (conteoGlobal[nombreLimpio] || 0) + item.cantidad;
            formatoOriginal[nombreLimpio] = item.producto.trim(); // Guarda "Empanada de Pollo" en vez de "empanada de pollo"
          }
        });
      }
    });

    let productoMasVendidoClave = "";
    let maxCantidad = 0;

    for (const clave in conteoGlobal) {
      if (conteoGlobal[clave] > maxCantidad) {
        maxCantidad = conteoGlobal[clave];
        productoMasVendidoClave = clave;
      }
    }

    if (maxCantidad > 0 && productoMasVendidoClave !== "") {
      return `${formatoOriginal[productoMasVendidoClave]} (${maxCantidad} unds)`;
    }

    return "Ninguno";
  }

  public obtenerPedidosPorCedula(cedula: number): Cl_mPedido[] {
    return this._pedidos.filter(p => p.cedula === cedula);
  }

  public static formatearCuenta({
    tipo,
    banco,
    titular,
    numero,
    cedula,
  }: {
    tipo: "transferencia" | "pagomovil";
    banco: string;
    titular: string;
    numero: string;
    cedula: string;
  }): any {
    if (tipo === "transferencia") {
      return {
        tipo,
        banco,
        titular,
        numero: `Titular: ${titular} | CI/RIF: ${cedula} | Nro: ${numero}`
      };
    } else {
      return {
        tipo,
        banco,
        titular: `CI/RIF: ${cedula}`,
        numero: `Tel: ${numero}`
      };
    }
  }
}