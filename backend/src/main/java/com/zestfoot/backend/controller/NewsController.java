package com.zestfoot.backend.controller;

import com.zestfoot.backend.entity.News;
import com.zestfoot.backend.repository.NewsRepository;
import com.zestfoot.backend.service.R2StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    @Autowired
    private NewsRepository newsRepository;

    @Autowired
    private R2StorageService r2StorageService;

    @GetMapping
    public List<News> list() {
        return newsRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<News> get(@PathVariable Long id) {
        return newsRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public News create(
            @ModelAttribute News news,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile
    ) {
        applyUploadedImage(news, imageFile);
        return newsRepository.save(news);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    public ResponseEntity<News> update(
            @PathVariable Long id,
            @ModelAttribute News news,
            @RequestPart(value = "imageFile", required = false) MultipartFile imageFile
    ) {
        return newsRepository.findById(id).map(existing -> {
            mergeEditableFields(existing, news);
            applyUploadedImage(existing, imageFile);
            return ResponseEntity.ok(newsRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!newsRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        newsRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void applyUploadedImage(News news, MultipartFile imageFile) {
        if (imageFile != null && !imageFile.isEmpty()) {
            news.setImage(r2StorageService.uploadNewsImage(imageFile));
        }
    }

    private void mergeEditableFields(News target, News source) {
        if (source.getTitle() != null) {
            target.setTitle(source.getTitle());
        }
        if (source.getSlug() != null) {
            target.setSlug(source.getSlug());
        }
        if (source.getImage() != null) {
            target.setImage(source.getImage());
        }
        if (source.getExcerpt() != null) {
            target.setExcerpt(source.getExcerpt());
        }
        if (source.getContent() != null) {
            target.setContent(source.getContent());
        }
        if (source.getAuthor() != null) {
            target.setAuthor(source.getAuthor());
        }
        if (source.getPublishedAt() != null) {
            target.setPublishedAt(source.getPublishedAt());
        }
    }
}
