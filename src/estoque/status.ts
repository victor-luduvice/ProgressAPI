export type StatusEstoque = 'SEM_CONTAGEM' | 'CRITICO' | 'ATENCAO' | 'OK';

// Margem acima do mínimo em que o item já entra em "atenção" (25%)
const MARGEM_ATENCAO = 0.25;

export function calcularStatus(
  saldo: number | null,
  minimo: number,
): StatusEstoque {
  if (saldo === null) return 'SEM_CONTAGEM';
  if (minimo <= 0) return 'OK'; // sem mínimo definido, não gera alerta
  if (saldo < minimo) return 'CRITICO';
  if (saldo <= Math.ceil(minimo * (1 + MARGEM_ATENCAO))) return 'ATENCAO';
  return 'OK';
}
