import "dotenv/config";

import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
    adapter,
});

async function main() {
    const senhaCriptografada = await bcrypt.hash("123456", 12);

    const admin = await prisma.usuario.upsert({
        where: {
            email: "admin@leadflow.com",
        },
        update: {
            nome: "Administrador",
            senha: senhaCriptografada,
            nivel: "ADMIN",
            ativo: true,
        },
        create: {
            nome: "Administrador",
            email: "admin@leadflow.com",
            senha: senhaCriptografada,
            nivel: "ADMIN",
        },
    });

    console.log("Administrador criado:");
    console.log({
        id: admin.id,
        nome: admin.nome,
        email: admin.email,
    });
}

main()
    .catch((erro) => {
        console.error("Erro ao executar seed:", erro);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });