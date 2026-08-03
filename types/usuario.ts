export type NivelUsuario =
    | "ADMIN"
    | "GERENTE"
    | "VENDEDOR";

export type UsuarioEquipe = {
    id: string;
    nome: string;
    email: string;
    nivel: NivelUsuario;
    ativo: boolean;
    criadoEm: string;
    atualizadoEm?: string;

    _count: {
        clientes: number;
        oportunidades: number;
        tarefas: number;
        interacoes: number;
    };
};

export type UsuariosResponse = {
    usuarios: UsuarioEquipe[];
};

export type CriarUsuarioPayload = {
    nome: string;
    email: string;
    senha: string;
    nivel: NivelUsuario;
};