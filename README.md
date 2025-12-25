# Recruitment Platform

This project is a full-stack web application designed to streamline the recruitment process. It provides a platform for managing candidates, tracking their progress through various recruitment stages, and facilitating communication.

## Features

- **User Authentication:** Secure login for users with different roles (Admin, Evaluator, Member) using JSON Web Tokens (JWT).
- **Role-Based Access Control:** Middleware protects API endpoints, ensuring users can only access features appropriate for their role.
- **Candidate Management:** Add, view, and update candidate information.
- **Recruitment Tracks:** Create and manage different recruitment pipelines or "tracks".
- **Candidate Evaluation:** A system for evaluators to assess candidates.
- **Email Integration:** Send emails to candidates directly from the application.
- **Excel Import:** Bulk-add candidates by importing data from `.xlsx` files.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Containerization:** Docker

## Prerequisites

Before you begin, ensure you have the following installed:
- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/)

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    cd recruitment-platform-njc
    ```

2.  **Build and run the application using Docker Compose:**
    ```bash
    docker-compose up --build
    ```

3.  **Access the application:**
    -   **Frontend:** Open your browser and navigate to [http://localhost:3000](http://localhost:3000)
    -   **Backend API:** The API is accessible at `http://localhost:5000/api`
    -   **Database:** The PostgreSQL database is running on port `5432`.

## Project Structure

The project is organized into three main parts:

-   `./frontend/`: Contains the React frontend application.
-   `./backend/`: Contains the Node.js/Express backend API.
-   `./postgres_data/`: Stores the persistent data for the PostgreSQL database.
-   `docker-compose.yml`: Defines the services, networks, and volumes for the Docker application.

## Database Schema

The database consists of the following main tables:

-   `recruitment_tracks`: Stores different recruitment processes.
-   `users`: Manages user accounts and their roles (`Admin`, `Evaluator`, `Member`).
-   `candidates`: Contains information about each candidate.
-   `evaluations`: Links candidates to evaluators and stores evaluation data.
-   `email_templates`: Stores templates for emails sent from the application.
