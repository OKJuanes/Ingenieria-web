package com.example.ProyectoWeb.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.ProyectoWeb.entity.Evento;

import java.util.List;

public interface IEventoRepository extends JpaRepository<Evento, Long> {

    @Query(value = "SELECT e.* FROM evento e JOIN evento_usuario eu ON e.id = eu.evento_id WHERE eu.usuario_id = :userId", nativeQuery = true)
    List<Evento> getEventosByUsuario(@Param("userId") Long id);

    @Query(value = "SELECT * FROM evento WHERE fecha > NOW() ORDER BY fecha ASC", nativeQuery = true)
    List<Evento> findEventosActivos();

    @Query(value = "SELECT * FROM evento WHERE fecha > NOW() ORDER BY fecha ASC LIMIT 3", nativeQuery = true)
    List<Evento> findEventosActivos3();

    @Query(value = "SELECT * FROM evento WHERE fecha > NOW() ORDER BY fecha ASC LIMIT 1", nativeQuery = true)
    Evento findEventoMasProximo();

    @Query(value = "SELECT e.id, e.nombre, COUNT(ei.invitado_id) AS cantidad_participantes " +
            "FROM evento e " +
            "LEFT JOIN evento_Invitado ei ON e.id = ei.evento_id " +
            "WHERE e.fecha > NOW() " +
            "GROUP BY e.id, e.nombre", nativeQuery = true)
    List<Object[]> findCantidadParticipantesEventosActivos();

}