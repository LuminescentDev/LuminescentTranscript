import { Resource, component$ } from '@builder.io/qwik';
import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import { routeLoader$, Link } from "@builder.io/qwik-city";

import fs from 'fs';

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

import Logo from '~/components/Logo';
import Icon from '~/components/Icon';

export const Markdown = component$<any>(({ mdContent, extraClass }) => (
  <>
    {unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(rehypeStringify)
      .process(mdContent)
      .then((file: any) => {
        let str = String(file);
        str.match(/&#x3C;(a?):(\w+):(\d+)>/g)?.forEach((match: string) => {
          const emoji = match.match(/&#x3C;(a?):\w+:(\d+)>/)!;
          const animated = emoji[1] == 'a';
          const id = emoji[2];
          str = str.replace(match, `<img src="https://cdn.discordapp.com/emojis/${id}.${animated ? 'gif' : 'png'}" class="inline h-5" />`);
        });
        return <div dangerouslySetInnerHTML={str} class={`whitespace-pre-line [&>p>a]:text-blue-400 [&>p>a]:hover:underline ${extraClass}`} />
      }
    )}
  </>
));

// return raw json if raw query param is set
export const onGet: RequestHandler = ({ json, query, params }) => {
  if (query.get('raw')) {
    const logs = JSON.parse(fs.readFileSync(`./transcript/${params.Id}.json`).toString());
    console.log(`Transcript ${params.Id} was accessed raw ;)`);
    throw json(200, logs);
  }
};

export const useTranscript = routeLoader$(({ params }) => {
  const logs = JSON.parse(fs.readFileSync(`./transcript/${params.Id}.json`).toString());
  console.log(`Transcript ${params.Id} was accessed`);
  return logs;
});

