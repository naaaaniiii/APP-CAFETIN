export default class Cl_sMockApiPed {
    // Aquí centralizamos la ejecución de los GET y POST
    static async get(url) {
        try {
            const respuesta = await fetch(url);
            return respuesta.ok ? await respuesta.json() : [];
        }
        catch {
            return [];
        }
    }
    static async post(url, data) {
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
//# sourceMappingURL=Cl_sMockApiPed.js.map