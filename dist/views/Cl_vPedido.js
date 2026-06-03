export default class Cl_vPedido {
    inCedula;
    inNombre;
    inCuentaDestino;
    inCuentaOrigen;
    inReferencia;
    btSiguiente;
    btEnviar;
    lblTasa;
    lblTotalUSD;
    lblTotalBS;
    secPago;
    inCedulaBuscar;
    btBuscar;
    lblEstadoResultado;
    // NUEVOS ELEMENTOS DE LA UI PARA MÉTODOS DE PAGO Y ACORDEÓN
    selectMetodoPago;
    secCamposBanco;
    secCamposPunto;
    inPuntoCedula;
    inPuntoClave;
    selectPuntoTipo;
    lblInfoEfectivo;
    tasaCambio = 1;
    totalUSD = 0;
    totalBS = 0;
    carrito = {};
    cuentasBackend = []; // Guarda las cuentas de forma local
    constructor() {
        this.inCedula = document.getElementById("pedido_inCedula");
        this.inNombre = document.getElementById("pedido_inNombre");
        this.inCuentaDestino = document.getElementById("pedido_inCuentaDestino");
        this.inCuentaOrigen = document.getElementById("pedido_inCuentaOrigen");
        this.inReferencia = document.getElementById("pedido_inReferencia");
        this.btSiguiente = document.getElementById("pedido_btSiguiente");
        this.btEnviar = document.getElementById("pedido_btEnviar");
        this.lblTasa = document.getElementById("pedido_lblTasa");
        this.lblTotalUSD = document.getElementById("pedido_lblTotalUSD");
        this.lblTotalBS = document.getElementById("pedido_lblTotalBS");
        this.secPago = document.getElementById("secPago");
        this.inCedulaBuscar = document.getElementById("pedido_inCedulaBuscar");
        this.btBuscar = document.getElementById("pedido_btBuscar");
        this.lblEstadoResultado = document.getElementById("pedido_lblEstadoResultado");
        // Inicialización de selectores agregados
        this.selectMetodoPago = document.getElementById("pedido_selectMetodoPago");
        this.secCamposBanco = document.getElementById("secCamposBanco");
        this.secCamposPunto = document.getElementById("secCamposPunto");
        this.inPuntoCedula = document.getElementById("pedido_inPuntoCedula");
        this.inPuntoClave = document.getElementById("pedido_inPuntoClave");
        this.selectPuntoTipo = document.getElementById("pedido_selectPuntoTipo");
        this.lblInfoEfectivo = document.getElementById("pedido_lblInfoEfectivo");
        // Configuración inicial del comportamiento dinámico de pagos
        this.selectMetodoPago.onchange = () => this.alternarCamposPago();
        // Lógica del acordeón para las 5 secciones del menú
        document.querySelectorAll(".categoria-cabecera").forEach(header => {
            header.addEventListener("click", () => {
                const bloque = header.parentElement;
                if (bloque) {
                    bloque.classList.toggle("activo");
                }
            });
        });
        // Delegación de eventos para botones del carrito
        document.addEventListener("click", (e) => {
            const target = e.target;
            if (target.classList.contains("btn-sumar"))
                this.modificarCantidad(target.dataset.id, 1);
            if (target.classList.contains("btn-restar"))
                this.modificarCantidad(target.dataset.id, -1);
        });
        this.btSiguiente.onclick = () => {
            if (this.cedula === 0 || this.nombre === "") {
                alert("Por favor introduce tu cédula y nombre antes de continuar.");
                return;
            }
            if (this.totalUSD > 0) {
                this.secPago.classList.remove("oculto");
                this.secPago.scrollIntoView({ behavior: "smooth" });
            }
            else {
                alert("Debes agregar al menos un producto al carrito.");
            }
        };
    }
    modificarCantidad(id, incremento) {
        if (!this.carrito[id])
            return;
        this.carrito[id].cantidad = Math.max(0, this.carrito[id].cantidad + incremento);
        const lbl = document.getElementById(`cant-${id}`);
        if (lbl)
            lbl.innerText = this.carrito[id].cantidad.toString();
        this.calcularFactura();
    }
    alternarCamposPago() {
        const metodo = this.metodoPago;
        // Ocultar todos los sub-paneles por defecto
        this.secCamposBanco.classList.add("oculto");
        this.secCamposPunto.classList.add("oculto");
        this.lblInfoEfectivo.innerText = "";
        // Filtrar y actualizar el listado de cuentas disponibles según la selección
        if (metodo === "transferencia") {
            this.secCamposBanco.classList.remove("oculto");
            this.actualizarComboCuentasDestino("transferencia");
        }
        else if (metodo === "pagomovil") {
            this.secCamposBanco.classList.remove("oculto");
            this.actualizarComboCuentasDestino("pagomovil");
        }
        else if (metodo === "punto") {
            this.secCamposPunto.classList.remove("oculto");
        }
        else if (metodo === "efectivoUSD") {
            this.lblInfoEfectivo.innerText = "Por favor, entregue el monto exacto en billetes en la caja del cafetín.";
        }
        else if (metodo === "efectivoBS") {
            this.lblInfoEfectivo.innerText = "Por favor, realice el pago en efectivo en taquilla bajo la tasa de cambio vigente.";
        }
    }
    actualizarComboCuentasDestino(tipo) {
        const filtradas = this.cuentasBackend.filter(c => (c.tipo || "transferencia") === tipo);
        if (filtradas.length === 0) {
            this.inCuentaDestino.innerHTML = `<option value="Directo en Taquilla">No hay cuentas registradas - Pagar en taquilla</option>`;
            return;
        }
        this.inCuentaDestino.innerHTML = filtradas.map(c => `<option value="${c.banco} - ${c.numero}">${c.banco} - ${c.titular} (${c.numero})</option>`).join("");
    }
    // --- GETTERS ---
    get cedula() { return parseInt(this.inCedula.value.trim()) || 0; }
    get nombre() { return this.inNombre.value.trim(); }
    get montoTotal$() { return this.totalUSD; }
    get montoTotalBs() { return this.totalBS; }
    get cuentaOrigen() { return this.inCuentaOrigen.value.trim(); }
    get cuentaDestino() { return this.inCuentaDestino.value; }
    get referencia() { return this.inReferencia.value.trim(); }
    get cedulaABuscar() { return parseInt(this.inCedulaBuscar.value.trim()) || 0; }
    get metodoPago() {
        return this.selectMetodoPago.value;
    }
    get puntoCedula() { return parseInt(this.inPuntoCedula.value.trim()) || 0; }
    get puntoClave() { return this.inPuntoClave.value.trim(); }
    get puntoTipoCuenta() { return this.selectPuntoTipo.value; }
    get resumenProductos() {
        return Object.entries(this.carrito)
            .filter(([_, p]) => p.cantidad > 0)
            .map(([_, p]) => `${p.cantidad}x${p.nombre}`)
            .join(", ");
    }
    // --- MÉTODOS ---
    onEnviarPedido(callback) { this.btEnviar.onclick = callback; }
    onBuscarPedido(callback) { this.btBuscar.onclick = callback; }
    setTasa(tasa) {
        this.tasaCambio = tasa;
        this.lblTasa.innerText = tasa.toFixed(2);
    }
    cargarCuentasDestino(cuentas) {
        this.cuentasBackend = cuentas; // Almacenamiento local para filtros dinámicos
        this.alternarCamposPago(); // Renderiza por defecto según la opción inicial
    }
    renderizarMenu(productos) {
        productos.forEach(p => {
            this.carrito[p.id] = { nombre: p.nombre, cantidad: 0, precio: p.precio };
            const contenedor = document.querySelector(`#categoria-${p.categoria.toLowerCase()} .contenido`);
            if (!contenedor)
                return;
            const divItem = document.createElement("div");
            divItem.className = "producto-item";
            divItem.innerHTML = `
        <span><strong>${p.nombre}</strong> - ${p.precio.toFixed(2)}$</span>
        <div>
          <button type="button" class="btn-restar" data-id="${p.id}">-</button>
          <span id="cant-${p.id}">0</span>
          <button type="button" class="btn-sumar" data-id="${p.id}">+</button>
        </div>`;
            contenedor.appendChild(divItem);
        });
    }
    calcularFactura() {
        this.totalUSD = Object.values(this.carrito).reduce((acc, p) => acc + (p.cantidad * p.precio), 0);
        this.totalBS = this.totalUSD * this.tasaCambio;
        this.lblTotalUSD.innerText = this.totalUSD.toFixed(2);
        this.lblTotalBS.innerText = this.totalBS.toFixed(2);
    }
    limpiarFormulario() {
        this.inCedula.value = "";
        this.inNombre.value = "";
        this.inCuentaOrigen.value = "";
        this.inReferencia.value = "";
        this.inPuntoCedula.value = "";
        this.inPuntoClave.value = "";
        this.selectMetodoPago.value = "transferencia";
        Object.keys(this.carrito).forEach(id => this.carrito[id].cantidad = 0);
        document.querySelectorAll('[id^="cant-"]').forEach(el => (el.innerHTML = "0"));
        this.calcularFactura();
        this.alternarCamposPago();
        this.secPago.classList.add("oculto");
    }
    mostrarHistorial(cedula, pedidos) {
        if (pedidos.length === 0) {
            this.lblEstadoResultado.innerText = "No se encontraron pedidos.";
            return;
        }
        this.lblEstadoResultado.innerHTML = `
      <h4>Historial para C.I: ${cedula}</h4>
      <ul class="lista-pedidos">
        ${pedidos.map(p => `
          <li>
            Orden #${p.id || 'N/A'}: ${p.resumenProductos} -
            Estado: <b class="status-${p.status || 'pendiente'}">${(p.status || 'pendiente').toUpperCase()}</b>
          </li>
        `).join("")}
      </ul>`;
    }
}
//# sourceMappingURL=Cl_vPedido.js.map