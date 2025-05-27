package com.example.ProyectoWeb.controllers;

import com.example.ProyectoWeb.entity.Hito;
import com.example.ProyectoWeb.services.HitoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    /**
     * Obtiene todos los hitos asociados a un evento específico
     * @param eventoId ID del evento
     * @return Lista de hitos
     */
    @GetMapping("/evento/{eventoId}")
    public ResponseEntity<?> getHitosByEventoId(@PathVariable Long eventoId) {
        try {
            List<Hito> hitos = hitoService.getHitosByEventoId(eventoId);
            return ResponseEntity.ok(hitos);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    /**
     * Actualiza un hito existente
     * @param id ID del hito a actualizar
     * @param request Datos actualizados del hito
     * @return Hito actualizado
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('admin:update', 'organizador:update') or hasRole('admin') or hasRole('ADMIN')")
    public ResponseEntity<?> updateHito(@PathVariable Long id, @RequestBody HitoUpdateRequest request) {
        try {
            Hito hito = hitoService.getHitoById(id);
            
            // Actualizar solo los campos proporcionados
            if (request.getTitulo() != null) hito.setTitulo(request.getTitulo());
            if (request.getDescripcion() != null) hito.setDescripcion(request.getDescripcion());
            if (request.getCategoria() != null) hito.setCategoria(request.getCategoria());
            
            Hito updatedHito = hitoService.updateHitoById(hito, id);
            return ResponseEntity.ok(updatedHito);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Elimina un hito por su ID
     * @param id ID del hito a eliminar
     * @return Mensaje de confirmación
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('admin:delete', 'organizador:delete') or hasRole('admin') or hasRole('ADMIN')")
    public ResponseEntity<?> deleteHito(@PathVariable Long id) {
        try {
            String result = hitoService.deleteHito(id);
            return ResponseEntity.ok().body(result);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Obtiene todos los hitos
     * @return Lista de todos los hitos
     */
    @GetMapping
    public ResponseEntity<List<Hito>> getAllHitos() {
        List<Hito> hitos = hitoService.getAllHitos();
        return ResponseEntity.ok(hitos);
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

    // DTO para la actualización de hitos
    public static class HitoUpdateRequest {
        private String titulo;
        private String descripcion;
        private String categoria;
        
        // getters y setters
        public String getTitulo() { return titulo; }
        public void setTitulo(String titulo) { this.titulo = titulo; }
        public String getDescripcion() { return descripcion; }
        public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
        public String getCategoria() { return categoria; }
        public void setCategoria(String categoria) { this.categoria = categoria; }
    }
}
