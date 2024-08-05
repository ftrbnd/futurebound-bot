const { statusSquaresLeaderboard } = require('../utils/heardleStatusFunctions');
const { heardleAnnouncementSchema } = require('../utils/schema');

const SERVER = process.env.EDEN_HEARDLE_SERVER_URL;
const ENDPOINT = `${SERVER}/api/heardles`;

async function sendHealthCheck() {
  const res = await fetch(`${SERVER}/healthcheck`, {
    headers: {
      Authorization: `Bearer ${process.env.DISCORD_TOKEN}`
    }
  });
  if (!res.ok) throw new Error('Failed to send request');

  const data = await res.json();
  return { data, res };
}

async function sendRetryRequest() {
  const res = await fetch(`${ENDPOINT}/daily/retry`, {
    headers: {
      Authorization: `Bearer ${process.env.DISCORD_TOKEN}`
    }
  });
  if (!res.ok) throw new Error('Failed to send Daily Heardle retry request');

  const { message } = await res.json();
  return { message };
}

async function getCurrentDailySong() {
  const res = await fetch(`${ENDPOINT}/daily`, {
    headers: {
      Authorization: `Bearer ${process.env.DISCORD_TOKEN}`
    }
  });
  if (!res.ok) throw new Error('Failed to send GET /api/heardles/daily request');

  // data: { song: DailySong }
  const { song } = await res.json();
  return { song };
}

// user: Discord.js User
async function getUserStats(user) {
  const res = await fetch(`${ENDPOINT}/statistics/${user.id}`, {
    headers: {
      Authorization: `Bearer ${process.env.DISCORD_TOKEN}`
    }
  });
  if (!res.ok) throw new Error('Failed to send GET /api/heardles/statistics/:userId request');

  // data: { guesses: GuessedSong[], statistics: Statistics }
  const { guesses, statistics } = await res.json();
  return { guesses, statistics };
}

async function getLeaderboard() {
  const res = await fetch(`${ENDPOINT}/leaderboard`, {
    headers: {
      Authorization: `Bearer ${process.env.DISCORD_TOKEN}`
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
function createLeaderboardDescription(leaderboard, category) {
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

async function setAnnouncement(showBanner, text, link, status) {
  const body = heardleAnnouncementSchema.parse({ showBanner, text, link, status });

  const res = await fetch(`${ENDPOINT}/announcement`, {
    method: 'PATCH',
    body: JSON.stringify({ announcement: body }),
    headers: {
      Authorization: `Bearer ${process.env.DISCORD_TOKEN}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error('Failed to send POST /api/heardles/announcement request');

  const { announcement } = await res.json();
  return announcement;
}

module.exports = {
  sendHealthCheck,
  sendRetryRequest,
  getCurrentDailySong,
  getUserStats,
  getLeaderboard,
  createLeaderboardDescription,
  setAnnouncement
};
