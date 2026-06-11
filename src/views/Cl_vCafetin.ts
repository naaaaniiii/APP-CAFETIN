import { I_vCafetin } from "../interfaces/I_vCafetin.js";

export default class vCafetin implements I_vCafetin {
  private inTasa: HTMLInputElement;
  private btTasa: HTMLButtonElement;
  private inProdCodigo: HTMLInputElement;
  private inProdNombre: HTMLInputElement;
  private inProdPrecio: HTMLInputElement;
  private inProdCategoria: HTMLSelectElement;
  private btProd: HTMLButtonElement;
  private inCtaBanco: HTMLSelectElement;
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
  private selectBanco: HTMLSelectElement;

  // SELECTORES PARA LA CONSULTA DE CLIENTES
  private inCedulaBuscar: HTMLInputElement;
  private btBuscarCliente: HTMLButtonElement;
  private lblResultadoCliente: HTMLElement;

  private manejadorAccionPedido!: (id: string, accion: "aceptado" | "rechazado") => void;
  private manejadorEliminarProducto!: (id: string) => void;

  constructor() {
    this.inTasa = document.getElementById("admin_inTasa") as HTMLInputElement;
    this.btTasa = document.getElementById("admin_btTasa") as HTMLButtonElement;
    this.inProdCodigo = document.getElementById("admin_inProdCodigo") as HTMLInputElement;
    this.inProdNombre = document.getElementById("admin_inProdNombre") as HTMLInputElement;
    this.inProdPrecio = document.getElementById("admin_inProdPrecio") as HTMLInputElement;
    this.inProdCategoria = document.getElementById("admin_inProdCategoria") as HTMLSelectElement;
    this.btProd = document.getElementById("admin_btProd") as HTMLButtonElement;
    this.inCtaBanco = document.getElementById("admin_selectBanco") as HTMLSelectElement;
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
    this.selectBanco = document.getElementById("admin_selectBanco") as HTMLSelectElement;
    
    // Inicialización de elementos de búsqueda de cliente
    this.inCedulaBuscar = document.getElementById("admin_inCedulaBuscar") as HTMLInputElement;
    this.btBuscarCliente = document.getElementById("admin_btBuscarCliente") as HTMLButtonElement;
    this.lblResultadoCliente = document.getElementById("admin_lblResultadoCliente") as HTMLElement;

    // Configuración de la navegación en el panel de administración
    const btnsNav = document.querySelectorAll(".btn-nav-admin");
    const sections = ["sec-tasa", "sec-producto", "sec-cuenta","sec-menu", "sec-cliente"];

    const mostrarSeccionAdmin = (targetId: string) => {
      sections.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
          if (id === targetId) {
            el.classList.remove("oculto");
          } else {
            el.classList.add("oculto");
          }
        }
      });
    };

    btnsNav.forEach(btn => {
      btn.addEventListener("click", () => {
        btnsNav.forEach(b => b.classList.remove("activo"));
        btn.classList.add("activo");
        const target = btn.getAttribute("data-target");
        if (target) {
          mostrarSeccionAdmin(target);
        }
      });
    });

    // Iniciar con la sección de tasa visible por defecto
    mostrarSeccionAdmin("sec-tasa");
  }

  onCambiarTipoFondo(callback: () => void): void {
    if (this.selectTipoFondo) {
      this.selectTipoFondo.onchange = callback;
    }
  }

  mostrarFormularioPagoMovil(): void {
    this.grupoNombreTitular.classList.add("oculto");
    this.lblCtaCedula.innerText = "Cédula o RIF:";
    this.lblDinamicoNumero.innerText = "Número de Teléfono PM:";
    this.inCtaNumero.placeholder = "Ej. 04141234567";
  }

  mostrarFormularioTransferencia(): void {
    this.grupoNombreTitular.classList.remove("oculto");
    this.lblCtaCedula.innerText = "Cédula o RIF del Titular:";
    this.lblDinamicoNumero.innerText = "Número de Cuenta (20 dígitos):";
    this.inCtaNumero.placeholder = "Ej. 01020000...";
  }

  // --- GETTERS ---
  get nuevaTasa(): number { 
    return parseFloat(this.inTasa.value.trim()) || 0; 
  }
  get prodCodigo(): string {
     return this.inProdCodigo.value.trim(); 
    }
  get prodNombre(): string {
     return this.inProdNombre.value.trim(); 
    }
  get prodPrecio(): number { 
    return parseFloat(this.inProdPrecio.value.trim()) || 0; 
  }
  get prodCategoria(): string { 
    return this.inProdCategoria.value; 
  }
  get cuentaBanco(): string { 
    return this.inCtaBanco.value.trim();
   }
  get cuentaTitular(): string {
     return this.inCtaTitular.value.trim();
     }
  get cuentaNumero(): string {
     return this.inCtaNumero.value.trim(); 
    }
  get cuentaCedula(): string { 
    return this.inCtaCedula.value.trim(); 
  }
  
  // Getter dinámico para que el controlador conozca la opción activa
  get tipoCuentaRegistrar(): "transferencia" | "pagomovil" {
    return this.selectTipoFondo ? (this.selectTipoFondo.value as any) : "transferencia";
  }

  // Getters y métodos de búsqueda de cliente
  get cedulaABuscar(): number {
    return parseInt(this.inCedulaBuscar.value.trim()) || 0;
  }

  /**
   * Vincula el evento click del botón de buscar cliente a un callback provisto por el controlador.
   * Evita lógica del controlador en la vista y mantiene el flujo MVC limpio.
   */
  onBuscarCliente(callback: () => void): void {
    if (this.btBuscarCliente) {
      this.btBuscarCliente.onclick = callback;
    }
  }
  mostrarTotalPagadoCliente(cedula: number, totalUSD: number, totalBs: number): void {
    if (cedula === 0) {
      this.lblResultadoCliente.innerHTML = "";
      this.lblResultadoCliente.style.display = "none";
      return;
    }
    this.lblResultadoCliente.innerHTML = `
      <h4>Resultado para C.I: ${cedula}</h4>
      <div style="margin-top: 10px; padding: 12px; background-color: #e8f5e9; border-left: 4px solid #2e7d32; border-radius: 8px;">
        <strong>Total Pagado (Aceptado):</strong>
        <span style="color: #2e7d32; font-weight: bold; margin-left: 5px;">$${totalUSD.toFixed(2)}</span>
        <span style="color: #1565c0; font-weight: bold; margin-left: 5px;">/ ${totalBs.toFixed(2)} Bs</span>
      </div>`;
    this.lblResultadoCliente.style.display = "block";
  }

  // --- MANEJADORES ---
  onActualizarTasa(callback: () => void): void {
      this.btTasa.onclick = callback; 
    }
  onAgregarProducto(callback: () => void): void { 
    this.btProd.onclick = callback; 
  }
  onAgregarCuenta(callback: () => void): void { 
    this.btCta.onclick = callback;
   }
  onEliminarProducto(callback: (id: string) => void): void {
     this.manejadorEliminarProducto = callback; 
    }
  onAccionPedido(callback: (id: string, accion: "aceptado" | "rechazado") => void): void { 
    this.manejadorAccionPedido = callback;
   }
  setTasaActual(tasa: number): void { 
    this.inTasa.value = tasa.toString(); 
  }
  // --- RENDERIZADO ---
  /**
   * Renderiza el panel de estadísticas en la interfaz de administración.
   * Recibe la información procesada por el controlador/modelo, incluyendo los porcentajes calculados.
   */
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
        <span>• [${p.codigo || 'S/C'}] <b>${p.nombre}</b> - ${p.precio.toFixed(2)}$</span>
        <button class="btn-del" data-id="${p.id}">🗑</button>`;
      this.listaProductos.appendChild(li);
      li.querySelector(".btn-del")?.addEventListener("click", () => this.manejadorEliminarProducto(p.id));
    });
  }

  limpiarFormProducto(): void { 
    this.inProdCodigo.value = ""; 
    this.inProdNombre.value = ""; 
    this.inProdPrecio.value = ""; 
  }
  
  limpiarFormCuenta(): void {
    this.inCtaBanco.value = "";
    this.inCtaTitular.value = "";
    this.inCtaNumero.value = "";
    this.inCtaCedula.value = "";
    this.selectBanco.value = "";
  }
}
