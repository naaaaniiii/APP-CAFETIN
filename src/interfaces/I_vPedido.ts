/**
 * Interfaz de la Vista (I_vPedido)
 * 
 * RESPONSABILIDAD:
 * Define las reglas de la vista. La vista solo sirve para prestar sus espacios 
 * para mostrar lo que el controlador le mande. No tiene lógica.
 */
export interface I_vPedido {
  // Getters para obtener valores desde el formulario
  get cedula(): number;
  get nombre(): string;
  get cuentaOrigen(): string;
  get cuentaDestino(): string;
  get referencia(): string;
  get cedulaABuscar(): number;

  // NUEVOS GETTERS PARA MÉTODOS DE PAGO EXTENDIDOS
  get metodoPago(): "transferencia" | "pagomovil" | "punto" | "efectivoUSD" | "efectivoBS";
  get puntoCedula(): number;
  get puntoClave(): string;
  get puntoTipoCuenta(): "ahorro" | "corriente";

  // Métodos de control
  setTasaUSD(tasaUSD: number): void;
  cargarCuentasDestino(cuentas: any[]): void; // Firma estricta compatible con el controlador
  renderizarMenu(productos: any[]): void;
  mostrarHistorial(cedula: number, pedidos: any[], totalUSD: number, totalBs: number): void;
  limpiarFormulario(): void;
  actualizarCantidadCarritoUI(id: string, cantidad: number): void;
  actualizarFacturaUI(totalUSD: number, totalBs: number): void;
  mostrarSeccionPago(): void;
  mostrarEstadoCargando(): void;

  // Eventos
  onEnviarPedido(callback: () => void): void;
  onBuscarPedido(callback: () => void): void;
  onModificarCantidadCarrito(callback: (id: string, incremento: number) => void): void;
  onProcederPago(callback: () => void): void;
}
