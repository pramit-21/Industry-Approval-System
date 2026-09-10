# IndustryOne - Spring Boot + PostgreSQL

This is the PostgreSQL version of the IndustryOne backend.

It uses:
- Spring Boot
- Spring Web REST controllers
- Spring Data JPA
- PostgreSQL
- BCrypt password hashing

It does NOT use manually written Servlet classes.

## 1. Requirements

Install:
- JDK 17+
- Maven 3.9+
- PostgreSQL 14+ (or a compatible recent version)

## 2. Create the database

Open PostgreSQL / pgAdmin and run:

    CREATE DATABASE industryone;

You do NOT need to manually create the tables.
Spring Boot + Hibernate will create/update them.

## 3. Configure PostgreSQL password

Open:

    src/main/resources/application.properties

Change:

    spring.datasource.password=YOUR_POSTGRES_PASSWORD

to your actual PostgreSQL password.

Do not put the password in GitHub.

## 4. Run in Antigravity

Open the folder containing pom.xml.

Terminal:

    mvn clean install

Then:

    mvn spring-boot:run

Server:

    http://localhost:8080

## 5. First users

This version expects users to exist in the users table.
For a quick development test, you can use the included database seed endpoint/code
later, or insert BCrypt hashes through a registration feature.

IMPORTANT:
The old in-memory demo passwords are intentionally NOT automatically created,
because PostgreSQL should be the source of truth.

## 6. Main database tables

Spring Boot creates:
- users
- login_attempts
- security_alerts
- auth_tokens

## 7. Security rule

Wrong login #1:
2 attempts remaining.

Wrong login #2:
1 attempt remaining.

Wrong login #3:
account locked for 3 minutes + HIGH security alert saved in PostgreSQL.

The admin can read unresolved alerts and resolve them.

## 8. API

POST /api/login
POST /api/logout
GET  /api/me

GET  /api/admin/alerts
GET  /api/admin/alerts/all
POST /api/admin/alerts/{id}/resolve

For authenticated requests:

    X-Auth-Token: <token>

## 9. Important

This project is a development implementation.
For production, add HTTPS, secure authentication/session handling,
CSRF protection where applicable, rate limiting, password reset,
email verification, audit logging and stronger administrative controls.
