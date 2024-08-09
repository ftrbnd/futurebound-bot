import { EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, ChannelType, GuildScheduledEventPrivacyLevel, GuildScheduledEventEntityType } from 'discord.js';
import { replyToInteraction } from '../utils/error-handler.js';
import { env } from '../utils/env.js';
import { Colors } from '../utils/constants.js';

export const data = new SlashCommandBuilder()
  .setName('listeningparty')
  .setDescription('Open a listening party chat and stage channel')
  .addSubcommand((subcommand) =>
    subcommand
      .setName('create')
      .setDescription('Create the listening party channels')
      .addStringOption((option) => option.setName('name').setDescription('The name of the listening party').setRequired(true))
      .addStringOption((option) =>
        option
          .setName('privacy-level')
          .setDescription('Private for testing purposes, Public otherwise')
          .setRequired(true)
          .addChoices({ name: 'Private', value: 'private' }, { name: 'Public', value: 'public' })
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName('announce')
      .setDescription('Create a Discord Scheduled Event and announce it - @everyone will be tagged at the end')
      .addStringOption((option) => option.setName('event-description').setDescription('The description of the event may vary based on album/tour etc').setRequired(true))
  )
  .addSubcommand((subcommand) => subcommand.setName('preview').setDescription('Everyone can view the channels but are unable to chat/join'))
  .addSubcommand((subcommand) => subcommand.setName('open').setDescription('Allow everyone to chat and join'))
  .addSubcommand((subcommand) =>
    subcommand
      .setName('start')
      .setDescription('Get the bot to join the Stage channel and start playing music')
      .addStringOption((option) => option.setName('playlist').setDescription('The playlist to play upon joining, likely the opener').setRequired(true))
      .addStringOption((option) => option.setName('topic').setDescription('The Stage topic').setRequired(true))
  )
  .addSubcommand((subcommand) => subcommand.setName('close').setDescription('Make the channels private'))
  .addSubcommand((subcommand) => subcommand.setName('archive').setDescription('Delete the Stage channel and move the text channel to the Archived category'))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);
