export default class Cl_sMockApiCaf {
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
}
//# sourceMappingURL=Cl_sMockApiCaf.js.map