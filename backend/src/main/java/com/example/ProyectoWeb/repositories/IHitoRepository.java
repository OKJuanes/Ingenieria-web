package com.example.ProyectoWeb.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.ProyectoWeb.entity.Hito;

import java.util.List;

public interface IHitoRepository extends JpaRepository<Hito, Long> {

    @Query("SELECT h FROM Hito h WHERE h.eventoRelacionado.nombre = :nombreEvento")
    List<Hito> findByNombreEvento(@Param("nombreEvento") String nombreEvento);

    @Query("SELECT h FROM Hito h WHERE h.fechaRegistro = :fecha")
    List<Hito> findByFecha(@Param("fecha") String fecha);

    @Query("SELECT h FROM Hito h WHERE h.beneficiario.nombre = :nombreResponsable")
    List<Hito> findByNombreResponsable(@Param("nombreResponsable") String nombreResponsable);
}
