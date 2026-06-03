import Cl_sMockApi from "./Cl_sMockApi.js";
export default class Cl_sPedido extends Cl_sMockApi {
    static urlPedidos = "https://6a14ae806c7db8aac054d899.mockapi.io/pedidos";
    static urlProductos = "https://6a14ae806c7db8aac054d899.mockapi.io/productos";
    static urlConfig = "https://6a1730e11b90031f81b2232e.mockapi.io/configuracion/1";
    static urlCuentas = "https://6a1730e11b90031f81b2232e.mockapi.io/cuentasBancarias";
    static async obtenerProductos() {
        return await this.gett(this.urlProductos);
    }
    static async obtenerCuentasDestino() {
        return await this.gett(this.urlCuentas);
    }
    static async obtenerTasaDinamica() {
        const data = await this.gett(this.urlConfig);
        return data && data.tasaCambio ? parseFloat(data.tasaCambio) : 40.0;
    }
    static async consultarEstadoPedido(cedula) {
        return await this.gett(`${this.urlPedidos}?cedula=${cedula}`);
    }
    static async guardarPedido(nuevoPedido) {
        return await this.postt(this.urlPedidos, nuevoPedido);
    }
}
//# sourceMappingURL=Cl_sPedido.js.map