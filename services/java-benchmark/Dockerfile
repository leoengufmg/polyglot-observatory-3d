FROM eclipse-temurin:17-jdk-alpine

WORKDIR /app

COPY services/java-benchmark/src ./src
RUN mkdir -p out && javac -d out src/main/java/com/polyglotobservatory/JavaBenchmarkServer.java

EXPOSE 8080

CMD ["java", "-cp", "out", "com.polyglotobservatory.JavaBenchmarkServer"]
