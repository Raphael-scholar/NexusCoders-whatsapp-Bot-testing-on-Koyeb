const { downloadMediaMessage } = require('@whiskeysockets/baileys');
const { writeFile } = require('fs-extra');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path');
const config = require('../../config');

module.exports = {
    name: 'sticker',
    aliases: ['s', 'stiker'],
    category: 'media',
    desc: 'Create sticker from image/video',
    cooldown: 10,
    
    async execute(messageInfo, args) {
        const { sock, msg, sender } = messageInfo;
        const quoted = msg.message;
        
        if (!quoted.imageMessage && !quoted.videoMessage) {
            await sock.sendMessage(sender, { text: 'Please reply to an image or video!' });
            return;
        }
        
        try {
            const media = await downloadMediaMessage(msg, 'buffer');
            const tmpFile = path.join('temp', `${Date.now()}.webp`);
            
            if (quoted.videoMessage) {
                await processVideo(media, tmpFile);
            } else {
                await processImage(media, tmpFile);
            }
            
            await sock.sendMessage(sender, {
                sticker: { url: tmpFile },
                mimetype: 'image/webp'
            });
            
            await unlink(tmpFile);
        } catch (error) {
            await sock.sendMessage(sender, { text: 'Failed to create sticker!' });
        }
    }
};

function processVideo(buffer, output) {
    return new Promise((resolve, reject) => {
        ffmpeg(buffer)
            .inputFormat('mp4')
            .on('error', reject)
            .on('end', () => resolve(output))
            .addOutputOptions([
                '-vcodec', 'libwebp',
                '-vf', 'scale=512:512:force_original_aspect_ratio=decrease,fps=15',
                '-loop', '0',
                '-ss', '00:00:00.0',
                '-t', '00:00:10.0',
                '-preset', 'default',
                '-an',
                '-vsync', '0'
            ])
            .toFormat('webp')
            .save(output);
    });
}

async function processImage(buffer, output) {
    const sharp = require('sharp');
    await sharp(buffer)
        .resize(512, 512)
        .webp({ quality: 95 })
        .toFile(output);
}
