export default class Cl_mPedido {
    _id = "";
    _cedula = 0;
    _nombre = "";
    _resumenProductos = "";
    _montoTotal$ = 0;
    _montoTotalBs = 0;
    _metodoPago = "transferencia";
    _cuentaOrigen = "";
    _cuentaDestino = "";
    _referencia = "";
    // Campos específicos de Punto de Venta
    _puntoCedula = 0;
    _puntoTipoCuenta = "";
    _puntoClave = "";
    _status = "pendiente";
    constructor({ id, cedula, nombre, resumenProductos, montoTotal$, montoTotalBs, metodoPago = "transferencia", cuentaOrigen = "", cuentaDestino = "", referencia = "", puntoCedula = 0, puntoTipoCuenta = "", puntoClave = "", status = "pendiente", }) {
        this.id = id;
        this.cedula = cedula;
        this.nombre = nombre;
        this.resumenProductos = resumenProductos;
        this.montoTotal$ = montoTotal$;
        this.montoTotalBs = montoTotalBs;
        this.metodoPago = metodoPago;
        this.cuentaOrigen = cuentaOrigen;
        this.cuentaDestino = cuentaDestino;
        this.referencia = referencia;
        this.puntoCedula = puntoCedula;
        this.puntoTipoCuenta = puntoTipoCuenta;
        this.puntoClave = puntoClave;
        this.status = status;
    }
    get id() {
        return this._id;
    }
    set id(value) {
        this._id = value;
    }
    get cedula() {
        return this._cedula;
    }
    set cedula(value) {
        this._cedula = value;
    }
    get nombre() {
        return this._nombre;
    }
    set nombre(value) {
        this._nombre = value;
    }
    get resumenProductos() {
        return this._resumenProductos;
    }
    set resumenProductos(value) {
        this._resumenProductos = value;
    }
    get montoTotal$() {
        return this._montoTotal$;
    }
    set montoTotal$(value) {
        this._montoTotal$ = value;
    }
    get montoTotalBs() {
        return this._montoTotalBs;
    }
    set montoTotalBs(value) {
        this._montoTotalBs = value;
    }
    get metodoPago() {
        return this._metodoPago;
    }
    set metodoPago(value) {
        this._metodoPago = value;
    }
    get cuentaOrigen() {
        return this._cuentaOrigen;
    }
    set cuentaOrigen(value) {
        this._cuentaOrigen = value;
    }
    get cuentaDestino() {
        return this._cuentaDestino;
    }
    set cuentaDestino(value) {
        this._cuentaDestino = value;
    }
    get referencia() {
        return this._referencia;
    }
    set referencia(value) {
        this._referencia = value;
    }
    get puntoCedula() {
        return this._puntoCedula;
    }
    set puntoCedula(value) {
        this._puntoCedula = value;
    }
    get puntoTipoCuenta() {
        return this._puntoTipoCuenta;
    }
    set puntoTipoCuenta(value) {
        this._puntoTipoCuenta = value;
    }
    get puntoClave() {
        return this._puntoClave;
    }
    set puntoClave(value) {
        this._puntoClave = value;
    }
    get status() {
        return this._status;
    }
    set status(value) {
        this._status = value;
    }
    desglosarCantidades() {
        const listado = [];
        if (!this.resumenProductos)
            return listado;
        let itemActual = "";
        let parentesis = 0;
        for (let i = 0; i < this.resumenProductos.length; i++) {
            const caracter = this.resumenProductos[i];
            if (caracter === '(')
                parentesis++;
            if (caracter === ')')
                parentesis--;
            if (caracter === ',' && parentesis === 0) {
                this.extraerUnidades(itemActual.trim(), listado);
                itemActual = "";
            }
            else {
                itemActual += caracter;
            }
        }
        if (itemActual.trim()) {
            this.extraerUnidades(itemActual.trim(), listado);
        }
        return listado;
    }
    extraerUnidades(str, listado) {
        const posX = str.indexOf('x');
        if (posX !== -1) {
            const cantStr = str.substring(0, posX).trim();
            const prodStr = str.substring(posX + 1).trim();
            const cantidad = parseInt(cantStr, 10);
            if (!isNaN(cantidad) && prodStr) {
                listado.push({ producto: prodStr, cantidad: cantidad });
            }
        }
        else {
            listado.push({ producto: str, cantidad: 1 });
        }
    }
    static calcularTotalesAceptados(pedidos) {
        const pedidosAceptados = pedidos.filter((p) => p.status === "aceptado");
        const totalUSD = pedidosAceptados.reduce((sum, p) => sum + (Number(p.montoTotal$) || 0), 0);
        const totalBs = pedidosAceptados.reduce((sum, p) => sum + (Number(p.montoTotalBs) || 0), 0);
        return { totalUSD, totalBs };
    }
    toJSON() {
        return {
            id: this.id,
            cedula: this.cedula,
            nombre: this.nombre,
            resumenProductos: this.resumenProductos,
            montoTotal$: this.montoTotal$,
            montoTotalBs: this.montoTotalBs,
            metodoPago: this.metodoPago,
            cuentaOrigen: this.cuentaOrigen,
            cuentaDestino: this.cuentaDestino,
            referencia: this.referencia,
            puntoCedula: this.puntoCedula,
            puntoTipoCuenta: this.puntoTipoCuenta,
            puntoClave: this.puntoClave,
            status: this.status,
        };
    }
}
//# sourceMappingURL=Cl_mPedido.js.map