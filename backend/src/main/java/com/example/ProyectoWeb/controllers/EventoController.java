package com.example.ProyectoWeb.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.example.ProyectoWeb.entity.Evento;
import com.example.ProyectoWeb.entity.Usuario;
import com.example.ProyectoWeb.services.EventoService;
import com.example.ProyectoWeb.services.UsuarioService;
import com.example.ProyectoWeb.entity.InvitadoExterno;
import com.example.ProyectoWeb.services.InvitadoExternoService;

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
    @Autowired
    private UsuarioService usuarioService; // con minúscula, es una instancia

    @Autowired
    private InvitadoExternoService invitadoExternoService;

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
    @PreAuthorize("hasAnyAuthority('admin:write', 'organizador:write') or hasRole('admin') or hasRole('ADMIN')")
    public String deleteEvento(@PathVariable Long id) {
        return eventoService.deleteEvento(id);
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
    
        @GetMapping("/activos3")
    public List<Evento> getEventosActivos3() {
        return eventoService.getEventosActivos3();
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

    /**
     * Devuelve el próximo evento
     * @return El próximo evento
     */
    @GetMapping("/proximo")
    public ResponseEntity<Evento> getProximoEvento() {
        Evento proximoEvento = eventoService.getEventoMasProximo();
        if (proximoEvento == null) {
            return ResponseEntity.ok().build(); // Devuelve 200 OK con cuerpo vacío si no hay evento próximo
        }
        return ResponseEntity.ok(proximoEvento);
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
    public ResponseEntity<?> getParticipantesByEventoId(@PathVariable Long id) {
        try {
            // Obtener el evento
            Evento evento = eventoService.getEventoById(id);
            
            // Obtener la lista de nombres de usuario de los participantes
            List<String> participantesUsernames = evento.getParticipantes();
            
            // Convertir los nombres de usuario en objetos con información detallada
            List<Map<String, Object>> participantesInfo = new ArrayList<>();
            for (String username : participantesUsernames) {
                try {
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
                } catch (Exception e) {
                    // Simplemente registrar el error y continuar con el siguiente usuario
                    System.err.println("Error al procesar usuario " + username + ": " + e.getMessage());
                }
            }
            
            return ResponseEntity.ok(participantesInfo);
        } catch (RuntimeException e) {
            // Devolver una lista vacía en caso de error, en lugar de null
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    /**
     * Devuelve el número total de participantes en todos los eventos activos
     * @return El número total de participantes
     */
    @GetMapping("/activos/total-participantes")
    public ResponseEntity<Integer> getTotalParticipantesEventosActivos() {
        Integer totalParticipantes = eventoService.getTotalParticipantesEventosActivos();
        return ResponseEntity.ok(totalParticipantes);
    }

    /**
     * Devuelve el número total de eventos activos
     * @return El número total de eventos activos
     */
    @GetMapping("/activos/count")
    public ResponseEntity<Integer> getCountEventosActivos() {
        Integer countEventos = eventoService.getCountEventosActivos();
        return ResponseEntity.ok(countEventos);
    }

    /**
     * Añade un invitado externo a un evento específico
     * @param id El ID del evento
     * @param request Datos del invitado externo
     * @return El invitado externo creado
     */
    @PostMapping("/{id}/invitados-externos")
    public ResponseEntity<?> addInvitadoExterno(@PathVariable Long id, @RequestBody InvitadoExternoRequest request) {
        try {
            // Obtener el evento
            Evento evento = eventoService.getEventoById(id);
            
            // Crear el invitado externo
            InvitadoExterno invitado = new InvitadoExterno();
            invitado.setNombre(request.getNombre());
            invitado.setApellido(request.getApellido());
            invitado.setCorreo(request.getCorreo());
            invitado.setTelefono(request.getTelefono());
            invitado.setEmpresa(request.getEmpresa()); // Asegúrate de que se establezca la empresa
            invitado.setEvento(evento);
            
            // Guardar el invitado externo
            InvitadoExterno savedInvitado = invitadoExternoService.saveInvitadoExterno(invitado);
            
            return ResponseEntity.ok(savedInvitado);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Clase para manejar la solicitud
    public static class InvitadoExternoRequest {
        private String nombre;
        private String apellido;
        private String correo;
        private String telefono;
        private String empresa;  // Añadir esta propiedad
        
        // Getters y setters
        public String getNombre() {
            return nombre;
        }
        
        public void setNombre(String nombre) {
            this.nombre = nombre;
        }
        
        public String getApellido() {
            return apellido;
        }
        
        public void setApellido(String apellido) {
            this.apellido = apellido;
        }
        
        public String getCorreo() {
            return correo;
        }
        
        public void setCorreo(String correo) {
            this.correo = correo;
        }
        
        public String getTelefono() {
            return telefono;
        }
        
        public void setTelefono(String telefono) {
            this.telefono = telefono;
        }
        
        public String getEmpresa() {
            return empresa;
        }
        
        public void setEmpresa(String empresa) {
            this.empresa = empresa;
        }
    }

    /**
     * Devuelve todos los eventos, incluyendo los pasados
     * @return Lista completa de eventos
     */
    @GetMapping("/historico")
    @PreAuthorize("hasAnyAuthority('admin:read') or hasRole('ADMIN')")
    public List<Evento> getEventosHistorico() {
        return eventoService.getAllEventos();  // Asumiendo que este método ya existe
    }
}