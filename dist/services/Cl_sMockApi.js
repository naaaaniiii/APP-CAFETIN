export default class Cl_sMockApi {
    static async get(url) {
        const resp = await fetch(url);
        return resp.ok ? await resp.json() : [];
    }
    static async post(url, data) {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return resp.ok;
    }
    static async put(url, data) {
        const resp = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        return resp.ok;
    }
    static async delete(url) {
        const resp = await fetch(url, { method: "DELETE" });
        return resp.ok;
    }
    static async gett(url) {
        try {
            const respuesta = await fetch(url);
            return respuesta.ok ? await respuesta.json() : [];
        }
        catch {
            return [];
        }
    }
    static async postt(url, data) {
        try {
            const respuesta = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });
            if (!respuesta.ok)
                return { ok: false, mensaje: "Error al registrar el pedido." };
            const resData = await respuesta.json();
            return { ok: true, mensaje: "¡Pedido enviado! Orden Nro: " + resData.id };
        }
        catch (error) {
            return { ok: false, mensaje: "Error de red: " + error.message };
        }
    }
}
//# sourceMappingURL=Cl_sMockApi.js.map