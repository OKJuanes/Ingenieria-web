package com.example.ProyectoWeb.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.example.ProyectoWeb.entity.Evento;
import com.example.ProyectoWeb.entity.Hito;
import com.example.ProyectoWeb.entity.Usuario;
import com.example.ProyectoWeb.services.UsuarioService;
import com.example.ProyectoWeb.services.HitoService;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/v1/usuario")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    @Autowired
    private HitoService hitoService;

    // Información de perfil propio
    @GetMapping("/perfil")
    public ResponseEntity<Map<String, Object>> getUserProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioService.getUserByUsername(username);
        
        // Crear un mapa con todos los campos que queremos devolver explícitamente
        Map<String, Object> response = new HashMap<>();
        response.put("id", usuario.getId());
        response.put("username", usuario.getUsername());
        response.put("nombre", usuario.getNombre());
        response.put("apellido", usuario.getApellido());
        response.put("correo", usuario.getCorreo());
        response.put("role", usuario.getRol().toString());
        
        return ResponseEntity.ok(response);
    }
    // Eventos de usuario
    @GetMapping("/mis-eventos")
    public ResponseEntity<List<Evento>> getEventosByUsuario() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName(); // Obtener el username del usuario autenticado
        Long id = usuarioService.getUserByUsername(username).getId();
        List<Evento> eventos = usuarioService.getMyEvents(id);
        return ResponseEntity.ok(eventos);
    }
    // Editar perfil
    @PutMapping("/perfil/Editar")
    public Usuario updateUserProfile(@RequestBody Usuario request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario currentUser = usuarioService.getUserByUsername(username);
        
        // Actualizar solo los campos permitidos desde el cliente
        if (request.getNombre() != null) currentUser.setNombre(request.getNombre());
        if (request.getApellido() != null) currentUser.setApellido(request.getApellido());
        if (request.getCorreo() != null) currentUser.setCorreo(request.getCorreo());
        
        // No permitimos actualizar el username ni la contraseña por esta vía
        // No permitimos actualizar el rol desde el perfil
        
        return usuarioService.updateUserById(currentUser, currentUser.getId());
    }

    // Eliminar perfil
    @DeleteMapping("/perfil/Eliminar")
    public String deleteUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName(); // Obtener el username del usuario autenticado
        return usuarioService.deleteUser(usuarioService.getUserByUsername(username).getId());
    }

    /**
     * Obtiene todos los usuarios del sistema excepto el usuario actual
     * Restringido solo a administradores
     * @return Lista de todos los usuarios excepto el usuario actual
     */
    @GetMapping("/todos")
    @PreAuthorize("hasAnyAuthority('admin:write', 'organizador:write') or hasRole('admin') or hasRole('ADMIN')")
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        // Obtener el nombre de usuario del usuario autenticado actual
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Obtener todos los usuarios
        List<Usuario> usuarios = usuarioService.getAllUsers();
        
        // Filtrar para excluir al usuario actual
        List<Usuario> filteredUsuarios = usuarios.stream()
            .filter(usuario -> !usuario.getUsername().equals(currentUsername))
            .toList();
        
        // Mapear los usuarios para excluir información sensible como contraseñas
        List<Map<String, Object>> usuariosDTO = filteredUsuarios.stream().map(usuario -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", usuario.getId());
            map.put("username", usuario.getUsername());
            map.put("nombre", usuario.getNombre());
            map.put("apellido", usuario.getApellido());
            map.put("correo", usuario.getCorreo());
            map.put("rol", usuario.getRol().toString());
            return map;
        }).toList();
        
        return ResponseEntity.ok(usuariosDTO);
    }

    /**
     * Cambia el rol de un usuario específico
     * Solo accesible para administradores
     * @return Mensaje de confirmación
     */
    @PutMapping("/{id}/cambiar-rol")
    @PreAuthorize("hasAnyAuthority('admin:write', 'organizador:write') or hasRole('admin') or hasRole('ADMIN')")
    public ResponseEntity<?> cambiarRolUsuario(
            @PathVariable Long id, 
            @RequestBody Map<String, String> rolRequest) {
        
        try {
            String nuevoRol = rolRequest.get("rol");
            if (nuevoRol == null) {
                return ResponseEntity.badRequest().body(Map.of("message", "El rol es requerido"));
            }
            
            Usuario usuario = usuarioService.getUserById(id);
            if (usuario == null) {
                return ResponseEntity.notFound().build();
            }
            
            // Implementar la lógica para cambiar el rol
            Usuario usuarioActualizado = usuarioService.cambiarRolUsuario(id, nuevoRol);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Rol actualizado con éxito");
            response.put("id", usuarioActualizado.getId());
            response.put("username", usuarioActualizado.getUsername());
            response.put("role", usuarioActualizado.getRol().toString());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * Obtiene los hitos ganados por un usuario específico
     * @return Lista de hitos ganados por el usuario
     */
    @GetMapping("/mis-hitos-ganados")
    public ResponseEntity<List<Hito>> getHitosGanados() {
        // Obtener el usuario autenticado
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Usuario usuario = usuarioService.getUserByUsername(username);
        
        // Obtener los hitos donde este usuario es beneficiario
        List<Hito> hitosGanados = hitoService.getHitosByBeneficiarioId(usuario.getId());
        
        return ResponseEntity.ok(hitosGanados);
    }
}
