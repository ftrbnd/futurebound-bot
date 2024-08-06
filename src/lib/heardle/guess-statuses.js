export function statusSquares(guesses) {
  function getStatusSquare(status) {
    switch (status) {
      case 'CORRECT':
        return '🟩';
      case 'ALBUM':
        return '🟧';
      case 'WRONG':
        return '🟥';
      default:
        return '⬜';
    }
  }

  let squares = [];
  guesses?.forEach((guess) => {
    squares.push(getStatusSquare(guess.correctStatus));
  });

  return squares.join('');
}

export function statusSquaresLeaderboard(statuses) {
  function getStatusSquare(status) {
    switch (status) {
      case 'CORRECT':
        return '🟩';
      case 'ALBUM':
        return '🟧';
      case 'WRONG':
        return '🟥';
      default:
        return '⬜';
    }
  }

  let squares = [];
  statuses?.forEach((status) => {
    squares.push(getStatusSquare(status));
  });

  return squares.join('');
}

// used in commands/heardle and events/interactionCreate
export function guessStatuses(songs) {
  const statuses = [];

  for (const song of songs) {
    statuses.push(song.correctStatus);
  }

  return statuses;
}
