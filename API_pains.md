# Rocketswap API Pain Points

- Resync from API takes a long time
- Code changes take a long time to test on remote environment
- Updates to one part of the application (UI eg) forces resync for whole application
- all processing for application is on one thread.
- bugs in rocketfarm cause all pools to stop showing interest
- websocket handler is wired as a callback chain - maintenance burden
- Trollbox loses all history on resync