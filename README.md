# Simulador Multiplayer de Gestão de Varejo

Projeto desenvolvido durante a Residência Tecnológica da **Cencosud**, com foco na simulação de operações de varejo em ambiente multiplayer, permitindo que participantes assumam diferentes papéis estratégicos e tomem decisões que impactam indicadores operacionais e financeiros em tempo real.

---

## Sobre o Projeto

O Simulador Multiplayer de Gestão de Varejo foi desenvolvido para reproduzir cenários reais de operação de uma rede varejista.

Os participantes assumem diferentes funções dentro das lojas e realizam tomadas de decisão relacionadas a:

* Planejamento Comercial;
* Operação de Loja;
* Abastecimento;
* Serviços ao Cliente;
* Gestão Financeira.

As decisões realizadas durante cada rodada impactam diretamente indicadores estratégicos como:

* EBITDA;
* Receita;
* Market Share;
* SLA;
* CSAT;
* Aging de Estoque;
* Nível de Serviço;
* Custos Operacionais.

A aplicação foi projetada para funcionar em tempo real, permitindo sincronização entre jogadores, administração das rodadas e cálculo automático dos resultados.

---

## Tecnologias Utilizadas

### Frontend

* Next.js
* React
* TypeScript
* TailwindCSS
* Socket.IO Client

### Backend

* NestJS
* TypeScript
* Prisma ORM
* PostgreSQL
* Socket.IO

### Ferramentas de Desenvolvimento

* Git
* GitHub
* ChatGPT
* Google Gemini
* Documentações Oficiais

---

## Arquitetura do Sistema

O projeto segue uma arquitetura cliente-servidor.

### Frontend

Responsável por:

* Interface dos participantes;
* Dashboard de indicadores;
* Exibição dos resultados;
* Comunicação em tempo real com o backend.

### Backend

Responsável por:

* Gerenciamento das sessões;
* Controle das rodadas;
* Processamento das decisões;
* Cálculo dos indicadores;
* Sincronização multiplayer;
* Persistência de dados.

### Banco de Dados

Utilizado para armazenar:

* Usuários;
* Lojas;
* Rodadas;
* Submissões;
* Resultados;
* Configurações da simulação.

---

## Estrutura do Projeto

```bash
Simulador-Mercado-R2
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── ...
│
├── backend/
│   ├── src/
│   ├── prisma/
│   └── ...
│
└── README.md
```

---

## Funcionalidades

### Administração

* Criação de sessões;
* Controle das rodadas;
* Início e encerramento da simulação;
* Gestão dos participantes;
* Acompanhamento em tempo real.

### Participantes

* Entrada em salas de simulação;
* Envio de decisões por rodada;
* Visualização de indicadores;
* Consulta de resultados.

### Simulação

* Múltiplas lojas simultâneas;
* Papéis distintos por participante;
* Troca de participantes entre rodadas;
* Reconfiguração estratégica;
* Cálculo automático dos indicadores.

---

## Como Executar o Projeto

### 1. Clonar o Repositório

```bash
git clone https://github.com/Andrelcs12/Simulador-Mercado-R2.git
```

---

### 2. Instalar Dependências

#### Frontend

```bash
cd frontend
npm install
```

#### Backend

```bash
cd backend
npm install
```

---

### 3. Configurar Variáveis de Ambiente

Criar um arquivo `.env` dentro da pasta backend.

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/simulador

FRONTEND_URL=http://localhost:3000

PORT=3333
```

---

### 4. Executar Migrations

```bash
npx prisma migrate dev
```

---

### 5. Gerar Prisma Client

```bash
npx prisma generate
```

---

### 6. Executar o Backend

```bash
npm run start:dev
```

Servidor disponível em:

```bash
http://localhost:3333
```

---

### 7. Executar o Frontend

```bash
npm run dev
```

Aplicação disponível em:

```bash
http://localhost:3000
```

---

## Fluxo da Simulação

1. Criação da sessão.
2. Entrada dos participantes.
3. Configuração inicial das lojas.
4. Início da rodada.
5. Envio das decisões.
6. Processamento das submissões.
7. Atualização dos indicadores.
8. Divulgação dos resultados.
9. Próxima rodada.
10. Encerramento e cálculo final.

---

## Indicadores Simulados

### Financeiros

* Receita
* EBITDA
* Custos Operacionais
* Investimentos (CAPEX)
* Market Share

### Operacionais

* SLA
* Aging
* Disponibilidade de Estoque
* Ruptura
* Nível de Serviço

### Experiência do Cliente

* CSAT
* Qualidade do Atendimento
* Eficiência Operacional

---

## Inteligência Artificial no Desenvolvimento

O projeto não possui integração direta com APIs de IA no produto final.

As ferramentas de IA foram utilizadas como apoio durante o desenvolvimento para:

* Pesquisa técnica;
* Prototipação de fluxos;
* Geração de ideias;
* Refinamento de arquitetura;
* Modelagem de entidades;
* Engenharia de prompts;
* Otimização de código;
* Revisão técnica;
* Organização da documentação.

### Ferramentas Utilizadas

* ChatGPT (OpenAI)
* Google Gemini

Todas as implementações foram revisadas, adaptadas e validadas pela equipe antes de serem incorporadas ao sistema.

---

## Processo de Validação

As sugestões geradas por IA passaram por:

* Testes locais;
* Revisão técnica da equipe;
* Comparação com documentação oficial;
* Adequação às regras de negócio da simulação.

---

## Documentações Oficiais Utilizadas

* NestJS Documentation
* Prisma Documentation
* Socket.IO Documentation
* React Documentation
* Next.js Documentation

---

## Histórico e Rastreabilidade

O histórico completo de desenvolvimento pode ser consultado através dos commits do projeto:

https://github.com/Andrelcs12/Simulador-Mercado-R2/commits/main

O repositório registra:

* Evolução da arquitetura;
* Correções de bugs;
* Melhorias de performance;
* Ajustes de regras de negócio;
* Implementação de funcionalidades.

---

## Equipe

Projeto desenvolvido durante a Residência Tecnológica da Cencosud.

**Squad 12**

---

## Licença

Projeto desenvolvido exclusivamente para fins acadêmicos e de avaliação da Residência Tecnológica Cencosud.
