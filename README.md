# Fenix Music Manager

Aplicacao web para gerenciar albuns e playlists locais, importar conteudo de fontes externas, armazenar dados em SQLite e exportar bibliotecas em JSON.

O projeto combina:

- Backend em Node.js + Express
- Banco local SQLite
- Frontend estatico em HTML, CSS e JavaScript modular
- Importadores via scraping para Internet Archive e Palco MP3

## Visao Geral

O Fenix Music Manager permite:

- listar albuns e playlists salvos no banco
- criar albuns e playlists manualmente pela interface
- adicionar musicas a um album ou playlist existente
- importar albuns por URL do Internet Archive
- importar albuns por URL do Palco MP3
- importar um album ou playlist a partir de um arquivo JSON
- salvar albuns/playlists como JSON
- exportar toda a biblioteca como JSON
- gerar copia de backup do banco SQLite

## Stack

- Node.js
- Express
- SQLite3
- Axios
- Cheerio
- HTML/CSS/JavaScript

## Requisitos

- Node.js 18+ recomendado
- npm

## Instalacao

```bash
npm install
```

## Scripts Disponiveis

```bash
npm run dev
```

Inicia o servidor com `node --watch server.js`.

```bash
npm start
```

Inicia o servidor normalmente.

```bash
npm run db:create
```

Cria o banco `db/music.db`, cria as tabelas e aplica um seed inicial se o banco estiver vazio.

```bash
npm run db:export
```

Exporta o conteudo do banco para um arquivo JSON na pasta `temp/`.

## Como Rodar

1. Instale as dependencias com `npm install`
2. Execute `npm run db:create`
3. Execute `npm run dev`
4. Acesse `http://localhost:3000`

## Estrutura do Projeto

```text
fenix-music-manager/
|-- db/
|   |-- music.db
|   `-- music_backup.db
|-- config/
|   `-- index.js
|-- repositories/
|   |-- albumRepository.js
|   |-- dbHelpers.js
|   `-- playlistRepository.js
|-- routes/
|   |-- albums.js
|   |-- backup.js
|   |-- database.js
|   |-- export.js
|   |-- playlists.js
|   `-- search.js
|-- scripts/
|   |-- archiveScraper.js
|   |-- createDb.js
|   |-- exportDb.js
|   |-- exportDbCli.js
|   `-- palcoScraper.js
|-- services/
|   |-- albumServices.js
|   |-- playlistService.js
|   `-- searchService.js
|-- temp/
|-- www/
|   |-- css/
|   |-- index.html
|   `-- js/
|       |-- main.js
|       `-- features/
|           |-- albums/
|           |-- importers/
|           |-- library/
|           |-- playlists/
|           `-- search/
|-- albums_json/
|-- package.json
`-- server.js
```

## Arquitetura

O backend esta organizado em camadas:

- `config/`: configuracoes centrais da aplicacao e caminhos do projeto
- `routes/`: recebe requests HTTP e responde em JSON/download
- `services/`: aplica regra de negocio e orquestra operacoes
- `repositories/`: concentra consultas e comandos SQL
- `scripts/`: utilitarios de banco e scrapers

O frontend esta organizado por dominio:

- `features/albums/`
- `features/playlists/`
- `features/search/`
- `features/importers/`
- `features/library/`

## Fluxo Geral da Aplicacao

### Backend

1. `config/index.js` define porta, caminhos e nomes de arquivos
2. `server.js` sobe o Express na porta configurada
3. o backend serve os arquivos estaticos da pasta `www/`
4. o frontend chama as rotas `/api/...`
5. as rotas delegam para `services/`
6. os services usam `repositories/` para acessar o banco SQLite

### Frontend

1. `www/index.html` carrega a interface
2. `www/js/main.js` registra os eventos principais da tela
3. cada feature renderiza telas, abre modais e chama a API
4. os dados retornam da API e atualizam a interface

## Banco de Dados

O banco principal fica em:

