import { FastifyInstance } from "fastify"; //Biblioteca de rotas
import { fastifyMultipart } from '@fastify/multipart' //Importação do Multipart do fastify dedicado a upload de arquivos
import path from "node:path"; //Importando o path - pacute nativo do node
import { randomUUID } from "node:crypto";
import fs from 'node:fs';
import { pipeline } from "node:stream";
import { promisify } from "node:util";
import { prisma } from "../lib/prisma";//Importando o banco

const pump = promisify(pipeline)

export async function uploadVideoRoute(app:FastifyInstance) {
    app.register(fastifyMultipart, {
        limits: {
            //vem por padrão 1 mb de filesize que é represnetado por esse número
            fileSize: 1_048_576 * 25 //25mb
        }
    })

    app.post('/videos', async(request, reply) => {
        const data = await request.file() 

        //Validação de conteudo
        if(!data) {
            return reply.status(400).send({ error: 'Missing file input' })
        }

        //Retorna a extenção do arquivo
        const extension = path.extname(data.filename)

        //Validação do arquivo que esta chegando para a gente, esta em mp3 pois sera feita a conversão do video para audio no navegador
        if(extension !== '.mp3') {
            return reply.status(400).send({error: 'Invalid input type, please upload a MP3'})
        }

        // criação de nome unico para o arquivio
        const fileBaseName = path.basename(data.filename, extension) //Esse metodo tira  a extenção do arquivo retornando somente o nome antes do '.'
        const fileUploadName = `${fileBaseName}-${randomUUID()}${extension}`
        const uploadDestination = path.resolve(__dirname, '../../tmp', fileUploadName)

        //Função de alocação em disco
        await pump(data.file, fs.createWriteStream(uploadDestination))

        //Adicionando o registro no banco de dados
        const video = await prisma.video.create({
            data: {
                name: data.filename,
                path: uploadDestination,

            }
        }) 

        return {
            video,
        }
    })
}