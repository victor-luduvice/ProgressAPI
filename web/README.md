# Armazém PWA

Interface Next.js para consultar o estoque e registrar contagens pela API NestJS.

## Desenvolvimento

Na raiz do repositório, mantenha a API rodando na porta 3000. Em outro terminal:

```bash
cd web
npm install
npm run dev
```

Abra http://localhost:3001 no computador. Para testar pelo celular na mesma rede Wi-Fi, use o endereço `Network` exibido pelo Next ao iniciar o servidor, por exemplo `http://192.168.1.191:3001`.

## Configuração

Por padrão, o Next encaminha `/api/*` para `http://127.0.0.1:3000`, sem expor o endereço da API ao navegador. Isso também permite abrir a interface pelo celular na mesma rede Wi-Fi. Para mudar o endereço da API, crie `web/.env.local`:

```dotenv
API_URL=http://127.0.0.1:3000
```

Entre com o usuário provisionado no seed. O papel `ESTOQUE` registra contagens; o papel `DONO` acompanha alertas e altera mínimos. O Next faz o proxy da API na mesma origem, e a sessão é mantida por cookie HttpOnly.

## PWA

O manifesto está em `public/manifest.webmanifest`; o ícone e o service worker ficam em `public/icon.svg` e `public/sw.js`. Em desenvolvimento, o app pode ser instalado em navegadores compatíveis via opção de instalação. Em produção, sirva a aplicação por HTTPS. O service worker guarda apenas o shell e arquivos estáticos; chamadas de estoque e gravações dependem de conexão ativa com a API.

## Verificações

```bash
npm run lint
npm run build
```