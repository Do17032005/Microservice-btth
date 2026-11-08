package com.example.rhl;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients
public class RhlApplication {

	public static void main(String[] args) {
		SpringApplication.run(RhlApplication.class, args);
	}

}
