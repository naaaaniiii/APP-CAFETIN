import Cl_sPedido from "../services/Cl_sPedido.js";
import Cl_mPedido from "../models/Cl_mPedido.js";
import { I_vPedido } from "../interfaces/I_vPedido.js";

export default class Cl_cPedido {
  private modelo: Cl_mPedido;
  private vista: I_vPedido;

  constructor({ modelo, vista }: { modelo: Cl_mPedido; vista: I_vPedido }) {
    this.modelo = modelo;
    this.vista = vista;

    this.inicializarApp();

    // Vinculación de escuchadores de eventos mediante callbacks de la UI
    this.vista.onEnviarPedido(() => this.procesarEnvioPedido());
    this.vista.onBuscarPedido(() => this.procesarConsultaEstado());
  }

  private async inicializarApp() {
    try {
      const [tasa, productos, cuentas] = await Promise.all([
        Cl_sPedido.obtenerTasaDinamica(),
        Cl_sPedido.obtenerProductos(),
        Cl_sPedido.obtenerCuentasDestino()
      ]);
      
      this.vista.setTasa(tasa);
      this.vista.renderizarMenu(productos);
      this.vista.cargarCuentasDestino(cuentas);
    } catch (error) {
      console.error("Error al inicializar la App del Cafetín:", error);
    }
  }

  private async procesarEnvioPedido() {
    const vistaDinamica = this.vista as any;
    const metodoPagoSelected = vistaDinamica.metodoPago;

    // 1. Validaciones previas estrictas según el método de pago seleccionado
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
      // 2. Seteo de datos básicos comunes del solicitante
      this.modelo.cedula = this.vista.cedula;
      this.modelo.nombre = this.vista.nombre;
      this.modelo.resumenProductos = this.vista.resumenProductos;
      this.modelo.montoTotal$ = this.vista.montoTotal$;
      this.modelo.montoTotalBs = this.vista.montoTotalBs;
      this.modelo.status = "pendiente";

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
        this.vista.limpiarFormulario();
      }
    } catch (error) {
      console.error("Error de red al intentar procesar el pedido:", error);
      alert("No se pudo establecer conexión con el servidor del cafetín.");
    }
  }

  private async procesarConsultaEstado() {
    const cedula = this.vista.cedulaABuscar;
    if (cedula === 0) {
      alert("Introduce una cédula válida.");
      return;
    }
    this.vista.lblEstadoResultado.innerText = "Buscando en el sistema...";
    const pedidos = await Cl_sPedido.consultarEstadoPedido(cedula);
    this.vista.mostrarHistorial(cedula, pedidos);
  }
}
