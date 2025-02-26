# Use an official Maven image to build the project
FROM maven:3.8.6-openjdk-17 AS build

WORKDIR /app

COPY ./pom.xml /app
COPY ./src /app/src

# CONSTRUIR NUESTRA APLICACION
RUN ./mvn clean install -DskipTests

# Use an official OpenJDK runtime image
FROM openjdk:17-jdk-slim

# Set the working directory
WORKDIR /app

# Copy the built JAR file from the build stage
COPY --from=build /app/target/*.jar app.jar

# Copy the .env file
COPY ../.env /app/.env

# Expose the port the app runs on
EXPOSE 8081

# Set the environment variables from the .env file
ENV CONNECTION_URL=${CONNECTION_URL}
ENV USER=${USER}
ENV PASSWORD=${PASSWORD}

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"]