- `db/music.db`

Backup local do banco:

- `db/music_backup.db`

Os caminhos do banco e das pastas auxiliares sao definidos em:

- `config/index.js`

### Tabelas

#### `albums`

Armazena os dados principais dos albuns.

Campos:

- `id`
- `artista_nome`
- `artista_relacionado`
- `titulo`
- `ano`
- `genero`
- `descricao`
- `cover`
- `servidor`
- `autor`

#### `musicas`

Armazena as faixas ligadas a um album.

Campos:

- `id`
- `album_id`
- `titulo`
- `url`
- `artista`

#### `playlists`

Armazena os dados principais das playlists.

Campos:

- `id`
- `artista_nome`
- `artista_relacionado`
- `titulo`
- `ano`
- `genero`
- `descricao`
- `cover`
- `servidor`
- `autor`

#### `playlists_musicas`

Armazena as faixas ligadas a uma playlist.

Campos:

- `id`
- `playlist_id`
- `titulo`
- `artista`
- `url`
- `cover`

## Rotas da API

### Albuns

#### `GET /api/albums`

Lista todos os albuns cadastrados.

Resposta:

```json
[
  {
    "id": 1,
    "artista_nome": "Independente",
    "titulo": "Sombras da Guerra"
  }
]
```

#### `POST /api/albums`

Cria um album ou playlist dependendo do campo `type`.

Body para album:

```json
{
  "type": "album",
  "album": "Nome do Album",
  "artist": "Nome do Artista",
  "related": "Relacionado",
  "year": "2025",
  "genrer": "Rock",
  "cover": "https://...",
  "server": "Local",
  "author": "Leo",
  "tracks": [
    {
      "title": "Faixa 1",
      "url": "https://..."
    }
  ]
}
```

Body para playlist:

```json
{
  "type": "playlist",
  "album": "Nome da Playlist",
  "artist": "Artista Principal",
  "related": "Relacionado",
  "year": "2025",
  "genrer": "Rock",
  "cover": "https://...",
  "server": "Local",
  "author": "Leo",
  "tracks": [
    {
      "title": "Musica 1",
      "url": "https://..."
    }
  ]
}
```

Resposta para album:

```json
{
  "success": true,
  "albumId": 10
}
```

Resposta para playlist:

```json
{
  "success": true,
  "playlistId": 5
}
```

#### `GET /api/albums/:id`

Retorna um album com suas faixas.

#### `POST /api/albums/:id/music`

Adiciona uma musica a um album.

Body:

```json
{
  "title": "Nova Musica",
  "artist": "Artista",
  "url": "https://..."
}
```

#### `DELETE /api/albums/:id`

Remove um album.

### Playlists

#### `GET /api/playlists`

Lista todas as playlists.

#### `GET /api/playlists/:id`

Retorna uma playlist com suas faixas.

#### `POST /api/playlists/:id/music`

Adiciona uma musica a uma playlist.

Body:

```json
{
  "title": "Nova Musica",
  "artist": "Artista",
  "url": "https://...",
  "cover": "https://..."
}
```

#### `DELETE /api/playlists/:id`

Remove uma playlist.

### Busca

#### `GET /api/search?q=termo`

Busca em albuns e playlists por titulo ou artista.

Resposta:

```json
[
  {
    "id": 1,
    "titulo": "Sombras da Guerra",
    "artista_nome": "Independente",
    "type": "album"
  },
  {
    "id": 2,
    "titulo": "Minhas favoritas",
    "artista_nome": "Samuel, Nathalia, Judas...",
    "type": "playlist"
  }
]
```

### Exportacao e Backup

#### `GET /api/export/db-json`

Gera um arquivo JSON com toda a biblioteca e responde com download.

Tambem salva o arquivo na pasta `temp/`.

#### `POST /api/backup-db`

Cria uma copia do banco principal em `db/music_backup.db`.

Resposta:

```json
{
  "success": true,
  "message": "backup criado"
}
```

