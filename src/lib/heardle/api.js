import { statusSquaresLeaderboard } from './guess-statuses.js';
import { heardleAnnouncementSchema } from './announcement.js';
import { env } from '../../utils/env.js';

const SERVER = env.HEARDLE_SERVER_URL;
const ENDPOINT = `${SERVER}/api/heardles`;

export async function sendHealthCheck() {
  const res = await fetch(`${SERVER}/healthcheck`, {
    headers: {
      Authorization: `Bearer ${env.DISCORD_TOKEN}`
    }
  });
  if (!res.ok) throw new Error('Failed to send request');

  const data = await res.json();
  return { data, res };
}

/**
 *
 * @param {'daily' | 'unlimited'} type
 * @returns
 */
export async function sendRetryRequest(type) {
  if (type !== 'daily' && type !== 'unlimited') throw new Error("Invalid Heardle type: must be 'daily' or 'unlimited' ");

  const res = await fetch(`${ENDPOINT}/${type.toLowerCase()}/retry`, {
    headers: {
      Authorization: `Bearer ${env.DISCORD_TOKEN}`
    }
  });
  if (!res.ok) throw new Error(`Failed to send ${type[0].toUpperCase() + type.substring(1)} Heardle retry request`);

  const { message } = await res.json();
  return { message };
}

export async function getCurrentDailySong() {
  const res = await fetch(`${ENDPOINT}/daily`, {
    headers: {
      Authorization: `Bearer ${env.DISCORD_TOKEN}`
    }
  });
  if (!res.ok) throw new Error('Failed to send GET /api/heardles/daily request');

  // data: { song: DailySong }
  const { song } = await res.json();
  return { song };
}

// user: Discord.js User
export async function getUserStats(user) {
  const res = await fetch(`${ENDPOINT}/statistics/${user.id}`, {
    headers: {
      Authorization: `Bearer ${env.DISCORD_TOKEN}`
    }
  });
  if (!res.ok) throw new Error('Failed to send GET /api/heardles/statistics/:userId request');

  // data: { guesses: GuessedSong[], statistics: Statistics }
  const { guesses, statistics } = await res.json();
  return { guesses, statistics };
}

export async function getLeaderboard() {
  const res = await fetch(`${ENDPOINT}/leaderboard`, {
    headers: {
      Authorization: `Bearer ${env.DISCORD_TOKEN}`
    }
  });
  if (!res.ok) throw new Error('Failed to send GET /api/heardles/leaderboard request');

  const { leaderboard } = await res.json();
  return { leaderboard };
}

const categories = new Map([
  ['today', 'Today'],
  ['winPercentages', 'Win Percentages'],
  ['accuracies', 'Accuracies'],
  ['currentStreaks', 'Current Streaks'],
  ['maxStreaks', 'Max Streaks']
]);
// leaderboard: Leaderboard
// category: 'today' | 'winPercentages' | 'accuracies' | 'currentStreaks' | 'maxStreaks'
export function createLeaderboardDescription(leaderboard, category) {
  let dataRows = [];

  for (let i = 0; i < leaderboard[category].length; i++) {
    const stat = leaderboard[category][i];
    const displayData = category === 'today' ? `${statusSquaresLeaderboard(stat.data)}` : `${stat.data}%`;

    dataRows.push(`${i + 1}. ${stat.user.name} **${displayData}**`);
  }
  if (dataRows.length > 10) dataRows = dataRows.slice(0, 10);

  const title = `EDEN Heardle Leaderboard - ${categories.get(category)}`;
  const description = dataRows.length > 0 ? dataRows.join('\n') : 'No data available yet.';

  return { title, description };
}

export async function setAnnouncement(showBanner, text, link, status) {
  const body = heardleAnnouncementSchema.parse({ showBanner, text, link, status });

  const res = await fetch(`${ENDPOINT}/announcement`, {
    method: 'PATCH',
    body: JSON.stringify({ announcement: body }),
    headers: {
      Authorization: `Bearer ${env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error('Failed to send POST /api/heardles/announcement request');

  const { announcement } = await res.json();
  return { announcement };
}
