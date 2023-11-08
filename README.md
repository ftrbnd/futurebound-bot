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
  <a href="https://github.com/ftrbnd/eden-bot">
    <img src="https://i.imgur.com/rQmm1FM.png" alt="Logo" width="80" height="80">
  </a>
<h3 align="center">EDEN Discord Bot</h3>
  <p align="center">
    A Discord bot for the Futurebound Discord server
    <br />
    <a href="https://github.com/ftrbnd/eden-bot/issues">Report Bug</a>
    ·
    <a href="https://github.com/ftrbnd/eden-bot/issues">Request Feature</a>
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

This server has 2 responsibilities:
* Choose a new random song every day at 4am UTC
* Receive POST and DELETE requests from [EDEN Heardle](https://eden-bot.io) when users interact with the Custom Heardle modal

<p align="right">(<a href="#readme-top">back to top</a>)</p>



### Built With

* [![Heroku][Heroku]][Heroku-url]
* [![Typescript][Typescript]][Typescript-url]
* [![Node][Node.js]][Node-url]
* [![Express][Express]][Express-url]
* [![Ffmpeg][Ffmpeg]][Ffmpeg-url]
* [![Prisma][PrismaOrm]][Prisma-url]
* [![Supabase][Supabase]][Supabase-url]

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- GETTING STARTED -->
## Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/en/) 18 or higher
* Database urls and key from [Supabase](https://supabase.com)

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/ftrbnd/eden-bot.git
   ```
2. Install NPM packages
   ```sh
   npm install
   ```
3. Generate your Prisma client
   ```sh
   npx prisma generate
   ```
5. Start the local dev server
   ```sh
   npm run dev
   ```

### Configuration

Create a `.env` file at the root and fill out the values:
```env
  DATABASE_URL=
  SUPABASE_KEY=
  SUPABASE_URL=

  # Set the hour and minute to your preference in UTC time
  CRON_UTC_HOUR=4
  CRON_UTC_MINUTE=0

  # The domain EDEN Heardle is running on, change the port if needed
  WHITELISTED_DOMAINS=http://localhost:3000
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- USAGE EXAMPLES -->
## Usage

### Viewing the leaderboard on the website
[![Website Leaderboard][website-leaderboard-screenshot]](https://eden-heardle.io)
### Viewing the leaderboard on the Discord server
[![Discord Leaderboard][discord-leaderboard-screenshot]](https://discord.gg/futurebound)

### Creating a Custom Heardle
**Note: An account is required to create a custom Heardle, and users are limited to 1.
Deleting a custom Heardle will again allow them to create a new custom Heardle.**
[![Custom Heardle Form][custom-heardle-form]](https://eden-heardle.io)
[![Custom Heardle Result][custom-heardle-result]](https://eden-heardle.io)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

If you have a suggestion that would make this better, please fork the repo and create a pull request. You can also simply open an issue with the tag "enhancement".
Don't forget to give the project a star! Thanks again!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

<p align="right">(<a href="#readme-top">back to top</a>)</p>


<!-- CONTACT -->
## Contact

Giovanni Salas - [@finalcalI](https://twitter.com/finalcali) - giosalas25@gmail.com

Project Link: [https://github.com/ftrbnd/eden-bot](https://github.com/ftrbnd/eden-bot)

<p align="right">(<a href="#readme-top">back to top</a>)</p>



<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/ftrbnd/eden-bot.svg?style=for-the-badge
[contributors-url]: https://github.com/ftrbnd/eden-bot/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/ftrbnd/eden-bot.svg?style=for-the-badge
[forks-url]: https://github.com/ftrbnd/eden-bot/network/members
[stars-shield]: https://img.shields.io/github/stars/ftrbnd/eden-bot.svg?style=for-the-badge
[stars-url]: https://github.com/ftrbnd/eden-bot/stargazers
[issues-shield]: https://img.shields.io/github/issues/ftrbnd/eden-bot.svg?style=for-the-badge
[issues-url]: https://github.com/ftrbnd/eden-bot/issues
[license-shield]: https://img.shields.io/github/license/ftrbnd/eden-bot.svg?style=for-the-badge
[license-url]: https://github.com/ftrbnd/eden-bot/blob/master/LICENSE.txt
[linkedin-shield]: https://img.shields.io/badge/-LinkedIn-black.svg?style=for-the-badge&logo=linkedin&colorB=555
[linkedin-url]: https://linkedin.com/in/linkedin_username
[product-screenshot]: https://i.imgur.com/OzETWxS.png
[website-leaderboard-screenshot]: https://i.imgur.com/dVr4AOB.png
[discord-leaderboard-screenshot]: https://i.imgur.com/3TyTIKe.png
[custom-heardle-form]: https://i.imgur.com/w0W4CFN.png
[custom-heardle-result]: https://i.imgur.com/wGNsPv2.png
[Heroku]: https://img.shields.io/badge/Heroku-430098?style=for-the-badge&logo=heroku&logoColor=white
[Heroku-url]: https://www.heroku.com/
[Typescript]: https://img.shields.io/badge/typescript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[Typescript-url]: https://www.typescriptlang.org/
[Node.js]: https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white
[Node-url]: https://nodejs.org/
[Express]: https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white
[Express-url]: https://expressjs.com/
[Ffmpeg]: https://img.shields.io/badge/Ffmpeg-007808?style=for-the-badge&logo=ffmpeg&logoColor=white
[Ffmpeg-url]: https://www.ffmpeg.org/
[PrismaOrm]: https://img.shields.io/badge/Prisma-%232D3748?style=for-the-badge&logo=prisma&logoColor=white
[Prisma-url]: https://www.prisma.io/
[Supabase]: https://img.shields.io/badge/Supabase-3FCF8E?style=for-the-badge&logo=supabase&logoColor=white
[Supabase-url]: https://supabase.com/
[Discord-server]: https://img.shields.io/discord/655655072885374987?logo=discord&logoColor=white&color=5865F2
[Server-link]: https://discord.gg/futurebound
