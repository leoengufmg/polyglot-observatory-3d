package com.aicodingtrainer;

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

public class JavaRunnerServer {
    public static void main(String[] args) throws IOException {
        HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
        server.createContext("/health", exchange -> writeJson(exchange, 200, "{\"status\":\"ok\",\"service\":\"java-runner\"}"));
        server.createContext("/score", exchange -> {
            if (!"POST".equalsIgnoreCase(exchange.getRequestMethod())) {
                writeJson(exchange, 405, "{\"error\":\"method not allowed\"}");
                return;
            }

            String body = new String(exchange.getRequestBody().readAllBytes(), StandardCharsets.UTF_8).toLowerCase();
            int bonusScore = 0;
            List<String> notes = new ArrayList<>();

            if (body.contains("public class")) {
                bonusScore += 6;
                notes.add("Java runner detected a class declaration.");
            }
            if (body.contains("static")) {
                bonusScore += 4;
                notes.add("Java runner detected a static entrypoint or helper.");
            }
            if (body.contains("list<")) {
                bonusScore += 5;
                notes.add("Java runner detected a typed collection.");
            }
            if (body.contains("for")) {
                bonusScore += 4;
                notes.add("Java runner detected iterative control flow.");
            }
            if (body.contains("if")) {
                bonusScore += 4;
                notes.add("Java runner detected branching logic.");
            }
            if (body.contains("return")) {
                bonusScore += 2;
                notes.add("Java runner detected an explicit return path.");
            }

            String notesJson = notes.stream()
                .map(note -> "\"" + escapeJson(note) + "\"")
                .collect(Collectors.joining(","));

            writeJson(
                exchange,
                200,
                "{\"bonusScore\":" + bonusScore + ",\"notes\":[" + notesJson + "]}"
            );
        });

        server.setExecutor(Executors.newFixedThreadPool(4));
        server.start();
        System.out.println("java-runner listening on port 8080");
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

