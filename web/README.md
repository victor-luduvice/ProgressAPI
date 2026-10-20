# Armazém PWA

Interface Next.js para consultar o estoque e registrar contagens pela API NestJS.

## Desenvolvimento

Na raiz do repositório, mantenha a API rodando na porta 3000. Em outro terminal:

```bash
cd web
npm install
npm run dev
```

Abra http://localhost:3001. O servidor Next usa a porta 3000 automaticamente se estiver livre; como a API já ocupa essa porta, ele selecionará outra, normalmente 3001.

## Configuração

Por padrão, a interface chama `http://localhost:3000` e registra as contagens para o usuário de ID `2` (o usuário provisório `Estoque` do seed). Para mudar esses valores, crie `web/.env.local`:

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_USER_ID=2
```

Em produção, a API precisa permitir CORS para a origem do frontend. A aplicação Nest já habilita CORS.

## PWA

O manifesto está em `public/manifest.webmanifest`; o ícone e o service worker ficam em `public/icon.svg` e `public/sw.js`. Em desenvolvimento, o app pode ser instalado em navegadores compatíveis via opção de instalação. Em produção, sirva a aplicação por HTTPS. O service worker guarda apenas o shell e arquivos estáticos; chamadas de estoque e gravações dependem de conexão ativa com a API.

## Verificações

```bash
npm run lint
npm run build
```