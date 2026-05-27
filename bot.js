const { Telegraf } = require('telegraf');
const bot = new Telegraf(process.env.BOT_TOKEN);

bot.start(ctx => ctx.replyWithHTML('🎮 <b>ARENA CHKOBA LEGENDS</b>\n\n/jouer - Lancer une partie\n/regles - Règles tunisiennes'));
bot.command('regles', ctx => ctx.reply('RÈGLES :\n• Chkoba = 1pt\n• Hayya 7♦ = 1pt\n• Baji = plus de cartes = 1pt\n• Dineri = plus de carreaux\n• Bermila = 7 puis 6...'));
bot.command('jouer', ctx => ctx.reply('Distribution...'));

bot.launch();
console.log('Bot lancé');
