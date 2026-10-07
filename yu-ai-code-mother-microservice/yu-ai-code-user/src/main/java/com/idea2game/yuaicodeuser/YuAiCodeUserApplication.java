package com.idea2game.yuaicodeuser;

import org.apache.dubbo.config.spring.context.annotation.EnableDubbo;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.ComponentScan;

@SpringBootApplication
@EnableDubbo
@MapperScan("com.idea2game.yuaicodeuser.mapper")
@ComponentScan("com.idea2game")
public class YuAiCodeUserApplication {
    public static void main(String[] args) {
        SpringApplication.run(YuAiCodeUserApplication.class, args);
    }
}
