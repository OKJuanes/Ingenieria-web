package com.example.ProyectoWeb.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.example.ProyectoWeb.entity.Evento;
import com.example.ProyectoWeb.services.EventoService;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1/eventos")
public class EventoController {

    @Autowired
    private EventoService eventoService;

    // Comprar un ticket para un evento con el usuario actual
    @PutMapping("/{id}/añadir-invitado")
    @PreAuthorize("hasAnyAuthority('admin:write', 'organizador:write')")
    public String addInvitado(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            return eventoService.addInvitado(username, id);
        } catch (RuntimeException e) {
            return e.getMessage();
        }
    }

    // Inscribirse a un evento como modelo
    @PutMapping("/{id}/inscribirse")
    public ResponseEntity<?> addParticipante(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            return ResponseEntity.ok(eventoService.addParticipante(username, id));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Crear un nuevo evento
    @PostMapping("/nuevo-evento")
    @PreAuthorize("hasAnyAuthority('admin:write', 'organizador:write')")
    public Evento postEvento(@RequestBody Evento evento) {
        return eventoService.saveEvento(evento);
    }

    // Modificar un evento
    @PutMapping("/{id}/modificar-evento")
    @PreAuthorize("hasAnyAuthority('admin:update', 'organizador:update')")
    public Evento updateEvento(@RequestBody Evento evento, @PathVariable Long id) {
        return eventoService.updateEventoById(evento, id);
    }

    // Eliminar un evento
    @DeleteMapping("/{id}/eliminar-evento")
    @PreAuthorize("hasAnyAuthority('admin:delete', 'organizador:delete')")
    public String deleteEvento(@PathVariable Long id) {
        return eventoService.deleteEvento(id);
    }

    // Eliminar un invitado de un evento
    @DeleteMapping("/{id}/eliminar-invitado")
    @PreAuthorize("hasAnyAuthority('admin:delete', 'organizador:delete')")
    public String removeInvitado(@RequestParam String username, @PathVariable Long id) {
        try {
            return eventoService.removeInvitado(username, id);
        } catch (RuntimeException e) {
            return e.getMessage();
        }
    }

    // Eliminar un participante de un evento
    @DeleteMapping("/{id}/eliminar-participante")
    //@PreAuthorize("hasAnyAuthority('admin:delete', 'organizador:delete')")
    public String removeParticipante(@RequestParam String username, @PathVariable Long id) {
        try {
            return eventoService.removeParticipante(username, id);
        } catch (RuntimeException e) {
            return e.getMessage();
        }
    }

    @GetMapping("/activos")
    public List<Evento> getEventosActivos() {
        return eventoService.getEventosActivos();
    }

    @GetMapping("/activos/participantes")
    public List<Map<String, Object>> getCantidadParticipantesEventosActivos() {
        List<Object[]> results = eventoService.getCantidadParticipantesEventosActivos();
        List<Map<String, Object>> response = new ArrayList<>();
        for (Object[] row : results) {
            Map<String, Object> map = new HashMap<>();
            map.put("id", row[0]);
            map.put("nombre", row[1]);
            map.put("cantidad_participantes", row[2]);
            response.add(map);
        }
        return response;
    }

    @GetMapping("/proximo")
    public Evento getEventoMasProximo() {
        return eventoService.getEventoMasProximo();
}
}
