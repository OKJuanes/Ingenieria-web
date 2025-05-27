package com.example.ProyectoWeb.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.ProyectoWeb.entity.Evento;
import com.example.ProyectoWeb.entity.Role; // Añade esta importación
import com.example.ProyectoWeb.entity.Usuario;
import com.example.ProyectoWeb.entity.UsuarioInfo;
import com.example.ProyectoWeb.repositories.IEventoRepository;
import com.example.ProyectoWeb.repositories.IUsuarioRepository;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class UsuarioService implements UserDetailsService {

    @Autowired
    private IUsuarioRepository userRepository;
    private final IEventoRepository eventoRepository;
    private final PasswordEncoder passwordEncoder;

    public void saveUser(Usuario user) {
        // Encripta la contraseña antes de guardarla
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        // Guarda el usuario en la base de datos
        userRepository.save(user);
        System.out.println("Usuario guardado con éxito");
    }

    public Usuario getUserById(Long id) {
        return userRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
    }

    public UsuarioInfo getUserInfoById(Long userId) {
        Usuario user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        UsuarioInfo userInfo = new UsuarioInfo();
        userInfo.setNombre(user.getNombre());
        userInfo.setApellido(user.getApellido());
        userInfo.setUsername(user.getUsername());
        return userInfo;
    }

    public Usuario getUserByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Optional<Usuario> userDetail = userRepository.findByUsername(username);

        return userDetail.map(user ->
                new org.springframework.security.core.userdetails.User(
                        user.getCorreo(),
                        user.getPassword(),
                        user.getAuthorities()
                )).orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    public List<Evento> getMyEvents(Long userId) {
        return eventoRepository.getEventosByUsuario(userId);
    }

    public Usuario updateUserById(Usuario request, Long userId) {
        Usuario user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Actualizar solo los campos no sensibles
        if (request.getNombre() != null) user.setNombre(request.getNombre());
        if (request.getApellido() != null) user.setApellido(request.getApellido());
        if (request.getCorreo() != null) user.setCorreo(request.getCorreo());
        
        // Guardar directamente sin pasar por la encriptación de contraseña
        return userRepository.save(user);
    }
    public String deleteUser(Long userId) {
        Usuario user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        userRepository.delete(user);
        return "Usuario eliminado";
    }

    /**
     * Obtiene todos los usuarios registrados en el sistema
     * @return Lista de todos los usuarios
     */
    public List<Usuario> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * Cambia el rol de un usuario
     * @param userId ID del usuario
     * @param nuevoRol Nombre del nuevo rol (debe coincidir con los valores del enum Role)
     * @return Usuario con el rol actualizado
     */
    public Usuario cambiarRolUsuario(Long userId, String nuevoRol) {
        Usuario usuario = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
        
        try {
            // Convertir String a enum Role
            Role rol = Role.valueOf(nuevoRol.toUpperCase());
            usuario.setRol(rol);
            return userRepository.save(usuario);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Rol no válido: " + nuevoRol);
        }
    }
}