### Scrapers

#### `POST /api/scrape/archive`

Importa dados de album do Internet Archive.

Body:

```json
{
  "url": "https://archive.org/details/..."
}
```

Resposta de sucesso:

```json
{
  "success": true,
  "album": {
    "album": "Nome do Album",
    "artist": "Desconhecido",
    "server": "internet-archive",
    "genrer": "Rock",
    "author": "Uploader",
    "cover": "https://...",
    "tracks": []
  }
}
```

#### `POST /api/scrape/palco`

Importa dados de album do Palco MP3.

Body:

```json
{
  "url": "https://www.palcomp3.com.br/..."
}
```

### Diagnostico

#### `GET /api/test-db`

Retorna todas as linhas da tabela `albums`. Serve como teste simples de conexao com o banco.

## Fluxo de Uso na Interface

### 1. Listar albuns

- clicar em `Albums`
- o frontend chama `GET /api/albums`
- os cards sao renderizados na grade

### 2. Abrir pagina de album

- clicar em um card de album
- o app salva `CURRENT_ALBUM_ID` no `localStorage`
- chama `GET /api/albums/:id`
- renderiza capa, metadados e faixas

### 3. Criar album ou playlist

- abrir o modal principal
- preencher dados
- escolher o tipo `album` ou `playlist`
- clicar em salvar
- o frontend chama `POST /api/albums`

### 4. Adicionar musica

- abrir pagina de album ou playlist
- clicar em `Adicionar Musica`
- preencher o modal
- o frontend chama:
  - `POST /api/albums/:id/music`, ou
  - `POST /api/playlists/:id/music`

### 5. Buscar itens

- digitar um termo no campo de busca
- clicar em pesquisar
- o frontend chama `GET /api/search?q=...`
- mistura resultados de albuns e playlists

### 6. Importar por JSON

- clicar em `Importar Json`
- selecionar um arquivo `.json`
- o modal do album e preenchido automaticamente
- o usuario pode salvar no banco ou reexportar

### 7. Importar do Internet Archive

- abrir `Import > Internet Archive`
- informar a URL
- o app chama `POST /api/scrape/archive`
- o retorno preenche o modal de album

### 8. Importar do Palco MP3

- abrir `Import > Palco Mp3`
- informar a URL
- o app chama `POST /api/scrape/palco`
- o retorno preenche o modal de album

### 9. Exportar biblioteca

- clicar em `Exportar Json`
- o frontend redireciona para `GET /api/export/db-json`
- o browser baixa o arquivo JSON

### 10. Backup do banco

- clicar em `Backup DB`
- o frontend chama `POST /api/backup-db`
- o banco principal e copiado para `db/music_backup.db`

## Fluxo de Backup e Importacao

### Backup do banco SQLite

Origem:

- `db/music.db`

Destino:

- `db/music_backup.db`

Mecanismo:

- copia direta via `fs.copyFileSync`

### Exportacao da biblioteca em JSON

Origem:

- dados do SQLite

Destino:

- arquivo JSON em `temp/fenix-backup-<timestamp>.json`

Formato:

- objeto com duas chaves principais:
  - `albums`
  - `playlists`

### Importacao por arquivo JSON

O arquivo JSON deve seguir o formato esperado pelo modal de album/playlist, por exemplo:

```json
{
  "type": "album",
  "album": "Meu Album",
  "artist": "Meu Artista",
  "related": "",
  "year": "2025",
  "genrer": "Rock",
  "cover": "https://...",
  "server": "Local",
  "author": "Leo",
  "tracks": [
    {
      "title": "Faixa 1",
      "url": "https://..."
    }
  ]
}
```

## Scrapers

### Internet Archive

Arquivo:

- `scripts/archiveScraper.js`

Responsabilidades:

- ler pagina principal do item
- extrair nome do album
- extrair uploader/autor
- extrair capa
- acessar a pagina de download
- localizar links `.mp3`
- montar o objeto de album usado pela UI

