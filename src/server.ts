import { app } from './app'

app
  .listen({
    port: 3333,
  })
  .then(() => {
    return console.log('HTTP Server runnig!')
  })
