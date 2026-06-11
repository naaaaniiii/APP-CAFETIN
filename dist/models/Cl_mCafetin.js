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
            }));
        });
    }
    calcularTotalPedidos() {
        return this._pedidos.length;
    }
    /**
     * Calcula el monto total en USD pagado por un cliente (solo pedidos aceptados).
     * Lógica de negocio (Modelo) para mantener los cálculos fuera de la vista y del controlador.
     * @param cedula Cédula del cliente a consultar
     */
    calcularTotalUSDCliente(cedula) {
        return this.obtenerPedidosPorCedula(cedula)
            .filter(p => p.status === "aceptado")
            .reduce((sum, p) => sum + p.montoTotal$, 0);
    }
    /**
     * Calcula el monto total en Bolívares pagado por un cliente (solo pedidos aceptados).
     * Lógica de negocio (Modelo) para evitar cálculos matemáticos en el controlador o en la vista.
     * @param cedula Cédula del cliente a consultar
     */
    calcularTotalBsCliente(cedula) {
        return this.obtenerPedidosPorCedula(cedula)
            .filter(p => p.status === "aceptado")
            .reduce((sum, p) => sum + p.montoTotalBs, 0);
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
    // MÉTODO CORREGIDO: Cuenta de forma segura sin importar mayúsculas/minúsculas ni espacios vacíos
    obtenerProductoMasPedido() {
        const conteoGlobal = {};
        const formatoOriginal = {}; // Guarda el nombre bonito original para mostrarlo en el dashboard
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
    obtenerPedidosPorCedula(cedula) {
        return this._pedidos.filter(p => p.cedula === cedula);
    }
    static formatearCuenta({ tipo, banco, titular, numero, cedula, }) {
        if (tipo === "transferencia") {
            return {
                tipo,
                banco,
                titular,
                numero: `Titular: ${titular} | CI/RIF: ${cedula} | Nro: ${numero}`
            };
        }
        else {
            return {
                tipo,
                banco,
                titular: `CI/RIF: ${cedula}`,
                numero: `Tel: ${numero}`
            };
        }
    }
}
//# sourceMappingURL=Cl_mCafetin.js.map