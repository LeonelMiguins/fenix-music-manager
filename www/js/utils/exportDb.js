export async function exportDb() {
    const res = await fetch("/api/export");
    const data = await res.json();

    if (!data.success) {
        alert("Erro ao exportar DB: " + data.error);
        return;
    }

    alert("Exportado com sucesso!\n" + data.path);
    console.log("EXPORT:", data);
}