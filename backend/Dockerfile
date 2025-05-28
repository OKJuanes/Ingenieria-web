# Stage 1: Build the application
FROM openjdk:19-jdk-alpine

# Instalar Maven
RUN apk add --no-cache maven

WORKDIR /app

# Copy pom.xml first for better layer caching
COPY pom.xml .

# Download dependencies (will be cached if pom.xml doesn't change)
RUN mvn dependency:go-offline -B

# Copy source code
COPY src/ ./src/

# Package the application
RUN mvn package -DskipTests

# Expose the port the app runs on
EXPOSE 8080

# Run the application with environment variables
CMD ["java", "-jar", "target/ProyectoWeb-0.0.1-SNAPSHOT.jar"]