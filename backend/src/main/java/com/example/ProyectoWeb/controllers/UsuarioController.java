package com.example.ProyectoWeb.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.example.ProyectoWeb.entity.Evento;
import com.example.ProyectoWeb.entity.Usuario;
import com.example.ProyectoWeb.services.UsuarioService;

import java.util.List;

@RestController
@RequestMapping("api/v1/usuario")
public class UsuarioController {

    @Autowired
    private UsuarioService usuarioService;

    // Información de perfil propio
    @GetMapping("/perfil")
    public Usuario getUserProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName(); // Obtener el username del usuario autenticado
        return usuarioService.getUserByUsername(username);
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
}
