import { FastifyInstance } from "fastify";
import { z } from 'zod' //Importando biblioteca de validação
import { prisma } from "../lib/prisma"; //Importando o banco
import { createReadStream } from "fs";
import { openai } from '../lib/openai'

export async function createTranscriptionRoute(app: FastifyInstance) {
    //Transcrição depende do ID de vide que sera passado na url
    app.post('/videos/:videoId/transcription', async(req) => {
        //Formato dos parametros da requisição esperado
        const paramsSchema = z.object({
            //Basicamente esperamos que dento de um obj tenha uma key de Id que seja string e no formato uuid
            videoId: z.string().uuid(),
        })

        //Parse valida se o param da req esta seguindo o formato estipulado, se estiver correto é retornado o ID do video
        const { videoId } = paramsSchema.parse(req.params)

        const bodySchema = z.object({
            prompt: z.string(),
        })

        //Vai validar o formato do prompt de acordo com o Squema feito acima e se for valido ele adere o valor no prompt
        const { prompt } = bodySchema.parse(req.body)

        // Função do prisma que filtra um unico Id na DB
        const video = await prisma.video.findUniqueOrThrow({
            //Filtra pelo ID
            where: {
                id: videoId,
            }
        })

        const videoPath = video.path
        const audioReadStream = createReadStream(videoPath)

        //configurações passados para a IA
        const response = await openai.audio.transcriptions.create({
            file: audioReadStream,
            model: 'whisper-1',
            language: 'pt',
            response_format: 'json',
            temperature: 0,
            prompt,
        })

       //parei no 1:04:38

       const transcription = response.text

        await prisma.video.update({
            where: {
                id: videoId,
            },
            data: {
                transcription,
            }
        })

        return { transcription }
    })
}
