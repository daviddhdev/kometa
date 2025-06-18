# kometa

![icon-512x512-withbg](https://github.com/user-attachments/assets/d140452e-06dc-4b41-8d9b-94b482954729)

### What is kometa?

Kometa is a self-hostedplatform for managing and reading your comics in one place.

[Docs](https://kometa-docs.daviddh.dev/)

### ⚠️ Development Status Warning

This project is currently in active development. While we encourage you to try it out and provide feedback, we do not recommend using it as your primary comic management solution or migrating from other services yet. The project may undergo significant changes, and some features might not be fully stable.

### Prerequisites

Before setting up kometa, ensure you have:

- A ComicVine account and API key (guide below)
- PostgreSQL database (local or remote)
- Node.js 18+ (if running without Docker)
- Docker and Docker Compose (for containerized setup)

### Features

- 📚 Comic library management
- 🔍 ComicVine integration for metadata
- 📱 Responsive web interface
- 🔔 Push notifications (optional)
- 🐳 Docker support for easy deployment
- 🔒 Self-hosted solution

Too see more about the feature visit [the docs](https://kometa-docs.daviddh.dev/features/overview/)

![og-image](https://kometa-docs.daviddh.dev/og-image.png)

### How to use kometa?

First of all, you need a ComicVine account and a ComicVine API key.

You can get them by creating an account on [ComicVine](https://comicvine.gamespot.com/login-signup/) and then going to the API page.

Then, you need to create a .env file in the root of the project and add the following variables:

```
COMIC_VINE_API_KEY=your_comicvine_api_key
```

Then you need a database. The project uses PostgreSQL.

```
DATABASE_URL=your_database_url
```

By default, the project uses a local PostgreSQL database. You can change the database URL in the .env file.

You will need a jwt secret. You can generate one with `openssl rand -hex 32`

```
JWT_SECRET=your_jwt_secret
```

Also the public url of the app.

```
NEXT_PUBLIC_APP_URL=your_app_url
```

If you want to use push notifications, you need to generate a VAPID key. You can follow the instructions [here](https://www.npmjs.com/package/web-push/).

Then add the following variables:

```
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=your_vapid_email
```

### Docker Setup

To run the application using Docker:

1. Make sure you have Docker and Docker Compose installed on your system.

2. Create a `.env` file in the root directory with all the required environment variables mentioned above.

3. Build the Docker image:

```bash
docker-compose build
```

4. Start the containers:

```bash
docker-compose up -d
```

This will:

- Start a PostgreSQL database container
- Build and start the application container
- Create a persistent volume for the database
- Mount the `./comics` directory to store comic files

### Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### License

This project is licensed under the MIT License - see the LICENSE file for details.

