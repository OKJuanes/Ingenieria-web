# Stage 1: Build the application
FROM maven:3.8.6-openjdk-17 AS build

WORKDIR /app

# Copy pom.xml first for better layer caching
COPY pom.xml .

# Download dependencies (will be cached if pom.xml doesn't change)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src/ ./src/

# Package the application
RUN mvn package -DskipTests

# Stage 2: Run the application
FROM eclipse-temurin:17-jre-alpine

# Create a non-root user to run our application
RUN addgroup --system spring && adduser --system spring --ingroup spring

WORKDIR /app

# Copy the built artifact from the build stage
COPY --from=build /app/target/*.jar app.jar

# Create a directory for the .env file with correct permissions
RUN mkdir -p /app/config && \
    chown -R spring:spring /app

# Copy the .env file
COPY .env /app/config/.env

# Set ownership
RUN chown -R spring:spring /app

# Use the non-root user
USER spring

# Expose the port the app runs on
EXPOSE 8080

# Run the application with environment variables
CMD ["java", \
     "-jar", \
     "app.jar", \
     "--spring.config.additional-location=file:/app/config/.env"]