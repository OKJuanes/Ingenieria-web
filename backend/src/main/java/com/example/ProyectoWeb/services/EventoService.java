package com.example.ProyectoWeb.services;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.ProyectoWeb.entity.Evento;
import com.example.ProyectoWeb.entity.Usuario;
import com.example.ProyectoWeb.repositories.IEventoRepository;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EventoService {

    @Autowired
    private final IEventoRepository eventoRepository;
    private final UsuarioService usuarioService;

    public Evento saveEvento(Evento evento){
        return eventoRepository.save(evento);
    }

    public Evento getEventoById(Long eventoId){
        return eventoRepository.findById(eventoId)
                .orElseThrow(() -> new RuntimeException("Evento no encontrado"));
    }

    public List<Evento> getAllEventos(){
        return eventoRepository.findAll();
    }

    public List<Evento> getEventosActivos() {
        return eventoRepository.findEventosActivos();
    }

    
    public List<Evento> getEventosActivos3() {
        return eventoRepository.findEventosActivos3();
    }

    public List<Object[]> getCantidadParticipantesEventosActivos() {
        return eventoRepository.findCantidadParticipantesEventosActivos();
    }

    public Evento getEventoMasProximo() {
    return eventoRepository.findEventoMasProximo();
    }

    public Evento updateEventoById(Evento request, Long eventoId){
        Evento evento = eventoRepository.findById(eventoId).get();

        evento.setNombre(request.getNombre());
        evento.setFecha(request.getFecha());
        evento.setEmpresa(request.getEmpresa()); // Añadir esta línea
        evento.setTipo(request.getTipo()); // Asegúrate de también actualizar el tipo
        evento.setDescripcion(request.getDescripcion()); // Y la descripción si aplica
        
        return eventoRepository.save(evento); // Guardar directamente aquí
    }

    public String deleteEvento(Long eventoId) {
        try {
            eventoRepository.deleteById(eventoId);
            return "Evento eliminado";
        } catch (Exception e) {
            return "Error al eliminar evento";
        }
    }

    @Transactional
    public String addParticipante(String username, Long eventoId) throws RuntimeException {
        Evento evento = getEventoById(eventoId);
        Usuario usuario = usuarioService.getUserByUsername(username);
        if (!evento.getParticipantes().contains(username)){
            evento.addParticipante(usuario);
            eventoRepository.save(evento);
        } else {
            throw new RuntimeException("Participante ya se inscribió al evento");
        }
        return "Participante " + username + " se inscribió al evento " + evento.getNombre();
    }

    public String removeParticipante(String username, Long eventoId) throws RuntimeException {
        Evento evento = getEventoById(eventoId);
        Usuario usuario = usuarioService.getUserByUsername(username);
        if (evento.getParticipantes().contains(username)){
            evento.removeParticipante(usuario);
            eventoRepository.save(evento);
            return username + " se eliminó con éxito del evento: " + evento.getNombre();
        } else {
            throw new RuntimeException("Usuario no encontrado en el evento");
        }
    }

    public List<String> getParticipantesDeEvento(Long eventoId) {
        Evento evento = getEventoById(eventoId);
        return evento.getParticipantes();
    }

    /**
     * Obtiene el número total de participantes en todos los eventos activos
     * @return El número total de participantes
     */
    public Integer getTotalParticipantesEventosActivos() {
        Integer total = eventoRepository.countTotalParticipantesEventosActivos();
        return total != null ? total : 0;
    }

    /**
     * Obtiene el número total de eventos activos
     * @return El número total de eventos activos
     */
    public Integer getCountEventosActivos() {
        return eventoRepository.findEventosActivos().size();
    }
}
