import Cl_sPedido from "../services/Cl_sPedido.js";
import Cl_mPedido from "../models/Cl_mPedido.js";
import { I_vPedido } from "../interfaces/I_vPedido.js";

/**
 * Controlador del Pedido (Cl_cPedido)
 * 
 * RESPONSABILIDAD:
 * Si hay instrucciones que son de toma de decisión, eso va en el controlador.
 * Decide el flujo del sistema: escucha a la vista, delega cálculos al modelo,
 * y luego decide qué información enviarle a la vista para que la muestre.
 */
export default class Cl_cPedido {
  // El controlador conecta la Vista (interfaz gráfica) con el Modelo (datos y lógica de negocio)
  private modelo: Cl_mPedido;
  private vista: I_vPedido;
  private tasaUSD: number = 1;

  constructor({ modelo, vista }: { modelo: Cl_mPedido; vista: I_vPedido }) {
    this.modelo = modelo;
    this.vista = vista;

    // 1. Carga inicial de datos de la API (tasa, productos, canales de pago)
    this.inicializarApp();

    // 2. Escucha de eventos de la vista mediante Callbacks (funciones de retorno)
    this.vista.onEnviarPedido(() => this.procesarEnvioPedido());
    this.vista.onBuscarPedido(() => this.procesarConsultaEstado());
    this.vista.onModificarCantidadCarrito((id, incremento) => this.procesarModificarCantidadCarrito(id, incremento));
    this.vista.onProcederPago(() => this.procesarProcederPago());
  }

  /**
   * Método inicializador: Descarga asíncronamente los datos requeridos por la UI.
   * Si necesitas añadir un nuevo servicio o configuración inicial, agrégala en esta sección.
   */
  private async inicializarApp() {
    try {
      // Descarga paralela usando Promise.all para optimizar el rendimiento
      const [tasa, productos, cuentas] = await Promise.all([
        Cl_sPedido.obtenerTasaDinamica(),
        Cl_sPedido.obtenerProductos(),
        Cl_sPedido.obtenerCuentasDestino()
      ]);
      
      this.tasaUSD = tasa;
      this.modelo.inicializarCarrito(productos);

      // Setea los valores resultantes directamente en la Vista
      this.vista.setTasaUSD(tasa);
      this.vista.renderizarMenu(productos);
      this.vista.cargarCuentasDestino(cuentas);
    } catch (error) {
      console.error("Error al inicializar la App del Cafetín:", error);
    }
  }

  /**
   * TOMA DE DECISIÓN: Qué hacer cuando el usuario suma/resta en el carritoCarrito.
   * El controlador decide:
   * 1. Pedirle al modelo que actualice la cantidad internamente.
   * 2. Pedirle al modelo que calcule los nuevos totales (matemática).
   * 3. Ordenarle a la vista que actualice sus espacios visuales.
   */
  private procesarModificarCantidadCarrito(id: string, incremento: number) {
    this.modelo.actualizarCantidadCarrito(id, incremento);
    const cantidad = this.modelo.obtenerCantidadCarrito(id);
    this.vista.actualizarCantidadCarritoUI(id, cantidad);

    const totalUSD = this.modelo.calcularTotalUSD();
    const totalBs = this.modelo.calcularTotalBs(this.tasaUSD);
    this.vista.actualizarFacturaUI(totalUSD, totalBs);
  }

  /**
   * TOMA DE DECISIÓN: Validar antes de proceder al pago.
   * El controlador decide si deja pasar al usuario o le muestra una alerta.
   */
  private procesarProcederPago() {
    const cedula = this.vista.cedula;
    const nombre = this.vista.nombre;
    if (cedula === 0 || nombre === "") {
      alert("Por favor introduce tu cédula y nombre antes de continuar.");
      return;
    }
    const totalUSD = this.modelo.calcularTotalUSD();
    if (totalUSD > 0) {
      this.vista.mostrarSeccionPago();
    } else {
      alert("Debes agregar al menos un producto al carrito.");
    }
  }

