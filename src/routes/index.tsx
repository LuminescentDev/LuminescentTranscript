import crypto from 'crypto';
function suffix() { return crypto.randomBytes(5).toString('hex'); }

import { PrismaClient } from '@prisma/client/edge';

export const onPost: any = async ({ text, request }: any) => {
    const prismaclient = new PrismaClient();
    const url = suffix();
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
        text(500, e);
        return;
    }
    
    text(200, `https://transcript.luminescent.dev/${url}`);
};

export const onGet: any = async ({ redirect }: any) => {
    throw redirect(302, 'https://luminescent.dev')
};