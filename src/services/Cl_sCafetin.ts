import Cl_sMockApiCaf from "./Cl_sMockApi.js";

export default class Cl_sCafetin {
  private static urlPedidos = "https://6a14ae806c7db8aac054d899.mockapi.io/pedidos";
  private static urlProductos = "https://6a14ae806c7db8aac054d899.mockapi.io/productos";
  private static urlConfig = "https://6a1730e11b90031f81b2232e.mockapi.io/configuracion/1";
  private static urlCuentas = "https://6a1730e11b90031f81b2232e.mockapi.io/cuentasBancarias";

  static async obtenerPedidos() { 
    return await Cl_sMockApiCaf.get(this.urlPedidos); 
}

  static async actualizarEstadoPedido(id: string, status: string) {
    return await Cl_sMockApiCaf.put(`${this.urlPedidos}/${id}`, { status });
  }

  static async obtenerProductos() { 
    return await Cl_sMockApiCaf.get(this.urlProductos);
 }

  static async agregarProducto(prod: any) { 
    return await Cl_sMockApiCaf.post(this.urlProductos, prod);
 }

  static async eliminarProducto(id: string) { 
    return await Cl_sMockApiCaf.delete(`${this.urlProductos}/${id}`); 
}

  static async obtenerTasa(): Promise<number> {
    const data = await Cl_sMockApiCaf.get(this.urlConfig);
    return parseFloat(data.tasaCambio) || 40.0;
  }

  static async actualizarTasa(nuevaTasa: number) {
    return await Cl_sMockApiCaf.put(this.urlConfig, { tasaCambio: nuevaTasa });
  }

  static async agregarCuenta(cuenta: any) { 
    return await Cl_sMockApiCaf.post(this.urlCuentas, cuenta); 
}
}
