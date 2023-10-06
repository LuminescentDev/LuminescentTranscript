import { component$, useStore } from '@builder.io/qwik';
import type { DocumentHead, RequestHandler } from '@builder.io/qwik-city';
import { routeLoader$, Link } from "@builder.io/qwik-city";

import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

import Logo from '~/components/Logo';
import Icon from '~/components/Icon';

import { PrismaClient } from '@prisma/client/edge';
import { withAccelerate } from '@prisma/extension-accelerate'

export const Markdown = component$(({ mdContent, extraClass }: any) => (
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
export const onGet: RequestHandler = async ({ json, query, params, env }) => {
  if (query.get('raw')) {
    const prisma = new PrismaClient({
      datasources: {
        db: {
          url: env.get('DATABASE_URL'),
        },
      },
    }).$extends(withAccelerate());
    const data = await prisma.transcripts.findUnique({
      where: {
        id: params.Id,
      },
      cacheStrategy: {
        ttl: 60
      },
    });
    console.log(`Transcript ${params.Id} was accessed raw ;)`);
    throw json(200, data);
  }
};

export const useTranscript = routeLoader$(async ({ params, env }) => {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: env.get('DATABASE_URL'),
      },
    },
  }).$extends(withAccelerate());
  const data = await prisma.transcripts.findUnique({
    where: {
      id: params.Id,
    },
    cacheStrategy: {
      ttl: 60
    },
  });
  if (!data) throw new Error('Transcript not found');

  console.log(`Transcript ${params.Id} was accessed`);
  return { 
    guild: JSON.parse(data.guild),
    channel: JSON.parse(data.channel),
    logs: JSON.parse(data.messages),
    time: data.createdAt,
  };
});

