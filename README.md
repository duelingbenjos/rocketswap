# rocketswap

An AMM for Lamden

## Run instructions

### Mainnet

* From root : `docker-compose up --build`

### Testnet

* From root : `docker-compose -f docker-compose-testnet.yml up --build`

## Development

### API

#### Testnet

* From /api : `npm run start:dev:tn`
  * To wipe local state and resync : `npm run start:dev:wipe:tn`
* From /ui : `npm run dev`

#### Mainnet

* From /api : `npm run start:dev`
  * To wipe local state and resync : `npm run start:dev:wipe`
* From /ui : `npm run dev`