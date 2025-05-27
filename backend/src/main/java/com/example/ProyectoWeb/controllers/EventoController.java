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
import java.util.stream.Collectors;

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

    // Para registrarse a un evento
    @PutMapping("/{id}/inscribirse")
    public ResponseEntity<?> addParticipante(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            String result = eventoService.addParticipante(username, id);
            return ResponseEntity.ok().body(Map.of("message", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Crear un nuevo evento
    @PostMapping("/nuevo-evento")
    @PreAuthorize("hasAnyAuthority('admin:write', 'organizador:write') or hasRole('admin') or hasRole('ADMIN')")
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
    public ResponseEntity<?> removeParticipante(@PathVariable Long id) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        try {
            String result = eventoService.removeParticipante(username, id);
            return ResponseEntity.ok().body(Map.of("message", result));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
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

    @GetMapping("/{id}")
    public Evento getEventoById(@PathVariable Long id) {
        return eventoService.getEventoById(id);
    }

    @GetMapping("/mis-eventos")
    public List<Evento> getMisEventos() {
        // Obtiene el nombre de usuario autenticado del SecurityContext
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Obtiene todos los eventos
        List<Evento> todosLosEventos = eventoService.getAllEventos();
        
        // Filtra los eventos donde el usuario actual es participante
        return todosLosEventos.stream()
                .filter(evento -> evento.getParticipantes() != null && 
                         evento.getParticipantes().contains(username))
                .collect(Collectors.toList());
    }

    /**
     * Devuelve la lista de usuarios participantes en un evento específico
     * @param id El ID del evento a consultar
     * @return Lista de nombres de usuario de los participantes
     */
    @GetMapping("/{id}/participantes")
    public ResponseEntity<List<Map<String, Object>>> getParticipantesByEventoId(@PathVariable Long id) {
        try {
            // Obtener el evento
            Evento evento = eventoService.getEventoById(id);
            
            // Obtener la lista de nombres de usuario de los participantes
            List<String> participantesUsernames = evento.getParticipantes();
            
            // Convertir los nombres de usuario en objetos con información detallada
            List<Map<String, Object>> participantesInfo = new ArrayList<>();
            for (String username : participantesUsernames) {
                Usuario usuario = usuarioService.getUserByUsername(username);
                
                // Crear un mapa con la información que queremos devolver de cada usuario
                Map<String, Object> usuarioInfo = new HashMap<>();
                usuarioInfo.put("id", usuario.getId());
                usuarioInfo.put("username", usuario.getUsername());
                usuarioInfo.put("nombre", usuario.getNombre());
                usuarioInfo.put("apellido", usuario.getApellido());
                usuarioInfo.put("correo", usuario.getCorreo());
                usuarioInfo.put("role", usuario.getRol().toString());
                
                participantesInfo.add(usuarioInfo);
            }
            
            return ResponseEntity.ok(participantesInfo);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }
}
