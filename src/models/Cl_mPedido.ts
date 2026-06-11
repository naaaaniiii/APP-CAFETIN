export default class Cl_mPedido {
  private _id: string = "";
  private _cedula: number = 0;
  private _nombre: string = "";
  private _resumenProductos: string = "";
  private _montoTotal$: number = 0;
  private _montoTotalBs: number = 0;
  private _metodoPago: "transferencia" | "pago_movil" | "punto" | "efectivo_usd" | "efectivo_bs" | "pagomovil" | "efectivoUSD" | "efectivoBS" = "transferencia";
  private _cuentaOrigen: string = "";
  private _cuentaDestino: string = "";
  private _referencia: string = "";
  // Campos específicos de Punto de Venta
  private _puntoCedula: number = 0;
  private _puntoTipoCuenta: "ahorro" | "corriente" | "" = "";
  private _puntoClave: string = "";
  private _status: "pendiente" | "aceptado" | "rechazado" = "pendiente";

  constructor({
    id,
    cedula,
    nombre,
    resumenProductos,
    montoTotal$,
    montoTotalBs,
    metodoPago = "transferencia",
    cuentaOrigen = "",
    cuentaDestino = "",
    referencia = "",
    puntoCedula = 0,
    puntoTipoCuenta = "",
    puntoClave = "",
    status = "pendiente",
  }: {
    id: string;
    cedula: number;
    nombre: string;
    resumenProductos: string;
    montoTotal$: number;
    montoTotalBs: number;
    metodoPago?: "transferencia" | "pago_movil" | "punto" | "efectivo_usd" | "efectivo_bs" | "pagomovil" | "efectivoUSD" | "efectivoBS";
    cuentaOrigen?: string;
    cuentaDestino?: string;
    referencia?: string;
    puntoCedula?: number;
    puntoTipoCuenta?: "ahorro" | "corriente" | "";
    puntoClave?: string;
    status?: "pendiente" | "aceptado" | "rechazado";
  }) {
    this.id = id;
    this.cedula = cedula;
    this.nombre = nombre;
    this.resumenProductos = resumenProductos;
    this.montoTotal$ = montoTotal$;
    this.montoTotalBs = montoTotalBs;
    this.metodoPago = metodoPago;
    this.cuentaOrigen = cuentaOrigen;
    this.cuentaDestino = cuentaDestino;
    this.referencia = referencia;
    this.puntoCedula = puntoCedula;
    this.puntoTipoCuenta = puntoTipoCuenta;
    this.puntoClave = puntoClave;
    this.status = status;
  }

  public get id(): string { 
    return this._id; 
  }
  public set id(value: string) { 
    this._id = value;
   }

  public get cedula(): number {
     return this._cedula;
     }
  public set cedula(value: number) { 
    this._cedula = value;
   }

  public get nombre(): string {
     return this._nombre;
     }
  public set nombre(value: string) { 
    this._nombre = value; 
  }

  public get resumenProductos(): string { 
    return this._resumenProductos; 
  }
  public set resumenProductos(value: string) { 
    this._resumenProductos = value;
   }

  public get montoTotal$(): number {
     return this._montoTotal$; 
    }
  public set montoTotal$(value: number) {
     this._montoTotal$ = value;
     }

  public get montoTotalBs(): number { 
    return this._montoTotalBs;
   }
  public set montoTotalBs(value: number) { 
    this._montoTotalBs = value;
   }

  public get metodoPago(): "transferencia" | "pago_movil" | "punto" | "efectivo_usd" | "efectivo_bs" | "pagomovil" | "efectivoUSD" | "efectivoBS" {
      return this._metodoPago; 
     }
  public set metodoPago(value: "transferencia" | "pago_movil" | "punto" | "efectivo_usd" | "efectivo_bs" | "pagomovil" | "efectivoUSD" | "efectivoBS") { 
     this._metodoPago = value; 
  }

  public get cuentaOrigen(): string { 
    return this._cuentaOrigen; 
  }
  public set cuentaOrigen(value: string) { 
    this._cuentaOrigen = value; 
  }

  public get cuentaDestino(): string { 
    return this._cuentaDestino; 
  }
  public set cuentaDestino(value: string) { 
    this._cuentaDestino = value; 
  }

  public get referencia(): string { 
    return this._referencia;
   }
  public set referencia(value: string) { 
    this._referencia = value; 
  }

  public get puntoCedula(): number { 
    return this._puntoCedula; 
  }
  public set puntoCedula(value: number) { 
    this._puntoCedula = value;
   }

  public get puntoTipoCuenta(): "ahorro" | "corriente" | "" {
     return this._puntoTipoCuenta; 
    }
  public set puntoTipoCuenta(value: "ahorro" | "corriente" | "") { 
    this._puntoTipoCuenta = value;
   }

  public get puntoClave(): string { 
    return this._puntoClave;
   }
  public set puntoClave(value: string) { 
    this._puntoClave = value; 
  }

  public get status(): "pendiente" | "aceptado" | "rechazado" { 
    return this._status; 
  }
  public set status(value: "pendiente" | "aceptado" | "rechazado") {
     this._status = value; 
    }
  public desglosarCantidades(): { producto: string; cantidad: number }[] {
    const listado: { producto: string; cantidad: number }[] = [];
    if (!this.resumenProductos) return listado;
    let itemActual = "";
    let parentesis = 0;
    for (let i = 0; i < this.resumenProductos.length; i++) {
      const caracter = this.resumenProductos[i];
      if (caracter === '(') parentesis++;
      if (caracter === ')') parentesis--;
      if (caracter === ',' && parentesis === 0) {
        this.extraerUnidades(itemActual.trim(), listado);
        itemActual = "";
      } else {
        itemActual += caracter;
      }
    }
    if (itemActual.trim()) {
      this.extraerUnidades(itemActual.trim(), listado);
    }
    return listado;
  }

  private extraerUnidades(str: string, listado: { producto: string; cantidad: number }[]) {
    const posX = str.indexOf('x');
    if (posX !== -1) {
      const cantStr = str.substring(0, posX).trim();
      const prodStr = str.substring(posX + 1).trim();
      const cantidad = parseInt(cantStr, 10);
      if (!isNaN(cantidad) && prodStr) {
        listado.push({ producto: prodStr, cantidad: cantidad });
      }
    } else {
      listado.push({ producto: str, cantidad: 1 });
    }
  }

  public static calcularTotalesAceptados(pedidos: any[]): { totalUSD: number; totalBs: number } {
    const pedidosAceptados = pedidos.filter((p: any) => p.status === "aceptado");
    const totalUSD = pedidosAceptados.reduce((sum: number, p: any) => sum + (Number(p.montoTotal$) || 0), 0);
    const totalBs = pedidosAceptados.reduce((sum: number, p: any) => sum + (Number(p.montoTotalBs) || 0), 0);
    return { totalUSD, totalBs };
  }

  toJSON() {
    return {
      id: this.id,
      cedula: this.cedula,
      nombre: this.nombre,
      resumenProductos: this.resumenProductos,
      montoTotal$: this.montoTotal$,
      montoTotalBs: this.montoTotalBs,
      metodoPago: this.metodoPago,
      cuentaOrigen: this.cuentaOrigen,
      cuentaDestino: this.cuentaDestino,
      referencia: this.referencia,
      puntoCedula: this.puntoCedula,
      puntoTipoCuenta: this.puntoTipoCuenta,
      puntoClave: this.puntoClave,
      status: this.status,
    };
  }
}
