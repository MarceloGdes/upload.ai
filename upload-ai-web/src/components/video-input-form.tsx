import { FileVideo, Upload } from "lucide-react";
import { Separator } from "./ui/separator";
import { Label } from "./ui/label";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ChangeEvent, FormEvent, useMemo, useRef, useState } from "react";
import { getFFmpeg } from "@/lib/ffmpeg";
import { fetchFile } from "@ffmpeg/util";
import { api } from "@/lib/axios";

type Status = 'waiting' | 'converting' | 'uploading' | 'generating' | 'succsess'

const statusMessages = {
  converting: 'Convertendo...',
  uploading: 'Carregando...',
  generating: 'Transcrevendo...',
  succsess: 'Sucesso!'
}

interface  VideoInputFormProps {
  onVideoUploaded: (id: string) => void
}

export function VideoInputForm(props: VideoInputFormProps) {
    //Estado é toda variavel que quemos monitorar a troca de valor
    //é declarado 2 itens dentro array um sendo a variavel que tyroca de valor e a outra a função que troca o valor da variave
    //Tipamos o use state com o que esperamos receber Ou seja o File ou o Null em primeiro momento
    const [videoFile, setVideoFile] = useState<File | null>(null)

    const [status, setStatus] = useState<Status>('waiting')

    const promptInputRef = useRef<HTMLTextAreaElement>(null)

    //Preview Video 
    //event: ChangeEvent<HTMLInputElement> -> tipando a variavel que é passada como argumento, para descobrir qual o tipo que vai ser retornado é só passar o mouse por sima da propriedade que esta na tag html que no caso é o input com a propriedade onChange
    function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
        //Pegando o files que vai estar presente no input(Target)
        const { files } = event.currentTarget

        if(!files) return

        const selectedFile = files[0]

        setVideoFile(selectedFile)
    }

    async function convertVideoToAudio(video: File) {
      console.log('Convert started.')
  
      const ffmpeg = await getFFmpeg()
  
      await ffmpeg.writeFile('input.mp4', await fetchFile(video))
  
      // ffmpeg.on('log', log => {
      //   console.log(log)
      // })
  
      ffmpeg.on('progress', progress => {
        console.log('Convert progress: ' + Math.round(progress.progress * 100))
      })
  
      await ffmpeg.exec([
        '-i',
        'input.mp4',
        '-map',
        '0:a',
        '-b:a',
        '20k',
        '-acodec',
        'libmp3lame',
        'output.mp3'
      ])
  
      const data = await ffmpeg.readFile('output.mp3')
  
      const audioFileBlob = new Blob([data], { type: 'audio/mp3' })
      const audioFile = new File([audioFileBlob], 'output.mp3', {
        type: 'audio/mpeg'
      })
  
      console.log('Convert finished.')
  
      return audioFile
    }

    async function handleUploadVideo(event: FormEvent<HTMLFormElement>) {
        event.preventDefault() //tira o recarregamento automatico da pagina

        const prompt = promptInputRef.current?.value //pegando o valor da textarea de referencia

        if(!videoFile) return  

        setStatus('converting')

        //Convertendo video em audio
        const audioFile = await convertVideoToAudio(videoFile)

        //Comunicação com a api do back-end

        setStatus('uploading')

        //Fazendo uploado do video 
        //Criando um Form data que é o tipo de conteudo que o backend recebe
        const data = new FormData()
        data.append('file', audioFile)

        //resposta da requisição
        const response = await api.post('/videos', data)

        setStatus('generating')

        //gerando transcrição

        const videoId = response.data.video.id
        await api.post(`videos/${videoId}/transcription`, {
          prompt
        })

        setStatus('succsess')

        props.onVideoUploaded(videoId)
    }

    //Toda vez que o state videoFile Mudar ira ser retornadno uma url de preview
    const previewURL = useMemo(() => {
        if(!videoFile) return null

        return URL.createObjectURL(videoFile)
''
    }, [videoFile])

    return (
        <form onSubmit={handleUploadVideo} className='space-y-6'>
            <label 
              htmlFor="video"
              className='relative border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5'
            >
            {/* Condicinal: Caso exista uma previewURL, ele mostra 'oi', caso não tenha ele vai mostrar o padrão, as tags <> </> são chamadas de fragmentos, usadas para evelopar tags filhas sem quebrar com a estilização do componente */}
            {previewURL ? (
                <video src={previewURL} controls={false} className="pointer-events-none absolute inset-0" />
            ) : (
                <>
                    <FileVideo className='w-4 h-4' />
                    Selecione um vídeo
                </>
            )}
            </label>
            
            <input 
                type="file" 
                id='video' 
                accept='video/mp4' 
                className='sr-only' 
                onChange={handleFileSelected}
            />

            <Separator />

            <div className='space-y-2'>
              <Label htmlFor='transcription_prompt'>Prompt de transcrição</Label>
              <Textarea 
                ref={promptInputRef}
                disabled={status !== 'waiting'}
                id='transcription_prompt'
                className='h-20 leading-relaxed resize-none'
                placeholder='Inclua palavras chaves mencionadas no vídeo separadas por virgula (,)'
              />
            </div>

            <Button 
              data-succsess={status === 'succsess'}
              disabled={status !== 'waiting'} 
              type='submit' 
              className='w-full data-[succsess=true]:bg-emerald-500'
            >
              {status === 'waiting' ? (
                <>
                  Carregar vídeo
                  <Upload className='w-4 h-4 ml-2' />
                </>
              ): statusMessages[status]}
            </Button>
          </form>
    )
}