import { RequestHandler } from '@builder.io/qwik-city';
import { PrismaClient } from '@prisma/client/edge';
const generateRandomString = () => {
    const array = new Uint8Array(10);
    crypto.getRandomValues(array);
    return Array.from(array)
        .map((byte) => byte.toString(16).padStart(2, '0'))
        .join('');
};

export const onPost: RequestHandler = async ({ text, request, env }) => {
    const prismaclient = new PrismaClient({
        datasources: {
            db: {
                url: env.get('DATABASE_URL'),
            },
        },
    });
    const url = generateRandomString();
    const data = await request.json();

    try {
        await prismaclient.transcripts.create({
            data: {
                id: url,
                guild: JSON.stringify(data.guild),
                channel: JSON.stringify(data.channel),
                messages: JSON.stringify(data.logs),
            },
        });
    }
    catch (e) {
        console.log(e);
        text(500, `${e}`);
        return;
    }
    
    text(200, `https://transcript.luminescent.dev/${url}`);
};

export const onGet: RequestHandler = async ({ redirect }: any) => {
    throw redirect(302, 'https://luminescent.dev')
};