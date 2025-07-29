const { Client, GatewayIntentBits, Partials } = require("discord.js");

const TOKEN = process.env.TOKEN;
if (!TOKEN) {
  console.error("❌ TOKEN bot tidak ditemukan di Environment Variables Railway!");
  process.exit(1);
}

const PREFIX = "!";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

const games = {};

client.once("ready", () => {
  console.log(`✅ Bot online sebagai ${client.user.tag}`);
  client.user.setActivity("Main Tebak Angka 🎯");
});

client.on("messageCreate", (message) => {
  if (message.author.bot) return;

  if (message.content.startsWith(PREFIX)) {
    const args = message.content.slice(PREFIX.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === "tebakangka") {
      startTebakAngka(message);
    }
  }
});

function startTebakAngka(message) {
  const userId = message.author.id;

  if (games[userId]) {
    return message.reply("Kamu sudah dalam permainan! Kirim angka untuk menebak.");
  }

  const target = Math.floor(Math.random() * 100) + 1;
  games[userId] = { number: target, attempts: 5 };

  message.reply("🎯 Aku sudah memilih angka 1-100. Tebak angkanya! Kamu punya 5 percobaan.");

  const filter = m => m.author.id === userId;
  const collector = message.channel.createMessageCollector({ filter, time: 30000 });

  collector.on("collect", m => {
    const guess = parseInt(m.content);
    if (isNaN(guess)) {
      return m.reply("Masukkan angka yang valid!");
    }

    games[userId].attempts--;

    if (guess === games[userId].number) {
      m.reply(`✅ Benar! Angkanya adalah **${guess}** 🎉`);
      delete games[userId];
      return collector.stop();
    } else if (games[userId].attempts <= 0) {
      m.reply(`❌ Kesempatan habis! Angka yang benar adalah **${games[userId].number}**.`);
      delete games[userId];
      return collector.stop();
    } else if (guess > games[userId].number) {
      m.reply(`🔻 Terlalu besar! Sisa percobaan: ${games[userId].attempts}`);
    } else {
      m.reply(`🔺 Terlalu kecil! Sisa percobaan: ${games[userId].attempts}`);
    }
  });

  collector.on("end", () => {
    if (games[userId]) {
      message.reply(`⏳ Waktu habis! Angka yang benar adalah **${games[userId].number}**.`);
      delete games[userId];
    }
  });
}

client.login(TOKEN);
