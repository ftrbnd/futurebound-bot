// Interactions: slash commands, buttons, select menus
const { EmbedBuilder, InteractionType } = require('discord.js');
const SurvivorRound = require('../schemas/SurvivorRoundSchema');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
        if (interaction.isStringSelectMenu() && interaction.channel.name == process.env.SURVIVOR_CHANNEL_NAME) {
            await handleSurvivorVote(interaction); // handle menu interactions from /survivor
        }

        if (!interaction.type === InteractionType.ApplicationCommand) return;

        const command = interaction.client.commands.get(interaction.commandName);
        if (!command) return;

        try {
            await command.execute(interaction);
        } catch (error) {
            console.error(error);
            const errorEmbed = new EmbedBuilder()
                .setDescription('There was an error while executing this command!')
                .setColor(process.env.ERROR_COLOR);
            await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
        }
	},
}

async function handleSurvivorVote(interaction) {
    let selectedSong = interaction.values[0];
    if (selectedSong == "$treams")
        selectedSong = " $treams"; // Mongoose maps do not support keys that start with "$"

    const albumName = interaction.message.embeds[0].data.title.split('**')[1];

    let userChangedSong = false, originalVote = '';

    await SurvivorRound.findOne({ album: albumName }, (err, data) => {
        if (err) return console.log(err);

        if (!data) { // this shouldn't be possible because users will only interact with the menu once a survivor round exists
            console.log('No survivor round data available.');
            const errEmbed = new EmbedBuilder()
                .setDescription('An error occured.')
                .setColor(process.env.ERROR_COLOR);
            return interaction.reply({ embeds: [errEmbed], ephemeral: true });
            
        } else {
            if (interaction.message.id == data.lastMessageId) { // users have to vote in the most recent poll in the survivor channel
                // collect all user ids who have voted
                let allVotes = [];
                for (const song of data.votes.keys()) {
                    allVotes.push(...data.votes.get(song));
                }

                // get all the votes for the song that the user selected
                const selectedSongVotes = data.votes.get(selectedSong);

                if (selectedSongVotes.includes(interaction.user.id)) { // happens if app client restarts or switch devices
                    console.log(`Invalid vote: ${interaction.user.tag} voted for the same song`);
                    const errorEmbed = new EmbedBuilder()
                        .setDescription(`You already selected **${selectedSong}**!`)
                        .setColor(process.env.ERROR_COLOR);
                    return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
                    
                } else if (allVotes.includes(interaction.user.id)) { // if the user has already voted for a song
                    // remove their original vote
                    data.votes.forEach((userIds, song) => {
                        if (userIds.includes(interaction.user.id)) {
                            originalVote = song;
                            userIds.splice(userIds.indexOf(interaction.user.id), 1); // remove the user's id from the original song's vote list
                            userChangedSong = true;
                        }
                    });
                }

                selectedSongVotes.push(interaction.user.id); // add their vote once it's confirmed that their original vote has been removed
                data.votes.set(selectedSong, selectedSongVotes); // add the new votes list to the database
                data.save();
            } else {
                console.log(`Invalid vote: ${interaction.user.tag} voted in an old round`);
                const errorEmbed = new EmbedBuilder()
                    .setDescription('Please vote in the most recent poll!')
                    .setColor(process.env.ERROR_COLOR);
                return interaction.reply({ embeds: [errorEmbed], ephemeral: true });
            }

            const userConfirmEmbed = new EmbedBuilder()
                .setColor(process.env.CONFIRM_COLOR);
    
            if (userChangedSong) {
                console.log(`${interaction.user.tag} updated their vote from ${originalVote} to ${selectedSong}`);
                userConfirmEmbed.setDescription(`You updated your vote from **${originalVote}** to **${selectedSong}**`);
            } else {
                console.log(`${interaction.user.tag} voted for ${selectedSong}`);
                userConfirmEmbed.setDescription(`You selected **${selectedSong}**`);
            }
                
            return interaction.reply({ embeds: [userConfirmEmbed], ephemeral: true });
        }
    }).clone();
}