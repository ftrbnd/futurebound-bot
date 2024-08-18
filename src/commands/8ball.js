import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { Colors } from '../utils/constants.js';

const responses = [
  'As I see it, yes.',
  'Ask again later.',
  'Better not tell you now.',
  'Cannot predict now.',
  'Concentrate and ask again.',
  "Don't count on it.",
  'It is certain.',
  'It is decidedly so.',
  'Most likely.',
  'My reply is no.',
  'My sources say no.',
  'Outlook not so good.',
  'Outlook good.',
  'Reply hazy, try again.',
  'Signs point to yes.',
  'Very doubtful.',
  'Without a doubt.',
  'Yes.',
  'Yes - definitely.',
  'You may rely on it.'
];

export const data = new SlashCommandBuilder()
  .setName('8ball')
  .setDescription('Ask a question and get a magic 8-ball response')
  .addStringOption((option) => option.setName('question').setDescription('Ask the magic 8-ball a question').setRequired(true));

export async function execute(interaction) {
  const questionAsked = interaction.options.getString('question');

  const eightBall = new EmbedBuilder()
    .setTitle('🎱 ' + questionAsked)
    .setDescription(responses[Math.floor(Math.random() * responses.length)])
    .setColor(Colors.RANDOM);

  await interaction.reply({ embeds: [eightBall] });
}
