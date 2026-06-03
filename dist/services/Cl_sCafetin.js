import Cl_sMockApiCaf from "./Cl_sMockApi.js";
export default class Cl_sCafetin {
    static urlPedidos = "https://6a14ae806c7db8aac054d899.mockapi.io/pedidos";
    static urlProductos = "https://6a14ae806c7db8aac054d899.mockapi.io/productos";
    static urlConfig = "https://6a1730e11b90031f81b2232e.mockapi.io/configuracion/1";
    static urlCuentas = "https://6a1730e11b90031f81b2232e.mockapi.io/cuentasBancarias";
    static async obtenerPedidos() {
        return await Cl_sMockApiCaf.get(this.urlPedidos);
    }
    static async actualizarEstadoPedido(id, status) {
        return await Cl_sMockApiCaf.put(`${this.urlPedidos}/${id}`, { status });
    }
    static async obtenerProductos() {
        return await Cl_sMockApiCaf.get(this.urlProductos);
    }
    static async agregarProducto(prod) {
        return await Cl_sMockApiCaf.post(this.urlProductos, prod);
    }
    static async eliminarProducto(id) {
        return await Cl_sMockApiCaf.delete(`${this.urlProductos}/${id}`);
    }
    static async obtenerTasa() {
        const data = await Cl_sMockApiCaf.get(this.urlConfig);
        return parseFloat(data.tasaCambio) || 40.0;
    }
    static async actualizarTasa(nuevaTasa) {
        return await Cl_sMockApiCaf.put(this.urlConfig, { tasaCambio: nuevaTasa });
    }
    static async agregarCuenta(cuenta) {
        return await Cl_sMockApiCaf.post(this.urlCuentas, cuenta);
    }
}
//# sourceMappingURL=Cl_sCafetin.js.map