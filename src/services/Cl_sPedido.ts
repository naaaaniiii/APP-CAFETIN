import Cl_mPedido from "../models/Cl_mPedido.js";
import Cl_sMockApi from "./Cl_sMockApi.js";

export default class Cl_sPedido extends Cl_sMockApi {
  static async obtenerProductos(): Promise<any[]> {
    const res = await this.getTabla({ tabla: "productos" });
    return res.ok ? res.tabla : [];
  }

  static async obtenerCuentasDestino(): Promise<any[]> {
    const res = await this.getTabla({ tabla: "cuentasBancarias" });
    return res.ok ? res.tabla : [];
  }

  static async obtenerTasaDinamica(): Promise<number> {
    const res = await this.getTabla({ tabla: "configuracion" });
    if (res.ok && res.tabla.length > 0) {
      const config = res.tabla[0];
      return config && config.tasaCambio ? parseFloat(config.tasaCambio) : 40.0;
    }
    return 40.0;
  }

  static async consultarEstadoPedido(cedula: number): Promise<any[]> {
    const res = await this.getTabla({ tabla: "pedidos" });
    if (res.ok) {
      return res.tabla.filter((p: any) => Number(p.cedula) === cedula);
    }
    return [];
  }

  static async guardarPedido(nuevoPedido: Cl_mPedido): Promise<{ ok: boolean; mensaje: string }> {
    try {
      const res = await this.getTabla({ tabla: "pedidos" });
      let nextId = 1;
      if (res.ok && res.tabla.length > 0) {
        const ids = res.tabla.map((p: any) => Number(p.idPed) || 0);
        nextId = Math.max(...ids) + 1;
      }
      const registro = nuevoPedido.toJSON() as any;
      registro.tabla = "pedidos";
      registro.idPed = nextId;
      return await this.agregar(registro);
    } catch (error: any) {
      return { ok: false, mensaje: "Error de red: " + error.message };
    }
  }
}