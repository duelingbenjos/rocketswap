import express from 'express'

const app = express()

app.get('/api/token-list', (req, res) => {
  res.send({ sup: 'hello world !!!' })
})

app.listen(3000)