### Palco MP3

Arquivo:

- `scripts/palcoScraper.js`

Responsabilidades:

- carregar o HTML da pagina
- extrair nome do album
- extrair artista
- extrair capa
- extrair ano
- localizar nomes de faixas
- localizar URLs MP3 no HTML
- montar o objeto de album usado pela UI

## Modulos e Funcoes

### Backend

#### `server.js`

Responsavel por:

- iniciar o servidor
- servir o frontend estatico
- registrar as rotas da API
- expor os endpoints de scraper

#### `config/index.js`

Responsavel por:

- definir a porta da aplicacao
- centralizar caminhos absolutos do projeto
- expor os caminhos de `www/`, `db/`, `temp/` e `albums_json/`
- gerar nomes de arquivo de exportacao via `createExportFilePath()`

#### `routes/albums.js`

Responsavel por:

- `GET /api/albums`
- `POST /api/albums`
- `GET /api/albums/:id`
- `POST /api/albums/:id/music`
- `DELETE /api/albums/:id`

#### `routes/playlists.js`

Responsavel por:

- `GET /api/playlists`
- `GET /api/playlists/:id`
- `POST /api/playlists/:id/music`
- `DELETE /api/playlists/:id`

#### `routes/search.js`

Responsavel por:

- `GET /api/search`

#### `routes/export.js`

Responsavel por:

- gerar o download do JSON exportado

#### `routes/backup.js`

Responsavel por:

- copiar o banco principal para o arquivo de backup

#### `routes/database.js`

Responsavel por:

- abrir a conexao global com `db/music.db`

#### `services/albumServices.js`

Funcoes:

- `getAlbums()`: lista albuns
- `addAlbum(album)`: alias de criacao de album
- `deleteAlbum(id)`: remove um album
- `createAlbum(album)`: cria um album e suas faixas
- `getAlbumById(id)`: busca um album com faixas
- `addMusicToAlbum(albumId, music)`: adiciona musica a album

#### `services/playlistService.js`

Funcoes:

- `getPlaylists()`: lista playlists
- `createPlaylist(playlist)`: cria playlist e suas faixas
- `removePlaylist(id)`: remove playlist
- `getPlaylistById(id)`: busca playlist com faixas
- `addMusicToPlaylist(playlistId, music)`: adiciona musica a playlist

#### `services/searchService.js`

Funcoes:

- `searchLibrary(query)`: busca em albuns e playlists

#### `repositories/dbHelpers.js`

Funcoes auxiliares para SQLite:

- `run(query, params)`: executa `INSERT`, `UPDATE`, `DELETE`
- `get(query, params)`: busca uma linha
- `all(query, params)`: busca varias linhas

#### `repositories/albumRepository.js`

Funcoes:

- `findAllAlbums()`
- `insertAlbum(album)`
- `insertAlbumTracks(albumId, tracks, artist)`
- `findAlbumById(id)`
- `findAlbumTracksById(albumId)`
- `deleteAlbumById(id)`
- `insertMusicIntoAlbum(albumId, music)`
- `searchAlbums(search)`

#### `repositories/playlistRepository.js`

Funcoes:

- `findAllPlaylists()`
- `insertPlaylist(playlist)`
- `insertPlaylistTracks(playlistId, tracks, artist, cover)`
- `deletePlaylistById(id)`
- `insertMusicIntoPlaylist(playlistId, music)`
- `findPlaylistById(id)`
- `findPlaylistTracksById(playlistId)`
- `searchPlaylists(search)`

#### `scripts/createDb.js`

Responsavel por:

- criar as tabelas
- habilitar `foreign_keys`
- popular o banco com seed inicial

#### `scripts/exportDb.js`

Responsavel por:

- ler as tabelas do banco
- transformar os dados no formato de exportacao
- retornar um objeto `{ albums, playlists }`

#### `scripts/exportDbCli.js`

