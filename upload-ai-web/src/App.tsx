import { FileVideo, Github, Upload, Wand2 } from 'lucide-react'
import { Separator } from './components/ui/separator'
import { Button } from "./components/ui/button";
import { Textarea } from './components/ui/textarea';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Slider } from './components/ui/slider';

export function App() {
  return (
    <div className='min-h-screen flex flex-col'>
      {/* Usando classes do tailwind para estilização */}
      <div className="px-6 py-3 flex items-center justify-between border-b">
        <h1 className="text-xl font-bold">upload.ai</h1>

        {/* gap seria uma propriedade de espaçamento */}
        <div className="flex items-center gap-3"> 

          <span className="text-sm text-muted-foreground">Desenvolvido com 💜 no NLW da Rocketseat</span>
          
          <Separator className='h-6' orientation='vertical' />

          <Button variant="outline">
            <Github className='w-4 h-4 mr-2'/>
            Github
          </Button>
        </div>
      </div>

      <main className='flex-1 p-6 flex gap-6'>
        <div className='flex flex-col flex-1 gap-4'>
          <div className='grid  grid-rows2 gap-4 flex-1'>
            <Textarea 
              placeholder='Inclua o prompt para a IA'
              className='resize-none p-4 leading-relaxed' 
            />
            <Textarea 
              placeholder='Resultado gerado pela IA' 
              readOnly
              className='resize-none p-4 leading-relaxed' 
            />
          </div>

          <p className='text-sm text-muted-foreground'>
            Lembre-se: você pode usara a variável <code className='text-violet-400'>{"{transcription}"}</code> no seu prompt para adicionar o conteudo de transcrição do video selecionado.
          </p>
        </div>

        <aside className='w-80 space-y-6'>
          <form className='space-y-6'>
            <label 
              htmlFor="video"
              className='border flex rounded-md aspect-video cursor-pointer border-dashed text-sm flex-col gap-2 items-center justify-center text-muted-foreground hover:bg-primary/5'
            >
              <FileVideo className='w-4 h-4' />
              Selecione um vídeo
            </label>
            
            <input type="file" id='video' accept='video/mp4' className='sr-only' />

            <Separator />

            <div className='space-y-2'>
              <Label htmlFor='transcription_prompt'>Prompt de transcrição</Label>
              <Textarea 
                id='transcription_prompt'
                className='h-20 leading-relaxed resize-none'
                placeholder='Inclua palavras chaves mencionadas no vídeo separadas por virgula (,)'
              />
            </div>

            <Button type='submit' className='w-full'>
              Carregar vídeo
              <Upload className='w-4 h-4 ml-2' />
            </Button>
          </form>

          <Separator />

          <form className='space-y-6'>
          <div className='space-y-2'>
              <label>Prompt</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder='Selecione  um prompt...'></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='title'>Titulo do Youtube</SelectItem>
                  <SelectItem value='description'>Descrição do Youtube</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className='space-y-2'>
              <label>Modelo</label>
              <Select defaultValue='gpt3.5' disabled>
                <SelectTrigger>
                  <SelectValue></SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value='gpt3.5'>GPT 3.5-turbo 16k</SelectItem>
                </SelectContent>
              </Select>

              <span className='block text-xs text-muted-foreground italic'>
                Você poderá costomizar essa função no futuro
              </span>
            </div>

            <Separator/>

            <div className='space-y-4'>
              <label>Temperatura</label>

              <Slider 
                min={0}
                max={1}
                step={0.1}
              />

              <span className='block text-xs text-muted-foreground italic leading-relaxed'>
                Valores mais altos tendem a deixar o resultado mais criativo e com possíveis erros.
              </span>

              <Separator />

              <Button type='submit' className='w-full'>
                Executar
                <Wand2 className='w-4 h-4 ml-2 ' />
              </Button>
            </div>
          </form>
        </aside>
      </main>
    </div>

    
  )
}


