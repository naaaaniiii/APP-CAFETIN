import Cl_sMockApiCaf from "./Cl_sMockApi.js";

export default class Cl_sCafetin {
  static async obtenerPedidos(): Promise<any[]> {
    const res = await Cl_sMockApiCaf.getTabla({ tabla: "pedidos" });
    return res.ok ? res.tabla : [];
  }

  static async actualizarEstadoPedido(idPed: number, status: string): Promise<boolean> {
    const res = await Cl_sMockApiCaf.getTabla({ tabla: "pedidos" });
    if (res.ok) {
      const pedido = res.tabla.find((p: any) => p.idPed === idPed);
      if (pedido) {
        pedido.status = status;
        const modRes = await Cl_sMockApiCaf.modificar(idPed, pedido, "idPed");
        return modRes.ok;
      }
    }
    return false;
  }

  static async obtenerProductos(): Promise<any[]> {
    const res = await Cl_sMockApiCaf.getTabla({ tabla: "productos" });
    return res.ok ? res.tabla : [];
  }

  static async agregarProducto(prod: any): Promise<boolean> {
    const res = await Cl_sMockApiCaf.getTabla({ tabla: "productos" });
    let nextId = 1;
    if (res.ok && res.tabla.length > 0) {
      const ids = res.tabla.map((p: any) => Number(p.idProd) || 0);
      nextId = Math.max(...ids) + 1;
    }
    prod.tabla = "productos";
    prod.idProd = nextId;
    const addRes = await Cl_sMockApiCaf.agregar(prod);
    return addRes.ok;
  }

  static async eliminarProducto(idProd: number): Promise<boolean> {
    const res = await Cl_sMockApiCaf.eliminar(idProd, "productos", "idProd");
    return res.ok;
  }

  static async obtenerTasa(): Promise<number> {
    const res = await Cl_sMockApiCaf.getTabla({ tabla: "configuracion" });
    if (res.ok && res.tabla.length > 0) {
      const config = res.tabla[0];
      return parseFloat(config.tasaCambio) || 40.0;
    }
    return 40.0;
  }

  static async actualizarTasa(nuevaTasa: number): Promise<boolean> {
    const res = await Cl_sMockApiCaf.getTabla({ tabla: "configuracion" });
    if (res.ok && res.tabla.length > 0) {
      const config = res.tabla[0];
      config.tasaCambio = nuevaTasa;
      const modRes = await Cl_sMockApiCaf.modificar(config.idConfig, config, "idConfig");
      return modRes.ok;
    } else {
      const config = {
        tabla: "configuracion",
        idConfig: 1,
        tasaCambio: nuevaTasa
      };
      const addRes = await Cl_sMockApiCaf.agregar(config);
      return addRes.ok;
    }
  }

  static async agregarCuenta(cuenta: any): Promise<boolean> {
    const res = await Cl_sMockApiCaf.getTabla({ tabla: "cuentasBancarias" });
    let nextId = 1;
    if (res.ok && res.tabla.length > 0) {
      const ids = res.tabla.map((c: any) => Number(c.idCuenta) || 0);
      nextId = Math.max(...ids) + 1;
    }
    cuenta.tabla = "cuentasBancarias";
    cuenta.idCuenta = nextId;
    const resAdd = await Cl_sMockApiCaf.agregar(cuenta);
    return resAdd.ok;
  }
}
