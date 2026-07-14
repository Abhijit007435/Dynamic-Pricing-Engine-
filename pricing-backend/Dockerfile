# Stage 1: Build the application
FROM maven:3.8.5-openjdk-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests

# Stage 2: Run the application
FROM openjdk:17.0.1-jdk-slim
WORKDIR /app
# Copies the compiled jar from the build stage
COPY --from=build /app/target/*.jar app.jar
# Exposes the port Render uses
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]