  /**
   * TOMA DE DECISIÓN: Flujo de envío de pedido.
   * El controlador verifica múltiples reglas de decisión dependiendo del método de pago,
   * y luego delega al modelo la sincronización de la data antes de enviarla.
   */
  private async procesarEnvioPedido() {
    const vistaDinamica = this.vista as any;
    const metodoPagoSelected = vistaDinamica.metodoPago;

    // [TOMA DE DECISIÓN] Validaciones requeridas según método de pago
    if (metodoPagoSelected === "transferencia") {
      if (!this.vista.cuentaOrigen || !this.vista.referencia) {
        alert("Por favor, complete los datos bancarios de la transferencia antes de enviar.");
        return;
      }
    } else if (metodoPagoSelected === "pagomovil") {
      if (!this.vista.cuentaOrigen || !this.vista.referencia) {
        alert("Por favor, complete el banco de origen y la referencia del Pago Móvil.");
        return;
      }
    } else if (metodoPagoSelected === "punto") {
      const cedulaPunto = vistaDinamica.puntoCedula;
      const clavePunto = vistaDinamica.puntoClave;

      if (!cedulaPunto) {
        alert("Por favor, introduzca la cédula del titular para la operación por punto de venta.");
        return;
      }
      if (!clavePunto || clavePunto.length < 4 || clavePunto.length > 6) {
        alert("La clave del punto de venta debe tener entre 4 y 6 dígitos.");
        return;
      }
    }

    try {
      // 2. Seteo de datos básicos comunes del solicitante y sincronización del pedido
      this.modelo.cedula = this.vista.cedula;
      this.modelo.nombre = this.vista.nombre;
      this.modelo.status = "pendiente";
      this.modelo.sincronizarPedido(this.tasaUSD);
      
      // Guardamos explícitamente el tipo de pago en la propiedad extendida del modelo
      const modeloDinamico = this.modelo as any;
      modeloDinamico.metodoPago = metodoPagoSelected;

      // 3. Formateo condicional exacto de Origen, Destino y Referencia según tus requerimientos
      if (metodoPagoSelected === "transferencia" || metodoPagoSelected === "pagomovil") {
        this.modelo.cuentaOrigen = this.vista.cuentaOrigen;
        this.modelo.cuentaDestino = this.vista.cuentaDestino; // Guarda la cuenta bancaria seleccionada
        this.modelo.referencia = this.vista.referencia;

      } else if (metodoPagoSelected === "punto") {
        // Origen estructurado: Punto de venta tipoDeCuenta: corriente u ahorro - C.I: 12345
        this.modelo.cuentaOrigen = `Punto de venta-tipoDeCuenta: ${vistaDinamica.puntoTipoCuenta} - C.I: ${vistaDinamica.puntoCedula}`;
        // Destino limpio: Solo indica la pasarela de Taquilla / Punto de venta sin jalar cuentas bancarias
        this.modelo.cuentaDestino = "Banco"; 
        // Referencia vacía limpia
        this.modelo.referencia = "---";

      } else if (metodoPagoSelected === "efectivoUSD") {
        this.modelo.cuentaOrigen = "Efectivo Divisas ($)";
        this.modelo.cuentaDestino = "Caja"; // Requerimiento: Destino debe decir caja
        this.modelo.referencia = "---"; // Requerimiento: Sin referencia

      } else if (metodoPagoSelected === "efectivoBS") {
        this.modelo.cuentaOrigen = "Efectivo Bolívares (Bs)";
        this.modelo.cuentaDestino = "Caja"; // Requerimiento: Destino debe decir caja
        this.modelo.referencia = "---"; // Requerimiento: Sin referencia
      }

      // 4. Despachamos el JSON procesado a la API de la nube
      const resultado = await Cl_sPedido.guardarPedido(this.modelo);
      alert(resultado.mensaje);
      
      if (resultado.ok) {
        this.modelo.limpiarCarrito();
        this.vista.limpiarFormulario();
      }
    } catch (error) {
      console.error("Error de red al intentar procesar el pedido:", error);
      alert("No se pudo establecer conexión con el servidor del cafetín.");
    }
  }

  /**
   * Procesa la consulta de estado de pedidos de un cliente.
   * Realiza la llamada de servicio, procesa los totales acumulados (USD y Bs) para los pedidos
   * que han sido aceptados, y delega a la vista la representación visual de la información.
   */
  private async procesarConsultaEstado() {
    const cedula = this.vista.cedulaABuscar;
    if (cedula === 0) {
      alert("Introduce una cédula válida.");
      return;
    }
    this.vista.mostrarEstadoCargando();
    const pedidos = await Cl_sPedido.consultarEstadoPedido(cedula);

    const { totalUSD, totalBs } = Cl_mPedido.calcularTotalesAceptados(pedidos);

    this.vista.mostrarHistorial(cedula, pedidos, totalUSD, totalBs);
  }
}
