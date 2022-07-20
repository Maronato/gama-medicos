# Gama Médicos!

A busca de credenciados da gama é mto ruim, então eu fiz a minha. Os resultados aqui são só do plano Master Ouro.

## Inner workings
This is a simple SPA built using Vite and React. It uses one of the backends available at `src/database/backends` to fetch and display provider data on a map.

The map uses Leaflet and StadiaMaps.

The default database provider is a simple sqlite database that is gzipped and downloaded on page load. It then uses SQL.js to load it into memory and run queries on it. An HTTP virtual file system backend is also available, but performance improvements are marginal and it requires the entire, unzipped, database to be downloaded since the map itself needs all data to be fetched.

I chose this approach since it does not require an active backend. It is currently hosted here, on Github Pages.

Other than that, the code should be pretty straighforward. If you have any questions, please open an issue or a PR!

## Running locally

```sh
npm install
npm run dev
```

## Linting and building

```sh
npm run lint
npm run build
```

