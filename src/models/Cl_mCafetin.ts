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
          id: p.id,
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

  public obtenerProductoMasPedido(): string {
    const conteoGlobal: { [key: string]: number } = {};

    this._pedidos.forEach(pedido => {
      if (pedido.status === "aceptado") {
        const desgloses = pedido.desglosarCantidades();
        desgloses.forEach(item => {
          conteoGlobal[item.producto] = (conteoGlobal[item.producto] || 0) + item.cantidad;
        });
      }
    });

    let productoMasVendido = "Ninguno";
    let maxCantidad = 0;

    for (const producto in conteoGlobal) {
      if (conteoGlobal[producto] > maxCantidad) {
        maxCantidad = conteoGlobal[producto];
        productoMasVendido = producto;
      }
    }

    return maxCantidad > 0 ? `${productoMasVendido} (${maxCantidad} unds)` : "Ninguno";
  }
}