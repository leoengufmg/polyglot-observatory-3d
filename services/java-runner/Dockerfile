FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY services/java-runner/src ./src
RUN mkdir -p out && javac -d out src/main/java/com/aicodingtrainer/JavaRunnerServer.java

EXPOSE 8080

CMD ["java", "-cp", "out", "com.aicodingtrainer.JavaRunnerServer"]

