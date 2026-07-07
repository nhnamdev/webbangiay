package com.zestfoot.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.net.URI;
import java.text.Normalizer;
import java.time.LocalDate;
import java.util.UUID;

@Service
public class R2StorageService {

    private final String endpoint;
    private final String accessKeyId;
    private final String secretAccessKey;
    private final String bucket;
    private final String publicBaseUrl;

    public R2StorageService(
            @Value("${r2.endpoint:}") String endpoint,
            @Value("${r2.access-key-id:}") String accessKeyId,
            @Value("${r2.secret-access-key:}") String secretAccessKey,
            @Value("${r2.bucket}") String bucket,
            @Value("${r2.public-base-url}") String publicBaseUrl
    ) {
        this.endpoint = endpoint;
        this.accessKeyId = accessKeyId;
        this.secretAccessKey = secretAccessKey;
        this.bucket = bucket;
        this.publicBaseUrl = publicBaseUrl;
    }

    public String uploadProductImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }
        if (bucket == null || bucket.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu cấu hình R2 bucket");
        }
        if (endpoint == null || endpoint.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu cấu hình R2 endpoint");
        }
        if (accessKeyId == null || accessKeyId.isBlank() || secretAccessKey == null || secretAccessKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Thiếu cấu hình R2 credentials");
        }

        String contentType = file.getContentType();
        String originalName = file.getOriginalFilename() == null ? "image" : file.getOriginalFilename();
        String fileName = sanitizeFileName(originalName);
        String key = "products/" + LocalDate.now() + "/" + UUID.randomUUID() + "-" + fileName;

        try (var r2Client = software.amazon.awssdk.services.s3.S3Client.builder()
                .region(Region.of("auto"))
                .endpointOverride(URI.create(endpoint))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(accessKeyId, secretAccessKey)))
                .forcePathStyle(true)
                .build()) {
            PutObjectRequest request = PutObjectRequest.builder()
                    .bucket(bucket)
                    .key(key)
                    .contentType(contentType)
                    .build();

            r2Client.putObject(request, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            String baseUrl = (publicBaseUrl != null && !publicBaseUrl.isBlank())
                    ? normalizeBaseUrl(publicBaseUrl)
                    : normalizeBaseUrl(endpoint) + "/" + bucket;
            return baseUrl + "/" + key;
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image to R2", e);
        }
    }

    private String sanitizeFileName(String input) {
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .replaceAll("[^a-zA-Z0-9._-]", "-")
                .replaceAll("-+", "-")
                .replaceAll("(^-|-$)", "");
        return normalized.isBlank() ? "image" : normalized.toLowerCase();
    }

    private String normalizeBaseUrl(String input) {
        return input.endsWith("/") ? input.substring(0, input.length() - 1) : input;
    }
}
