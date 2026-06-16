//adiciona um novo album por um objeto
export function addAlbum(album) {

    return new Promise((resolve, reject) => {

        db.run(`
            INSERT INTO albums (
                artista_nome,
                titulo,
                ano,
                genero,
                descricao,
                cover,
                servidor,
                autor
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `, [

            album.artista_nome,
            album.titulo,
            album.ano,
            JSON.stringify(album.genero),
            album.descricao,
            album.cover,
            album.servidor,
            album.autor

        ], function (err) {

            if (err) reject(err);
            else resolve(this.lastID);

        });

    });

}

//deleta um album por id
export function deleteAlbum(id) {

    return new Promise((resolve, reject) => {

        db.run(`
            DELETE FROM albums
            WHERE id = ?
        `, [id], function (err) {

            if (err) reject(err);
            else resolve();

        });

    });

}