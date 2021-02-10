curl http://127.0.0.1:3002/api/auth/message \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE2MTI1NjUxNjAsImV4cCI6MTYxMjU2ODc2MCwiYXVkIjoiaHR0cHM6Ly9teS1hcHAuY29tIiwiaXNzIjoiaHR0cHM6Ly9teS1hcHAuY29tIiwic3ViIjoiODA2ODQzNjM3ODFkYzNhNzRjMjE1MTExZWM2ZTViZTBhNWJhZDM4MjkwNDE0ZTIyOThiNWU3ZjM3MzNhZTkzOCJ9.9hzSb7A1v-GJPOijmw6AksGTIYs2nhde4jEuzr7E3Fc"\
  --data '{"message": "Hello World !!!"}'