export interface I_vCafetin {
  // Getters
  get nuevaTasa(): number;
  get prodCodigo(): string;
  get prodNombre(): string;
  get prodPrecio(): number;
  get prodCategoria(): string;
  get cuentaBanco(): string;
  get cuentaTitular(): string;
  get cuentaNumero(): string;
  get cuentaCedula(): string;
  get tipoCuentaRegistrar(): "transferencia" | "pagomovil";

  // Métodos de acción (Callbacks)
  onActualizarTasa(callback: () => void): void;
  onAgregarProducto(callback: () => void): void;
  onAgregarCuenta(callback: () => void): void;
  onAccionPedido(callback: (id: string, accion: "aceptado" | "rechazado") => void): void;
  onEliminarProducto(callback: (id: string) => void): void;

  // Métodos de actualización de UI (setters y renderizado)
  setTasaActual(tasa: number): void;
  renderizarEstadisticas(datos: any): void;
  renderizarPedidos(pedidos: any[]): void;
  renderizarListaProductos(productos: any[]): void;
  mostrarTotalPagadoCliente(cedula: number, totalUSD: number, totalBs: number): void;

  // Métodos de limpieza
  limpiarFormProducto(): void;
  limpiarFormCuenta(): void;

  // Eventos de cliente
  get cedulaABuscar(): number;
  onBuscarCliente(callback: () => void): void;

  // Cambios dinámicos de formularios (Vista Pasiva)
  onCambiarTipoFondo(callback: () => void): void;
  mostrarFormularioPagoMovil(): void;
  mostrarFormularioTransferencia(): void;
}
