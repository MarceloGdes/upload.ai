import { FastifyInstance } from "fastify";
import { z } from 'zod' //Importando biblioteca de validação
import { streamToResponse, OpenAIStream } from 'ai'
import { prisma } from "../lib/prisma"; //Importando o banco
import { createReadStream } from "fs";
import { openai } from '../lib/openai'

export async function generateAiCompletionRoute(app: FastifyInstance) {
    //Transcrição depende do ID de vide que sera passado na url
    app.post('/ai/complete', async(req, reply) => {
        const bodySchema = z.object({
            videoId: z.string().uuid(),
            prompt: z.string(),
            temperature: z.number().min(0).max(1).default(0.5)
        })

        //Vai validar o formato do prompt de acordo com o Squema feito acima e se for valido ele adere o valor no prompt
        const { videoId, prompt, temperature } = bodySchema.parse(req.body)

        //Localizando o video by ID
        const video = await prisma.video.findUniqueOrThrow({
            where: {
                id: videoId
            }
        })
        
        //Validação se o video tem transcrição
        if(!video.transcription) {
            return reply.status(400).send({ error: "video transcription was not generated yet." })
        }

        // aderindo o prompt message
        const promptMessage = prompt.replace('{transcription}', video.transcription)

        //Enviando para a AI

        const response = await openai.chat.completions.create({
            model: 'gpt-3.5-turbo-16k',
            temperature,
            messages: [
                { role: 'user', content: promptMessage } 
            ],
            stream: true
        })

        //Mecanismo de stream para os textareas
        const strem = OpenAIStream(response)

        streamToResponse(strem, reply.raw, {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
            }
        })

    })  
}
