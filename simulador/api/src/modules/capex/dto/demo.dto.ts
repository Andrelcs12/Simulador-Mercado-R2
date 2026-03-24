


export class DemoDTO {
  responsavel: string;
  descricao: string;
  saldoDisponivel: number;
  valorGasto: number;
  saldoAtual: number;
  csat: number;
  
  // Opcionais se você quiser usar para cálculos depois:
  qtdOperadores?: number;
  notaQuiz?: number;
}