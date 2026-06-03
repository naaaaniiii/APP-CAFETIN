import { I_vCafetin } from "../interfaces/I_vCafetin.js";

export default class vCafetin implements I_vCafetin {
  private inTasa: HTMLInputElement;
  private btTasa: HTMLButtonElement;
  private inProdNombre: HTMLInputElement;
  private inProdPrecio: HTMLInputElement;
  private inProdCategoria: HTMLSelectElement;
  private btProd: HTMLButtonElement;
  private inCtaBanco: HTMLInputElement;
  private inCtaTitular: HTMLInputElement;
  private inCtaNumero: HTMLInputElement;
  private inCtaCedula: HTMLInputElement;
  private btCta: HTMLButtonElement;
  private tablaPedidos: HTMLElement;
  private listaProductos: HTMLElement;

  // NUEVOS SELECTORES PARA CONTROLAR LA INTERFAZ
  private selectTipoFondo: HTMLSelectElement;
  private grupoNombreTitular: HTMLElement;
  private lblDinamicoNumero: HTMLElement;
  private lblCtaCedula: HTMLElement;

  private manejadorAccionPedido!: (id: string, accion: "aceptado" | "rechazado") => void;
  private manejadorEliminarProducto!: (id: string) => void;

  constructor() {
    this.inTasa = document.getElementById("admin_inTasa") as HTMLInputElement;
    this.btTasa = document.getElementById("admin_btTasa") as HTMLButtonElement;
    this.inProdNombre = document.getElementById("admin_inProdNombre") as HTMLInputElement;
    this.inProdPrecio = document.getElementById("admin_inProdPrecio") as HTMLInputElement;
    this.inProdCategoria = document.getElementById("admin_inProdCategoria") as HTMLSelectElement;
    this.btProd = document.getElementById("admin_btProd") as HTMLButtonElement;
    this.inCtaBanco = document.getElementById("admin_inCtaBanco") as HTMLInputElement;
    this.inCtaTitular = document.getElementById("admin_inCtaTitular") as HTMLInputElement;
    this.inCtaNumero = document.getElementById("admin_inCtaNumero") as HTMLInputElement;
    this.inCtaCedula = document.getElementById("admin_inCtaCedula") as HTMLInputElement;
    this.btCta = document.getElementById("admin_btCta") as HTMLButtonElement;
    this.tablaPedidos = document.getElementById("admin_tablaPedidos") as HTMLElement;
    this.listaProductos = document.getElementById("admin_listaProductos") as HTMLElement;

    // Inicialización de elementos dinámicos añadidos
    this.selectTipoFondo = document.getElementById("admin_selectTipoFondo") as HTMLSelectElement;
    this.grupoNombreTitular = document.getElementById("grupoNombreTitular") as HTMLElement;
    this.lblDinamicoNumero = document.getElementById("lblDinamicoNumero") as HTMLElement;
    this.lblCtaCedula = document.getElementById("lblCtaCedula") as HTMLElement;

    // Escuchador de cambios para alternar las etiquetas y ocultar campos según requerimiento
    if (this.selectTipoFondo) {
      this.selectTipoFondo.onchange = () => this.alternarTipoRegistro();
    }
  }

  private alternarTipoRegistro(): void {
    if (this.selectTipoFondo.value === "pagomovil") {
      this.grupoNombreTitular.classList.add("oculto");
      this.lblCtaCedula.innerText = "Cédula o RIF:";
      this.lblDinamicoNumero.innerText = "Número de Teléfono PM:";
      this.inCtaNumero.placeholder = "Ej. 04141234567";
    } else {
      this.grupoNombreTitular.classList.remove("oculto");
      this.lblCtaCedula.innerText = "Cédula o RIF del Titular:";
      this.lblDinamicoNumero.innerText = "Número de Cuenta (20 dígitos):";
      this.inCtaNumero.placeholder = "Ej. 01020000...";
    }
  }

  // --- GETTERS ---
  get nuevaTasa(): number { return parseFloat(this.inTasa.value.trim()) || 0; }
  get prodNombre(): string { return this.inProdNombre.value.trim(); }
  get prodPrecio(): number { return parseFloat(this.inProdPrecio.value.trim()) || 0; }
  get prodCategoria(): string { return this.inProdCategoria.value; }
  get cuentaBanco(): string { return this.inCtaBanco.value.trim(); }
  get cuentaTitular(): string { return this.inCtaTitular.value.trim(); }
  get cuentaNumero(): string { return this.inCtaNumero.value.trim(); }
  get cuentaCedula(): string { return this.inCtaCedula.value.trim(); }
  
  // Getter dinámico para que el controlador conozca la opción activa
  get tipoCuentaRegistrar(): "transferencia" | "pagomovil" {
    return this.selectTipoFondo ? (this.selectTipoFondo.value as any) : "transferencia";
  }

  // --- MANEJADORES ---
  onActualizarTasa(callback: () => void): void { this.btTasa.onclick = callback; }
  onAgregarProducto(callback: () => void): void { this.btProd.onclick = callback; }
  onAgregarCuenta(callback: () => void): void { this.btCta.onclick = callback; }
  onEliminarProducto(callback: (id: string) => void): void { this.manejadorEliminarProducto = callback; }
  onAccionPedido(callback: (id: string, accion: "aceptado" | "rechazado") => void): void { this.manejadorAccionPedido = callback; }

  setTasaActual(tasa: number): void { this.inTasa.value = tasa.toString(); }

  // --- RENDERIZADO ---
  public renderizarEstadisticas(datos: any): void {
    const contenedor = document.getElementById("admin_contenedorEstadisticas");
    if (!contenedor) return;
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

  renderizarPedidos(pedidos: any[]): void {
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

    this.tablaPedidos.querySelectorAll(".btn-ok").forEach(b =>
      b.addEventListener("click", () => this.manejadorAccionPedido((b as HTMLElement).dataset.id!, "aceptado")));
    this.tablaPedidos.querySelectorAll(".btn-no").forEach(b =>
      b.addEventListener("click", () => this.manejadorAccionPedido((b as HTMLElement).dataset.id!, "rechazado")));
  }

  renderizarListaProductos(productos: any[]): void {
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

  limpiarFormProducto(): void { 
    this.inProdNombre.value = ""; 
    this.inProdPrecio.value = ""; 
  }
  
  limpiarFormCuenta(): void {
    this.inCtaBanco.value = "";
    this.inCtaTitular.value = "";
    this.inCtaNumero.value = "";
    this.inCtaCedula.value = "";
  }
}
