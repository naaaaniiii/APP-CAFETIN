import { I_vPedido } from "../interfaces/I_vPedido.js";

export default class Cl_vPedido implements I_vPedido {
  private inCedula: HTMLInputElement;
  private inNombre: HTMLInputElement;
  private inCuentaDestino: HTMLSelectElement;
  private inCuentaOrigen: HTMLInputElement;
  private inReferencia: HTMLInputElement;
  private btSiguiente: HTMLButtonElement;
  private btEnviar: HTMLButtonElement;
  private lblTasa: HTMLElement;
  private lblTotalUSD: HTMLElement;
  private lblTotalBS: HTMLElement;
  private secPago: HTMLElement;
  private inCedulaBuscar: HTMLInputElement;
  private btBuscar: HTMLButtonElement;
  public lblEstadoResultado: HTMLElement;

  // NUEVOS ELEMENTOS DE LA UI PARA MÉTODOS DE PAGO Y ACORDEÓN
  private selectMetodoPago: HTMLSelectElement;
  private secCamposBanco: HTMLElement;
  private secCamposPunto: HTMLElement;
  private inPuntoCedula: HTMLInputElement;
  private inPuntoClave: HTMLInputElement;
  private selectPuntoTipo: HTMLSelectElement;
  private lblInfoEfectivo: HTMLElement;

  // NUEVOS ELEMENTOS PARA NAVEGACIÓN DE BOTONES COLGANTES
  private containerSecciones: HTMLElement;
  private containerDetalle: HTMLElement;
  private tituloDetalle: HTMLElement;
  private btnVolverSecciones: HTMLButtonElement;

  private tasaCambio: number = 1;
  private totalUSD: number = 0;
  private totalBS: number = 0;
  private carrito: { [key: string]: { nombre: string; cantidad: number; precio: number; codigo?: string } } = {};
  private cuentasBackend: any[] = []; // Guarda las cuentas de forma local

