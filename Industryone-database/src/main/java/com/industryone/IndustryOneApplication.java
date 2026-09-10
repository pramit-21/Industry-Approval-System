package com.industryone;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class IndustryOneApplication {

    public static void main(String[] args) {
        SpringApplication.run(IndustryOneApplication.class, args);
        System.out.println("========================================");
        System.out.println(" IndustryOne Spring Boot Backend");
        System.out.println(" PostgreSQL database enabled");
        System.out.println(" http://localhost:8080");
        System.out.println("========================================");
    }
}