export default component$(() => {
  const logData = useTranscript();
  return (
    <>
      <header>
        <nav class="z-10 fixed top-0 w-screen bg-discord-600/50 backdrop-blur-2xl border-b border-b-discord-900">
          <div class="mx-auto max-w-7xl px-6 lg:px-8">
            <div class="relative flex h-12 items-center">

              <div class="flex flex-1 items-center justify-start">
                <button type="button" id="mobile-menu-button" onClick$={() => document.getElementById('mobile-menu')?.classList.toggle("hidden")} class="transition duration-200 inline-flex items-center justify-center rounded-full p-2 text-gray-400 hover:text-white focus:outline-none mr-2" aria-controls="mobile-menu" aria-expanded="false">
                  <span class="sr-only">Open main menu</span>
                  <svg class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                  </svg>
                  <svg class="hidden h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <svg width="24" height="24" viewBox="0 0 24 24">
                  <path fill="rgb(255, 255, 255, 0.3)" d="M5.88657 21C5.57547 21 5.3399 20.7189 5.39427 20.4126L6.00001 17H2.59511C2.28449 17 2.04905 16.7198 2.10259 16.4138L2.27759 15.4138C2.31946 15.1746 2.52722 15 2.77011 15H6.35001L7.41001 9H4.00511C3.69449 9 3.45905 8.71977 3.51259 8.41381L3.68759 7.41381C3.72946 7.17456 3.93722 7 4.18011 7H7.76001L8.39677 3.41262C8.43914 3.17391 8.64664 3 8.88907 3H9.87344C10.1845 3 10.4201 3.28107 10.3657 3.58738L9.76001 7H15.76L16.3968 3.41262C16.4391 3.17391 16.6466 3 16.8891 3H17.8734C18.1845 3 18.4201 3.28107 18.3657 3.58738L17.76 7H21.1649C21.4755 7 21.711 7.28023 21.6574 7.58619L21.4824 8.58619C21.4406 8.82544 21.2328 9 20.9899 9H17.41L16.35 15H19.7549C20.0655 15 20.301 15.2802 20.2474 15.5862L20.0724 16.5862C20.0306 16.8254 19.8228 17 19.5799 17H16L15.3632 20.5874C15.3209 20.8261 15.1134 21 14.8709 21H13.8866C13.5755 21 13.3399 20.7189 13.3943 20.4126L14 17H8.00001L7.36325 20.5874C7.32088 20.8261 7.11337 21 6.87094 21H5.88657ZM9.41045 9L8.35045 15H14.3504L15.4104 9H9.41045Z"></path>
                </svg>
                <Resource
                  value={logData}
                  onPending={() => <span class="flex-1 ml-3">Loading...</span>}
                  onRejected={() => <span class="flex-1 ml-3">Error</span>}
                  onResolved={({ channel }) => {
                    return (
                      <span class="ml-3 font-bold text-gray-100">
                        {channel ?? 'Unknown Channel'}
                      </span>
                    )
                  }}
                />
              </div>
              
              <div class="flex items-center justify-center">
                <Resource
                  value={logData}
                  onPending={() => <span class="flex-1 ml-3">Loading...</span>}
                  onRejected={() => <span class="flex-1 ml-3">Error</span>}
                  onResolved={({ guild }) => {
                    return (
                      <div class="hidden sm:flex space-x-4 font-bold">
                        {guild?.icon && <img class="h-6 w-6 mr-3 rounded-full" src={guild?.icon} alt="Server Icon" />}
                        {guild?.name}
                      </div>
                    )
                  }}
                />
              </div>

              <div class="flex flex-1 items-center justify-end">
                <div class="flex space-x-4">
                  <Link href="https://luminescent.dev" style="filter: drop-shadow(0 0 0 #DD6CFF);" class="h-8 w-8 sm:w-32 transition text-gray-300 hover:bg-black/20 sm:px-3 py-2 rounded-md flex items-center whitespace-nowrap">
                    <div class="hidden sm:flex" style="filter: drop-shadow(0 0 1rem #CB6CE6);">
                      <Logo/>
                    </div>
                    <div class="flex sm:hidden" style="filter: drop-shadow(0 0 1rem #CB6CE6);">
                      <Icon/>
                    </div>
                  </Link>
                </div>
              </div>

            </div>
          </div>

          <div class="hidden px-6 py-2 mx-auto max-w-2xl" id="mobile-menu">
            <Resource
              value={logData}
              onPending={() => <span class="flex-1 ml-3">Loading...</span>}
              onRejected={() => <span class="flex-1 ml-3">Error</span>}
              onResolved={({ guild }) => {
                return (
                  <>
                    {guild?.name &&
                      <div class="sm:hidden space-y-1 my-3 py-5 px-6 justify-center items-center bg-discord-900 rounded-2xl">
                        <div class="flex space-x-4 font-bold">
                          {guild?.icon && <img class="h-6 w-6 mr-3 rounded-full" src={guild?.icon} alt="Server Icon" />}
                          {guild?.name}
                        </div>
                      </div>
                    }
                  </>
                )
              }}
            />
            <Resource
              value={logData}
              onPending={() => <span class="flex-1 ml-3">Loading...</span>}
              onRejected={() => <span class="flex-1 ml-3">Error</span>}
              onResolved={({ time }) => {
                return (
                  <p class="py-4 font-bold">
                    Created on {new Date(time).toLocaleString()}
                  </p>
                )
              }}
            />
            <p class="text-gray-300">
              Users with access to this transcript
            </p>
            <div class="space-y-1 my-3 justify-center items-center bg-discord-900 rounded-2xl">

              <Resource
                value={logData}
                onPending={() => <div class="text-gray-300 bg-discord-800 px-3 py-2 rounded-xl text-sm font-medium flex items-center whitespace-nowrap">Loading...</div>}
                onRejected={() => <div class="text-gray-300 bg-discord-800 px-3 py-2 rounded-xl text-sm font-medium flex items-center whitespace-nowrap">An error occurred while trying to get this data.</div>}
                onResolved={({ users }) => {
                  return (
                    <>
                      {users &&
                        <div class="text-gray-300 bg-discord-800 px-4 py-3 rounded-lg text-sm font-medium flex items-center whitespace-nowrap">
                          <img class="h-6 w-6 mr-3 rounded-full" src={`https://cactie.luminescent.dev/assets/images/Cactie.webp`} alt="Cactie Bot" />
                          Cactie
                        </div>
                      }
                      {!users &&
                        <div class="text-gray-300 bg-discord-800 px-4 py-3 rounded-lg text-sm font-medium flex items-center whitespace-nowrap">
                          Anyone with the link
                        </div>
                      }
                    </>
                  )
                }}
              />
            </div>
          </div>
        </nav>
      </header>
      <section class="mx-auto max-w-7xl px-6 py-2" style={{ minHeight: 'calc(100dvh - 64px)' }}>
        <Resource
          value={logData}
          onPending={() => <div class="text-gray-300 bg-discord-800 px-3 py-2 rounded-xl text-sm font-medium flex items-center whitespace-nowrap">Loading...</div>}
          onRejected={() => <div class="text-gray-300 bg-discord-800 px-3 py-2 rounded-xl text-sm font-medium flex items-center whitespace-nowrap">An error occurred while trying to get this data.</div>}
          onResolved={({ logs }) => {
            return (
              <>
                {logs.map((log: any, i: number) => {
                  const sameuser = !(!logs[i - 1] || logs[i - 1]?.author.avatar != log.author.avatar);
                  return <>
                    <div class={`flex ${sameuser ? 'p-1 group' : 'mt-2 ml-2 pt-2 pl-2'} hover:bg-discord-700`}>
                      {!sameuser && <img class="w-10 h-10 mr-5 rounded-full" src={log.author.avatar} alt={log.author.name} />}
                      {sameuser && <p class="w-2 mr-16 text-gray-300 text-sm pl-2 text-center"><span class="hidden group-hover:flex">{typeof log.time == 'number' ? new Date(log.time).toLocaleString() : log.time.split(' at ')[1].split(' ')[0]}</span></p>}
                      <div>
                        {!sameuser && <h3 class="text-lg font-bold" style={{ color: `#${log.author.color}` }}>{log.author.name} <span class="text-gray-300 font-normal text-sm pl-1">{typeof log.time == 'number' ? new Date(log.time).toLocaleString() : log.time}</span></h3>}
                        {log.content && <Markdown mdContent={log.content} extraClass="text-gray-100" /> }
                        {log.embeds && log.embeds.map((embed: any) => {
                          return <>
                            <div class="bg-discord-800 rounded p-4 max-w-lg" style={{ borderLeftColor: `#${embed.color}`, borderLeftWidth: '4px' }}>
                              <div class="flex space-x-8">
                                <div>
                                  {embed.author &&
                                    <div class="flex items-center mb-3">
                                      {embed.author?.iconURL && <img src={embed.author?.iconURL} class="w-8 h-8 rounded-full mr-2" alt="Avatar"/>}
                                      {embed.author?.name && <p class="text-gray-300 text-sm font-bold">{embed.author?.name}</p>}
                                    </div>
                                  }
                                  {embed.title && <h3 class="text-white font-bold">{embed.title}</h3>}
                                  {embed.description && <Markdown mdContent={embed.description} extraClass="text-gray-100" /> }
                                  {embed.fields && embed.fields[0] &&
                                    <div class="mt-3">
                                      {embed.fields.map((field: any) => {
                                        return (
                                          <>
                                            <Markdown mdContent={field.name} extraClass="text-gray-50 font-bold" />
                                            <Markdown mdContent={field.value} extraClass="text-gray-100" />
                                          </>
                                        )
                                      })}
                                    </div>
                                  }
                                </div>
                                {embed.thumb && 
                                  <div>
                                    <img src={embed.thumb} class="rounded float-right" alt="Thumbnail"/>
                                  </div>
                                }
                              </div>
                              {embed.image && <img src={embed.image} class="w-full rounded mt-3" alt="Attachment"/>}
                              {embed.footer && 
                                <div class="flex items-center mt-3">
                                  <p class="text-gray-500 text-xs">{embed.footer}</p>
                                </div>
                              }
                              
                            </div>
                          </>
                        })}
                      </div>
                    </div>
                  </>
                })}
              </>
            )
          }}
        />
      </section>
    </>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const { channel, logs, time } = resolveValue(useTranscript);
  return {
      title: `Transcript of # ${channel}`,
      meta: [
          {
              name: 'description',
              content: `${logs.length} Messages - Created on ${new Date(time).toLocaleString('default', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}`
          },
          {
              property: 'og:description',
              content: `${logs.length} Messages - Created on ${new Date(time).toLocaleString('default', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true })}`
          }
      ]
  }
}