  constructor() {
    this.inCedula = document.getElementById("pedido_inCedula") as HTMLInputElement;
    this.inNombre = document.getElementById("pedido_inNombre") as HTMLInputElement;
    this.inCuentaDestino = document.getElementById("pedido_inCuentaDestino") as HTMLSelectElement;
    this.inCuentaOrigen = document.getElementById("pedido_inCuentaOrigen") as HTMLInputElement;
    this.inReferencia = document.getElementById("pedido_inReferencia") as HTMLInputElement;
    this.btSiguiente = document.getElementById("pedido_btSiguiente") as HTMLButtonElement;
    this.btEnviar = document.getElementById("pedido_btEnviar") as HTMLButtonElement;
    this.lblTasa = document.getElementById("pedido_lblTasa") as HTMLElement;
    this.lblTotalUSD = document.getElementById("pedido_lblTotalUSD") as HTMLElement;
    this.lblTotalBS = document.getElementById("pedido_lblTotalBS") as HTMLElement;
    this.secPago = document.getElementById("secPago") as HTMLElement;
    this.inCedulaBuscar = document.getElementById("pedido_inCedulaBuscar") as HTMLInputElement;
    this.btBuscar = document.getElementById("pedido_btBuscar") as HTMLButtonElement;
    this.lblEstadoResultado = document.getElementById("pedido_lblEstadoResultado") as HTMLElement;

    // Inicialización de selectores agregados
    this.selectMetodoPago = document.getElementById("pedido_selectMetodoPago") as HTMLSelectElement;
    this.secCamposBanco = document.getElementById("secCamposBanco") as HTMLElement;
    this.secCamposPunto = document.getElementById("secCamposPunto") as HTMLElement;
    this.inPuntoCedula = document.getElementById("pedido_inPuntoCedula") as HTMLInputElement;
    this.inPuntoClave = document.getElementById("pedido_inPuntoClave") as HTMLInputElement;
    this.selectPuntoTipo = document.getElementById("pedido_selectPuntoTipo") as HTMLSelectElement;
    this.lblInfoEfectivo = document.getElementById("pedido_lblInfoEfectivo") as HTMLElement;

    // Elementos de navegación
    this.containerSecciones = document.getElementById("secciones-botones-container") as HTMLElement;
    this.containerDetalle = document.getElementById("categoria-detalle-contenedor") as HTMLElement;
    this.tituloDetalle = document.getElementById("categoria-detalle-titulo") as HTMLElement;
    this.btnVolverSecciones = document.getElementById("btn-volver-secciones") as HTMLButtonElement;

    // Configuración inicial del comportamiento dinámico de pagos
    this.selectMetodoPago.onchange = () => this.alternarCamposPago();

    // Mapeo para nombres bonitos de las categorías
    const nombresCategorias: { [key: string]: string } = {
      comida: "🍔 Comidas",
      bebida: "🥤 Bebidas",
      postre: "🍰 Postres",
      chucheria: "🍿 Chucherías",
      combo: "🎁 Combos Especiales"
    };

    // Configuración de la navegación por botones colgantes
    document.querySelectorAll(".btn-colgante").forEach(btn => {
      btn.addEventListener("click", () => {
        const categoria = btn.getAttribute("data-categoria");
        if (categoria) {
          // Ocultar cuadrícula principal
          this.containerSecciones.classList.add("oculto");
          // Mostrar vista de detalle
          this.containerDetalle.classList.remove("oculto");
          // Actualizar el título de la sección activa
          this.tituloDetalle.innerText = nombresCategorias[categoria] || "Categoría";
          // Ocultar cualquier categoría previamente mostrada
          document.querySelectorAll(".categoria-bloque").forEach(b => b.classList.add("oculto"));
          // Mostrar la categoría elegida
          const bloque = document.getElementById(`categoria-${categoria}`);
          if (bloque) {
            bloque.classList.remove("oculto");
          }
        }
      });
    });

    if (this.btnVolverSecciones) {
      this.btnVolverSecciones.onclick = () => {
        this.containerDetalle.classList.add("oculto");
        this.containerSecciones.classList.remove("oculto");
        document.querySelectorAll(".categoria-bloque").forEach(b => b.classList.add("oculto"));
      };
    }

    // Delegación de eventos para botones del carrito
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains("btn-sumar")) this.modificarCantidad(target.dataset.id!, 1);
      if (target.classList.contains("btn-restar")) this.modificarCantidad(target.dataset.id!, -1);
    });

    // Restringir la clave del punto de venta a solo números (evitar letras y caracteres especiales)
    if (this.inPuntoClave) {
      this.inPuntoClave.addEventListener("keypress", (e: KeyboardEvent) => {
        // Bloquear si la tecla presionada no es un número (dígito de 0 a 9)
        if (!/^\d$/.test(e.key)) {
          e.preventDefault();
        }
      });
      this.inPuntoClave.addEventListener("input", () => {
        // En caso de pegar o autocompletar, limpiar cualquier carácter no numérico
        this.inPuntoClave.value = this.inPuntoClave.value.replace(/\D/g, "");
      });
    }

    // Restringir la referencia bancaria a solo números (evitar letras y caracteres especiales)
    if (this.inReferencia) {
      this.inReferencia.addEventListener("keypress", (e: KeyboardEvent) => {
        if (!/^\d$/.test(e.key)) {
          e.preventDefault();
        }
      });
      this.inReferencia.addEventListener("input", () => {
        this.inReferencia.value = this.inReferencia.value.replace(/\D/g, "");
      });
    }

    this.btSiguiente.onclick = () => {
      if (this.cedula === 0 || this.nombre === "") {
        alert("Por favor introduce tu cédula y nombre antes de continuar.");
        return;
      }
      if (this.totalUSD > 0) {
        this.secPago.classList.remove("oculto");
        this.secPago.scrollIntoView({ behavior: "smooth" });
      } else {
        alert("Debes agregar al menos un producto al carrito.");
      }
    };
  }

  private modificarCantidad(id: string, incremento: number): void {
    if (!this.carrito[id]) return;
    this.carrito[id].cantidad = Math.max(0, this.carrito[id].cantidad + incremento);
    const lbl = document.getElementById(`cant-${id}`);
    if (lbl) lbl.innerText = this.carrito[id].cantidad.toString();
    this.calcularFactura();
  }
  private alternarCamposPago(): void {
    const metodo = this.metodoPago;
    
    // Ocultar todos los sub-paneles por defecto
    this.secCamposBanco.classList.add("oculto");
    this.secCamposPunto.classList.add("oculto");
    this.lblInfoEfectivo.innerText = "";

    // Filtrar y actualizar el listado de cuentas disponibles según la selección
    if (metodo === "transferencia") {
      this.secCamposBanco.classList.remove("oculto");
      this.actualizarComboCuentasDestino("transferencia");
    } else if (metodo === "pagomovil") {
      this.secCamposBanco.classList.remove("oculto");
      this.actualizarComboCuentasDestino("pagomovil");
    } else if (metodo === "punto") {
      this.secCamposPunto.classList.remove("oculto");
    } else if (metodo === "efectivoUSD") {
      this.lblInfoEfectivo.innerText = "Por favor, entregue el monto exacto en billetes en la caja del cafetín.";
    } else if (metodo === "efectivoBS") {
      this.lblInfoEfectivo.innerText = "Por favor, realice el pago en efectivo en taquilla bajo la tasa de cambio vigente.";
    }
  }

  private actualizarComboCuentasDestino(tipo: "transferencia" | "pagomovil"): void {
    const filtradas = this.cuentasBackend.filter(c => (c.tipo || "transferencia") === tipo);
    if (filtradas.length === 0) {
      this.inCuentaDestino.innerHTML = `<option value="Directo en Taquilla">No hay cuentas registradas - Pagar en taquilla</option>`;
      return;
    }
    this.inCuentaDestino.innerHTML = filtradas.map(c => {
      const valor = tipo === "pagomovil" 
        ? `${c.banco} - ${c.titular} - ${c.numero}` 
        : `${c.banco} - ${c.numero}`;
      return `<option value="${valor}">${c.banco} - ${c.titular} (${c.numero})</option>`;
    }).join("");
  }

  // --- GETTERS ---
  get cedula(): number { 
    return parseInt(this.inCedula.value.trim()) || 0; 
  }
  get nombre(): string {
     return this.inNombre.value.trim();
     }
  get montoTotal$(): number {
     return this.totalUSD; 
    }
  get montoTotalBs(): number { 
    return this.totalBS;
   }
  get cuentaOrigen(): string { 
    return this.inCuentaOrigen.value.trim(); 
  }
  get cuentaDestino(): string {
     return this.inCuentaDestino.value; 
    }
  get referencia(): string {
     return this.inReferencia.value.trim();
     }
  get cedulaABuscar(): number { 
    return parseInt(this.inCedulaBuscar.value.trim()) || 0;
   }
  
  get metodoPago(): "transferencia" | "pagomovil" | "punto" | "efectivoUSD" | "efectivoBS" {
    return this.selectMetodoPago.value as any;
  }
  get puntoCedula(): number { 
    return parseInt(this.inPuntoCedula.value.trim()) || 0; 
  }
  get puntoClave(): string { 
    return this.inPuntoClave.value.trim(); 
  }
  get puntoTipoCuenta(): "ahorro" | "corriente" {
     return this.selectPuntoTipo.value as any;
     }

  get resumenProductos(): string {
    return Object.entries(this.carrito)
      .filter(([_, p]) => p.cantidad > 0)
      .map(([_, p]) => `${p.cantidad}x${p.codigo || p.nombre}`)
      .join(", ");
  }

  // --- MÉTODOS ---
  onEnviarPedido(callback: () => void): void {
     this.btEnviar.onclick = callback;
     }
  onBuscarPedido(callback: () => void): void {
     this.btBuscar.onclick = callback; 
    }

  setTasa(tasa: number): void {
    this.tasaCambio = tasa;
    this.lblTasa.innerText = tasa.toFixed(2);
  }

  cargarCuentasDestino(cuentas: any[]): void {
    this.cuentasBackend = cuentas; // Almacenamiento local para filtros dinámicos
    this.alternarCamposPago(); // Renderiza por defecto según la opción inicial
  }

  renderizarMenu(productos: any[]): void {
    productos.forEach(p => {
      this.carrito[p.id] = { nombre: p.nombre, cantidad: 0, precio: p.precio, codigo: p.codigo || p.nombre };
      const contenedor = document.querySelector(`#categoria-${p.categoria.toLowerCase()} .contenido`);
      if (!contenedor) return;

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

  private calcularFactura(): void {
    this.totalUSD = Object.values(this.carrito).reduce((acc, p) => acc + (p.cantidad * p.precio), 0);
    this.totalBS = this.totalUSD * this.tasaCambio;
    this.lblTotalUSD.innerText = this.totalUSD.toFixed(2);
    this.lblTotalBS.innerText = this.totalBS.toFixed(2);

    // Actualizar el monto en el panel de punto de venta
    const puntoMontoTotal = document.getElementById("punto_lblMontoTotal");
    if (puntoMontoTotal) {
      puntoMontoTotal.innerText = `${this.totalBS.toFixed(2)} Bs (${this.totalUSD.toFixed(2)} $)`;
    }
  }

  limpiarFormulario(): void {
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

    // Reiniciar vista de secciones
    this.containerDetalle.classList.add("oculto");
    this.containerSecciones.classList.remove("oculto");
    document.querySelectorAll(".categoria-bloque").forEach(b => b.classList.add("oculto"));
  }

  /**
   * Renderiza el historial de pedidos de un cliente.
   * Recibe los totales calculados por parámetro para mantener la vista libre de lógica matemática y de negocio,
   * de acuerdo con las especificaciones del patrón MVC.
   */
  mostrarHistorial(cedula: number, pedidos: any[], totalUSD: number, totalBs: number): void {
    if (pedidos.length === 0) {
      this.lblEstadoResultado.innerText = "No se encontraron pedidos.";
      return;
    }

    this.lblEstadoResultado.innerHTML = `
      <h4>Historial para C.I: ${cedula}</h4>
      <div style="margin: 12px 0; padding: 12px; background-color: #e8f5e9; border-left: 4px solid #2e7d32; border-radius: 8px; font-size: 14px;">
        <strong>Total Pagado:</strong>
        <span style="color: #2e7d32; font-weight: bold; margin-left: 5px;">$${totalUSD.toFixed(2)}</span>
        <span style="color: #1565c0; font-weight: bold; margin-left: 5px;">/ ${totalBs.toFixed(2)} Bs</span>
      </div>
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
