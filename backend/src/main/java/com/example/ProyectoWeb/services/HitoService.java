package com.example.ProyectoWeb.services;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.ProyectoWeb.entity.Hito;
import com.example.ProyectoWeb.entity.Evento;
import com.example.ProyectoWeb.entity.Usuario;
import com.example.ProyectoWeb.repositories.IHitoRepository;

import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class HitoService {

    private final IHitoRepository hitoRepository;
    private final UsuarioService usuarioService;
    private final EventoService eventoService;

    public void saveHito(Hito hito) {
        // Guarda el hito en la base de datos
        hitoRepository.save(hito);
        System.out.println("Hito guardado con éxito");
    }

    public Hito getHitoById(Long id) {
        return hitoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hito no encontrado"));
    }

    public List<Hito> getAllHitos() {
        return hitoRepository.findAll();
    }

    public Hito updateHitoById(Hito request, Long id) {
        Hito hito = hitoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hito no encontrado"));

        hito.setTitulo(request.getTitulo());
        hito.setDescripcion(request.getDescripcion());
        hito.setCategoria(request.getCategoria());
        hito.setFechaRegistro(request.getFechaRegistro());
        hito.setBeneficiario(request.getBeneficiario());
        hito.setEventoRelacionado(request.getEventoRelacionado());
        saveHito(hito);

        return hito;
    }

    public String deleteHito(Long id) {
        Hito hito = hitoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Hito no encontrado"));
        hitoRepository.delete(hito);
        return "Hito eliminado";
    }

    public Hito crearHitoParaParticipante(Long eventoId, Long userId, String titulo, String descripcion, String categoria) {
        Evento evento = eventoService.getEventoById(eventoId);
        Usuario usuario = usuarioService.getUserById(userId);

        if (!evento.getParticipantes().contains(usuario.getUsername())) {
            throw new RuntimeException("El usuario no participó en este evento");
        }

        Hito hito = new Hito();
        hito.setTitulo(titulo);
        hito.setDescripcion(descripcion);
        hito.setCategoria(categoria);
        hito.setFechaRegistro(new Date());
        hito.setBeneficiario(usuario);
        hito.setEventoRelacionado(evento);

        return hitoRepository.save(hito);
    }

    /**
     * Obtiene todos los hitos asociados a un evento específico
     * @param eventoId ID del evento
     * @return Lista de hitos asociados al evento
     */
    public List<Hito> getHitosByEventoId(Long eventoId) {
        // Verificar que el evento existe
        eventoService.getEventoById(eventoId); // Lanzará excepción si no existe
        
        // Obtener los hitos asociados al evento
        return hitoRepository.findByEventoId(eventoId);
    }
    /**
     * Obtiene todos los hitos donde un usuario específico es el beneficiario
     * @param userId ID del usuario beneficiario
     * @return Lista de hitos ganados por el usuario
     */
    public List<Hito> getHitosByBeneficiarioId(Long userId) {
        // Verificar que el usuario existe
        usuarioService.getUserById(userId); // Lanzará excepción si no existe
        
        // Obtener los hitos donde el usuario es beneficiario
        return hitoRepository.findByBeneficiarioId(userId);
    }
}
