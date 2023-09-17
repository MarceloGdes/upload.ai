import { FastifyInstance } from "fastify";

//Importando o banco
import { prisma } from "../lib/prisma";

//Rota de get assincrona de prompts - consulta de banco
export async function getAllPromptsRoute(app:FastifyInstance) {
    app.get('/prompts', async() => {
        // Filtro na tabela videos
        const prompts = await prisma.prompt.findMany()
        return prompts
    })
}