Responsavel por:

- usar `exportDB()`
- salvar o resultado em `temp/`
- funcionar via `npm run db:export`

#### `scripts/archiveScraper.js`

Funcoes:

- `scrapeArchive(url)`: importa album do Internet Archive

#### `scripts/palcoScraper.js`

Funcoes:

- `scrapePalco(url)`: importa album do Palco MP3

### Frontend

#### `www/js/main.js`

Responsavel por:

- registrar eventos globais da interface
- disparar renderizacao de albuns, playlists e busca
- abrir importadores
- acionar backup e exportacao

#### `features/albums/components/albumCard.js`

Funcoes:

- `createAlbumCard(album)`: monta o card visual de album

#### `features/albums/pages/renderAlbums.js`

Funcoes:

- `renderAlbums()`: renderiza a grade de albuns

#### `features/albums/pages/renderAlbumPage.js`

Funcoes:

- `renderAlbumPage(albumId)`: renderiza a pagina de detalhe de um album

#### `features/albums/modals/modalAlbum.js`

Funcoes:

- `openAlbumModal()`: abre o modal principal
- `closeAlbumModal()`: fecha o modal principal
- `saveAlbum()`: salva album ou playlist no banco
- `fillAlbumModal(album)`: preenche o modal com dados existentes
- `importJsonAlbum()`: importa um JSON local para o modal
- `saveAlbumAsJson()`: exporta o conteudo do modal para JSON

#### `features/playlists/components/playlistCard.js`

Funcoes:

- `createPlaylistCard(playlist)`: monta o card visual de playlist

#### `features/playlists/pages/renderPlaylists.js`

Funcoes:

- `renderPlaylists()`: renderiza a grade de playlists

#### `features/playlists/pages/renderPlaylistPage.js`

Funcoes:

- `renderPlaylistPage(playlistId)`: renderiza a pagina de detalhe da playlist

#### `features/search/renderSearch.js`

Funcoes:

- `renderSearch(query)`: renderiza resultados mistos de busca

#### `features/library/modals/addMusicModal.js`

Funcoes:

- `openMusicModal(type, id)`: abre modal de musica
- `closeMusicModal()`: fecha modal de musica
- `saveMusic()`: adiciona musica a album ou playlist

#### `features/library/actions/exportDatabaseJson.js`

Funcoes:

- `exportDatabaseJson()`: inicia o download do JSON exportado

#### `features/importers/archiveImporter.js`

Funcoes:

- `openArchiveModal()`
- `closeArchiveModal()`
- `searchArchiveAlbum()`

#### `features/importers/palcoImporter.js`

Funcoes:

- `openPalcoModal()`
- `closePalcoModal()`
- `searchPalcoAlbum()`

#### `features/library/legacy/albumsLocalDb.js`

Arquivo legado nao usado no fluxo atual. Foi mantido apenas como referencia historica.

## Pastas Geradas e Arquivos de Saida

### `db/`

- `music.db`: banco principal
- `music_backup.db`: backup do banco

### `temp/`

- recebe os arquivos JSON gerados por exportacao

### `albums_json/`

- pode receber JSONs locais de scrapers quando o salvamento opcional e ativado

## Observacoes Importantes

- A porta esta fixa em `3000`
- A porta esta centralizada em `config/index.js`
- O projeto nao usa variaveis de ambiente atualmente
- O banco e local e baseado em arquivo SQLite
- O frontend usa `fetch` para toda comunicacao com o backend
- O endpoint `POST /api/albums` tambem cria playlists quando `type === 'playlist'`
- Os scrapers retornam um objeto no formato esperado pelo modal da UI

## Melhorias Futuras Recomendadas

- adicionar validacao de entrada nas rotas
- padronizar respostas HTTP de erro e sucesso
- mover os endpoints de scraper para rotas dedicadas
- adicionar testes automatizados
- adicionar configuracao por ambiente
- documentar exemplos de payloads reais por fonte importada
