export default class Cl_sMockApi {
  protected static apiUrl: string = "https://6a14ae806c7db8aac054d899.mockapi.io/cafetin";

  protected static async fetchMockApi({
    method = "GET",
    uri,
    body,
    headers = {},
  }: {
    method?: "GET" | "POST" | "PUT" | "DELETE";
    uri: string;
    body?: any;
    headers?: Record<string, string>;
  }): Promise<{ ok: boolean; status: number; data?: any; message?: string }> {
    if (this.apiUrl === "") {
      return { ok: false, status: 0, message: "API URL no configurada" };
    }
    try {
      const options: RequestInit = {
        method,
        headers: { "Content-Type": "application/json", ...headers },
      };

      if (body !== undefined) {
        options.body = JSON.stringify(body);
      }

      const respuesta = await fetch(uri, options);
      const status = respuesta.status;

      if (status === 404) {
        return { ok: true, status, data: [] };
      }

      if (!respuesta.ok) {
        return { ok: false, status, data: [] };
      }

      let data: any = null;
      try {
        data = await respuesta.json();
      } catch (_) {
        data = null;
      }

      return { ok: true, status, data };
    } catch (error: any) {
      return { ok: false, status: 0, message: error?.message };
    }
  }

  static async getTabla({ tabla }: { tabla: string }): Promise<{
    ok: boolean;
    tabla: any[];
  }> {
    const uri = `${this.apiUrl}?tabla=${tabla}`;
    const respuesta = await this.fetchMockApi({ method: "GET", uri });

    if (respuesta.status === 404) {
      return { ok: true, tabla: [] };
    }

    if (!respuesta.ok) {
      return { ok: false, tabla: [] };
    }

    return { ok: true, tabla: respuesta.data ?? [] };
  }

  static async existeId({
    tabla,
    tablaId,
    tablaIdName,
  }: {
    tabla: string;
    tablaId: number;
    tablaIdName: string;
  }): Promise<{ ok: boolean; existe: boolean }> {
    const uri = `${this.apiUrl}?tabla=${tabla}&${tablaIdName}=${tablaId}`;
    const respuesta = await this.fetchMockApi({ method: "GET", uri });

    // ¡El truco para domar a MockAPI!
    // Si el servidor responde 404, la conexión fue exitosa, pero no hay resultados.
    if (respuesta.status === 404) {
      return { ok: true, existe: false };
    }

    // Si falla por un error real del servidor (ej. 500)
    if (!respuesta.ok) {
      return { ok: false, existe: false };
    }

    // Si responde 200 (OK), verificamos si hay registros en `respuesta.data`
    return {
      ok: true,
      existe: Array.isArray(respuesta.data) && respuesta.data.length > 0,
    };
  }

  static async agregar(
    registro: any,
  ): Promise<{ ok: boolean; mensaje: string }> {
    const uri = this.apiUrl;
    const respuesta = await this.fetchMockApi({
      method: "POST",
      uri,
      body: registro,
    });

    if (!respuesta.ok) {
      return { ok: false, mensaje: "Error al guardar el registro" };
    }

    return {
      ok: true,
      mensaje: "Registro guardado con ID: " + (respuesta.data?.id ?? ""),
    };
  }

  private static async obtenerIdMockApi({
    tabla,
    tablaId,
    tablaIdName,
  }: {
    tabla: string;
    tablaId: number;
    tablaIdName: string;
  }): Promise<string | undefined> {
    const uri = `${this.apiUrl}?tabla=${tabla}&${tablaIdName}=${tablaId}`;
    return this.fetchMockApi({ method: "GET", uri }).then((respuesta) => {
      if (respuesta.status === 404 || !respuesta.ok) {
        return undefined;
      }

      if (!Array.isArray(respuesta.data) || respuesta.data.length === 0) {
        return undefined;
      }

      // Filtrar EXACTAMENTE por el valor de tablaId para evitar coincidencias parciales
      const registroExacto = respuesta.data.find(
        (item: any) => item[tablaIdName] === tablaId
      );

      return registroExacto?.id;
    });
  }

  static async modificar(
    tablaId: number,
    registro: any,
    tablaIdName: string,
  ): Promise<{ ok: boolean; mensaje: string }> {
    const tabla = registro?.tabla;
    const recursoId = tabla
      ? await this.obtenerIdMockApi({ tabla, tablaId, tablaIdName })
      : undefined;

    if (!recursoId) {
      return {
        ok: false,
        mensaje:
          "No se encontró el registro en MockAPI para modificar con ese tablaId",
      };
    }

    const uri = `${this.apiUrl}/${recursoId}`;
    const respuesta = await this.fetchMockApi({
      method: "PUT",
      uri,
      body: registro,
    });

    if (!respuesta.ok) {
      return { ok: false, mensaje: "Error al modificar el registro" };
    }

    return { ok: true, mensaje: "Registro modificado" };
  }

  static async eliminar(
    tablaId: number,
    tabla: string,
    tablaIdName: string,
  ): Promise<{ ok: boolean; mensaje: string }> {
    const recursoId = await this.obtenerIdMockApi({
      tabla,
      tablaId,
      tablaIdName,
    });

    if (!recursoId) {
      return {
        ok: false,
        mensaje:
          "No se encontró el registro en MockAPI para eliminar con ese tablaId",
      };
    }

    const uri = `${this.apiUrl}/${recursoId}`;
    const respuesta = await this.fetchMockApi({ method: "DELETE", uri });

    if (!respuesta.ok) {
      return { ok: false, mensaje: "Error al eliminar el registro" };
    }

    return { ok: true, mensaje: "Registro eliminado" };
  }
}
