package com.example.ProyectoWeb.controllers;

import com.example.ProyectoWeb.entity.Hito;
import com.example.ProyectoWeb.services.HitoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/hitos")
@RequiredArgsConstructor
public class HitoController {

    private final HitoService hitoService;

    @PostMapping("/{eventoId}/logro")
    public ResponseEntity<?> crearHitoParaParticipante(
            @PathVariable Long eventoId,
            @RequestBody HitoRequest request
    ) {
        try {
            Hito hito = hitoService.crearHitoParaParticipante(
                eventoId,
                request.getUserId(),
                request.getTitulo(),
                request.getDescripcion(),
                request.getCategoria()
            );
            return ResponseEntity.ok(hito);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // DTO para la petición
    public static class HitoRequest {
        private Long userId;
        private String titulo;
        private String descripcion;
        private String categoria;
        // getters y setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }
        public String getTitulo() { return titulo; }
        public void setTitulo(String titulo) { this.titulo = titulo; }
        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
        public String getCategoria() { return categoria; }
        public void setCategoria(String categoria) { this.categoria = categoria; }
    }
}
