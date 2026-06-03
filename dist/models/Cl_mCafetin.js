import Cl_mPedido from "./Cl_mPedido.js";
export default class Cafetin {
    _tasaCambio;
    _pedidos = [];
    constructor(tasaInicial = 0) {
        this._tasaCambio = tasaInicial;
    }
    get tasaCambio() {
        return this._tasaCambio;
    }
    set tasaCambio(nuevaTasa) {
        this._tasaCambio = nuevaTasa;
    }
    setPedidos(arrayPlanos) {
        this._pedidos = [];
        arrayPlanos.forEach((p) => {
            this._pedidos.push(new Cl_mPedido({
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
            }));
        });
    }
    calcularTotalPedidos() {
        return this._pedidos.length;
    }
    calcularPendientes() {
        return this._pedidos.filter(p => p.status === "pendiente").length;
    }
    calcularAceptados() {
        return this._pedidos.filter(p => p.status === "aceptado").length;
    }
    calcularRechazados() {
        return this._pedidos.filter(p => p.status === "rechazado").length;
    }
    calcularMontoAceptadoUsd() {
        return this._pedidos
            .filter(p => p.status === "aceptado")
            .reduce((acum, p) => acum + p.montoTotal$, 0);
    }
    calcularMontoAceptadoBs() {
        return this.calcularMontoAceptadoUsd() * this._tasaCambio;
    }
    obtenerProductoMasPedido() {
        const conteoGlobal = {};
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
//# sourceMappingURL=Cl_mCafetin.js.map