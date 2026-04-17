package com.sliit.smartcampus.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import java.io.File;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.logging.Logger;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private static final Logger log = Logger.getLogger(WebConfig.class.getName());

    @Value("${app.upload.dir:./uploads/tickets}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(@NonNull ResourceHandlerRegistry registry) {
        try {
            File dir = Paths.get(uploadDir).toAbsolutePath().normalize().toFile();
            Files.createDirectories(dir.toPath());

            // File.toURI() correctly formats the path for all OS (Windows/Linux/Mac)
            String location = dir.toURI().toString();
            if (!location.endsWith("/")) location += "/";

            log.info("=== Serving uploads from: " + location + " ===");
            log.info("=== Directory exists: " + dir.exists() + ", Files: " + dir.list().length + " ===");

            registry.addResourceHandler("/uploads/tickets/**")
                    .addResourceLocations(location)
                    .setCachePeriod(0);
        } catch (Exception e) {
            log.warning("WebConfig upload handler error: " + e.getMessage());
            registry.addResourceHandler("/uploads/tickets/**")
                    .addResourceLocations("file:./uploads/tickets/");
        }
    }
}
