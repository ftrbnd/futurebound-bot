const {initializeApp} = require('firebase/app');
const { getFirestore, getDocs, collection, setDoc, doc } = require('firebase/firestore');
const { EmbedBuilder } = require('discord.js');
const ytdl = require('ytdl-core');

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app);

module.exports = {
    async execute(client) {
        setInterval(async () => {
            const server = client.guilds.cache.get(process.env.GUILD_ID);
            const heardleChannel = server.channels.cache.get(process.env.ANNOUNCEMENTS_CHANNEL_ID);
            const today = new Date();

            if (today.getHours() == 0 && today.getMinutes() === 0) { // midnight: set new daily song
                console.log("It is now midnight! Selecting new daily song...");
                
                const querySnapshot = await getDocs(collection(firestore, "songs"));
                
                const songs = [];
                querySnapshot.forEach((doc) => {
                    songs.push({
                        name: doc.id,
                        ...doc.data()
                    })
                });
                const randomSong = songs[Math.floor(Math.random() * songs.length)];
                console.log('New daily song: ', randomSong);

                // determine the random start time
                const songLength = (await ytdl.getBasicInfo(randomSong.link)).videoDetails.lengthSeconds;
                const randomStartTime = Math.floor(Math.random() * songLength ) - 7;
                console.log(`Determined start time: ${randomStartTime} seconds`);

                // write to database with new daily song
                await setDoc(doc(firestore, 'daily_song', 'song'), {
                    name: randomSong.name,
                    link: randomSong.link,
                    album: randomSong.album,
                    cover: randomSong.cover,
                    start: randomStartTime
                });

                // const heardleEmbed = new EmbedBuilder()
                //     .setTitle('EDEN Heardle - New daily song!')
                //     .setDescription('https://eden-heardle.web.app')
                //     .setThumbnail('https://i.imgur.com/rQmm1FM.png')
                //     .setTimestamp()
                //     .setFooter({
                //     text: 'Share your results in the #eden thread!', 
                //     iconURL: server.iconURL({ dynamic : true})
                // });

                // heardleChannel.send({ embeds: [heardleEmbed]});
            }
        }, 60000);  // run this every minute
    }
}