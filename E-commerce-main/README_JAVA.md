# Java Backend Setup Guide

## Prerequisites
1. **Java Development Kit (JDK)**: You have Java 23 installed, which is great.
2. **Maven**: This project uses Maven for build and dependency management.
   - Since `mvn` is not found in your terminal, please [download and install Maven](https://maven.apache.org/install.html) or use an IDE like IntelliJ IDEA or Eclipse which includes Maven.
3. **MySQL Database**: The current code requires a MySQL database.

## Database Setup
1. Install MySQL Server if you haven't already.
2. Create the database and tables using the provided schema:
   - Run the commands in `database_schema.sql` in your MySQL client (Workbench, CLI, etc.).
   - Key command: `CREATE DATABASE ecommerce_db;`
3. Update Database Credentials:
   - Open `src/main/java/com/ecommerce/DatabaseConnection.java`.
   - Update the `USER` and `PASSWORD` constants to match your MySQL installation.

## How to Run
### Option 1: Using an IDE (Recommended)
1. Open the project in IntelliJ IDEA or Eclipse.
2. Import it as a **Maven Project**.
3. Locate `src/main/java/com/ecommerce/Main.java`.
4. Right-click and select **Run 'Main.main()'**.

### Option 2: Using Command Line (Requires Maven)
1. Ensure Maven is installed and in your PATH (`mvn -version`).
2. Run the following command in the project root:
   ```bash
   mvn exec:java
   ```

## Note on H2 Database
If you prefer not to install MySQL, we can switch the project to use H2 (an in-memory database). Let me know if you'd like to do this!

## Checking Data
You can check the users in the database using the provided utility:
1. Ensure MySQL is running and the `ecommerce_db` database exists.
2. Run the following command:
   ```bash
   mvn exec:java -Dexec.mainClass="com.ecommerce.CheckUsers"
   ```
3. Alternatively, use a SQL client (like MySQL Workbench) to connect to `localhost:3306` and run:
   ```sql
   USE ecommerce_db;
   SELECT * FROM users;
   ```
