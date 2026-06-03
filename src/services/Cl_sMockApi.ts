export default class Cl_sMockApi {
  static async get(url: string): Promise<any> {
    const resp = await fetch(url);
    return resp.ok ? await resp.json() : [];
  }

  static async post(url: string, data: any): Promise<boolean> {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return resp.ok;
  }

  static async put(url: string, data: any): Promise<boolean> {
    const resp = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return resp.ok;
  }

  static async delete(url: string): Promise<boolean> {
    const resp = await fetch(url, { method: "DELETE" });
    return resp.ok;
  }
  protected static async gett(url: string): Promise<any> {
    try {
      const respuesta = await fetch(url);
      return respuesta.ok ? await respuesta.json() : [];
    } catch {
      return [];
    }
  }

  protected static async postt(url: string, data: any): Promise<{ ok: boolean; mensaje: string }> {
    try {
      const respuesta = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!respuesta.ok) return { ok: false, mensaje: "Error al registrar el pedido." };
      const resData = await respuesta.json();
      return { ok: true, mensaje: "¡Pedido enviado! Orden Nro: " + resData.id };
    } catch (error: any) {
      return { ok: false, mensaje: "Error de red: " + error.message };
    }
  }
}
