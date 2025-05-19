package com.example.ProyectoWeb.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.ProyectoWeb.entity.Evento;

import java.util.List;

public interface IEventoRepository extends JpaRepository<Evento, Long> {

    @Query(value = "SELECT e.* FROM evento e JOIN evento_usuario eu ON e.id = eu.evento_id WHERE eu.usuario_id = :userId", nativeQuery = true)
    List<Evento> getEventosByUsuario(@Param("userId") Long id);

}
