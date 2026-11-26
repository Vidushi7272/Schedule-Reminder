package com.vidushi.schedulereminder.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
//@Configuration- tells spring, this class contains configuration information. Inspect it for beans
public class SecurityConfig {
    @Bean
    public PasswordEncoder passwordEncoder(){
        return new BCryptPasswordEncoder();
        //returns an actual encoder object
    }
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception{
        //http is configuration tool, injected by spring

        http.authorizeHttpRequests(auth->{
            auth.requestMatchers(HttpMethod.POST,"/auth/register").permitAll();
            auth.requestMatchers(HttpMethod.POST,"/auth/login").permitAll();
            auth.anyRequest().authenticated();
            // any other request must be authenticated
        });
        http.sessionManagement(session->session.sessionCreationPolicy(SessionCreationPolicy.STATELESS));
        //sessionManagement- opens session configuration
        http.csrf(csrf->csrf.disable());
        http.cors(Customizer.withDefaults());
        //Browsers enforce the same-origin policy by default.
        //CORS allows a server to explicitly permit requests from other origins.
        // Enables CORS in Spring Security and uses the rules defined in CorsConfig.
        // This allows our React frontend to make permitted requests without being
        // blocked by Spring Security, including preflight OPTIONS requests.
        return http.build();
        // builds and returns configured filter chain
    }
}
