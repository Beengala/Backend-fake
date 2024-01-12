# Beengala Fake Server (Only Development)

This project is a mock server designed for local development environments. It simulates a backend application and provides a simple framework for testing and development purposes. The server is not intended for production use and is optimized for ease of setup and use within a local development context. It supports basic database operations and serves as a starting point for backend development, offering a controlled environment to develop and test frontend applications, APIs, or other client-side projects that require server interaction.
## Prerequisites

Before you begin, ensure you have installed the following:
- Node.js (download from [here](https://nodejs.org/))
- MySQL (installation instructions for [Windows](https://dev.mysql.com/doc/refman/8.0/en/windows-installation.html) and [macOS](https://dev.mysql.com/doc/refman/8.0/en/macos-installation.html))
- A code editor like Visual Studio Code (optional but recommended, available [here](https://code.visualstudio.com/))

## Environment Setup

### Clone the Repository

First, clone the repository to your local machine using Git:
`git clone git@github.com:Beengala/Backend-fake.git`

### Install Dependencies

Navigate to the project directory and run the following command to install the necessary dependencies:
`npm install`

### Database Configuration

#### Windows/macOS

1. Install MySQL on your system. Follow the instructions mentioned in the Prerequisites. For better control and easier management, you can download a MySQL plugin from the Visual Studio Code marketplace.
2. The project should come with a pre-configured database. The project lead will provide you with the necessary credentials. Once you have them, create a .env file in the root of your project and add the following lines, replacing the values with the credentials provided:

`DB_HOST=localhost`
`DB_USER=your_mysql_username`
`DB_PASS=your_mysql_password`
`DB_NAME=your_database_name`

4. Ensure that your `.env` file is listed in `.gitignore` to keep your credentials secure.

### Compile and Run the Server

© Beengala 2023. All rights reserved.

Once the environment and database are set up, you can start the server locally:
`node app.js`

This will start the server on `http://localhost:3000` (or whichever port you have configured).