export async function execute(interaction) {
  try {
    if (interaction.options.getSubcommand() === 'create') {
      const listeningPartyName = interaction.options.getString('name');

      const categoryChannel = await interaction.guild.channels.create({
        name: 'Listening Party',
        type: ChannelType.GuildCategory,
        position: 2,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.client.user.id, // this bot itself
            allow: [PermissionFlagsBits.ViewChannel]
          }
        ]
      });

      await categoryChannel.children.create({
        name: 'listening party chat',
        type: ChannelType.GuildText,
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.guild.roles.cache.find((role) => role.name === 'Bot').id, // all other bots
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.client.user.id, // this bot itself
            allow: [PermissionFlagsBits.ViewChannel]
          }
        ]
      });

      const stageChannel = await categoryChannel.children.create({
        name: listeningPartyName,
        type: ChannelType.GuildStageVoice
      });

      let privacyLevel = interaction.options.getString('privacy-level');
      if (privacyLevel === 'private') {
        stageChannel.edit({
          permissionOverwrites: [
            {
              id: interaction.guild.roles.everyone.id,
              deny: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
            },
            {
              id: interaction.client.user.id, // this bot itself
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
            }
          ]
        });
      } else {
        // privacyLevel == 'public'
        stageChannel.edit({
          permissionOverwrites: [
            {
              id: interaction.guild.roles.everyone.id,
              allow: [PermissionFlagsBits.ViewChannel],
              deny: [PermissionFlagsBits.Connect]
            },
            {
              id: interaction.client.user.id, // this bot itself
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
            }
          ]
        });
      }

      const confirmEmbed = new EmbedBuilder().setDescription(`**${listeningPartyName}** channels have been created!`).setColor(Colors.CONFIRM);

      await interaction.reply({ embeds: [confirmEmbed] });
    } else if (interaction.options.getSubcommand() === 'preview') {
      const categoryChannel = await interaction.guild.channels.cache.find((channel) => channel.name === 'Listening Party');
      categoryChannel.edit({
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            allow: [PermissionFlagsBits.ViewChannel]
          }
        ]
      });

      const listeningPartyChat = await categoryChannel.children.cache.find((channel) => channel.name === 'listening-party-chat');
      listeningPartyChat.edit({
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            allow: [PermissionFlagsBits.ViewChannel],
            deny: [PermissionFlagsBits.SendMessages]
          },
          {
            id: interaction.guild.roles.cache.find((role) => role.name === 'Bot').id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.client.user.id, // this bot itself
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
          }
        ]
      });

      const stageChannel = await categoryChannel.children.cache.find((channel) => channel.type === ChannelType.GuildStageVoice);
      stageChannel.edit({
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            allow: [PermissionFlagsBits.ViewChannel],
            deny: [PermissionFlagsBits.Connect]
          },
          {
            id: interaction.client.user.id, // this bot itself
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
          }
        ]
      });
      stageChannel.setTopic(`Listening to ${stageChannel.name}!`);

      const confirmEmbed = new EmbedBuilder().setDescription(`**${stageChannel.name}** channels are now public but locked.`).setColor(Colors.CONFIRM);

      await interaction.reply({ embeds: [confirmEmbed] });
    } else if (interaction.options.getSubcommand() === 'announce') {
      const description = interaction.options.getString('event-description');

      // check if the Stage channel has been created yet
      const stageChannel = await interaction.guild.channels.cache.find((channel) => channel.type === ChannelType.GuildStageVoice);
      if (!stageChannel) {
        throw new Error('Please use **/listeningparty create** before using this command');
      }

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const scheduledEvent = await interaction.guild.scheduledEvents.create({
        name: `${stageChannel.name} Listening Party`,
        scheduledStartTime: tomorrow,
        privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
        entityType: GuildScheduledEventEntityType.StageInstance,
        description: description,
        channel: stageChannel
      });

      const confirmEmbed = new EmbedBuilder().setDescription(`The **${stageChannel.name}** Event has been created!`).setColor(Colors.CONFIRM);
      const announcementEmbed = new EmbedBuilder().setDescription(`Now, please enter the message that will be posted in **#announcements** without mentioning @everyone`).setColor(Colors.YELLOW);

      // once created, ask for the announcement text
      await interaction.reply({ embeds: [confirmEmbed, announcementEmbed] });

      // maybe: with the announcement text, add an option for the pic url,
      //      and set the event's banner to that img
      // also append the event url to the final announcement
      const filter = (m) => m.author === interaction.user;
      const collector = interaction.channel.createMessageCollector({ filter, time: 180000 }); // one minute to collect

      collector.on('collect', async (m) => {
        const announcementText = `${m.content} @everyone ${scheduledEvent.url}`;
        const announcementChannel = interaction.guild.channels.cache.get(env.ANNOUNCEMENTS_CHANNEL_ID);

        await announcementChannel.send({ content: announcementText });

        collector.stop();
      });

      collector.on('end', async (collected) => {
        if (collected.size === 0) {
          // if no message was entered
          const couldntFindEmbed = new EmbedBuilder()
            .setDescription(`You did not type within 3 minutes, please use the **/say** command to post the announcement.`)
            .setColor(Colors.ERROR)
            .setFooter({
              text: interaction.guild.name,
              iconURL: interaction.guild.iconURL({ dynamic: true })
            });

          await interaction.followUp({ embeds: [couldntFindEmbed], ephemeral: true });
        } else {
          const announcedEmbed = new EmbedBuilder().setDescription(`The announcement was sent!`).setColor(Colors.CONFIRM);
          const editDateEmbed = new EmbedBuilder().setDescription(`Now manually edit the Event's start time.`).setColor(Colors.YELLOW);

          await interaction.followUp({ embeds: [announcedEmbed, editDateEmbed] });
        }
      });
    } else if (interaction.options.getSubcommand() === 'start') {
      // on joining the stage channel, change the permissions so only admins can use the music commands
      const categoryChannel = await interaction.guild.channels.cache.find((channel) => channel.name === 'Listening Party');
      if (!categoryChannel) {
        const errEmbed = new EmbedBuilder().setDescription(`Listening party channels don't exist!`).setColor(Colors.ERROR);
        return interaction.reply({ embeds: [errEmbed] });
      }

      const stageChannel = await categoryChannel.children.cache.find((channel) => channel.type === ChannelType.GuildStageVoice);
      const voiceChannel = interaction.member.voice.channel;

      if (voiceChannel === stageChannel) {
        // if the user is in the Stage channel
        await interaction.client.DisTube.voices.join(stageChannel); // get the bot to join the Stage

        interaction.guild.members.me.voice.setSuppressed(false); // set bot as Stage speaker

        const playlist = interaction.options.getString('playlist'); // get the playlist
        const topic = interaction.options.getString('topic');

        await interaction.client.DisTube.play(stageChannel, playlist, {
          // play the playlist
          member: interaction.member,
          textChannel: interaction.channel
        });

        if (!stageChannel.stageInstance) {
          // start the Stage if it doesn't exist
          stageChannel.createStageInstance({
            topic: topic,
            sendStartNotification: true
          });
        }

        const joinEmbed = new EmbedBuilder().setDescription(`Joined **${voiceChannel.name}** and queued your playlist!`).setColor(Colors.MUSIC).setFooter({
          text: 'Use /play to add more songs'
        });

        await interaction.reply({ embeds: [joinEmbed] });
      } else {
        throw new Error(`You must join the Stage channel!`);
      }
    } else if (interaction.options.getSubcommand() === 'open') {
      const categoryChannel = await interaction.guild.channels.cache.find((channel) => channel.name === 'Listening Party');
      categoryChannel.edit({
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            allow: [PermissionFlagsBits.ViewChannel]
          }
        ]
      });

      const listeningPartyChat = await categoryChannel.children.cache.find((channel) => channel.name === 'listening-party-chat');
      listeningPartyChat.edit({
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
          },
          {
            id: interaction.guild.roles.cache.find((role) => role.name === 'Bot').id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.client.user.id, // this bot itself
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages]
          }
        ]
      });

      const stageChannel = await categoryChannel.children.cache.find((channel) => channel.type === ChannelType.GuildStageVoice);
      stageChannel.edit({
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
          },
          {
            id: interaction.client.user.id, // this bot itself
            allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect]
          }
        ]
      });
      stageChannel.setTopic(`Listening to ${stageChannel.name}!`);

      const confirmEmbed = new EmbedBuilder().setDescription(`**${stageChannel.name}** channels have been opened to everyone!`).setColor(Colors.CONFIRM);

      await interaction.reply({ embeds: [confirmEmbed] });
    } else if (interaction.options.getSubcommand() === 'close') {
      const categoryChannel = await interaction.guild.channels.cache.find((channel) => channel.name === 'Listening Party');
      categoryChannel.edit({
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.client.user.id, // this bot itself
            allow: [PermissionFlagsBits.ViewChannel]
          }
        ]
      });

      const listeningPartyChat = await categoryChannel.children.cache.find((channel) => channel.name === 'listening-party-chat');
      listeningPartyChat.edit({
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.guild.roles.cache.find((role) => role.name === 'Bot').id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.client.user.id, // this bot itself
            allow: [PermissionFlagsBits.ViewChannel]
          }
        ]
      });

      const stageChannel = await categoryChannel.children.cache.find((channel) => channel.type === ChannelType.GuildStageVoice);
      stageChannel.edit({
        permissionOverwrites: [
          {
            id: interaction.guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
          },
          {
            id: interaction.client.user.id, // this bot itself
            allow: [PermissionFlagsBits.ViewChannel]
          }
        ]
      });

      const confirmEmbed = new EmbedBuilder().setDescription(`**${stageChannel.name}** channels have been closed.`).setColor(Colors.CONFIRM);

      await interaction.reply({ embeds: [confirmEmbed] });
    } else if (interaction.options.getSubcommand() === 'archive') {
      const categoryChannel = await interaction.guild.channels.cache.find((channel) => channel.name === 'Listening Party');
      const listeningPartyChat = await categoryChannel.children.cache.find((channel) => channel.name === 'listening-party-chat');
      const stageChannel = await categoryChannel.children.cache.find((channel) => channel.type === ChannelType.GuildStageVoice);
      const archivesChannel = await interaction.guild.channels.cache.find((channel) => channel.name === 'archived');

      await listeningPartyChat.edit({
        parent: archivesChannel
      });

      await stageChannel.delete();
      await categoryChannel.delete();

      const confirmEmbed = new EmbedBuilder().setDescription(`**${listeningPartyChat.name}** has been archived.`).setColor(Colors.CONFIRM);

      await interaction.reply({ embeds: [confirmEmbed] });
    }
  } catch (err) {
    await replyToInteraction(interaction, err);
  }
}
