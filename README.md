# kometa

### What is kometa?

Kometa is a self-hostedplatform for managing and reading your comics in one place.

### ⚠️ Development Status Warning

This project is currently in active development. While we encourage you to try it out and provide feedback, we do not recommend using it as your primary comic management solution or migrating from other services yet. The project may undergo significant changes, and some features might not be fully stable.

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
