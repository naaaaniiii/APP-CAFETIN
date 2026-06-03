export default class vCafetin {
    inTasa;
    btTasa;
    inProdNombre;
    inProdPrecio;
    inProdCategoria;
    btProd;
    inCtaBanco;
    inCtaTitular;
    inCtaNumero;
    inCtaCedula;
    btCta;
    tablaPedidos;
    listaProductos;
    // NUEVOS SELECTORES PARA CONTROLAR LA INTERFAZ
    selectTipoFondo;
    grupoNombreTitular;
    lblDinamicoNumero;
    lblCtaCedula;
    manejadorAccionPedido;
    manejadorEliminarProducto;
    constructor() {
        this.inTasa = document.getElementById("admin_inTasa");
        this.btTasa = document.getElementById("admin_btTasa");
        this.inProdNombre = document.getElementById("admin_inProdNombre");
        this.inProdPrecio = document.getElementById("admin_inProdPrecio");
        this.inProdCategoria = document.getElementById("admin_inProdCategoria");
        this.btProd = document.getElementById("admin_btProd");
        this.inCtaBanco = document.getElementById("admin_inCtaBanco");
        this.inCtaTitular = document.getElementById("admin_inCtaTitular");
        this.inCtaNumero = document.getElementById("admin_inCtaNumero");
        this.inCtaCedula = document.getElementById("admin_inCtaCedula");
        this.btCta = document.getElementById("admin_btCta");
        this.tablaPedidos = document.getElementById("admin_tablaPedidos");
        this.listaProductos = document.getElementById("admin_listaProductos");
        // Inicialización de elementos dinámicos añadidos
        this.selectTipoFondo = document.getElementById("admin_selectTipoFondo");
        this.grupoNombreTitular = document.getElementById("grupoNombreTitular");
        this.lblDinamicoNumero = document.getElementById("lblDinamicoNumero");
        this.lblCtaCedula = document.getElementById("lblCtaCedula");
        // Escuchador de cambios para alternar las etiquetas y ocultar campos según requerimiento
        if (this.selectTipoFondo) {
            this.selectTipoFondo.onchange = () => this.alternarTipoRegistro();
        }
    }
    alternarTipoRegistro() {
        if (this.selectTipoFondo.value === "pagomovil") {
            this.grupoNombreTitular.classList.add("oculto");
            this.lblCtaCedula.innerText = "Cédula o RIF:";
            this.lblDinamicoNumero.innerText = "Número de Teléfono PM:";
            this.inCtaNumero.placeholder = "Ej. 04141234567";
        }
        else {
            this.grupoNombreTitular.classList.remove("oculto");
            this.lblCtaCedula.innerText = "Cédula o RIF del Titular:";
            this.lblDinamicoNumero.innerText = "Número de Cuenta (20 dígitos):";
            this.inCtaNumero.placeholder = "Ej. 01020000...";
        }
    }
    // --- GETTERS ---
    get nuevaTasa() { return parseFloat(this.inTasa.value.trim()) || 0; }
    get prodNombre() { return this.inProdNombre.value.trim(); }
    get prodPrecio() { return parseFloat(this.inProdPrecio.value.trim()) || 0; }
    get prodCategoria() { return this.inProdCategoria.value; }
    get cuentaBanco() { return this.inCtaBanco.value.trim(); }
    get cuentaTitular() { return this.inCtaTitular.value.trim(); }
    get cuentaNumero() { return this.inCtaNumero.value.trim(); }
    get cuentaCedula() { return this.inCtaCedula.value.trim(); }
    // Getter dinámico para que el controlador conozca la opción activa
    get tipoCuentaRegistrar() {
        return this.selectTipoFondo ? this.selectTipoFondo.value : "transferencia";
    }
    // --- MANEJADORES ---
    onActualizarTasa(callback) { this.btTasa.onclick = callback; }
    onAgregarProducto(callback) { this.btProd.onclick = callback; }
    onAgregarCuenta(callback) { this.btCta.onclick = callback; }
    onEliminarProducto(callback) { this.manejadorEliminarProducto = callback; }
    onAccionPedido(callback) { this.manejadorAccionPedido = callback; }
    setTasaActual(tasa) { this.inTasa.value = tasa.toString(); }
    // --- RENDERIZADO ---
    renderizarEstadisticas(datos) {
        const contenedor = document.getElementById("admin_contenedorEstadisticas");
        if (!contenedor)
            return;
        contenedor.innerHTML = `
      <div class="stat-container">
        <div class="stat-box"> <small>Total de Pedidos</small> <h2>${datos.total}</h2> </div>
        <div class="stat-box"> <small>Pendientes</small> <h2>${datos.pendientes}</h2> </div>
        <div class="stat-box"> <small>Aceptados</small> <h2>${datos.aceptados}</h2> </div>
        <div class="stat-box"> <small>Rechazados</small> <h2>${datos.rechazados}</h2> </div>
        <div class="stat-box stat-monto"> 
          <small>Monto Aceptado</small> 
          <h2>Bs. ${datos.montoBs.toFixed(2)}</h2>
          <p class="monto-dolar">($ ${datos.monto$ ? datos.monto$.toFixed(2) : '0.00'})</p>
        </div>
        <div class="stat-box"> <small>Más Pedido</small> <h2>${datos.masPedido}</h2> </div>
      </div>`;
    }
    renderizarPedidos(pedidos) {
        this.tablaPedidos.innerHTML = pedidos.length === 0
            ? `<tr><td colspan="7" class="text-center">No hay pedidos registrados</td></tr>`
            : "";
        pedidos.forEach(p => {
            const claseStatus = p.status === "aceptado" ? "status-aceptado" : p.status === "rechazado" ? "status-rechazado" : "status-pendiente";
            const tr = document.createElement("tr");
            tr.innerHTML = `
        <td><b>${p.id}</b></td>
        <td>${p.cedula}<br><small>${p.nombre}</small></td>
        <td>${p.resumenProductos}</td>
        <td><b>${p.montoTotal$.toFixed(2)}$</b><br><small>${p.montoTotalBs} Bs</small></td>
        <td>
          <small><b>Origen:</b> ${p.cuentaOrigen || 'N/A'}</small><br>
          <small><b>Destino:</b> ${p.cuentaDestino || 'N/A'}</small>
        </td> 
        <td><span class="ref-badge">${p.referencia || 'N/A'}</span></td>
        <td>
          ${p.status === "pendiente" ? `
            <button class="btn-ok" data-id="${p.id}">✓</button>
            <button class="btn-no" data-id="${p.id}">✗</button>
          ` : `<span class="badge ${claseStatus}">${p.status.toUpperCase()}</span>`}
        </td>`;
            this.tablaPedidos.appendChild(tr);
        });
        this.tablaPedidos.querySelectorAll(".btn-ok").forEach(b => b.addEventListener("click", () => this.manejadorAccionPedido(b.dataset.id, "aceptado")));
        this.tablaPedidos.querySelectorAll(".btn-no").forEach(b => b.addEventListener("click", () => this.manejadorAccionPedido(b.dataset.id, "rechazado")));
    }
    renderizarListaProductos(productos) {
        this.listaProductos.innerHTML = productos.length === 0 ? `<li>No hay productos</li>` : "";
        productos.forEach(p => {
            const li = document.createElement("li");
            li.className = "prod-item";
            li.innerHTML = `
        <span>• <b>${p.nombre}</b> - ${p.precio.toFixed(2)}$</span>
        <button class="btn-del" data-id="${p.id}">🗑</button>`;
            this.listaProductos.appendChild(li);
            li.querySelector(".btn-del")?.addEventListener("click", () => this.manejadorEliminarProducto(p.id));
        });
    }
    limpiarFormProducto() {
        this.inProdNombre.value = "";
        this.inProdPrecio.value = "";
    }
    limpiarFormCuenta() {
        this.inCtaBanco.value = "";
        this.inCtaTitular.value = "";
        this.inCtaNumero.value = "";
        this.inCtaCedula.value = "";
    }
}
//# sourceMappingURL=Cl_vCafetin.js.map