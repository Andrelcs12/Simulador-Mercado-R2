🚀 Guia de Testes da API (Insomnia / Postman)
Este guia contém os exemplos reais para testar o CRUD de usuários na porta 4000.

1. Criar Usuário (POST)
URL: http://localhost:4000/usuarios

Body (JSON):

JSON
{
  "name": "André Santos",
  "email": "andre@residencia.com",
  "password": "senha_segura_123"
}
Resposta esperada: 201 Created

2. Listar Todos os Usuários (GET)
URL: http://localhost:4000/usuarios

Descrição: Use para visualizar todos os registros e copiar o id (cuid) para os próximos testes.

Resposta esperada: 200 OK (Array de objetos)

3. Buscar Usuário Específico (GET)
URL: http://localhost:4000/usuarios/ID_AQUI

Descrição: Substitua ID_AQUI pelo ID gerado no banco.

Resposta esperada: 200 OK ou 404 Not Found se o ID não existir.

4. Atualizar Dados (PATCH)
URL: http://localhost:4000/usuarios/ID_AQUI

Body (JSON):

JSON
{
  "name": "André Lucas Torres",
  "email": "contato@residencia.com"
}
Descrição: Altera apenas os campos enviados.

5. Deletar Usuário (DELETE)
URL: http://localhost:4000/usuarios/ID_AQUI

Descrição: Remove o registro permanentemente.

Resposta esperada: 200 OK

💡 Dica Técnica para o Time
Atenção: Se você receber um erro de conexão, verifique se o seu main.ts está configurado para ouvir na porta correta:
await app.listen(4000);