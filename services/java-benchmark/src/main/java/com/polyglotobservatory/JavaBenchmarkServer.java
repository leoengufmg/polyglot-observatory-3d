package com.polyglotobservatory;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

public class JavaBenchmarkServer {
    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/health", exchange -> writeJson(exchange, 200, "{\"status\":\"ok\",\"service\":\"java-benchmark\"}"));
        server.createContext("/benchmark", exchange -> {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                writeJson(exchange, 405, "{\"error\":\"method not allowed\"}");
                return;
            }

            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8).toLowerCase();
            int benchmarkBonus = 0;
            List<String> notes = new ArrayList<>();

            if (body.contains("public class")) {
                benchmarkBonus += 6;
                notes.add("Java benchmark detected a class declaration.");
            }
            if (body.contains("static")) {
                benchmarkBonus += 4;
                notes.add("Java benchmark detected a static method.");
            }
            if (body.contains("list<")) {
                benchmarkBonus += 5;
                notes.add("Java benchmark detected a typed collection.");
            }
            if (body.contains("for")) {
                benchmarkBonus += 4;
                notes.add("Java benchmark detected iterative control flow.");
            }
            if (body.contains("if")) {
                benchmarkBonus += 4;
                notes.add("Java benchmark detected branching logic.");
            }
            if (body.contains("return")) {
                benchmarkBonus += 2;
                notes.add("Java benchmark detected an explicit return path.");
            }

            String notesJson = notes.stream()
                .map(note -> "\"" + escapeJson(note) + "\"")
                .collect(Collectors.joining(","));

            writeJson(
                exchange,
                200,
                "{\"benchmarkBonus\":" + benchmarkBonus + ",\"notes\":[" + notesJson + "]}"
            );
        });

        server.setExecutor(Executors.newFixedThreadPool(4));
        server.start();
        System.out.println("java-benchmark listening on port 8080");
    }

    private static void writeJson(HttpExchange exchange, int statusCode, String body) throws IOException {
        byte[] bytes = body.getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
        exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        exchange.sendResponseHeaders(statusCode, bytes.length);
        try (OutputStream output = exchange.getResponseBody()) {
            output.write(bytes);
        } finally {
            exchange.close();
        }
    }

    private static String escapeJson(String raw) {
        return raw.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
