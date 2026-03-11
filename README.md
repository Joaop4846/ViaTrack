# ViaTrack

Sistema full stack para registro e consulta de infrações de trânsito vinculadas a contratos.

Feito com Node.js + React.

---

## Tecnologias

**Backend:**
- Node.js (v20+) / TypeScript
- Express
- better-sqlite3
- Swagger (swagger-jsdoc + swagger-ui-express)
- Jest para testes

**Frontend:**
- React / TypeScript
- Vite
- Axios

---

## Fluxo do Sistema

A ideia principal e como o sistema funciona no dia a dia é bem simples:
1. O usuário escolhe um contrato na lista.
2. Digita a velocidade e o endereço (com ajuda do preenchimento automático via CEP).
3. A infração é registrada no sistema.
4. A lista que fica ao lado atualiza na mesma hora mostrando a infração nova.

---

## Banco de Dados

Pra facilitar a vida, a configuração do banco é toda automática:
- O banco SQLite é criado sozinho na primeira vez que a aplicação roda.
- O arquivo do banco fica guardado em `server/data/viatrack.db`.
- Quando o backend inicia, ele já tem um "seed" (dados iniciais) automático pra inserir alguns contratos básicos pra você testar, sem precisar ficar cadastrando tudo do zero.

---

## Estrutura

```
ViaTrack/
├── server/
│   └── src/
│       ├── controllers/
│       ├── database/
│       ├── models/
│       ├── repositories/
│       ├── routes/
│       ├── services/
│       └── tests/
├── client/
│   └── src/
│       ├── components/
│       ├── pages/
│       └── services/
└── README.md
```

---

## Como rodar

Necessário   ter **Node.js v20+** e **Git** instalados.

- Node.js: [nodejs.org](https://nodejs.org)
- Git: [git-scm.com](https://git-scm.com)

### 1. Clonar o repositório

```bash
git clone https://github.com/Joaop4846/ViaTrack.git
cd ViaTrack
```

### 2. Backend

```bash
cd server
npm install
npm run dev
```

O `npm install` vai instalar todas as dependências do backend (Express, better-sqlite3, Swagger, etc).

Vai rodar em `http://localhost:3001`.
A documentação da API fica em `http://localhost:3001/api-docs`.

### 3. Frontend

Em outro terminal:

```bash
cd client
npm install
npm run dev
```

O `npm install` vai instalar todas as dependências do frontend (React, Axios, etc).

Vai rodar em `http://localhost:5173`.

### 4. Build de Produção (Opcional)

Caso queira testar a versão final do projeto já pronta para produção:

**Backend:**
```bash
cd server
npm run build
npm start
```
Isso vai gerar a pasta `dist/` com o código JavaScript minificado e iniciar a API.

**Frontend:**
```bash
cd client
npm run build
npm run preview
```
Isso vai criar a pasta `dist/` com os arquivos finais e subir um servidor local só pra você visualizar a versão de produção.

---

## Rotas da API

| Método | Rota | O que faz |
|--------|------|-----------|
| GET | `/api/contracts` | Lista os contratos |
| GET | `/api/violations` | Lista as infrações |
| POST | `/api/violations` | Cria uma infração |
| DELETE | `/api/violations/:id` | Exclui uma infração |
| GET | `/api/health` | Health check |

### Exemplo de body para criação:

```json
{
  "contractId": 1,
  "speed": 80,
  "address": "Av. Paulista, 1000 - São Paulo"
}
```

---

## Testes

```bash
cd server
npm test
```

---

## Algumas decisões que tomei

- Separei o backend em camadas (Controllers → Services → Repositories) pra ficar mais organizado e facilitar os testes.

- Usei SQLite com better-sqlite3 por ser simples e não precisar de servidor externo. Pra um projeto assim funciona bem.

- Coloquei as validações no Service pra manter os controllers enxutos.

- No seed de contratos uso transaction pra garantir que ou insere tudo ou não insere nada.

- Os services recebem os repositórios como parâmetro opcional, assim fica mais fácil testar o código sem precisar conectar de verdade no banco de dados.

- No frontend separei em componentes (formulário, lista, background) e criei um service pra centralizar as chamadas de API. Escolhi usar o React pela experiência que já tenho com ele e por ajudar muito na hora da componentização.

- Integrei com a API do ViaCEP pra preencher o endereço automaticamente pelo CEP.

- As velocidades na tabela têm cores diferentes dependendo do valor (normal, amarelo, vermelho).

- Quando uma infração nova é criada, ela aparece na tabela com uma animação suave.

- Criei também um botão de filtrar por ordem. A ideia foi basicamente facilitar a vida do usuário na hora de consultar, caso exista um número muito grande de infrações listadas.

- Tentei manter o foco em fazer um layout e um design mais simples, porém que ficasse bem agradável de ver e totalmente funcional.

- Adicionei também um botão de excluir as infrações e, pra evitar acidentes, coloquei um modal (aquela janelinha que aparece na tela) de confirmação junto com ele. O motivo disso é que, se o usuário clicar no botão sem querer, ele não apaga o registro direto e acaba perdendo a informação.
