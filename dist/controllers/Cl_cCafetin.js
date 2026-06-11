import Cl_sCafetin from "../services/Cl_sCafetin.js";
import Cl_mCafetin from "../models/Cl_mCafetin.js";
export default class Cl_cCafetin {
    vista;
    modelo;
    constructor({ modelo, vista }) {
        this.vista = vista;
        this.modelo = modelo;
        // Disparamos la descarga y sincronización inicial de los paneles
        this.inicializarDashboard();
        // Vinculación de los eventos gráficos mediante callbacks controlados
        this.vista.onActualizarTasa(() => this.procesarTasa());
        this.vista.onAgregarProducto(() => this.procesarProducto());
        this.vista.onAgregarCuenta(() => this.procesarCuenta());
        this.vista.onAccionPedido((id, accion) => this.procesarAccionPedido(id, accion));
        this.vista.onEliminarProducto((id) => this.procesarEliminarProducto(id));
        this.vista.onBuscarCliente(() => this.procesarBuscarCliente());
        this.vista.onCambiarTipoFondo(() => this.procesarCambioTipoFondo());
    }
    async inicializarDashboard() {
        try {
            const tasa = await Cl_sCafetin.obtenerTasa();
            this.vista.setTasaActual(tasa);
            this.modelo.tasaCambio = tasa;
            const prods = await Cl_sCafetin.obtenerProductos();
            this.vista.renderizarListaProductos(prods);
            await this.cargarYRenderizarPedidos();
        }
        catch (error) {
            console.error("Error al inicializar el Dashboard Administrativo:", error);
        }
    }
    async cargarYRenderizarPedidos() {
        try {
            const pedsPlanos = await Cl_sCafetin.obtenerPedidos();
            this.modelo.setPedidos(pedsPlanos);
            this.vista.renderizarPedidos(pedsPlanos);
            this.vista.renderizarEstadisticas({
                total: this.modelo.calcularTotalPedidos(),
                pendientes: this.modelo.calcularPendientes(),
                aceptados: this.modelo.calcularAceptados(),
                rechazados: this.modelo.calcularRechazados(),
                montoBs: this.modelo.calcularMontoAceptadoBs(),
                monto$: this.modelo.calcularMontoAceptadoUsd(),
                masPedido: this.modelo.obtenerProductoMasPedido()
            });
        }
        catch (error) {
            console.error("Error al refrescar las métricas operativas:", error);
        }
    }
    async procesarAccionPedido(id, accion) {
        if (!confirm(`¿Confirmar acción: ${accion.toUpperCase()} para la orden #${id}?`))
            return;
        try {
            if (await Cl_sCafetin.actualizarEstadoPedido(id, accion)) {
                alert(`Orden #${id} actualizada con éxito.`);
                await this.cargarYRenderizarPedidos();
            }
        }
        catch {
            alert("Error de comunicación al actualizar el estado de la orden.");
        }
    }
    async procesarTasa() {
        const t = this.vista.nuevaTasa;
        if (t <= 0) {
            alert("Introduzca una tasa válida mayor a cero.");
            return;
        }
        try {
            if (await Cl_sCafetin.actualizarTasa(t)) {
                this.modelo.tasaCambio = t;
                await this.cargarYRenderizarPedidos();
                alert("Tasa del día sincronizada correctamente en la nube.");
            }
        }
        catch {
            alert("Error de red al actualizar la configuración de la tasa.");
        }
    }
    async procesarProducto() {
        if (!this.vista.prodCodigo || !this.vista.prodNombre || this.vista.prodPrecio <= 0) {
            alert("Complete los campos del producto correctamente (debe incluir el código).");
            return;
        }
        const nuevoProducto = {
            codigo: this.vista.prodCodigo,
            nombre: this.vista.prodNombre,
            precio: this.vista.prodPrecio,
            categoria: this.vista.prodCategoria
        };
        try {
            if (await Cl_sCafetin.agregarProducto(nuevoProducto)) {
                alert("¡Producto incorporado al menú del cafetín exitosamente!");
                this.vista.limpiarFormProducto();
                const prods = await Cl_sCafetin.obtenerProductos();
                this.vista.renderizarListaProductos(prods);
            }
        }
        catch {
            alert("Error al intentar añadir el producto.");
        }
    }
    async procesarCuenta() {
        const tipoFondo = this.vista.tipoCuentaRegistrar;
        if (tipoFondo === "transferencia") {
            if (!this.vista.cuentaBanco || !this.vista.cuentaTitular || !this.vista.cuentaNumero || !this.vista.cuentaCedula) {
                alert("Por favor, rellene todos los campos de la cuenta bancaria.");
                return;
            }
            const cta = Cl_mCafetin.formatearCuenta({
                tipo: "transferencia",
                banco: this.vista.cuentaBanco,
                titular: this.vista.cuentaTitular,
                numero: this.vista.cuentaNumero,
                cedula: this.vista.cuentaCedula,
            });
            try {
                if (await Cl_sCafetin.agregarCuenta(cta)) {
                    alert("¡Cuenta receptora de Transferencia registrada con éxito!");
                    this.vista.limpiarFormCuenta();
                }
            }
            catch {
                alert("Error de red al registrar la cuenta bancaria.");
            }
        }
        else if (tipoFondo === "pagomovil") {
            if (!this.vista.cuentaBanco || !this.vista.cuentaCedula || !this.vista.cuentaNumero) {
                alert("Por favor, complete Banco, Cédula y Teléfono para Pago Móvil.");
                return;
            }
            const ctaPM = Cl_mCafetin.formatearCuenta({
                tipo: "pagomovil",
                banco: this.vista.cuentaBanco,
                titular: "",
                numero: this.vista.cuentaNumero,
                cedula: this.vista.cuentaCedula,
            });
            try {
                if (await Cl_sCafetin.agregarCuenta(ctaPM)) {
                    alert("¡Pago Móvil registrado con éxito!");
                    this.vista.limpiarFormCuenta();
                }
            }
            catch {
                alert("Error de red al registrar el canal de Pago Móvil.");
            }
        }
    }
    async procesarEliminarProducto(id) {
        if (!confirm("¿Está seguro de que desea remover este producto del menú?"))
            return;
        try {
            if (await Cl_sCafetin.eliminarProducto(id)) {
                alert("Producto eliminado del menú.");
                const prods = await Cl_sCafetin.obtenerProductos();
                this.vista.renderizarListaProductos(prods);
            }
        }
        catch {
            alert("Error al intentar dar de baja el producto.");
        }
    }
    /**
     * Procesa la consulta del total pagado por un cliente.
     * Coordina el flujo obteniendo la cédula desde la Vista, invocando los métodos del Modelo
     * para efectuar el cálculo del total (USD y Bs), y enviando los resultados de vuelta a la Vista para su visualización.
     */
    procesarBuscarCliente() {
        const cedula = this.vista.cedulaABuscar;
        if (cedula === 0) {
            alert("Por favor, introduzca una cédula válida.");
            return;
        }
        const totalUSD = this.modelo.calcularTotalUSDCliente(cedula);
        const totalBs = this.modelo.calcularTotalBsCliente(cedula);
        this.vista.mostrarTotalPagadoCliente(cedula, totalUSD, totalBs);
    }
    procesarCambioTipoFondo() {
        const tipo = this.vista.tipoCuentaRegistrar;
        if (tipo === "pagomovil") {
            this.vista.mostrarFormularioPagoMovil();
        }
        else {
            this.vista.mostrarFormularioTransferencia();
        }
    }
}
//# sourceMappingURL=Cl_cCafetin.js.map