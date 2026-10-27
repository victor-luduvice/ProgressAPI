import 'dotenv/config';
import { Papel, PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { emitKeypressEvents } from 'node:readline';
import { stdin, stdout } from 'node:process';

const prisma = new PrismaClient();

async function lerSenhaSemEco() {
  if (!stdin.isTTY || !stdin.setRawMode) {
    throw new Error('Execute este comando em um terminal interativo');
  }

  emitKeypressEvents(stdin);
  stdout.write('Nova senha (mínimo 12 caracteres): ');
  stdin.setRawMode(true);
  stdin.resume();

  return new Promise<string>((resolve, reject) => {
    let senha = '';
    const cleanup = () => {
      stdin.setRawMode(false);
      stdin.off('keypress', onKeypress);
      stdout.write('\n');
    };
    const onKeypress = (character: string, key: { name?: string; ctrl?: boolean }) => {
      if (key.ctrl && key.name === 'c') {
        cleanup();
        reject(new Error('Operação cancelada'));
      } else if (key.name === 'return' || key.name === 'enter') {
        cleanup();
        resolve(senha);
      } else if (key.name === 'backspace') {
        senha = senha.slice(0, -1);
      } else if (character && !key.ctrl) {
        senha += character;
      }
    };
    stdin.on('keypress', onKeypress);
  });
}

async function main() {
  const [emailArgument] = process.argv.slice(2);
  if (emailArgument === '--help' || emailArgument === '-h') {
    console.log('Uso: npm run user:set-password -- <email>');
    return;
  }
  const email = emailArgument?.toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error('Uso: npm run user:set-password -- <email>');
  }

  const usuario = await prisma.usuario.findUnique({
    where: { email },
  });
  if (!usuario || ![Papel.DONO, Papel.ESTOQUE].includes(usuario.papel)) {
    throw new Error('Usuário não encontrado ou com papel inválido');
  }

  const senha = await lerSenhaSemEco();
  if (senha.length < 12) throw new Error('A senha precisa ter pelo menos 12 caracteres');

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { senhaHash: await hash(senha, 12) },
  });

  console.log(`Senha atualizada para ${usuario.email}`);
}

main()
  .catch((error: unknown) => {
    console.error(error instanceof Error ? error.message : 'Falha ao atualizar senha');
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());