package com.vidushi.schedulereminder.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
@Configuration
public class CorsConfig implements WebMvcConfigurer {
    //WebMvcConfigurer: lets us customize Spring MVC behaviour.
    @Override
    public void addCorsMappings(CorsRegistry registry) {

        registry.addMapping("/**")
        //registry.addMapping("/**"):-Applies this CORS configuration to all backend endpoints.
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
        //.allowedHeaders("*"):- Allows request headers, including our future Authorization header.
    }}
