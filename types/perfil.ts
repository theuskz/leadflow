export type NivelUsuarioPerfil =
    | "ADMIN"
    | "GERENTE"
    | "VENDEDOR";

export type EstatisticasPerfil = {
    clientes: number;
    oportunidades: number;
    tarefas: number;
    interacoes: number;
    vendasFechadas: number;
    valorFechado: number;
};

export type UsuarioPerfil = {
    id: string;
    nome: string;
    email: string;
    nivel: NivelUsuarioPerfil;
    ativo: boolean;
    criadoEm: string;
    estatisticas: EstatisticasPerfil;
};

export type PerfilResponse = {
    usuario: UsuarioPerfil;
};

export type AtualizarPerfilPayload = {
    nome: string;
    email: string;
};

export type AlterarSenhaPayload = {
    senhaAtual: string;
    novaSenha: string;
    confirmarSenha: string;
};