package com.example.parcialFashionEvent.repositories;

import com.example.parcialFashionEvent.entity.Hito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface IHitoRepository extends JpaRepository<Hito, Long> {

    @Query("SELECT h FROM Hito h WHERE h.evento.nombre = :nombreEvento")
    List<Hito> findByNombreEvento(@Param("nombreEvento") String nombreEvento);

    @Query("SELECT h FROM Hito h WHERE h.fecha = :fecha")
    List<Hito> findByFecha(@Param("fecha") String fecha);

    @Query("SELECT h FROM Hito h WHERE h.responsable.nombre = :nombreResponsable")
    List<Hito> findByNombreResponsable(@Param("nombreResponsable") String nombreResponsable);
}
