package com.zestfoot.backend.controller;

import com.zestfoot.backend.entity.News;
import com.zestfoot.backend.repository.NewsRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/news")
public class NewsController {

    @Autowired
    private NewsRepository newsRepository;

    @GetMapping
    public List<News> list() {
        return newsRepository.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<News> get(@PathVariable Long id) {
        return newsRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public News create(@RequestBody News news) {
        return newsRepository.save(news);
    }

    @PutMapping("/{id}")
    public ResponseEntity<News> update(@PathVariable Long id, @RequestBody News news) {
        return newsRepository.findById(id).map(existing -> {
            news.setId(existing.getId());
            return ResponseEntity.ok(newsRepository.save(news));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!newsRepository.existsById(id)) return ResponseEntity.notFound().build();
        newsRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
