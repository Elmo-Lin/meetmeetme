package com.meetmeetme.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.io.InputStream;
import java.util.Map;
import java.util.Properties;
import java.util.stream.Collectors;

@Configuration
public class SqlMapConfig {

    @Bean
    public Map<String, String> sqlMap() throws IOException {
        Properties props = new Properties();
        try (InputStream is = getClass().getClassLoader().getResourceAsStream("sql.xml")) {
            if (is != null) {
                props.loadFromXML(is);
            } else {
                throw new IOException("sql.xml not found");
            }
        }
        return props.entrySet().stream()
                .collect(Collectors.toMap(
                        e -> String.valueOf(e.getKey()),
                        e -> String.valueOf(e.getValue())
                ));
    }
}