export default component$(() => {
  const logData = useTranscript();
  const { guild, channel, logs, time } = logData.value;

  const store: {
    notifications: {
      title: string;
      content: string;
    }[];
  } = useStore({
    notifications: [],
  });

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
                <span class="ml-3 font-bold text-gray-100">
                  {channel.name}
                </span>
              </div>
              
              <div class="flex items-center justify-center">
                  <div class="hidden sm:flex space-x-4 font-bold">
                    {guild.icon && <img width={24} height={24} class="h-6 w-6 mr-3 rounded-full" src={guild.icon} alt="Server Icon" />}
                    {guild.name}
                  </div>
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
            <div class="space-y-1 my-3 py-4 px-6 justify-center items-center bg-discord-900 rounded-lg">
              {guild.name &&
                <div class="flex sm:hidden space-x-4 font-bold">
                  {guild.icon && <img width={24} height={24} class="h-6 w-6 mr-3 rounded-full" src={guild.icon} alt="Server Icon" />}
                  {guild.name}
                </div>
              }
              <p class="font-semibold">
                Created on {new Date(time).toLocaleString()}
              </p>
            </div>
          </div>
        </nav>
      </header>
      <section class="mx-auto max-w-7xl px-6 py-2" style={{ minHeight: 'calc(100dvh - 64px)' }}>
        {logs.map((log: any, i: number) => {
          const sameuser = !(!logs[i - 1] || logs[i - 1]?.author.avatar != log.author.avatar);
          return <>
            <span id={log.id} class="pointer-events-none block h-12 -mt-12" />
            <div class={`flex ${sameuser ? 'p-1' : 'mt-2 ml-2 pt-2 pl-2'} group hover:bg-discord-700`}>
              {!sameuser && <img width={40} height={40} class="w-10 h-10 mr-5 rounded-full" src={log.author.avatar} alt={log.author.name} />}
              {sameuser && <p class="w-2 mr-16 text-gray-300 text-sm pl-2 text-center"><span class="hidden group-hover:flex">{typeof log.time == 'number' ? new Date(log.time).toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: false }) : log.time.split(' at ')[1].split(' ')[0]}</span></p>}
              <div>
                {!sameuser && <h3 class="text-lg font-bold" style={{ color: log.author.color }}>{log.author.name} <span class="text-gray-300 font-normal text-sm pl-1">{typeof log.time == 'number' ? new Date(log.time).toLocaleString() : log.time}</span></h3>}
                {(log.content || log.attachments) && <Markdown mdContent={`${log.content}${log.attachments ? `\n${log.attachments.map((attachment: any) => `![Attachment](${attachment.url})`).join(' ')}` : ''}`} extraClass="text-gray-100" /> }
                {log.embeds && log.embeds.map((embed: any) => {
                  return <>
                    <div class="bg-discord-800 rounded p-4 max-w-lg" style={{ borderLeftColor: `#${embed.color}`, borderLeftWidth: '4px' }}>
                      <div class="flex space-x-8">
                        <div>
                          {embed.author &&
                            <div class="flex items-center mb-3">
                              {embed.author?.iconURL && <img src={embed.author?.iconURL} width={32} height={32} class="w-8 h-8 rounded-full mr-2" alt="Avatar"/>}
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
                            <img width={50} height={50} src={embed.thumb} class="rounded float-right" alt="Thumbnail"/>
                          </div>
                        }
                      </div>
                      {embed.image && <img width={512} height={512} src={embed.image} class="w-full rounded mt-3" alt="Attachment"/>}
                      {embed.footer && 
                        <div class="flex items-center mt-3">
                          <p class="text-gray-500 text-xs">{embed.footer}</p>
                        </div>
                      }
                      
                    </div>
                  </>
                })}
                { log.reactions &&
                  <div class="flex flex-wrap gap-1 mt-2">
                    { log.reactions.map((reaction: { name: string, count: number }, i: number) => (
                      <div key={i} class="flex items-center gap-2 bg-discord-800 px-2 py-1 rounded-lg">
                        <Markdown mdContent={reaction.name} />
                        <p>{reaction.count}</p>
                      </div>
                    )) }
                  </div> 
                }
              </div>
              <div class="hidden group-hover:flex flex-1 h-full justify-end">
                <div class="flex bg-discord-800 shadow-md rounded-lg">
                  <button class="hover:bg-discord-400 p-2 rounded-lg cursor-pointer" onClick$={() => {
                    navigator.clipboard.writeText(window.location.href + '#' + log.id);
                    const element = document.getElementById(log.id);
                    if (element) element.scrollIntoView({ behavior: 'smooth' });
                    store.notifications.push({
                      title: 'Copied Successfully!',
                      content: 'The link to this message has been copied to your clipboard.',
                    });
                    setTimeout(() => {
                      store.notifications.shift();
                    }, 5000);
                  }}>
                    <svg class="icon-3XHs8t" aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24"><g fill="none" fill-rule="evenodd"><path fill="currentColor" d="M10.59 13.41c.41.39.41 1.03 0 1.42-.39.39-1.03.39-1.42 0a5.003 5.003 0 0 1 0-7.07l3.54-3.54a5.003 5.003 0 0 1 7.07 0 5.003 5.003 0 0 1 0 7.07l-1.49 1.49c.01-.82-.12-1.64-.4-2.42l.47-.48a2.982 2.982 0 0 0 0-4.24 2.982 2.982 0 0 0-4.24 0l-3.53 3.53a2.982 2.982 0 0 0 0 4.24zm2.82-4.24c.39-.39 1.03-.39 1.42 0a5.003 5.003 0 0 1 0 7.07l-3.54 3.54a5.003 5.003 0 0 1-7.07 0 5.003 5.003 0 0 1 0-7.07l1.49-1.49c-.01.82.12 1.64.4 2.43l-.47.47a2.982 2.982 0 0 0 0 4.24 2.982 2.982 0 0 0 4.24 0l3.53-3.53a2.982 2.982 0 0 0 0-4.24.973.973 0 0 1 0-1.42z"></path><rect width="24" height="24"></rect></g></svg>
                  </button>
                  <button class="hover:bg-discord-400 p-2 rounded-lg cursor-pointer" onClick$={() => {
                    navigator.clipboard.writeText(log.id);
                    store.notifications.push({
                      title: 'Copied Successfully!',
                      content: `The message Id ${log.id} has been copied to your clipboard.`,
                    });
                    setTimeout(() => {
                      store.notifications.shift();
                    }, 5000);
                  }}>
                    <svg class="icon-3XHs8t" aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M3.37868 2.87868C3.94129 2.31607 4.70435 2 5.5 2H19.5C20.2956 2 21.0587 2.31607 21.6213 2.87868C22.1839 3.44129 22.5 4.20435 22.5 5V19C22.5 19.7956 22.1839 20.5587 21.6213 21.1213C21.0587 21.6839 20.2956 22 19.5 22H5.5C4.70435 22 3.94129 21.6839 3.37868 21.1213C2.81607 20.5587 2.5 19.7956 2.5 19V5C2.5 4.20435 2.81607 3.44129 3.37868 2.87868ZM7.65332 16.3125H9.47832V7.6875H7.65332V16.3125ZM11.23 7.6875V16.3125H14.2925C15.6008 16.3125 16.6091 15.9417 17.3175 15.2C18.0341 14.4583 18.3925 13.3917 18.3925 12C18.3925 10.6083 18.0341 9.54167 17.3175 8.8C16.6091 8.05833 15.6008 7.6875 14.2925 7.6875H11.23ZM15.955 14.0625C15.5466 14.4625 14.9925 14.6625 14.2925 14.6625H13.055V9.3375H14.2925C14.9925 9.3375 15.5466 9.5375 15.955 9.9375C16.3633 10.3375 16.5675 11.025 16.5675 12C16.5675 12.975 16.3633 13.6625 15.955 14.0625Z"></path></svg>
                  </button>
                  <a href={`https://discord.com/channels/${guild.id}/${channel.id}/${log.id}`} class="hover:bg-discord-400 p-2 rounded-lg cursor-pointer">
                    <svg class="launchIcon-2KvOPN" aria-hidden="true" role="img" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M10 5V3H5.375C4.06519 3 3 4.06519 3 5.375V18.625C3 19.936 4.06519 21 5.375 21H18.625C19.936 21 21 19.936 21 18.625V14H19V19H5V5H10Z"></path><path fill="currentColor" d="M21 2.99902H14V4.99902H17.586L9.29297 13.292L10.707 14.706L19 6.41302V9.99902H21V2.99902Z"></path></svg>
                  </a>
                </div>
              </div>
            </div>
          </>
        })}
        { !!store.notifications.length &&
          <div class="fixed block bottom-4 right-4 px-4 py-3 rounded-lg bg-green-500/50 backdrop-blur-xl">
            {
              store.notifications.map((notification, i) => (
                <div key={i}>
                  <p class="font-bold text-white text-2xl">{notification.title}</p>
                  <p class="font-normal text-gray-100 text-lg">{notification.content}</p>
                </div>
              ))
            }
          </div>
        }
      </section>
    </>
  );
});

export const head: DocumentHead = ({ resolveValue }) => {
  const { channel, logs, time } = resolveValue(useTranscript);
  return {
      title: `Transcript of # ${channel.name}`,
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