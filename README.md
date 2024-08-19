<!-- Improved compatibility of back to top link: See: https://github.com/othneildrew/Best-README-Template/pull/73 -->

<a name="readme-top"></a>

<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Don't forget to give the project a star!
*** Thanks again! Now go create something AMAZING! :D
-->

<!-- PROJECT LOGO -->
<br />
<div align="center">
  <a href="https://github.com/ftrbnd/futurebound-bot">
    <img src="https://i.imgur.com/rQmm1FM.png" alt="Logo" width="80" height="80">
  </a>
<h3 align="center">Futurebound Bot</h3>
  <p align="center">
    A Discord bot for the Futurebound Discord server
    <br />
    <a href="https://github.com/ftrbnd/futurebound-bot/issues">Report Bug</a>
    ·
    <a href="https://github.com/ftrbnd/futurebound-bot/issues">Request Feature</a>
  </p>
</div>

[![Discord-server][Discord-server]][Server-link]

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
        <li><a href="#configuration">Configuration</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>

<!-- ABOUT THE PROJECT -->

## About The Project

This Discord bot was created during the peak of the pandemic in May 2020 and was made to help manage the growth the Futurebound server was experiencing. It was this project that reignited my passion
for programming, and it has continued to be maintained throughout the years.

In addition to some basic moderation commands (`/ban`, `/warn`, etc.), the bot also helps automate the hosting of listening parties, announcing the new daily Heardle, plays music in voice channels,
and even has a `/guessthesong` game.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

### Built With

- [![Heroku][Heroku]][Heroku-url]
- [![Javascript][Javascript]][Javascript-url]
- [![Node][Node.js]][Node-url]
- [![Discord.js][Discord.js]][DiscordJs-url]
- [![MongoDB][Mongodb]][MongoDb-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- GETTING STARTED -->

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) 18 or higher
- Client keys from [Discord](https://discord.com/developers/applications)
- Database url from [MongoDB](https://mongodb.com/)
- API key from [OpenAI](https://openai.com/)
- API key from [Spotify](https://developer.spotify.com/) for the music player

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/ftrbnd/futurebound-bot.git
   ```
2. Install NPM packages
   ```sh
   yarn install
   ```
3. Start the local dev server
   ```sh
   yarn dev
   ```

### Configuration

Create a `.env` file at the root and fill out the values:

```env
  NODE_ENV=development

  DISCORD_TOKEN=
  DISCORD_CLIENT_ID=
  GUILD_ID=

  MONGODB_URI=

  HEARDLE_WEBHOOK_ID=
  HEARDLE_CHANNEL_ID =
  HEARDLE_SERVER_URL=
  HEARDLE_ROLE_ID=

  SPOTIFY_CLIENT_ID=
  SPOTIFY_CLIENT_SECRET=

  # comma separated list of Imgur album ids (ex: '2k34h,l2343k,123kdf')
  IMGUR_ALBUMS=

  # ... and a lot of Discord ids for channels, roles, etc.

  ANNOUNCEMENTS_CHANNEL_ID=
  BOTS_CHANNEL_ID=
  BOT_BAIT_CHANNEL_ID=
  COMMANDS_CHANNEL_ID=
  GENERAL_CHANNEL_ID=
  INTRODUCTIONS_CHANNEL_ID=
  JOIN_TO_CREATE_CHANNEL_ID=
  LOGS_CHANNEL_ID=
  MODERATORS_CHANNEL_ID=
  ROLES_CHANNEL_ID=
  SURVIVOR_CHANNEL_ID=
  VOICE_CHAT_CHANNEL_ID=
  WELCOME_CHANNEL_ID=

  JOIN_TO_CREATE_CATEGORY_ID=

  MODERATORS_ROLE_ID=
  HELPERS_ROLE_ID=
  TIER_3_ROLE_ID=
  SUBSCRIBER_ROLE_ID=
  BOOSTER_ROLE_ID=
  SURVIVOR_ROLE_ID=
  MUTED_ROLE_ID=
  SUBSCRIBER_ROLE_IDS= # TIER_1 -> TIER_3
  ALBUM_ROLE_IDS= # oldest => newest

  INTRODUCTIONS_REACTION_EMOJI_ID=
  GIVEAWAY_EMOJI_ID=
  NUMBER_EMOJIS= # emojis for numbers after 10; 11 => ...
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- USAGE EXAMPLES -->

## Usage

### Viewing the leaderboard on the Discord server

[![Discord Leaderboard][discord-leaderboard-screenshot]](https://discord.gg/futurebound)

### Use /help to view the list of all commands

[![Discord Help][discord-help-screenshot]](https://discord.gg/futurebound)

### Slash Commands provide users an easier experience when using commands

[![Discord Slash Commands][discord-slashcommands-screenshot]](https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTRIBUTING -->

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement". Don't forget to give the project a
star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- CONTACT -->

## Contact

Giovanni Salas - [@finalcalI](https://twitter.com/finalcali) - giosalas25@gmail.com

Project Link: [https://github.com/ftrbnd/futurebound-bot](https://github.com/ftrbnd/futurebound-bot)

<p align="right">(<a href="#readme-top">back to top</a>)</p>

<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->

[contributors-shield]: https://img.shields.io/github/contributors/ftrbnd/futurebound-bot.svg?style=for-the-badge
[contributors-url]: https://github.com/ftrbnd/futurebound-bot/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/ftrbnd/futurebound-bot.svg?style=for-the-badge
[forks-url]: https://github.com/ftrbnd/futurebound-bot/network/members
[stars-shield]: https://img.shields.io/github/stars/ftrbnd/futurebound-bot.svg?style=for-the-badge
[stars-url]: https://github.com/ftrbnd/futurebound-bot/stargazers
[issues-shield]: https://img.shields.io/github/issues/ftrbnd/futurebound-bot.svg?style=for-the-badge
[issues-url]: https://github.com/ftrbnd/futurebound-bot/issues
[license-shield]: https://img.shields.io/github/license/ftrbnd/futurebound-bot.svg?style=for-the-badge
[license-url]: https://github.com/ftrbnd/futurebound-bot/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: https://i.imgur.com/OzETWxS.png
[website-leaderboard-screenshot]: https://i.imgur.com/dVr4AOB.png
[discord-leaderboard-screenshot]: https://i.imgur.com/3TyTIKe.png
[discord-help-screenshot]: https://i.imgur.com/0Sd2kXW.png
[discord-slashcommands-screenshot]: https://i.imgur.com/XO2ZYMi.png
[custom-heardle-form]: https://i.imgur.com/w0W4CFN.png
[custom-heardle-result]: https://i.imgur.com/wGNsPv2.png
[Heroku]: https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white
[Heroku-url]: https://www.heroku.com/
[Javascript]: https://img.shields.io/badge/javascript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[Javascript-url]: https://www.javascript.com/
[Node.js]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[Node-url]: https://nodejs.org/
[Discord.js]: https://img.shields.io/badge/Discord.JS-5865F2?style=for-the-badge&logo=discord&logoColor=white
[DiscordJs-url]: https://discord.js.org/
[MongoDb]: https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white
[Mongodb-url]: https://mongodb.com/
[Discord-server]: https://img.shields.io/discord/655655072885374987?logo=discord&logoColor=white&color=5865F2
[Server-link]: https://discord.gg/futurebound
