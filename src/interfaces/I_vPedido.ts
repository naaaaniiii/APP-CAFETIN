export interface I_vPedido {
  // Getters para obtener valores desde el formulario
  get cedula(): number;
  get nombre(): string;
  get montoTotal$(): number;
  get montoTotalBs(): number;
  get cuentaOrigen(): string;
  get cuentaDestino(): string;
  get referencia(): string;
  get resumenProductos(): string;
  get cedulaABuscar(): number;
  lblEstadoResultado: HTMLElement;

  // NUEVOS GETTERS PARA MÉTODOS DE PAGO EXTENDIDOS
  get metodoPago(): "transferencia" | "pagomovil" | "punto" | "efectivoUSD" | "efectivoBS";
  get puntoCedula(): number;
  get puntoClave(): string;
  get puntoTipoCuenta(): "ahorro" | "corriente";

  // Métodos de control
  setTasa(tasa: number): void;
  cargarCuentasDestino(cuentas: any[]): void; // Firma estricta compatible con el controlador
  renderizarMenu(productos: any[]): void;
  mostrarHistorial(cedula: number, pedidos: any[], totalUSD: number, totalBs: number): void;
  limpiarFormulario(): void;

  // Eventos
  onEnviarPedido(callback: () => void): void;
  onBuscarPedido(callback: () => void): void;
}
